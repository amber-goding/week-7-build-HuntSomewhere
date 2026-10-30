# Prompt History — HuntSomewhere

Durable record of collaboration between the user and Claude Code on this project: what was asked, how it was redirected, what was built, why, and how it was verified. Not a transcript. Commits and PR descriptions remain canonical for *what* changed; this file holds rejected approaches, mid-session redirections, and decision rationale.

Maintained by the `prompt-history` skill (opted in via [CLAUDE.md](CLAUDE.md)). Rotates to `PROMPT-HISTORY-<YYYY>-Q<N>.md` at ~800 lines or when a calendar quarter turns.

---

## Session — 2026-10-30

### 1. Opt in to prompt history

- **Asked:** User invoked `/prompt-history`.
- **Context:** Repo contained only `README.md` and the initial commit (`02e2da6`). No `CLAUDE.md`, so the project hadn't opted in. The skill's `reference.md` (entry templates) is missing from `~/.claude/skills/prompt-history/`, so this file's format is derived from `SKILL.md` alone.
- **Decision:** Asked the user whether to opt in; they said yes.
- **Done:** Created `CLAUDE.md` (project summary from the README plus the opt-in line) and this file.
- **Verified:** N/A (documentation only). Nothing committed yet.

### 2. [Claude] Shared project plan

- **Asked:** Create `project-plan.md` as the shared source of truth for Claude and Codex, from a detailed product brief (approved stack: Next.js/TS, Neon, Prisma, OpenAI, managed auth, transactional email). No packages, app code, migrations, or commits.
- **Context:** Repo had only `README.md`, `CLAUDE.md`, and this file. Codex is installed on the machine, but `~/.codex` has no global `AGENTS.md` and no skills, so Codex would not see `CLAUDE.md` on its own.
- **Decisions (proposed, pending user override):**
  - Agent discovery: a thin repo `AGENTS.md` that points Codex to `CLAUDE.md`, `project-plan.md`, and this file, with no copied content. Codex appends to this same history file with `[Codex]` tags. Not created yet: it's the first step of M0.
  - Proposed provider defaults: Clerk (auth), MapLibre + MapTiler (maps), Resend (email), Vercel (hosting).
  - Flagged a dependency missing from the approved stack: private file storage for photos and signed documents (proposed: R2/S3 with presigned URLs).
  - Grace period left unresolved, with a placeholder default of 14 days.
  - Private-listing distance is computed only from the approximate display point, so repeated distance queries can't triangulate the exact location.
  - Explicit split of review-required vs. ordinary listing fields (plan §4.3).
  - Milestones M0–M11 total about 24–27 h against a 12–24 h window. Presentation tiers (P/S/L) in plan §10 prioritize the work without dropping any scope.
- **Done:** Wrote `project-plan.md`.
- **Verified:** Not applicable; plan only. Nothing installed, migrated, or committed.
- **Next:** M0 — create `AGENTS.md`, then feasibility checks (Maryland data sources and terms, provider accounts, email domain, written-permission requirement).

### 3. [Claude] Plan correction pass (revision 2)

- **Asked:** Documentation-only correction of `project-plan.md` covering 12 issues. No installs, code, migrations, or commits. Full scope preserved.
- **Redirections from revision 1 (what was wrong, and the fix):**
  - **M0 contradiction:** M0 banned code but required working sign-in, uploads, maps, and an OpenAI script. Split it into **M0a**, read-only research plus `AGENTS.md`, and **per-milestone integration checks** run after approval. M1 now needs only Neon and hosting.
  - **Critical path:** AI NL→filters (now M6) sits before signing, with failure-path, budget-concurrency, and ambiguity checks. Real-user testing is now **≥3 people** (M8). Signing moved to stretch (M11).
  - **Estimates:** revision 1's rows summed to 24–26.5 h (it said "24–27"), but they omitted work the corrections add: versioned review, snapshots, email outbox, a separate testing round, and three AI features with evals. Rows were rewritten and re-summed, with the arithmetic shown in the plan. Provisional totals: presentation path 19.5–30.5 h, stretch 9.5–14 h, full scope 29–44.5 h. The P path doesn't fit a 12 h window. The plan lists ordered, recorded reductions.
  - **§4.3 conflict:** exact location was both "review-required" and "edits are logged". Replaced with one process: every edit creates an immutable `ListingVersion`, and changed fields trigger `GENERAL` and/or `PRIVATE_LOCATION` review scopes. Private location values are visible only to a separate `LOCATION_REVIEWER` grant, with each view audited. They never appear in public DTOs, logs, or AI prompts.
  - **Immutable `AgreementSnapshot`** at acceptance, alternate-date acceptance, and accepted amendment. Later listing edits show a diff and never change agreements.
  - **Document status** split into completion / supersession / follow-up. `COMPLETED` is preserved on cancellation. Open invitations are revoked on cancellation or supersession. Atomic finalization under a row lock, checking the content hash.
  - **Separate `DOCUMENT_ACCESS` token** for guest retrieval of the completed copy. The guest signer sees the full document plus a read-only signer list (names, roles, status) and can act only on their own signature. The document generator has no access to private location data.
  - **Email outbox** with idempotency keys. Retries re-send emails, never re-run business actions. Tokens are minted at send time, and minting revokes earlier ones. Email (M9) precedes sharing, signing, and reminders.
  - **AI controls:** removed the claim of a hard OpenAI dashboard cap. Replaced with app-enforced budget reservation (a conditional atomic UPDATE), input and output limits, concurrency limits, and a DB + env kill switch. Citation validation now checks verbatim quotes and values, and its limits are stated. Acceptance checks added for all four AI features.
  - **Search:** ambiguous equipment, season terms, and dates become unresolved chips, never silent mappings. Distance bounds only where defensible (county boundary, or a server-computed town bucket). Otherwise labeled approximate with no guaranteed inclusion.
  - **Demo:** isolated demo actors with presenter-controlled emails, `BLOCKED_DEMO` for other recipients, and an authenticated admin-only demo outbox behind a flag, demo records only, labeled "Not delivered". No public token panel.
  - **Unverified claims:** provider capabilities marked [VERIFY]. The `~/.codex` observation in entry 2 is reworded in the plan as a dated, machine-scoped observation. Codex's `AGENTS.md` discovery is to be confirmed in M0a.
- **Done:** Rewrote `project-plan.md` (revision 2, change log §11).
- **Verified:** Re-summed milestone estimates by hand (shown in plan §9). Checked section headings for structure. No code, so nothing was executed. Nothing installed, migrated, or committed.
- **Next:** M0a — read-only feasibility research and creating `AGENTS.md`.

### 4. [Claude] M0a (partial): agent discovery + Maryland public-data feasibility

- **Asked:** Start M0a, limited to `AGENTS.md` and DNR/iMAP public hunting-area sources. Record findings with dated evidence and three implementation cautions. No installs, code, provisioning, migrations, or commits. Leave Codex verification pending.
- **Done:**
  - Created `AGENTS.md`: a pointer to `CLAUDE.md`, `project-plan.md`, and this file, with instructions to append `[Codex]`-tagged entries here in the existing format.
  - Plan revision 3: findings rows in §3.3, new §3.4 (source detail plus recommended import), cautions C1–C3 in §9, and the spec fixes those cautions required.
- **Findings (read-only GETs, 2026-10-30):**
  - **Hunting Atlas not available:** the DNR Hunting Atlas service `dnr.geodata.md.gov/.../AIMS/HuntingAtlasRO/MapServer`, which search engines still cite, returned "Service … not found". The DNR `Hunting` services folder lists nothing public.
  - **Working source:** the iMAP `MD_ProtectedLands` FeatureServer layer 0 (DNR Owned Lands and Conservation Easements), on the `mdgeodata.md.gov` host. The `geodata.md.gov` host served an HTML maintenance page.
    - 580 records, 92 of them WMA polygons (65 names). A GeoJSON query in EPSG:4326 works.
    - **No field identifies hunting access.** Most easement records are private land.
    - 16 WMA names have no `WebLink`. All 48 distinct links returned 200.
    - No data-edit date (the metadata creation date is 2025-04-14). No explicit license, only a credit line and a DNR no-warranty disclaimer.
  - **Hunting terms live on per-WMA DNR pages:** the Avondale page explicitly permits hunting, with permit, Sunday, and reservation rules, but as unstructured text.
- **Decisions:**
  - Initial import is the WMA subset only. Hunting status starts "Not confirmed" and becomes confirmed only from a recorded DNR-page quote and date, never from `DESIG`.
  - Easements are never imported as hunting areas.
  - Reuse terms remain an open item, to be confirmed in writing before launch.
- **Cautions recorded (C1–C3), with plan text corrected where it conflicted:**
  - **C1 (§6.6):** previously said timeouts release the AI budget reservation. Now timeouts count as spent.
  - **C2 (§6.5):** previously minted a fresh token on each retry, which with provider idempotency could deliver a dead link. Now tokens are deterministic per send via HMAC, and retries never mint or revoke.
  - **C3 (§4.3):** previously carried ordinary edits *into* a pending version, which mutated a submitted version. Now every edit makes a new version, and approvals are bound to per-scope content hashes.
- **Agent mistake caught (my own, during research):** my first link-status check reported 48/48 failures. The cause was Windows CRLF line endings in the URL list my script wrote, not the DNR site. A rerun with CR stripped gave 48/48 HTTP 200. This is a gate-evidence candidate.
- **Verified:** the endpoint responses, counts, field lists, GeoJSON output, and link statuses above were observed directly. The license and freshness conclusions are from the metadata as observed. Hunting access was checked on one WMA page only (Avondale), not all 48.
- **Not done:** the other M0a rows (federal lands, PAD-US, county/municipal, county boundaries and places, taxonomy, written-permission wording, provider docs). Codex verification is pending. Nothing installed, migrated, or committed.
- **Next:** County boundaries + places (D7) research, which feeds the distance bounds and the location-review county check.

### 5. [Claude] Reuse-terms correction + county and place reference research

- **Asked:** Remove the unsupported "fine for the presentation with attribution" conclusion and record reuse permission as unresolved. Check the linked ArcGIS item and published Maryland/iMAP terms for an explicit reuse basis, keeping a disclaimer distinct from a grant, and without assuming a permission letter is needed. Keep HTTP availability separate from accuracy and freshness. Don't repeat completed endpoint tests. Then research county boundaries and town/place reference only.
- **Correction to entry 4:**
  - Entry 4 said "No explicit license" and that terms were "to be confirmed in writing before launch". Both were incomplete. I had checked only the service-level `iteminfo`, whose `licenseInfo` is empty, and not the official catalog item.
  - My summary in that turn also called the terms "fine for the presentation with attribution". That conclusion was unsupported and has been removed from the plan.
- **Findings (2026-10-30, read-only):**
  - **Official catalog item:** ArcGIS item `a5de633b6ebf450b94dcb08b519c3414` (owner `mdimapdatacatalog`, Maryland's org) points to exactly our endpoint. Its `licenseInfo` contains the as-is / no-liability disclaimer **and, separately, an explicit grant**: "The Data can be freely distributed as long as the metadata entry is not modified or deleted. Any data derived from the Data must acknowledge the State of Maryland in the metadata." The same text appears on the iMAP county and municipal items.
  - **Reuse status:** recorded as **UNRESOLVED pending your acceptance** of that published grant. No written letter is assumed to be needed.
  - **Freshness:** catalog modified dates (2025-05-12) are recorded as catalog dates, not data-edit dates. Data freshness is still unknown.
  - **Counties:** iMAP `MD_PoliticalBoundaries/FeatureServer/1` has 24 county-equivalents, **Baltimore City `COUNTY_FIP` 510 separate from Baltimore County 5**. It covers legal extent including water (Anne Arundel ≈ 0.160 vs 0.111 deg² in the shoreline layer) but is coarse (Baltimore City has 38 vertices). The shoreline "Physical" layers exclude water, and the detailed one has `maxRecordCount` 50.
  - **Places:** the Census TIGER/Line 2025 Maryland place file has 536 places (157 incorporated + 379 CDPs), with polygons and internal points but no county field. Its ISO metadata has an explicit grant: "free to use in a product or publication, however acknowledgement must be given to the U.S. Census Bureau as the source." The Gazetteer files (2024/2025/2026, 536 rows each) have no use statement, so the TIGER grant isn't assumed to cover them. The iMAP municipal layer covers incorporated places only (162 polygons). A TIGER 2026 Maryland place file exists (HTTP 200) but hasn't been inspected.
- **Decisions (proposed):**
  - Counties come from iMAP Political County Boundaries, keyed by 5-digit FIPS (`24510` = Baltimore City).
  - A county-line mismatch is flagged for the reviewer rather than rejected, because the boundaries are coarse and offshore blinds are legitimate.
  - Towns come from Census TIGER/Line places, with each place's county assigned by testing its internal point.
- **Done:** plan revision 4 (§3.3 rows, a four-question reading guide for findings, §3.4 split into availability / content / freshness / disclaimer / grant rows, new §3.5, D7, change log).
- **Method notes:** I didn't repeat the earlier DNR endpoint or link tests. The TIGER zip was downloaded to its own scratchpad folder, and only its metadata and DBF header and rows were read in memory, with nothing extracted or executed. Vertex counts and areas come from EPSG:4326 query output (approximate planar deg²).
- **Not done:** the other M0a rows (federal lands, PAD-US, county/municipal hunts, taxonomy, written-permission wording, provider docs). Codex verification is pending. Nothing installed, provisioned, migrated, or committed.
- **Next:** pending your call on accepting the published iMAP and Census grants. Otherwise the remaining M0a research rows.

### 6. [Claude] Rev 4 correction: header, reuse basis, metadata preservation

- **Asked:** Documentation-only fix to `project-plan.md`:
  - Header to revision 4, with repo state taken from actual Git history.
  - Drop "pending user acceptance" as the reuse blocker. Record the exact published terms as the proposed basis, with compliance conditions and the genuinely open interpretations.
  - Require an unmodified copy of source metadata alongside imports, plus retained attribution, without assuming a catalog link satisfies metadata preservation.
- **Redirection:** entry 5's "Next" (waiting on the user to accept the grants) is superseded. The published terms are now the proposed basis, not a pending approval.
- **Done (plan only):**
  - **Header:** revision 4. Repo state from `git log` / `git ls-files`: commits `02e2da6`, `eaff8e8`, `d771662`, and 5 tracked files. It previously said "No commits beyond the initial one", which was wrong.
  - **"Pending acceptance" wording removed:** D7, §3.3 rows (DNR lands, counties, places), §3.4 reuse rows, and §3.4 import step 6 now point to §3.6.
  - **New §3.6:** verbatim iMAP `licenseInfo` and Census TIGER/Line use constraints, each marked by the scope verified. Compliance conditions R1–R8 (R1: byte-for-byte metadata copies with URL, time, and SHA-256 per `ImportRun`; a hyperlink alone is not treated as sufficient). Open interpretations U1–U5: what counts as "distributed", which artifact is "the metadata entry", whether DNR web pages are covered (their terms not reviewed), Gazetteer coverage, and the county item's full license text.
  - **§6.2 update strategy:** now stores the metadata and terms copies with each run.
  - **Change log:** a correction note added under rev 4.
- **Verified:** the git commits and tracked files were read directly. The iMAP terms quote comes from the item JSON saved in the scratchpad on 2026-10-30. The TIGER quote comes from the metadata XML in the already-downloaded 2025 zip. No new network research, and the county item's full license text was not fetched (recorded as U5).
- **Not done:** nothing installed, migrated, or committed. The other M0a rows and the Codex verification are still pending.

### 7. [Codex] Instruction-discovery verification

- **Asked:** Read `AGENTS.md` and every referenced project instruction, verify instruction discovery only, report the required project and workflow facts, and record the verification in the plan and this shared history. No research, installs, application code, migrations, or commits.
- **Context:** Codex received the repo-root `AGENTS.md` as its instruction entry point. It points to `CLAUDE.md`, `project-plan.md`, and this file without duplicating their contents.
- **Decision:** Claude's `prompt-history` skill named in `CLAUDE.md` is not available to Codex. Codex used the documented equivalent in `AGENTS.md`: re-read this existing file immediately before appending, match the established entry format, and tag the heading `[Codex]`. No second history file was created.
- **Done:** Read all four instruction and planning files in full. Updated `project-plan.md` to revision 5, marked Codex discovery verified in §1 and §3.3, documented the Claude-specific logging equivalent, removed the pending-verification wording from the M0a status and milestone row, and added the revision-5 change-log entry.
- **Verified:** Project is HuntSomewhere. The plan is `project-plan.md`; the shared log is `PROMPT-HISTORY.md`, using numbered session entries with agent-tagged headings and labeled bullets. Approval rules remain: explicit user approval before any package install, migration, or commit; milestones end with acceptance evidence, review, logging, and an approval stop. Current milestone is M0a, still in progress because other research rows remain open. No research, packages, application code, migrations, or commits were performed.
- **Next:** Continue the remaining M0a research only when the user requests it.

### 8. [Claude] M0a: species/equipment taxonomy + written-permission requirement

- **Asked:** Research only Maryland species/equipment taxonomy and written-permission requirements from current official DNR and legislative sources. Recommend filter values keeping species, equipment, season rules, property restrictions, and availability separate. Flag ambiguous terms (including white-tailed vs. sika). No season engine. Record permission requirements with dated links, separating explicit requirements from product choices. No sufficiency claim. No installs, code, migrations, or commits.
- **Context:** Codex had verified instruction discovery (entry 7, plan rev 5). The plan header still listed 3 commits, while `git log` showed 5, so it was corrected.
- **Findings (read 2026-10-30):**
  - **NR §10-411 (2026 session text, `mgaleg.maryland.gov/2026RS/Statute_Web/gnr/10-411.pdf`):**
    - (a) written permission of the landowner or the landowner's agent or lessee is required to hunt on another's land. (b) hunter liable for damage. (c) landowner not liable for accidental injury. (d) Harford County misdemeanor, $25–$250.
    - **No form, content, carry, or electronic-signature rule.**
    - The 2025 session PDF has a different file hash, and its text wasn't compared.
  - **Secondary sources found but not relied on:** the DNR 2026–2027 guide says "property owner" written permission in all counties (the statute is broader). The bear page says "Written permission is required." An undated FindLaw county list conflicts with current statute.
  - **DNR permission form gone from its URL:** the COMPASS form URL now 301-redirects to `mdoutdoors.maryland.gov`, and the form wasn't located.
  - **SB 582 (2022)** amended NR Title 5 liability sections, not §10-411.
  - **Taxonomy (DNR 2026–2027 guide, pages updated 2026-09-30 to 10-14):**
    - **Sika deer is separate from white-tailed** (own limits, Sika Deer Stamp, different "antlered" definition, lower Eastern Shore).
    - Deer devices: vertical bow, crossbow, muzzleloader, shotgun, rifle, handgun, air gun. Rifles and handguns are split by straight-walled vs. bottleneck cartridge, with bottleneck area-restricted.
    - Closed or excluded: bobcat, Delmarva fox squirrel, trapping-only furbearers.
    - The turkey and falconry pages weren't read.
- **Decisions (proposed):**
  - Two-level species values. Equipment values that avoid season names, with "Archery" and "Firearms" as UI groups only.
  - Ambiguous-term table: bow, archery, gun/firearm, rifle, muzzleloader, primitive, deer, buck/doe, fox, squirrel, goose, and group words.
  - Five-concept separation table.
  - Product choices P1–P6, including aligning the poster relationship with the statute's roles (landowner / agent / lessee) in M4, and document wording that disclaims sufficiency.
  - Open legal questions L1–L5, including whether electronic signatures count as "written". Maryland e-transactions law was not reviewed.
- **Done:** `project-plan.md` rev 6 (header, §3.3 rows, M0a status, new §3.7 and §3.8, change log).
- **Verified:** the statute text was read from the official PDF. DNR guide content was read via page fetches (summarized, with short quotes). The sika distribution comes from a search excerpt of the DNR page, not a full fetch. No season eligibility is computed or implied.
- **Not done:** federal hunting lands, PAD-US, county/municipal hunts, provider docs. Nothing installed, migrated, or committed.
- **Next:** provider documentation review (D1–D5, D9), the last M0a item that M1 and M2 depend on.

### 9. [Claude] Correction pass on §3.7 taxonomy and §3.8 permission

- **Asked:** Correct only the new taxonomy and permission sections:
  - broad searches expand groups instead of forcing clarification;
  - separate species from groups, and split raccoon from opossum;
  - scope equipment rules to their source species, keep turkey and falconry unconfirmed, and never infer compatibility from owner statements;
  - reword legal-absence claims without promising liability protection;
  - remove the E7 safety-distance summary;
  - keep capacity separate from organization type.
  No new research, code, installs, migrations, or commits.
- **Redirections from entry 8 (what was wrong, and the fix):**
  - **Ambiguity handling:** entry 8 required clarification chips for terms like "deer" and "bow", which blocked broad discovery. Now defined groups expand to visible, editable member chips, and clarification is required only for access requests, AI listing drafts, or date intent. Undefined words ("predators", "varmints", "birds") stay unresolved, with suggestions. §6.1's bullet and the §6.6 NL→filters acceptance check were updated to match, as the request required consistency.
  - **Species vs. groups:** entry 8 stored `ducks`, `squirrel`, `fox`, `raccoon_opossum`, and `rails` as if they were species. Now every value has a `species` or `group` kind. Squirrels, foxes, and rails are split into member species, `raccoon` and `opossum` are separate, and `ducks`, `light_geese`, `coots`, `quail`, and `crow` are labeled groups because the sources don't name single species.
  - **Equipment scope:** entry 8's device notes read as universal. They're now labeled "For deer (DNR guide)", with a compatibility table: deer is sourced, turkey and falconry are unconfirmed, and bear, small game, migratory birds, and furbearers are "not established by the sources reviewed". Owner species + method statements are property restrictions only, and a combination is confirmed for matching only when the owner records methods per species.
  - **Legal wording:** "the sources do not specify" became "§10-411 does not specify…", plus "not established by the sources reviewed", noting that other law may address these points. The full (c) quotation is restored, with "no statement or promise about liability". FindLaw is described by what §10-411(a) does not specify, not by a legal conclusion.
  - **E7 removed** (safety distances and field permissions under §10-410(g)/(h)).
  - **P1:** capacity (landowner / agent / lessee) is now a separate field from organization type (individual / hunting club), proposed to replace §4.2's single relationship value in M4.
- **Done:** `project-plan.md` §3.7 body, §3.8, the §3.3 permission row, the §6.1 ambiguity bullet, the §6.6 acceptance check, and a change-log note under rev 6.
- **Verified:** `git diff --check` was run (result reported to the user). No new sources were consulted, and all content comes from the sources already recorded in entry 8.
- **Not done:** nothing installed, migrated, or committed. The remaining M0a rows are unchanged.

### 10. [Claude] M0a: provider documentation review

- **Asked:** Review current official docs to prepare app setup. Priority on Vercel, Neon + Prisma, and managed auth with Google + email/password. Record setup requirements, env-var names only, plan restrictions, and dated links. Briefly evaluate maps, email, storage, and OpenAI, deferring their setup. Identify deferrable research without marking M0a complete. No accounts, installs, provisioning, code, migrations, or commits.
- **Findings (official docs read 2026-10-30; doc dates where shown):**
  - **Vercel:**
    - Hobby (2026-09-14): "non-commercial, personal use only", 300 s function max.
    - Cron (2026-07-15): Hobby runs at most **once per day** with ±59 min precision.
  - **Neon + Prisma:**
    - The guide targets Prisma 7 (Node 20.19+/22.12+/24+, pin all three packages at `@7`).
    - Connections: `DATABASE_URL` pooled for runtime, `DATABASE_URL_UNPOOLED` direct for CLI and migrations, `@prisma/adapter-neon`, `connect_timeout=15` for cold starts.
    - Free plan: scale-to-zero after 5 min can't be disabled. 1 GB, 100 CU-hours per project.
    - Marketplace integrations create preview branches, and manual setup doesn't. The env names the integrations set weren't stated ([VERIFY] in M1).
  - **Clerk:**
    - `@clerk/nextjs`, `clerkMiddleware()` in `proxy.ts` on Next.js 16+.
    - Env: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`.
    - Development uses shared Google credentials. **Production needs your own Google OAuth client** (Google "In production" status requires app verification) **and "a domain you own"** (DNS up to 48 h).
    - Hobby: 50,000 MRU, branding not removable.
  - **Neon Auth:**
    - Managed Better Auth, users in the `neon_auth` schema. `@neondatabase/auth`, `NEON_AUTH_BASE_URL`, `NEON_AUTH_COOKIE_SECRET`. Email/password is shown.
    - Production needs trusted domains, custom SMTP for verification links (codes work with the shared SMTP), and its own Google OAuth app.
    - The OAuth guide URL returned 404. MAU limits and release stage were not stated.
  - **Vercel Blob (2026-08-26):** **private stores** exist, with authenticated reads through our functions and OIDC by default. The access mode is fixed at creation.
  - **MapTiler Free:** non-commercial, logo required, service pauses at the monthly limit.
  - **Resend:** `resend.dev` sends only to the owner's address. `Idempotency-Key` kept 24 h (a different payload returns 409). Free: 100/day, 3,000/month.
  - **OpenAI:** strict `json_schema` via `text.format` in the Responses API, refusals in a `refusal` field. Spending-limit enforcement was only described by third parties, so it isn't relied on.
- **Decisions (proposed):**
  - **Vercel** (Hobby for build and presentation, plan for launch decided later) + **Neon via a Marketplace integration** + **Prisma 7**.
  - **Clerk** for auth, with a local `User` upserted on first authenticated request.
  - Decision rule: if no domain by M2, switch to Neon Auth with verification codes. Auth.js dropped.
  - D5 now recommends a **Vercel Blob private store** (approval still needed).
  - Email retries stay "after commit + manual", because Hobby cron is daily.
- **Redirection:** the change log had rev 5 and rev 6 listed above rev 1. It was reordered chronologically, with no content changes.
- **Done:** `project-plan.md` rev 7:
  - new §3.9 (provider findings, env-var names, deferred-provider evaluation, M0a done/deferred table);
  - D1–D5 and D9 rows, §2.3 user actions;
  - §3.3 provider row, M0a status;
  - R6 updated, R9 added;
  - header (six commits) and change log.
- **Verified:** all findings come from the doc pages fetched on 2026-10-30. Gaps are marked [VERIFY]. `git diff --check` exit 0. Nothing installed, provisioned, migrated, or committed, and no accounts created.
- **Not done (deferred, not blocking M1/M2):** DNR website terms (U3, before M3), federal lands, PAD-US, county/municipal hunts, and full storage/maps/email/AI checks in M4, M3, M9, and M6. **M0a is not complete.**
- **Next:** M1, the app skeleton and deploy. It needs approval before the package install and before the first migration.

### 11. [Claude] M1 (partial): Next.js application foundation

- **Asked:** On `feat/app-foundation` only, set up the app foundation. The user authorized installing Next.js App Router, TypeScript, Tailwind CSS, and ESLint packages. Preserve docs and history. Scaffold in a temp sibling if the directory isn't empty. Use the npm lockfile. Build a simple responsive cream / forest-green landing page with no fake listings or nonfunctional controls. No Prisma, auth, maps, storage, email, or AI packages. No external services, deploy, migrations, or commits. Run lint, typecheck, and build, and record this as partial M1.
- **Context:** branch confirmed `feat/app-foundation`, clean tree, Node v24.18.0, npm 11.16.0. Official install docs (`nextjs.org/docs/app/getting-started/installation`, lastUpdated 2026-10-02): Node ≥ 20.9. `--yes` defaults to TypeScript, Tailwind, ESLint, App Router, Turbopack, `@/*`, **and an `AGENTS.md`**. `npm view`: next / create-next-app `16.4.3` latest.
- **Decisions:**
  - Scaffolded into `../.huntsomewhere-scaffold/huntsomewhere` with `create-next-app@16.4.3 --ts --tailwind --eslint --app --use-npm --import-alias "@/*" --disable-git --no-agents-md --no-agent-feedback --yes`. **`--no-agents-md`** prevents a second `AGENTS.md` conflicting with ours. Defaults kept: Cache Components on, no `src/`, no React Compiler.
  - Transferred only `.gitignore`, `package.json`, `package-lock.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, and `app/{layout,page,globals.css}`, after checking that none existed. **Not copied:** the scaffold README (ours kept), any `.git` (none was created), `node_modules`, `.next`, `next-env.d.ts` (generated), starter SVGs, and the default favicon.
  - Ran `npm ci` from the lockfile, then removed the temp directory.
  - `.gitignore`: kept the scaffold's `.env*` rule and added `!.env.example`, because the plan's M0b template holds names only.
  - Added a `typecheck` script (`next typegen && tsc --noEmit`).
  - Landing page:
    - header wordmark, forest-green hero, three descriptive cards (hunters, landowners, data honesty), an "In development" note, and a DNR / legality footer;
    - no links, buttons, forms, or listings;
    - color tokens in `globals.css` (cream `#f7f3e8`, forest `#1f4d2b`), with a dark-scheme variant;
    - Geist font only.
- **Installed (top level):** next 16.4.3, react 19.3.0, react-dom 19.3.0, typescript 5.9.3, tailwindcss 4.3.3, @tailwindcss/turbopack 4.3.3, eslint 9.39.5, eslint-config-next 16.4.3, @types/node 20.19.43, @types/react 19.3.0, @types/react-dom 19.3.0. 357 packages, 0 vulnerabilities.
- **Warnings noted, not acted on:** npm flags `eslint@9.39.5` as "no longer supported". This is the version `eslint-config-next@16.4.3`'s scaffold pins (`^9`). npm 11 skipped `unrs-resolver@1.12.2`'s postinstall pending `npm approve-scripts`. Lint still passed.
- **Verified:**
  - `npm run lint` exit 0. `npm run typecheck` exit 0. `npm run build` exit 0 (Next 16.4.3 Turbopack, `/` and `/_not-found` prerendered static).
  - `next start` on port 3107 returned HTTP 200 with the HuntSomewhere title, heading, and in-development note. The server was then stopped.
  - `git check-ignore` confirms `node_modules`, `.next`, `next-env.d.ts`, `.env`, `.env.local`, `.env.production` are ignored, and `.env.example` is allowed.
  - Tracked docs: no diff.
  - **Not verified:** visual rendering in a browser at phone width (no browser check was run).
- **Not done (remaining M1):** Prisma 7 + Neon, Vercel deploy, integration checks, first migration. Nothing committed. Plan updated to rev 8 (header, M1 row partial note, change log).
- **Next:** finish M1 with Prisma 7 + Neon (needs approval for the Prisma packages and the first migration), then the Vercel deploy.

### 12. [Claude] M1 (partial): Prisma 7 configuration

- **Asked:** On `feat/app-foundation`, prepare Prisma 7 configuration only. Installs authorized: `prisma`, `@prisma/client`, `@prisma/adapter-neon`, plus dependencies the official setup docs require.
  - Create `prisma.config.ts`, a minimal PostgreSQL schema with the client generator, and a server-only reusable client.
  - The CLI must load `.env.local` explicitly.
  - `.env.example` holds placeholders only. Runtime uses the pooled URL, and the CLI uses the direct URL.
  - No tables, migrations, db push, provisioning, deploy, or commit. Never print connection strings.
- **Context:**
  - Branch confirmed, tree clean at `92ff49a` (the user committed the foundation). No `.env.local`, and `DATABASE_URL` / `DATABASE_URL_UNPOOLED` are not set in the shell, so **credentials are unavailable**.
  - Docs read 2026-10-30:
    - **Neon Prisma guide:** Prisma 7, pin `@7`, `dotenv`, `import 'dotenv/config'`, `env('DATABASE_URL_UNPOOLED')`, `PrismaNeon({ connectionString })`. Its example uses `prisma-client-js`.
    - **Prisma config reference:** env files "need to be loaded explicitly". `env()` throws if a var is undefined, and `process.env` should be used when it's optional.
    - **Prisma generators doc:** `prisma-client` is the default, `output` is required, and **`prisma-client-js` is deprecated**.
    - **Next.js docs:** installing `server-only` is optional, because Next handles the import internally.
  - `npm view`: `prisma` `latest` is **8.0.0-rc.28**, and the 7.x latest is 7.10.1. prisma@7.10.1 engines: Node ^20.19 / ^22.12 / >=24 (we have 24.18.0).
- **Decisions:**
  - Pinned exactly: `@prisma/client` and `@prisma/adapter-neon` 7.10.1 (deps), and `prisma` 7.10.1 (dev).
  - `dotenv` **17.4.2** (dev). 18.0.9 was published 2026-10-22, and the docs don't pin a version.
  - `tsx` not installed: Neon lists it only for running TS scripts, and Prisma loads `prisma.config.ts` itself.
  - `@neondatabase/serverless` comes transitively (1.2.0), as Neon advises.
  - `prisma.config.ts` uses `config({ path: ".env.local", quiet: true })` and reads `DATABASE_URL_UNPOOLED` via `process.env`. The datasource is included only when the var is set, so generate and validate run without credentials.
  - Schema: `prisma-client` generator → `lib/generated/prisma` (gitignored and ESLint-ignored), `postgresql`, no models. **Deviates from Neon's `prisma-client-js` example** in favor of Prisma's own current guidance.
  - `lib/db.ts`: `import "server-only"`, lazy `getPrisma()` with a `globalThis` cache, `PrismaNeon` with the pooled `DATABASE_URL`, and a clear error if it's unset.
  - Scripts added: `db:validate`, `db:generate`, `postinstall: prisma generate` (needed because the generated client is gitignored).
  - `.env.example` has empty `DATABASE_URL` / `DATABASE_URL_UNPOOLED`.
- **Agent mistake caught (mine):**
  - **What happened:** to prove `postinstall` regenerates the client, I ran `npm ci`. It deleted most of `node_modules` and then failed with **EPERM**, because the user's running `npm run dev` (pids 25092/40168/38892) held `lightningcss.win32-x64-msvc.node`. `next` and `prisma` were missing afterward, and the user's dev server was left running against removed files.
  - **Fix:** I didn't kill the user's process. I restored with `npm install` from the same lockfile, which succeeded with the same top-level versions and with `postinstall` regenerating the client.
  - **Lockfile:** it changed only by adding `"hasInstallScript": true` to the root entry, which is correct given the new `postinstall`.
  - **Lesson:** check for running dev servers before any command that deletes `node_modules`. This is a gate-evidence candidate.
- **Install-script warnings (npm 11 allowScripts), not approved:** `prisma` preinstall, `@prisma/engines` postinstall, and `unrs-resolver`. validate and generate work without them. **Whether migrate / db push need the `@prisma/engines` postinstall is untested** and needs checking before the first migration.
- **Verified (no credentials):**
  - `prisma validate` exit 0. `prisma generate` exit 0 (Prisma Client 7.10.1). lint exit 0. typecheck exit 0. build exit 0 (static `/`), all after the restore.
  - `.env.local` loading was proven with a **temporary file of fake `.invalid` URLs**: the config resolved the *direct* host. Without the file, the datasource was omitted. The file was then deleted. This used Node's TS loader, not Prisma's.
  - `lib/generated/` and `.env.local` are git-ignored, and `.env.example` is trackable. No connection-string pattern in tracked or untracked files. `git diff --check` exit 0.
- **Not tested (blocked by missing credentials, not failures):** database connectivity, a runtime query through `PrismaNeon`, and CLI commands that connect.
- **Not done:** Neon setup, first migration, deploy, integration checks. Nothing committed. Plan updated to rev 9 (header, M1 row, change log).
- **Next:** the user creates the Neon database and fills `.env.local`. Then a connectivity check and the first migration (each with approval), then the Vercel deploy.

### 13. [Claude] M1 (partial): read-only Neon connectivity check

- **Asked:** Verify the Neon connection with read-only checks only:
  - load `.env.local` without displaying values;
  - confirm both variables exist and point at the same endpoint (accounting for `-pooler`);
  - `SELECT 1` on both URLs and through the Prisma runtime client with its Neon adapter.
  Use existing tooling, with no installs and no exposed credentials. No public diagnostic route, no tables, writes, migrations, db push / pull, deploy, or commit. Close connections, remove temp files, and keep M1 partial.
- **Context:** branch `feat/app-foundation`, clean tree at `1537e35` (the user committed the Prisma config and created `.env.local`, which is git-ignored). Existing tooling used: `dotenv` 17.4.2, `@neondatabase/serverless` 1.2.0 (transitive via the adapter), and `jiti` 2.7.0 (transitive via Prisma's config loader), to import the generated TypeScript client.
- **Method:**
  - A temporary script in the session scratchpad, outside the repo.
  - `.env.local` parsed into a private object, never into the shell. Output is booleans and timings only. Errors are sanitized by redacting the URLs, user, password, and hosts, plus any `postgres://` or `*.neon.tech` pattern, and the run output was additionally filtered for those patterns.
  - Raw checks: `Pool` → `SELECT 1` → `pool.end()`.
  - Prisma check: mirrors `lib/db.ts` (generated `PrismaClient` + `PrismaNeon` with the pooled `DATABASE_URL`) → `$queryRaw SELECT 1` → `$disconnect()`. `lib/db.ts` itself wasn't imported, because `import "server-only"` only resolves inside Next.js.
  - The script was deleted afterward.
- **Results (2026-10-30):**
  - Variables: `DATABASE_URL` present, `DATABASE_URL_UNPOOLED` present.
  - Endpoint:
    - both parse as Postgres URLs;
    - the pooled host has `-pooler` and the direct host doesn't;
    - **same endpoint after removing the suffix**, same domain, same database name, same role;
    - `sslmode=require` on both;
    - `connect_timeout` **not set on both** (recommendation from plan §3.9, not a failure).
  - `SELECT 1` on the pooled URL: **passed** (≈1.9 s). On the direct URL: **passed** (≈1.2 s). Through the Prisma runtime client + `PrismaNeon` on the pooled URL: **passed** (≈2.8 s).
  - No errors occurred, so no sanitized errors to report.
- **Not exercised:** Prisma CLI commands that connect (e.g. `migrate status`), deliberately skipped to stay clearly read-only. The direct URL the CLI uses did pass `SELECT 1`. Whether migrate needs the unapproved `@prisma/engines` postinstall is still untested.
- **Repo:** unchanged by the check (`git status` clean, no `prisma/migrations`). Plan updated to rev 10 (header with 9 commits, M1 row, §3.3 integration-checks row, change log). Nothing committed.
- **M1 status:** still **partial**. Persistence (a table plus a write that survives a redeploy) and the Vercel deploy aren't proven.
- **Next:** optionally add `&connect_timeout=15` to both URLs in `.env.local`. Then, with approval, check whether the Prisma CLI's migrate works with the skipped engine install scripts, and plan the first migration.

### 14. [Claude] M1 (partial): first model `DataSource` + SQL preview

- **Asked:** Add the first useful model, `DataSource`, per the plan, with only identity, URL, attribution, reuse terms, and timestamps. Defer import-run relations and explain the constraints and defaults. Validate, regenerate the client, and produce a local SQL preview with `prisma migrate diff` from empty, checking the installed CLI's help for syntax. Preview only: no migrate dev / deploy, db push, records, install-script approval, installs, deploy, or commit. Report an engine block instead of changing permissions.
- **Context:** branch `feat/app-foundation`, clean at `35cbbd9`. Plan §4.2 listed `DataSource` as name, URL, license/reuse terms, attribution text, and last import run (the last one deferred per the request). `prisma migrate diff --help` (7.10.1) says the command is **read-only**. Syntax: `--from-empty` / `--to-schema <path>` / `--script` / `-o <file>`. Only `--*-config-datasource` would touch the DB.
- **Model (`prisma/schema.prisma`, table `data_sources`):**

  | Field | Type / constraint | Why |
  |---|---|---|
  | `id` | `String @db.Uuid`, `@default(dbgenerated("gen_random_uuid()"))` | DB-side default, so any insert path (Prisma, SQL, import scripts) gets an ID. Built into PostgreSQL 13+. |
  | `slug` | `String @unique` | Stable human-readable key the importer upserts on (e.g. `md-imap-dnr-owned-lands`) |
  | `name` | `String` | Display name |
  | `url` | `String` (not unique) | Canonical page shown to users. Two layers can share a portal page. |
  | `attribution` | `String` | Credit text required in the product (§3.6 R5) |
  | `reuseTerms` → `reuse_terms` | `String` (text) | Published terms verbatim (§3.6). Required, so no source can exist without recorded terms. |
  | `createdAt` → `created_at` | `Timestamptz(3)`, `@default(now())` | Timezone-aware. DB default. |
  | `updatedAt` → `updated_at` | `Timestamptz(3)`, `@updatedAt` | Set by Prisma Client, **with no DB default**, so raw SQL inserts must supply it |

  - All fields are required. snake_case tables and columns are mapped from camelCase.
  - No CHECK constraints: Prisma schema can't express them, so slug and URL format validation belongs at the app layer.
  - **Deferred:** `ImportRun` relation, preserved metadata copies (R1), and `PublicArea` relation.
- **Engine note:** `node_modules/@prisma/engines/schema-engine-windows.exe` exists (created 06:48:02, about 30 s after the `prisma` package, during entry 12's restore install). It wasn't downloaded during this task. No install-script approval was given or needed.
- **SQL preview:** `prisma/sql-preview/0001_data_sources.preview.sql`, from `npx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script -o …`. Contents: `CREATE SCHEMA IF NOT EXISTS "public"`, `CREATE TABLE "data_sources"` (as above, PK `data_sources_pkey`), and `CREATE UNIQUE INDEX "data_sources_slug_key"`. A "PREVIEW ONLY" header comment with the regeneration command was prepended. It sits outside `prisma/migrations`, which doesn't exist.
- **Verified:** `prisma format --check` 0, `prisma validate` 0, `prisma generate` 0 (client 7.10.1), `migrate diff` 0, lint 0, typecheck 0, build 0, `git diff --check` 0. No DB connection was used by the diff, and Neon is unchanged.
- **Not verified:** the Neon server's PostgreSQL version (`gen_random_uuid()` needs ≥ 13). Whether `migrate dev` works end to end.
- **Plan:** rev 11 (header with 10 commits, §4.2 `DataSource` entry, M1 row, change log). Nothing committed.
- **Next:** with explicit approval, create and apply the first migration to Neon (`migrate dev --name init_data_sources` on a dev branch), then the persistence proof and Vercel deploy.

### 15. [Claude] M1 (partial): first migration `init_data_sources` applied to Neon

- **Asked:** The user approved applying the first `DataSource` migration to the dedicated HuntSomewhere Neon database. Requirements:
  - read-only pre-checks (PostgreSQL ≥ 13, URL match, existing tables and migration history), stopping if anything is unexpected;
  - create migration `init_data_sources` from the reviewed preview via the documented CLI workflow, verifying the SQL before applying;
  - apply with the direct connection;
  - read-only post-checks, regenerate, lint/typecheck/build, keep the SQL and lock file;
  - no reset, db push, records, script approvals, installs, deploy, or commit. M1 stays partial.
- **Redirection from entry 14:** entry 14's "Next" suggested `migrate dev`. Instead I used the **documented baselining pattern** (`migrate diff --from-empty --to-schema --script` into a migration folder) plus **`migrate deploy`**.
  - Prisma's shadow-database doc (read 2026-10-30) says `migrate dev` creates and drops a temporary shadow database (it needs CREATEDB, which would alter the Neon project beyond our DB) and can prompt for resets.
  - `migrate deploy` uses no shadow database and never resets.
  - CLI help: `migrate deploy` reads the datasource URL from the Prisma config, which is `DATABASE_URL_UNPOOLED` = direct.
- **Pre-checks (read-only, temp script outside the repo, sanitized, deleted after):**
  - Both env vars present. Same endpoint after removing `-pooler`, same database name and role.
  - **PostgreSQL 18.6** (`server_version_num` 180006) on both connections.
  - `public` is the only non-system schema. **No tables** in `public` or elsewhere. **No `_prisma_migrations`.**
  - `gen_random_uuid()` available. Role can CREATE in `public`. Pooled and direct see the same (empty) table set.
  - No stop condition was met.
- **Migration creation:**
  - Confirmed `prisma/migrations` didn't exist, then created `prisma/migrations/20261030133412_init_data_sources/`. The folder is named like `migrate dev` would (UTC timestamp + name).
  - `migration.sql` came from `npx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script -o …`. It's **byte-identical to the reviewed preview body** (preview minus its 5-line header). Its only statements are `CREATE SCHEMA IF NOT EXISTS "public"`, `CREATE TABLE "data_sources"` (with `data_sources_pkey`), and `CREATE UNIQUE INDEX "data_sources_slug_key"`.
  - `prisma/migrations/migration_lock.toml` was written with the exact template from the installed `prisma@7.10.1` CLI source (`# Please do not edit this file manually` / `# It should be added in your version-control system (e.g., Git)` / `provider = "postgresql"`), because `migrate deploy` doesn't create it.
- **Apply:** `npx prisma migrate status` (pre) reported 1 unapplied migration (exit 1, expected). `npx prisma migrate deploy` gave "All migrations have been successfully applied", exit 0. CLI output was piped through host and URL redaction, and only database name `neondb` / schema `public` were shown.
- **Post-checks (read-only):**
  - `migrate status`: "Database schema is up to date!" (exit 0).
  - Tables: `_prisma_migrations`, `data_sources`, nothing else. No other schemas.
  - `_prisma_migrations`: one row `20261030133412_init_data_sources`, finished, not rolled back, `applied_steps_count` 1, no logs.
  - Columns:
    - `id` uuid, default `gen_random_uuid()`;
    - `slug`, `name`, `url`, `attribution`, `reuse_terms` text;
    - `created_at` timestamptz(3), default `CURRENT_TIMESTAMP`;
    - `updated_at` timestamptz(3), no default;
    - all NOT NULL.
  - Constraints: `data_sources_pkey` PRIMARY KEY(id), plus PostgreSQL 18's named NOT NULL constraints (one per column). Indexes: `data_sources_pkey`, `data_sources_slug_key` (unique on slug).
  - Row count 0. The pooled connection sees the same tables and migration row.
- **Checks:** `prisma validate` 0, `prisma generate` 0, lint 0, typecheck 0, build 0, `git diff --check` 0. Migration files are not git-ignored.
- **Not done / not proven:** no application records written (persistence through the app is unproven), no Vercel deploy. No install-script approvals or installs. Nothing committed.
- **Plan:** rev 12 (header, §4.2 `DataSource` marked migrated, M1 row, §3.3 integration-checks row, change log).
- **Next:** prove application-record persistence: a minimal server-side write and read of a real `DataSource` row (the iMAP DNR source with its verbatim terms), with approval for the write. Then the Vercel deploy and a check that the row survives a redeploy.

### 16. [Claude] M1 (partial): genuine `DataSource` seed + read-only `/sources` page

- **Asked:** The user approved inserting exactly one genuine `DataSource` row (MD iMAP DNR Owned Lands), slug `md-imap-dnr-owned-lands`, using the official catalog URL and the exact terms from the plan, verified against recorded evidence.
  - A repeatable seed: create if absent, no-op if equal, stop and report differing field names if different. Never overwrite, never touch other rows. Run it, then re-run to prove idempotency.
  - A read-only `/sources` page via `lib/db.ts`, with escaped text, empty and sanitized error states, a request-time read inside `<Suspense>` (Cache Components), and a working landing-page link.
  - No schema change, migration, installs, deploy, commit, public write endpoints, or seeding during render, install, or build.
- **Context:** branch `feat/app-foundation`, clean at `4c0616a`.
- **Payload verification:**
  - The plan's §3.6 quote **== raw `licenseInfo`** in the catalog JSON captured 2026-10-30 (`scratchpad/m0a/item_a5.json`), exactly: 881 chars, no HTML, no edge whitespace, ASCII only, SHA-256 `2555e9bc…94da`.
  - From the same JSON: id `a5de633b…`, owner `mdimapdatacatalog`, access public, title "Maryland Protected Lands - DNR Owned Properties and Conservation Easements", `accessInformation` "MD iMAP, DNR".
  - **Values:** name = catalog item title (the stored URL is that item's page; the layer name is "DNR Owned Lands and Conservation Easements"), url = `https://www.arcgis.com/home/item.html?id=a5de633b6ebf450b94dcb08b519c3414`, attribution = "MD iMAP, DNR", reuseTerms = verbatim.
- **Seed design (`prisma/seed.ts`):**
  - Refuses to write unless SHA-256(reuseTerms) equals the recorded hash.
  - `findUnique` by slug → `create` if absent. A P2002 race leads to a re-read and compare. Otherwise it compares name / url / attribution / reuseTerms and reports differing **field names** only, never updating. Exit codes: 0 created/unchanged, 2 conflict, 1 error.
  - Errors are printed as class or Prisma code only. Uses `DATABASE_URL_UNPOOLED` from `.env.local` (dotenv) with `PrismaNeon`, and calls `$disconnect()` in `finally`.
  - **Runner:** `prisma.config.ts` → `migrations.seed: "node --import jiti/register prisma/seed.ts"`, and `npm run db:seed` → `prisma db seed`. **Caveat:** `jiti` 2.7.0 is only a **transitive** dependency (via prisma's `@prisma/config`, eslint, and `@tailwindcss/node`). It's not declared in `package.json`, so a future upgrade could drop it. Adding `jiti` or `tsx` as an explicit devDependency needs user approval.
- **Seed results (2026-10-30):**
  - Run 1: `md-imap-dnr-owned-lands: created`.
  - Runs 2 and 3: `unchanged`.
  - A read-only snapshot before and after runs 2–3 was **identical**: 1 total row, 1 with the slug, same `created_at` = `updated_at` (13:46:19.517Z), same row fingerprint, and terms hash matching.
  - **Conflict path:** a temporary seed copy with only `name` changed printed "differs in name; nothing was changed", exit 2, and the row was unchanged (same fingerprint). The temporary copy and snapshot script were deleted.
- **Page and UI:**
  - `app/sources/page.tsx`: a static shell (header, title, intro) + `<Suspense>` around `SourcesList`, which calls `await connection()` (outside try/catch) and then `getPrisma().dataSource.findMany` with public fields only, ordered by name.
  - Text is rendered as React children (auto-escaped). There's no `dangerouslySetInnerHTML`. Links are rendered only for `http(s)` URLs.
  - Empty state: "No data sources have been added yet." Error state: "Sources couldn't be loaded right now." Only the error class is logged.
  - `app/site-header.tsx`: shared header with Home and **Sources** links, used by `/` and `/sources`.
- **Verified:**
  - lint 0, typecheck 0.
  - **Build 0 with `DATABASE_URL` overridden to an unreachable `.invalid` host:** `/sources` reported as ◐ Partial Prerender, and **0 DB access attempts during build** (no "sources: failed to load" in the build log).
  - Production server, port 3109, real env: `/sources` shows the name, attribution, official link href, and the full terms with HTML-escaped quotes. No error text, no connection string or Neon host in the HTML.
  - Port 3110, unreachable DB: the sanitized error message is shown, the fake host and credentials are absent from the HTML and the server log (which logged `sources: failed to load unknown`), and no source data is shown.
  - The landing page has `href="/sources"`. Both servers were stopped. The user's dev server on 3000 was untouched.
  - `git diff --check` 0.
- **Not done:** no deploy, so persistence across a redeploy is unproven. No schema change or migration. Nothing committed. Plan rev 13 (header with 11 commits, §4.2 `DataSource` seeded, M1 row, §3.3 integration-checks row, change log).
- **Next:** Vercel deploy (connect the Neon project via the Neon-managed integration, set env vars), then verify `/sources` in production and that the row survives a redeploy.

### 17. [Claude] Pin `jiti` as a direct devDependency

- **Asked:** On `feat/app-foundation`, add `jiti` as a direct devDependency, pinned to the version the seed already used. Update `package.json`, `package-lock.json`, and the `prisma.config.ts` comment. No `npm ci` or `node_modules` removal while the dev server runs. No unrelated script approvals or version changes. Re-run the seed (expect "unchanged"), then lint, typecheck, build, and `git diff --check`. No record changes, migrations, deploy, or commit.
- **Context:** this resolves entry 16's caveat that `jiti` was only transitive. Installed version: **2.7.0** (deduped under `@prisma/config`→`c12`, `eslint`, `@tailwindcss/node`). The user's dev server was listening on :3000 (pid 33424), so only an additive `npm install` was used. `npm view jiti@2.7.0` shows no pre/install/postinstall scripts.
- **Done:**
  - `npm install --save-dev --save-exact jiti@2.7.0` reported "up to date, audited 484 packages".
  - Diffs against pre-install snapshots:
    - `package.json`: +`"jiti": "2.7.0"` in devDependencies only;
    - `package-lock.json`: +`"jiti": "2.7.0"` in the root package's devDependencies only;
    - resolved `npm ls --all` tree: the only change is that `/jiti` 2.7.0 now appears top-level, and **no other package was added, removed, or changed version**.
  - `prisma.config.ts` comment now reads "jiti (a pinned devDependency)". Snapshots deleted.
- **Verified:** `npm run db:seed` → `md-imap-dnr-owned-lands: unchanged` (exit 0). lint 0, typecheck 0, build 0 (`/` static, `/sources` ◐ partial prerender), `git diff --check` 0.
- **Not done:** no record change, migration, deploy, or commit. Plan rev 14 (header, change log).
- **Next:** unchanged: Vercel deploy, then verify `/sources` in production and persistence across a redeploy.

### 18. [Claude] Read-only pre-merge review: `feat/app-foundation` vs `origin/main` (logged retroactively)

- **Asked:** Read-only review of the branch against `origin/main` before merging. Covered blocking correctness issues, exposed secrets, dependency and configuration problems, and consistency with M1. Confirm migrations and seeding don't run during builds. Never print credentials. No edits, installs, DB writes, deploy, commit, or merge. Separate checks done now from earlier results. Optional improvements kept separate.
- **Context:** This entry wasn't written at the time because the user had asked for no file edits. It's recorded now at the user's request (entry 19).
- **Checks performed then (2026-10-30):**
  - `git ls-remote` confirmed local refs matched the remote (`main` `d910c3e`, branch `183d206`). The branch was 5 ahead, 0 behind, clean tree.
  - Full code and config diff read (21 files, lockfile and history log scanned separately).
  - Secrets: `.env.example` is the only env file ever committed. Pattern scan of branch patches found 0 matches. Real `.env.local` values: 0 hits in tracked files, all Git history, and the local `.next/static` bundle (counts only).
  - No automatic migrate or seed: the only lifecycle hook is `postinstall: prisma generate`. No `vercel.json` or other build hook. No write, seed, or migrate calls in app code.
  - `prisma migrate status` up to date. `migrate diff --from-config-datasource --to-schema --exit-code`: "No difference detected."
  - `db:validate`, `prisma format --check`, lint, typecheck: all 0.
  - Build 0 with `DATABASE_URL` overridden to an unreachable host, with 0 DB access during the build.
  - `npm audit --omit=dev`: 0 vulnerabilities.
- **Result:** no blocking findings. Ready to merge, with deployment and persistence across a redeploy unverified.
- **Pre-merge caution:** if a hosting project auto-deploys `main`, set `DATABASE_URL` there first.
- **Optional findings:**
  1. Stale plan header.
  2. No `engines` field (Prisma 7.10.1 Node ranges), and `@types/node` `^20`.
  3. `postinstall` depends on the `prisma` devDependency.
  4. An unhandled `$disconnect()` error path in `prisma/seed.ts`.
  5. Schema comment examples differ from the seeded values.
- **Not done:** no files changed, nothing installed, written, deployed, committed, or merged.

### 19. [Claude] Handoff checkpoint: merged to `main`, Railway deployment, plan reconciliation

- **Asked:** Documentation-only handoff before clearing the session.
  - The user reports that `feat/app-foundation` was fast-forward merged and pushed to `main` at `183d206`, that **Railway** now deploys `main` successfully, and that live `/sources` shows the existing Neon record after a redeploy. Hosting is Railway, replacing Vercel.
  - Inspect Git, correct stale plan status, record the evidence, and reconcile M1 acceptance without assuming completion. Create `HANDOFF.md`, log entry 18 and this one, and run `git diff --check`.
  - No app code, installs, migrations, seeds, external services, commit, or push.
- **Git state (inspected, `git log` / `status` / `ls-remote`):** current branch `main`, clean tree. `main`, `origin/main`, and `feat/app-foundation` (local and remote) are all at `183d206`, with 12 commits. This is consistent with the user's fast-forward report.
- **Redirection:** hosting decision changed from **Vercel → Railway** (user). Vercel research is kept as history and not deleted. Railway itself wasn't researched (out of scope).
- **Plan changes (revision 15):**
  - **Header:** corrected the stale repo state (review finding 1).
  - **§2.1:** hosting is Railway (approved).
  - **D4:** decided Railway, superseding Vercel, with Railway unknowns listed.
  - **D5:** flagged that the Vercel Blob OIDC proposal needs re-deciding.
  - **§2.3:** M1 action marked done (user-reported), with the original text kept. M4 storage action re-pointed to D5.
  - **§3.2:** "Scheduled jobs" flagged for Railway.
  - **§3.3:** integration row records the user-reported Railway evidence.
  - **§3.9:** superseded note.
  - **New §3.10:** a table of Vercel assumptions to revisit (Hobby terms, daily cron and outbox/reminders, Neon–Vercel integration and preview branches, Vercel Blob OIDC, R7 preview deploys, Node version, Clerk origins and redirects). Placed after §3.9's M0a table. It was first inserted mid-§3.9 by mistake and moved before finishing.
  - **M1 row:** the stale "Not done: Vercel deploy…" replaced with the reconciliation.
  - **Gate evidence:** production deployment noted.
  - **Change log:** rev 15.
- **M1 reconciliation:**
  - **Met:** approval points; `.env*` ignored and no secrets in Git or the *local* bundle (agent-verified; the Railway build output wasn't scanned); data survives a redeploy (user-reported).
  - **Unmet as worded:** §3.2 "Deployed page reads and writes a row". The deployed page only reads, and the row came from the local seed, with no write path by design. This needs a user decision (amend the criterion, or approve a write path).
  - **M1 stays partial.**
- **`HANDOFF.md` created:**
  - purpose and authoritative-file links;
  - branch and commit;
  - implemented features and versions;
  - migration and seeded record;
  - agent-verified vs. user-reported evidence;
  - Railway notes and env-var **names only** (`DATABASE_URL` runtime, `DATABASE_URL_UNPOOLED` CLI-only);
  - M1 status, open decisions, review findings, gotchas, Vercel-revisit summary;
  - the proposed next M2 task.
- **Proposed next task (M2, small):** Clerk sign-in foundation on the development instance, local only. Prerequisites: confirm D1 given Clerk's owned-domain requirement for production, approve a pinned `@clerk/nextjs` install, and put Clerk dev keys in `.env.local`. Scope: `proxy.ts` + `clerkMiddleware()`, `ClerkProvider`, sign-in and sign-up routes, a header control, public `/` and `/sources`, `auth()` readers in `<Suspense>`. No DB models, roles, production instance, or Railway changes.
- **Verified:** `git diff --check` (see the final report). No app code, packages, migrations, seeds, external services, commit, or push.
- **Next:** user review of this handoff. Then a decision on the M1 write criterion and D1, before starting the M2 task.

### 20. [Claude] Docs correction: M1 criterion amended (M1 complete), no automatic auth fallback

- **Asked:** Two documentation-only corrections in `project-plan.md` and `HANDOFF.md`:
  1. The user **approved amending** M1's persistence criterion to "An approved seed writes a persistent row; the deployed page reads it after redeployment". Record it as satisfied by existing evidence, preserve the later requirement for user-facing create/read, and mark M1 complete only if every other criterion is met.
  2. **Remove the automatic Clerk → Neon Auth fallback.** Clerk remains proposed. Re-verify its current production requirements before implementation, and discuss any blocker before changing providers. Don't present unverified Google-verification or domain requirements as settled.

  Update history, run `git diff --check`. No app changes, installs, DB operations, commits, or pushes.
- **Redirection:** this resolves entry 19's open M1 decision (the user chose to amend the criterion). It also withdraws the rev-7 proposal that M2 auto-switches to Neon Auth when no domain is available.
- **M1 criteria check (done before marking complete):**
  - (1) Neon/hosting, amended: the approved seed's write is agent-verified (entry 16), and the deployed read after redeploy is user-reported (entry 19). **Met.**
  - (2) Data survives a redeploy: user-reported. **Met.**
  - (3) Install and migration approval points: **met** (entries 11, 12, 15).
  - (4) `.env*` ignored, and no secrets in Git or the client bundle: **met**, agent-verified in entry 18 on a local production build of the same app code. Railway's build output wasn't scanned, which is stated.
  - Result: **M1 complete.**
- **`project-plan.md` (revision 16):**
  - Header revision.
  - §3.2: the pass condition is replaced with the amended criterion, keeping the original wording and the note that user-facing create/read remains required (M4, M7).
  - §9 M1 row: the "Unmet as worded… stays partial" text is replaced by a per-criterion reconciliation and **M1 complete**.
  - D1: "PROPOSED: Clerk", no automatic fallback, Neon Auth as an alternative only, re-verify before M2.
  - §2.3 M2 row: domain, DNS, and Google statements relabeled "as read 2026-10-30, unverified".
  - §3.3 provider row and §3.9 auth section: added a status note that the table reflects docs as read; "fallback" → "alternative"; "Cost of choosing Clerk" marked unverified; the "Decision rule" replaced with "no automatic fallback; discuss blockers with the user".
  - Env table: Neon Auth vars → "only if the user chooses Neon Auth".
  - §3.10 Clerk row and R9 reworded.
  - Change log: rev 16. Earlier change-log entries (rev 7, rev 15) are kept as history.
- **`HANDOFF.md`:**
  - Plan revision 16, history entries 18–20.
  - "M1 status: complete" section, with the amended criterion, per-criterion evidence, and the preserved later requirement.
  - D1 bullet rewritten: proposed, no automatic fallback, requirements unverified.
  - "M1 write criterion" open-decision bullet removed.
  - M2 prerequisite 1 is now "re-verify Clerk's current production requirements; discuss blockers before considering another provider".
- **Verified:** `git diff --check` (including `HANDOFF.md`) — see the final report. Leftover-wording scans only match historical change-log lines, the intentional quote of the original criterion, and the new "no automatic fallback" text. No app code, installs, DB operations, commits, or pushes.
- **Next:** user review. Then the M2 task (Clerk development instance, local only), after re-verifying Clerk's production requirements and approving the pinned `@clerk/nextjs` install.
