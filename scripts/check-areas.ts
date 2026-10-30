// Focused checks for public-area discovery. Reads only: the preserved source artifacts
// in data/sources/, the curated list, and (read-only) trip lookups in Neon.
//
// Run: node --import jiti/register scripts/check-areas.ts

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { config } from "dotenv";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../lib/generated/prisma/client";
import { CURATED_AREAS, areasInCounties, coveredCounties, type CuratedArea } from "../lib/areas/curated";
import { COUNTIES } from "../lib/trips/options";
import { getTrip } from "../lib/trips/store";

config({ path: ".env.local", quiet: true });

let failures = 0;
function check(name: string, ok: boolean, detail = "") {
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  (${detail})` : ""}`);
}

const DIR = "data/sources/md-imap-dnr-owned-lands/2026-10-30";
const HASHES: Record<string, string> = {
  "layer_query.json": "4af24eb987f74e70fa8d6e6005405758a0932a421559de241832d312df328ad6",
  "catalog_item.json": "0dee6a169ec844cbe7189e149c8aeecf2cbfec38fa900223238a9b30dd447382",
  "layer.json": "6f4c110a03136fe357a0a37c62d7e95497dbb472f2d157efcbf8e1b5e5c84837",
  "layer_metadata.xml": "eacea0cee8d9abaed8562f6087cf922d576d9f9c3bd956cbe9812e2184a9eede",
};
const SOURCE_COUNTY_TO_FIPS = Object.fromEntries(
  COUNTIES.map((c) => [c.label.replace(/ County$/, ""), c.value]),
);
const ids = (areas: CuratedArea[]) => areas.map((a) => a.id).join(",");

async function main() {
  console.log("== Preserved source artifacts ==");
  for (const [file, expected] of Object.entries(HASHES)) {
    const actual = createHash("sha256").update(readFileSync(`${DIR}/${file}`)).digest("hex");
    check(`${file} unchanged (SHA-256)`, actual === expected);
  }
  const catalog = JSON.parse(readFileSync(`${DIR}/catalog_item.json`, "utf8"));
  const termsHash = createHash("sha256").update(catalog.licenseInfo, "utf8").digest("hex");
  check("reuse terms match the hash recorded in prisma/seed.ts", termsHash === "2555e9bc6280c3ed421e03aa25f5a25546d5ebbeb5733641348c44dd477794da");

  console.log("== Curated list matches the source records ==");
  type Attr = { OBJECTID: number; DNRName: string; County: string; WebLink: string | null; DESIG: string };
  const records: Attr[] = JSON.parse(readFileSync(`${DIR}/layer_query.json`, "utf8")).features.map(
    (f: { attributes: Attr }) => f.attributes,
  );
  check("at most six areas", CURATED_AREAS.length <= 6, `${CURATED_AREAS.length}`);
  for (const area of CURATED_AREAS) {
    const all = records.filter((r) => (r.DNRName ?? "").trim() === area.sourceName);
    const counties = [...new Set(all.map((r) => (r.County ?? "").trim()))];
    const fips = counties.map((c) => SOURCE_COUNTY_TO_FIPS[c]);
    check(
      `${area.name}: record ids, every county from every record, WMA, link`,
      ids([area]) !== "" &&
        all.map((r) => r.OBJECTID).sort().join() === [...area.sourceRecordIds].sort().join() &&
        all.every((r) => r.DESIG.trim() === "WMA") &&
        !counties.includes("Multiple") &&
        fips.every(Boolean) &&
        fips.sort().join() === [...area.counties].sort().join() &&
        all.some((r) => (r.WebLink ?? "").trim() === area.sourceWebLink) &&
        area.dnrPageUrl === area.sourceWebLink.replace(/^http:/, "https:"),
      `${counties.join("+")}`,
    );
  }

  console.log("== County matching ==");
  check("Garrett -> Mt. Nebo, Cunningham Swamp", ids(areasInCounties(["24023"])) === "mt-nebo-wma,cunningham-swamp-wma");
  check("Montgomery -> McKee Beshers, Strider", ids(areasInCounties(["24031"])) === "mckee-beshers-wma,strider-wma");
  check(
    "multiple selected counties (Allegany + Montgomery) -> areas in either",
    ids(areasInCounties(["24001", "24031"])) === "dans-mountain-wma,mckee-beshers-wma,strider-wma",
  );
  check("Frederick -> no results (no area with a DNR link)", areasInCounties(["24021"]).length === 0);
  check("no counties selected -> no results", areasInCounties([]).length === 0);
  check("unknown county key -> no results", areasInCounties(["99999"]).length === 0);
  const crossCounty: CuratedArea = { ...CURATED_AREAS[0], id: "fixture-two-counties", counties: ["24001", "24043"] };
  check(
    "an area recorded in two counties matches either one, and appears once",
    ids(areasInCounties(["24043"], [crossCounty])) === "fixture-two-counties" &&
      areasInCounties(["24001", "24043"], [crossCounty]).length === 1,
  );
  check("covered counties = Garrett, Allegany, Washington, Montgomery", coveredCounties().join() === "24023,24001,24043,24031");

  console.log("== Trip lookup (read only) ==");
  const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) });
  try {
    check("malformed trip id -> nothing", (await getTrip(prisma, "not-a-uuid")) === null);
    check("unknown trip id -> nothing", (await getTrip(prisma, "00000000-0000-4000-8000-000000000000")) === null);
  } finally {
    await prisma.$disconnect();
  }

  console.log(failures === 0 ? "\nAll checks passed." : `\n${failures} check(s) failed.`);
}

main()
  .catch((e) => {
    failures++;
    console.error("check run failed:", e instanceof Error ? e.message : "unknown");
  })
  .finally(() => {
    process.exitCode = failures ? 1 : 0;
  });
