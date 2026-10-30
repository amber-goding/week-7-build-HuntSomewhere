// Focused checks for the gate demo: persistence, invalid input, simulated API failures,
// and the shared AI allowance. The OpenAI API is SIMULATED here (no key used, no cost).
// Writes only synthetic records: trips with is_synthetic = true and ai_allowances rows
// whose id starts with "synthetic-". The real "gate-demo" allowance is only read.
//
// Run: node --import jiti/register scripts/check-gate.ts

import { config } from "dotenv";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../lib/generated/prisma/client";
import { buildRequestBody, MAX_OUTPUT_TOKENS, MAX_REQUEST_BYTES, suggestPreferences, type SuggestDeps } from "../lib/trips/ai";
import { createTrip, getTrip, reserveAiCall } from "../lib/trips/store";

config({ path: ".env.local", quiet: true });

const client = () => new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) });
const prisma = client();

let failures = 0;
function check(name: string, ok: boolean, detail = "") {
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  (${detail})` : ""}`);
}

const FAIL_ROW = "synthetic-check-failures";
const RACE_ROW = "synthetic-check-race";
const OFF_ROW = "synthetic-check-off";

async function resetRow(id: string, maxCalls: number, enabled = true) {
  await prisma.aiAllowance.upsert({
    where: { id },
    create: { id, maxCalls, enabled },
    update: { maxCalls, usedCalls: 0, enabled },
  });
}
const used = async (id: string) => (await prisma.aiAllowance.findUniqueOrThrow({ where: { id } })).usedCalls;

function okResponse(text: string, status = "completed") {
  return new Response(
    JSON.stringify({ status, output: [{ type: "message", content: [{ type: "output_text", text }] }] }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
}

function deps(rowId: string, fetchImpl: typeof fetch, extra: Partial<SuggestDeps> = {}): SuggestDeps {
  return {
    apiKey: "simulated-key",
    aiSwitchOff: false,
    reserve: () => reserveAiCall(prisma, rowId),
    fetchImpl,
    timeoutMs: 300,
    today: "2026-10-30",
    ...extra,
  };
}

const DESC = "Bow hunting deer in Garrett County November 14 to 16, maybe opening day";

async function main() {
  console.log("== Persistence (real Neon, synthetic record) ==");
  const prefs = {
    counties: ["24023"],
    species: ["white_tailed_deer", "sika_deer"],
    methods: ["vertical_bow", "crossbow"],
    startDate: "2026-11-14",
    endDate: "2026-11-16",
  };
  const saved = await createTrip(prisma, prefs, { aiAssisted: false, isSynthetic: true });
  check("valid trip saves", saved.ok);
  if (saved.ok) {
    const second = client(); // separate client and connection
    const loaded = await getTrip(second, saved.id);
    await second.$disconnect();
    check("trip reloads by id from a separate connection", JSON.stringify(loaded?.preferences) === JSON.stringify(prefs));
    check("id is a random UUID", /^[0-9a-f-]{36}$/.test(saved.id));
  }

  console.log("== Invalid input ==");
  const bad = async (name: string, input: unknown) =>
    check(name, !(await createTrip(prisma, input, { aiAssisted: false, isSynthetic: true })).ok);
  await bad("unknown county rejected", { ...prefs, counties: ["99999"] });
  await bad("end date before start rejected", { ...prefs, startDate: "2026-11-20", endDate: "2026-11-01" });
  await bad("impossible date rejected", { ...prefs, startDate: "2026-02-30" });
  await bad("extra free-text field rejected", { ...prefs, description: "my name is ..." });
  await bad("empty preferences rejected", { counties: [], species: [], methods: [], startDate: null, endDate: null });
  check("malformed trip id returns nothing", (await getTrip(prisma, "not-a-uuid")) === null);
  check("unknown trip id returns nothing", (await getTrip(prisma, "00000000-0000-4000-8000-000000000000")) === null);

  await resetRow(FAIL_ROW, 20);
  let fetchCalls = 0;
  const counting: typeof fetch = async () => {
    fetchCalls++;
    return okResponse("{}");
  };
  const long = await suggestPreferences("x".repeat(301), deps(FAIL_ROW, counting));
  const empty = await suggestPreferences("  ", deps(FAIL_ROW, counting));
  check("301-char description rejected", !long.ok && long.code === "invalid_input");
  check("blank description rejected", !empty.ok && empty.code === "invalid_input");
  check("rejected input consumed no call and made no request", (await used(FAIL_ROW)) === 0 && fetchCalls === 0);

  console.log("== Off switch ==");
  const envOff = await suggestPreferences(DESC, deps(FAIL_ROW, counting, { aiSwitchOff: true }));
  const noKey = await suggestPreferences(DESC, deps(FAIL_ROW, counting, { apiKey: undefined }));
  await resetRow(OFF_ROW, 10, false);
  const dbOff = await suggestPreferences(DESC, deps(OFF_ROW, counting));
  check("env switch off -> ai_disabled", !envOff.ok && envOff.code === "ai_disabled");
  check("missing key -> ai_disabled", !noKey.ok && noKey.code === "ai_disabled");
  check("database switch off -> ai_disabled", !dbOff.ok && dbOff.code === "ai_disabled");
  check("off paths made no request", fetchCalls === 0);

  console.log("== Simulated API failures (each still consumes one call) ==");
  await resetRow(FAIL_ROW, 20);
  const cases: [string, typeof fetch, string][] = [
    ["HTTP 500", async () => new Response("err", { status: 500 }), "provider_error"],
    ["network error", async () => { throw new TypeError("fetch failed"); }, "provider_error"],
    [
      "timeout",
      (_u, init) =>
        new Promise((_, reject) =>
          init?.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError"))),
        ),
      "timeout",
    ],
    ["non-JSON output text", async () => okResponse("not json"), "invalid_output"],
    ["schema-invalid output", async () => okResponse(JSON.stringify({ counties: ["99999"] })), "invalid_output"],
    ["incomplete response", async () => okResponse("{}", "incomplete"), "invalid_output"],
    [
      "refusal",
      async () =>
        new Response(JSON.stringify({ status: "completed", output: [{ type: "message", content: [{ type: "refusal", refusal: "no" }] }] })),
      "refused",
    ],
  ];
  for (const [name, impl, expected] of cases) {
    const before = await used(FAIL_ROW);
    const r = await suggestPreferences(DESC, deps(FAIL_ROW, impl));
    const after = await used(FAIL_ROW);
    check(`${name} -> ${expected}, call consumed`, !r.ok && r.code === expected && after === before + 1, r.ok ? "ok" : r.code);
  }

  console.log("== Simulated successful response ==");
  const modelOutput = {
    counties: ["24023"],
    species: ["deer"],
    methods: ["archery"],
    start_date: "2026-11-14",
    end_date: "2026-11-16",
    unresolved: [{ term: "opening day", reason: "season_term" }],
  };
  const good = await suggestPreferences(DESC, deps(FAIL_ROW, async () => okResponse(JSON.stringify(modelOutput))));
  check("valid output accepted", good.ok);
  if (good.ok) {
    const s = good.suggestion;
    check("'deer' expanded by code to white-tailed + sika", s.preferences.species.join() === "white_tailed_deer,sika_deer");
    check("'archery' expanded to vertical bow + crossbow", s.preferences.methods.join() === "vertical_bow,crossbow");
    check("season term left unresolved, dates kept", s.unresolved[0]?.term === "opening day" && s.preferences.startDate === "2026-11-14");
  }
  const swapped = await suggestPreferences(
    DESC,
    deps(FAIL_ROW, async () => okResponse(JSON.stringify({ ...modelOutput, start_date: "2026-11-20", end_date: "2026-11-01" }))),
  );
  check("out-of-order dates become unresolved, not applied", swapped.ok && swapped.suggestion.preferences.startDate === null && swapped.suggestion.unresolved.some((u) => u.reason === "vague_date"));

  console.log("== Shared allowance: atomic, never exceeded ==");
  await resetRow(RACE_ROW, 3);
  const results = await Promise.all(Array.from({ length: 10 }, () => reserveAiCall(prisma, RACE_ROW)));
  const reserved = results.filter((r) => r === "reserved").length;
  check("10 concurrent reservations against max 3 -> exactly 3 granted", reserved === 3, `${reserved} granted`);
  check("used_calls stops at max_calls", (await used(RACE_ROW)) === 3);
  fetchCalls = 0;
  const exhausted = await suggestPreferences(DESC, deps(RACE_ROW, counting));
  check("exhausted allowance -> allowance_exhausted, no request made", !exhausted.ok && exhausted.code === "allowance_exhausted" && fetchCalls === 0);

  console.log("== Bounds ==");
  const bytes = new TextEncoder().encode(JSON.stringify(buildRequestBody("é".repeat(300), "2026-10-30"))).length;
  check(`worst-case request body ${bytes} bytes <= ${MAX_REQUEST_BYTES}`, bytes <= MAX_REQUEST_BYTES);
  console.log(`      max_output_tokens = ${MAX_OUTPUT_TOKENS}`);

  const demo = await prisma.aiAllowance.findUnique({ where: { id: "gate-demo" } });
  check("real 'gate-demo' allowance exists with max 10 (read only)", demo?.maxCalls === 10, `used ${demo?.usedCalls}, enabled ${demo?.enabled}`);

  console.log(failures === 0 ? "\nAll checks passed." : `\n${failures} check(s) failed.`);
}

main()
  .catch((e) => {
    failures++;
    console.error("check run failed:", e instanceof Error ? e.name : "unknown");
  })
  .finally(async () => {
    await prisma.$disconnect().catch(() => {});
    process.exitCode = failures ? 1 : 0;
  });
