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
