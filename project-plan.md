# HuntSomewhere — Project Plan

Shared source of truth for Claude Code and Codex. Product scope, decisions, and milestone status live here. The collaboration log lives in [PROMPT-HISTORY.md](PROMPT-HISTORY.md). Agent entry points are [CLAUDE.md](CLAUDE.md) and a proposed `AGENTS.md` (§1).

**Last updated:** 2026-10-30 (revision 4) · **Repo state (from `git log` / `git ls-files`, 2026-10-30):** three commits on `main`: `02e2da6` "Initial commit", `eaff8e8` "docs: define HuntSomewhere scope and implementation plan", `d771662` "docs: record Maryland data sources and agent instructions". Tracked files: `README.md`, `CLAUDE.md`, `AGENTS.md`, `PROMPT-HISTORY.md`, this file. No application code. This revision-4 correction isn't committed yet.

### Status vocabulary

| Label | Meaning |
|---|---|
| **Implemented** | Code exists and runs locally. |
| **Tested** | Implemented, and checked by an automated test or a recorded manual check (record which). |
| **Deployed** | Tested, and running on the production URL. |
| **Demo-only** | Works only with isolated demonstration data (§6.8). Labeled as such in the UI. |
| **Planned** | Not started. Everything in this file is **Planned** until a milestone updates it. |

Decision labels: **[APPROVED]** = decided by the user · **[PROPOSED DEFAULT]** = Claude's suggestion, in force until the user overrides it · **[UNRESOLVED]** = needs a decision or evidence before the work that depends on it · **[VERIFY]** = an assumption about a tool or provider that must be confirmed before relying on it.

---

## 1. How the agents work together

### Instruction discovery (no duplication)

| Agent | Expected entry point | Then reads |
|---|---|---|
| Claude Code | `CLAUDE.md` | `project-plan.md`, `PROMPT-HISTORY.md`, and the `prompt-history` skill as `CLAUDE.md` directs |
| Codex | `AGENTS.md` at repo root **[VERIFY]**: Codex's documented convention. M0a confirms it by opening Codex in this repo. | `CLAUDE.md`, `project-plan.md`, `PROMPT-HISTORY.md` |

- [AGENTS.md](AGENTS.md) (created 2026-10-30) points to the three files above and contains no copied rules or plan content. **Whether Codex actually reads it is pending verification** (§3.3).
- **Observed 2026-10-30, this machine only:** `~/.codex` contained no `AGENTS.md`, and its `skills` directory listing was empty. This can change, and it says nothing about other machines. Rely on the repo-level `AGENTS.md`, not on any global configuration.
- **One prompt history.** `AGENTS.md` tells Codex to append to the **same** `PROMPT-HISTORY.md` using the entry format already in that file, re-reading it before each write, and tagging entries `[Codex]`. Claude tags its entries `[Claude]`. There is no second history file.
- Rules live in `CLAUDE.md`, the plan lives here, and `AGENTS.md` only points to them.

### Working rules [APPROVED unless marked]

1. Only one agent edits the repo at a time. The agent finishing a milestone writes a handoff entry in `PROMPT-HISTORY.md` and updates the §9 status here.
2. Work in small, sequential milestones (§9).
3. **No package installs, migrations, or commits without explicit user approval.** Agents stop and ask at each approval point.
4. **[PROPOSED DEFAULT]** Cross-review: one agent reviews the other's diff before a commit is approved. Real defects found go into `PROMPT-HISTORY.md` as candidates for the "caught agent mistake" gate.
5. Never claim a status that wasn't observed.

---

## 2. Decisions

### 2.1 Approved

- **Stack:** Next.js + TypeScript, Neon Postgres, Prisma, OpenAI API.
- **Auth:** managed provider supporting Google and email/password.
- **Email:** transactional provider for notifications and signing invitations.
- **No payments or subscriptions.** Listings describe free permission, paid daily access, seasonal leases, and hunting-club openings. Payment happens outside the app.
- **Design:** modern outdoor marketplace. Cream and forest green, clean property cards, responsive split map/list browsing.
- **Accounts:** one account can hunt, post, or both, with separate Hunter and Property dashboards. Admin privileges are assigned separately and never selectable at signup.
- **Listing publication:** draft → admin review → published. Important location, access-rule, and listing-authority changes need review again. Ordinary edits publish immediately. Trusted-poster publishing comes later.
- **Reconfirmation:** every 30 days. Hidden after a configurable grace period.
- **Signing:** in-app permission-document signing by the authorized property representative and every participating adult hunter. Accountless adults sign via email links.
- **Minors:** owners may describe youth opportunities. Minor participation requests are deferred.
- **Full scope is kept.** The presentation shows what genuinely works. The launch may follow the presentation.

### 2.2 Unresolved dependencies and proposed defaults

Provider and library choices are **candidates**. Their capabilities are **[VERIFY]** until a feasibility check records evidence in §3.3.

| # | Item | Status | Proposed default | Must be confirmed |
|---|---|---|---|---|
| D1 | Auth provider | UNRESOLVED | Clerk (alternatives: Neon Auth, Auth.js) | Google + email/password support, production redirect setup, a way to sync users into our DB, free-tier limits |
| D2 | Maps and tiles | UNRESOLVED | MapLibre GL JS + MapTiler (alternative: Mapbox) | Key restriction by domain, attribution terms, free-tier limits, suitable outdoor style |
| D3 | Email provider | UNRESOLVED | Resend (alternative: Postmark) | Domain verification needs, whether unverified accounts can send to arbitrary recipients, idempotency-key support, webhook/bounce support |
| D4 | Hosting | UNRESOLVED | Vercel | Plan terms for this use, env-var handling, scheduled-job support (needed for email retries and reminders) |
| D5 | Photo and document storage | **UNRESOLVED — not in approved stack; needs approval** | S3-compatible private bucket (Cloudflare R2 or AWS S3) with short-lived presigned URLs | Private access, presigned URL expiry, cost. Signed documents must never be at public URLs. |
| D6 | Geospatial approach | PROPOSED | lat/lng columns + haversine SQL. Display geometry as simplified GeoJSON. PostGIS deferred. | Whether Prisma + Neon handle this adequately; whether PostGIS is needed for county-polygon bounds (§6.1) |
| D7 | County and town reference data | PROPOSED (sources researched 2026-10-30, §3.5) | Counties: iMAP Political Boundaries – County Boundaries (24 county-equivalents, including Baltimore City). Towns: Census TIGER/Line places for Maryland (incorporated places + CDPs). | Reuse basis and compliance conditions in §3.6. Inspect the 2026 TIGER place file and its terms before adopting it. County-line tolerance set in M4. |
| D8 | Reconfirmation grace period | **UNRESOLVED (user decision)** | Placeholder 14 days in config | Not blocking. Only the value is open. |
| D9 | OpenAI model, pricing, spending controls | UNRESOLVED | Smallest model passing the §6.6 evals, structured outputs | Current model list and pricing. **Which spending controls the selected account actually offers — not assumed.** The app's own limits (§6.6) are the enforced control. |
| D10 | Signed-copy format | PROPOSED | Server-generated PDF from the immutable document version (library chosen at the start of M11) | Library choice, rendering fidelity |
| D11 | Signature method | PROPOSED | Typed full name + explicit acknowledgment + timestamp, bound to the document content hash | Wording reviewed (§7). No legal-sufficiency claim. |
| D12 | Token lifetimes | PROPOSED | Signing invitation: 7 days, single use. Document-access link: 30 days, multi-use, revocable (§6.4). | — |
| D13 | Overlap and capacity policy | PROPOSED | §5.5 | — |
| D14 | Review-required vs. ordinary fields | PROPOSED | §4.3 | User may reclassify fields |
| D15 | Rate-limit and budget store | PROPOSED | Postgres with atomic conditional updates (§6.6) | Contention behavior under concurrency (tested in M6) |
| D16 | Real private listings | UNRESOLVED (user action) | Isolated demo properties (§6.8) until a real owner authorizes a listing in writing | — |
| D17 | Location-reviewer assignment | PROPOSED | A separate `LOCATION_REVIEWER` grant (§4.3). For the demo, the single demo admin holds it. | — |

### 2.3 User actions (not all needed up front)

| Needed for | Action | Lead-time note |
|---|---|---|
| M1 | Neon project, hosting account | — |
| M2 | Auth provider account, Google OAuth client | — |
| M3 | Map tile key | — |
| M4 | Storage bucket (after D5 approval) | — |
| M6 | OpenAI API key; review the account's available spending controls | — |
| M9 | Email provider account and a **sending domain you control** | DNS changes can take time to propagate. Start whenever convenient, but nothing before M9 waits on it. |

Agents never see or commit secret values. They live in `.env.local` (gitignored) and the hosting dashboard.

---

## 3. Feasibility

Feasibility has two parts: **M0a**, read-only research, and **per-milestone integration checks** run after approval at the start of the milestone that first needs each provider. The skeleton (M1) needs only Neon and hosting.

### 3.1 M0a — read-only research (no accounts, code, installs, or migrations)

Allowed writes: `AGENTS.md`, this file, `PROMPT-HISTORY.md`.

**Maryland public hunting data.** Candidates, not confirmed. For each: URL, license/reuse terms, format, fields, last-updated date, geographic coverage, and whether hunting is explicitly stated.
- Maryland DNR public hunting lands (e.g. Wildlife Management Areas, State Forests, Natural Resources Management Areas, Cooperative WMAs), possibly via Maryland iMAP / DNR open data
- Federal lands with hunting programs in Maryland (e.g. national wildlife refuges): permit or lottery requirements
- USGS PAD-US: **ownership only, never treated as hunting permission**
- County or municipal managed hunts: record "not covered" if no structured source exists
- County boundaries and a town/place reference (D7)
- DNR season information: record what exists and its structure only. v1 does not compute season eligibility (§7).

**Taxonomy.** Species and hunting-method vocabularies checked against DNR sources, including which equipment terms are ambiguous (e.g. "bow", "gun") and need clarification (§6.1).

**Written-permission requirement.** Record what Maryland sources say about written permission to hunt private land, with citations. **This informs product wording only. It is not legal advice, and it doesn't change the rule that the app makes no legal-sufficiency claim.**

**Provider documentation review** for D1–D5 and D9: record what each provider's *documentation* says, dated, without creating accounts. Answers marked "per docs, not yet tested".

**Agent wiring.** Create `AGENTS.md`. Open Codex in the repo and record whether it reports reading `AGENTS.md`.

**Exit:** every M0a row in §3.3 has evidence or is marked "unavailable / blocked". At least one public-data source has known reuse terms, or the fallback (R1) is chosen.

### 3.2 Integration checks (run after approval at the start of the milestone that first needs each provider)

| Check | Milestone | Pass condition |
|---|---|---|
| Neon connection + hosting deploy | M1 | Deployed page reads and writes a row |
| Auth | M2 | Google and email/password sign-in both work locally and in production |
| Maps | M3 | Restricted key renders Maryland tiles locally and in production |
| Storage | M4 | Private upload. Presigned read works, then expires. A direct public URL is denied. |
| OpenAI | M6 | Server-side structured-output call returns schema-valid JSON. Usage fields are read for budget accounting. |
| Email | M9 | Message from the verified domain delivered to a non-owner inbox. Idempotency behavior observed (§6.5). |
| Scheduled jobs | M9 | A scheduled job runs in production (needed for retries and reminders) |

### 3.3 Findings

| Check | Phase | Result | Evidence (link / observation + date) | Decision |
|---|---|---|---|---|
| DNR public lands data | M0a | **Working endpoint found (2026-10-30).** iMAP `MD_ProtectedLands` layer 0 "DNR Owned Lands and Conservation Easements". 580 records, 92 with `DESIG = 'WMA'` (65 distinct names). Polygons, GeoJSON output works. **No hunting attribute in any field.** **Reuse:** a published grant in the official catalog item is the proposed basis, with the conditions and open interpretations in §3.6. | §3.4, §3.6 | Initial source: WMA subset only, with hunting confirmed per area from DNR WMA pages (§3.4). |
| DNR "Hunting Atlas" service | M0a | **Not available (2026-10-30).** `dnr.geodata.md.gov/.../AIMS/HuntingAtlasRO/MapServer?f=pjson` returned `{"error":{"code":500,"message":"Service AIMS/HuntingAtlasRO/MapServer not found"}}`. The `Hunting` folder lists no public services. Search engines still index the old URL. | §3.4 | Don't use. Recheck later. |
| Federal hunting lands | M0a | Not yet researched | — | — |
| PAD-US | M0a | Not yet researched | — | — |
| County / municipal hunts | M0a | Not yet researched | — | — |
| County boundaries | M0a | **Working endpoint found (2026-10-30).** iMAP `MD_PoliticalBoundaries` layer 1: 24 county-equivalents, **including Baltimore City (`COUNTY_FIP` 510) separate from Baltimore County (5)**. Published reuse grant in the catalog item. | §3.5, §3.6 | Recommended: iMAP Political County Boundaries. Reuse: published iMAP grant is the proposed basis (§3.6). |
| Town / place reference | M0a | **Working download found (2026-10-30).** Census TIGER/Line 2025 Maryland places: 536 places (157 incorporated + 379 CDPs) with internal points. Explicit Census use statement in the file's metadata. | §3.5, §3.6 | Recommended: Census TIGER/Line places (state 24). Reuse: published TIGER/Line use constraint is the proposed basis (§3.6). |
| Species and method taxonomy | M0a | Not yet researched | — | — |
| MD written-permission wording | M0a | Not yet researched | — | — |
| Provider docs D1–D5, D9 | M0a | Not yet researched | — | — |
| Codex reads `AGENTS.md` | M0a | **Pending.** `AGENTS.md` created 2026-10-30. Not verified until Codex is opened in the repo and reports reading it. | — | — |
| Integration checks (§3.2) | M1–M9 | Not started | — | — |

**M0a status:** in progress. Done: `AGENTS.md` created, DNR/iMAP public data, county boundaries, town/place reference. Still open: the other M0a rows and the Codex verification.

**Reading these findings.** Each source is evaluated on four separate questions, and a "yes" on one never implies the others:
1. **HTTP availability:** did the endpoint return the expected format on the date checked?
2. **Content accuracy:** does the content correctly describe reality (e.g. does a page actually permit hunting)?
3. **Freshness:** when was the *data* last updated, as opposed to its metadata or catalog item?
4. **Reuse permission:** is there a published grant that allows our use? A no-warranty or liability disclaimer is **not** a reuse grant. It limits the publisher's responsibility and grants nothing.

### 3.4 Maryland public-data source detail (observed 2026-10-30)

All endpoint observations below are from read-only HTTP GET requests made on 2026-10-30. Raw responses were kept in the session scratchpad, not the repo.

**Working data endpoint (machine-readable)**

| Item | Value |
|---|---|
| Service | `https://mdgeodata.md.gov/imap/rest/services/Environment/MD_ProtectedLands/FeatureServer` (ArcGIS Server 11.3, capabilities `Query,Extract`, `maxRecordCount` 36000) |
| Layer | `/0` — "DNR Owned Lands and Conservation Easements", polygons |
| Host note | The `geodata.md.gov` hostname (the one most search results cite) returned an HTML "Site Maintenance" page for the same path on 2026-10-30. `mdgeodata.md.gov` returned JSON. The importer must treat a non-JSON response as a failed run, not as empty data. |
| Query used | `…/FeatureServer/0/query?where=DESIG='WMA'&outFields=OBJECTID,DNRName,County,WebLink,DNRType,LandIntere&outSR=4326&geometryPrecision=5&maxAllowableOffset=0.0005&f=geojson` → HTTP 200, `application/geo+json`, 92 features, about 185 KB, no transfer-limit flag |
| Formats | The service advertises `supportedQueryFormats: JSON`, but `f=geojson` worked in practice. Keep `f=json` as the fallback. |
| Fields | `OBJECTID`, `Label`, `DNRType`, `DNRName`, `ManagedBy`, `County`, `WebLink`, `DESIG`, `LandIntere`, `Shape__Area`, `Shape__Length` |
| Value distributions | `DNRType`: Owned Property 379, Conservation Easement - CREP 93, Conservation Easement - Other 64, Owned Property - Submerged 32, Conservation Easement - Forest Legacy 12. `DESIG`: SP 134, CREP 93, **WMA 92**, UNDESIGNATED 50, CFL 40, CEDNR 33, NRMA 29, SF 22, others under 22. `LandIntere`: OWN 404, CE 167, other codes ≤ 2 each. |
| Coverage (WMA subset) | 92 polygons, 65 distinct names (a WMA can span several polygons, and at least one record is "Owned Property - Submerged"). County values cover 22 named counties plus "Multiple". DNR's public-lands page states 64 WMAs "in 19 of Maryland's 23 counties". The counts differ, so don't present the layer as a definitive WMA list. |
| WebLink | Present on 63 of 92 WMA records. **16 WMA names have no link** (e.g. Chicone Creek, Fort Hill, McIntosh Run, Parkers Creek, Warrior Mountain). |
| WebLink — HTTP availability | All 48 distinct links returned HTTP 200 on 2026-10-30 (old `http://` links redirect to `https://dnr.maryland.gov/wildlife/Pages/publiclands/...`). **This shows only that the pages loaded.** It says nothing about their content or how current it is. |
| WebLink — content accuracy and freshness | **Not checked, except one page.** Only the Avondale page was read (see "Hunting access" below). The pages show no last-updated date, and that page's dove-field link text ("2025-2026") disagrees with its tooltip ("2022-2023"). Accuracy and currency must be confirmed per area when hunting status is recorded (import step 2). |
| Data quality | Whitespace defects: `WebLink` values of `' '`, a name with a trailing tab (`'WARRIOR MOUNTAIN WMA\t'`), a `DESIG` of `' SP'`, `ManagedBy` values of `' '` and null. The importer must trim and normalize. |
| Freshness | The layer metadata (`…/MapServer/0/metadata`) shows `CreaDate 20250414`. The official catalog item (below) shows modified 2025-05-12. **Both are metadata or catalog dates, not data-edit dates.** No data-edit date is exposed (`editingInfo` is absent). **Data freshness is unknown.** Display "Source updated: unknown" and "Last checked: [import date]". |
| Official catalog item | ArcGIS Online item [`a5de633b6ebf450b94dcb08b519c3414`](https://www.arcgis.com/home/item.html?id=a5de633b6ebf450b94dcb08b519c3414), "Maryland Protected Lands - DNR Owned Properties and Conservation Easements". Owner `mdimapdatacatalog` (the Maryland iMAP data catalog account, org `njFNhDsUCentVYJW`). Public. Its `url` is exactly this layer (`…/MD_ProtectedLands/FeatureServer/0`). Created 2016-02-09, modified 2025-05-12, credit "MD iMAP, DNR". Read via `https://www.arcgis.com/sharing/rest/content/items/a5de633b6ebf450b94dcb08b519c3414?f=json` on 2026-10-30. (The service-level `info/iteminfo` has an empty `licenseInfo`, so the catalog item is where the terms are published.) Several other ArcGIS Online items copy this layer under third-party owners. They aren't authoritative. |
| No-warranty disclaimer (not a grant) | Item `licenseInfo`: *"provided 'as is' without warranty of any kind … The user assumes the entire risk as to quality and performance of the Data … the State of Maryland [shall not] be liable … nor is there responsibility assumed to maintain the Data."* The layer metadata has a similar DNR disclaimer. These clauses limit liability. **They don't authorize reuse.** |
| Published reuse basis | Same item `licenseInfo`: *"The Data can be freely distributed as long as the metadata entry is not modified or deleted. Any data derived from the Data must acknowledge the State of Maryland in the metadata."* This is an **explicit published grant** for distribution and derived data. No separate written permission is assumed to be needed. |
| Reuse basis and compliance | **Proposed basis: this published grant.** The exact text, compliance conditions (including keeping an unmodified copy of the source metadata, not just a link), and the interpretations still open are in §3.6. |
| Hunting access (content) | **Not identified by the dataset.** No field states hunting status. `DESIG` is a land designation, not a permission, and CREP / Forest Legacy / other easements are mostly **private land**. Only the per-area DNR web page states hunting terms. Example (fetched 2026-10-30): the Avondale WMA page says *"Public hunting on Avondale WMA is permitted during legal hunting seasons with restrictions"*, and lists a free permit requirement, seasonal permit-holder access, no Sunday hunting, and reservations for some seasons. |

**Pages describing data (not data endpoints)**
- DNR public lands home: `https://dnr.maryland.gov/wildlife/Pages/publiclands/home.aspx`. States 64 WMAs, "primarily managed for hunting, trapping and other wildlife-dependent recreational uses", and lotteries and reservations on popular areas. No downloadable data and no last-updated date.
- WMA maps by region: `https://dnr.maryland.gov/wildlife/pages/publiclands/allbyregion.aspx` (HTML and PDF maps).
- Per-WMA pages, e.g. `https://dnr.maryland.gov/wildlife/Pages/publiclands/central/avondale.aspx` (HTML). The hunting terms there are unstructured text.
- Annual rules: *Guide to Hunting & Trapping in Maryland*, linked from DNR at `https://www.eregulations.com/maryland/hunting/`. That is third-party hosted, and its terms have not been reviewed.
- An Esri-hosted "WMA" sample service at `servicesdev.arcgis.com` describes itself as modified from MD iMAP data. **It is not official. Don't use it.**

**Missing for our model** (show "Not provided by source"; never infer): hunting permitted (yes/no), species, allowed methods/devices, permit/reservation/lottery requirements, Sunday rules, closed or safety zones, parking/access points, accessibility, and data-edit dates. Cooperative WMAs, federal lands, county/municipal hunts, and state parks/forests open to hunting are **not covered** by the WMA subset.

**Recommended initial import approach (M3)**
1. Pull **only `DESIG = 'WMA'`** from layer 0 as GeoJSON in EPSG:4326, simplified (as in the query above). Store `OBJECTID` as the source record ID, plus trimmed name, county, `WebLink`, `DNRType`, and `LandIntere`. Merge polygons by normalized name into one public area, keeping all polygons for display.
2. Each area starts with hunting status **"Not confirmed — check DNR"**. It is labeled *"Hunting confirmed by DNR page"* only after a person (or a later, reviewed extraction step) records a quote and the fetch date from that area's `WebLink` page. Areas without a `WebLink` stay unconfirmed. **The importer never sets hunting status from `DESIG`.**
3. Public-area cards and details always show: source "MD iMAP / Maryland DNR — DNR Owned Lands and Conservation Easements", the endpoint link, the DNR page link, "Source updated: unknown", "Last checked: [date]", the no-warranty note, and the standing ownership-is-not-permission notice (§6.2).
4. Treat a non-JSON response, an HTTP error, or a feature count under half the last import's as a **failed run**. Keep serving the last good import (§6.2).
5. Other designations (state forests `SF`, Chesapeake Forest Lands `CFL`, `NRMA`; 42 distinct names, 72 records with links) are a **later expansion**, using the same confirmation rule. Never import easement (`CREP`, `CEDNR`, Forest Legacy) records as hunting areas.
6. **Reuse:** follow the §3.6 compliance conditions on every import: store an unmodified copy of the source metadata with the run, acknowledge the State of Maryland in our derived-data metadata, retain source attribution, and stop the run if the published terms text has changed.

### 3.5 County boundaries and town/place reference (observed 2026-10-30)

These sources feed D7: county placement, distance bounds (§6.1), the location-review county check (§4.3), and town buckets.

**Baltimore City is a county-equivalent.** Maryland has **24** county-level jurisdictions: 23 counties plus Baltimore City. Both recommended sources list Baltimore City separately from Baltimore County.
- The county picker shows both as separate choices ("Baltimore City" and "Baltimore County"), never just "Baltimore".
- The canonical county key is the 5-digit FIPS GEOID: `24005` is Baltimore County, `24510` is Baltimore City. iMAP stores FIPS as an integer (`5`, `510`), so build the key as `"24" + zero-pad(3)`.
- Census also lists "Baltimore city" as a **place** (GEOID `2404000`). In the town list it appears inside county `24510`, and it must not create a second "Baltimore" county entry.

#### County boundaries: candidates

| Source | Endpoint / file | Fields | Coverage, format, geometry | Freshness | Reuse |
|---|---|---|---|---|---|
| **iMAP Political Boundaries – County Boundaries** (recommended) | `https://mdgeodata.md.gov/imap/rest/services/Boundaries/MD_PoliticalBoundaries/FeatureServer/1`. Catalog item [`a24953147769432585eb6e0b655a835b`](https://www.arcgis.com/home/item.html?id=a24953147769432585eb6e0b655a835b) (owner `mdimapdatacatalog`). | `COUNTY`, `DISTRICT`, `TSD_ID`, `OBJECTID_1`, `COUNTY_FIP`, `COUNTYNUM` | 24 features, one ring each. `maxRecordCount` 3000. Query output tested in EPSG:4326 JSON. Covers **legal extent including water** (Anne Arundel ≈ 0.160 deg² vs 0.111 in the shoreline layer). **Coarse in places:** Baltimore City has 38 vertices, Anne Arundel 3,210. | No data-edit field. Catalog item modified 2025-05-12 (catalog date, not data date). | Same iMAP grant as §3.4 ("freely distributed … metadata entry not modified … derived data must acknowledge the State of Maryland"). |
| iMAP Physical Boundaries – County Boundaries (Detailed) | `…/Boundaries/MD_PhysicalBoundaries/FeatureServer/0`. Item `2315ef0b071a4ec59420e3d342dbcfe2` | `COUNTY`, `DISTRICT`, `COUNTY_FIP`, `COUNTYNUM`, `CREATION_D`, `LAST_UPDAT` | 24 features. **Shoreline-following**, multi-ring (islands): Anne Arundel has 16 rings and 48,673 vertices. **`maxRecordCount` 50.** Excludes open water. | Has `LAST_UPDAT` per feature (not reviewed for all rows) | Same iMAP grant |
| iMAP Physical Boundaries – County Boundaries (Generalized) | `…/MD_PhysicalBoundaries/FeatureServer/1`. Item `4c172f80b626490ea2cff7b699febedb` | `county`, `district`, `county_fip`, `countynum`, `creation_d`, `last_updat` | 24 features, shoreline-based, one ring each | `last_updat` for Baltimore County 2012-02-14, Baltimore City 2009-11-18 | Same iMAP grant |
| Census TIGER/Line counties (alternative) | `https://www2.census.gov/geo/tiger/TIGER2026/COUNTY/tl_2026_us_county.zip` (HTTP 200, about 83 MB, **national file, not inspected**) | Not inspected | Includes water area (per Gazetteer `AWATER`) | 2026 vintage | TIGER grant (below) |

**Recommended county source: iMAP Political Boundaries – County Boundaries.**
- **Why:** it's state-published, has all 24 county-equivalents with FIPS, and its legal extent includes water. That matters because waterfowl blinds and island or shoreline properties can sit offshore, and the shoreline layers would wrongly fail them.
- **Caution:** its coarseness means the location-review check must treat a point that falls outside the declared county, or within a tolerance of a county line, as **"near or outside county line — reviewer confirms"**, never an automatic rejection. The tolerance is decided in M4, after measuring against the detailed layer.
- **Display:** the map uses a simplified copy derived from this same source, so it's one source with one attribution.

#### Town / place reference: candidates

| Source | Endpoint / file | Fields | Coverage, format | Freshness | Reuse |
|---|---|---|---|---|---|
| **Census TIGER/Line places, Maryland** (recommended) | `https://www2.census.gov/geo/tiger/TIGER2025/PLACE/tl_2025_24_place.zip` (2.73 MB, **inspected**). A 2026 file exists at `…/TIGER2026/PLACE/tl_2026_24_place.zip` (HTTP 200, 2.74 MB, **not inspected**). | `STATEFP`, `PLACEFP`, `PLACENS`, `GEOID`, `GEOIDFQ`, `NAME`, `NAMELSAD`, `LSAD`, `CLASSFP`, `PCICBSA`, `MTFCC`, `FUNCSTAT`, `ALAND`, `AWATER`, `INTPTLAT`, `INTPTLON` | Shapefile with polygons. 536 places: 157 incorporated (123 towns, 28 cities + Baltimore city, 5 villages) and 379 CDPs (e.g. Columbia, Waldorf, Ellicott City). **No county field.** | Vintage year in the filename | **Explicit grant** in the file's ISO metadata: *"The TIGER/Line Shapefile products are not copyrighted … These products are free to use in a product or publication, however acknowledgement must be given to the U.S. Census Bureau as the source."* The same text says the boundaries are "for statistical data collection and tabulation purposes only." TIGER/Line is a registered trademark. |
| Census Gazetteer places, Maryland | `https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2026_Gazetteer/2026_gaz_place_24.txt` (also 2025 and 2024) | `USPS`, `GEOID`, `GEOIDFQ`, `ANSICODE`, `NAME`, `LSAD`, `FUNCSTAT`, `ALAND`, `AWATER`, `ALAND_SQMI`, `AWATER_SQMI`, `INTPTLAT`, `INTPTLONG` | Pipe-delimited text, 536 rows (2024, 2025, and 2026 all inspected). Points only, no polygons, no county field. | 2026 is the latest vintage listed on the Gazetteer page | **No use statement** on the Gazetteer page or in the file. The TIGER grant isn't stated for Gazetteer files, so it isn't assumed to cover them. |
| iMAP Municipal Boundaries (Generalized / Detailed) | `…/MD_PoliticalBoundaries/FeatureServer/2` and `/5`. Items `bd486d7feeec443c89a822dde5b86a1e`, `92f5b561a1fd4e43b2f9a43fa5ab59c1` | `JURSCODE`, `MUN_NAME` (generalized) | 162 polygons, **incorporated municipalities only**. Misses the CDPs where many Marylanders say they live. | Catalog item modified 2025-05-12 | Same iMAP grant |

**Recommended town source: Census TIGER/Line places, Maryland.**
- **Why:** it covers incorporated places *and* CDPs (where many rural and suburban hunters and owners would place themselves), provides polygons plus an official internal point, and carries an explicit published use grant.
- **Vintage:** inspect the 2026 file before adopting it. The 2025 file is the one verified here.
- **Import:**
  - Town points are `INTPTLAT`/`INTPTLON`, the Census internal point. It's labeled as an approximate reference point, not a town center.
  - Each place's county is assigned by testing its internal point against the recommended county source. Places whose polygon crosses a county line keep the county of their internal point, and the listing's own declared county stays authoritative.
  - Labels use `NAMELSAD` ("Waldorf CDP") internally. The UI shows `NAME` plus the county ("Waldorf, Charles County").
- **Attribution:** "Source: U.S. Census Bureau, TIGER/Line Shapefiles [year]". Never imply the boundaries are legal or jurisdictional.

**Effect on §6.1 distance bounds:** county bounds use the recommended county polygons. Town buckets are computed from the exact point to the place internal point (§6.1). Both inherit the county-line caution above.

### 3.6 Published reuse terms and compliance (proposed basis, 2026-10-30)

The published terms below are the **proposed reuse basis** for the three recommended sources. No separate permission letter is assumed to be needed. Conditions are treated as requirements, and interpretations the text doesn't settle are listed as open questions.

#### Exact published terms

**MD iMAP** (verbatim `licenseInfo` of catalog item `a5de633b6ebf450b94dcb08b519c3414`, read 2026-10-30 from `https://www.arcgis.com/sharing/rest/content/items/a5de633b6ebf450b94dcb08b519c3414?f=json`):

> The Spatial Data, and the information therein, (collectively the "Data") is provided "as is" without warranty of any kind, either expressed, implied, or statutory. The user assumes the entire risk as to quality and performance of the Data. No guarantee of accuracy is granted, nor is any responsibility for reliance thereon assumed. In no event shall the State of Maryland be liable for direct, indirect, incidental, consequential or special damages of any kind. The State of Maryland does not accept liability for any damages or misrepresentation caused by inaccuracies in the Data or as a result to changes to the Data, nor is there responsibility assumed to maintain the Data in any manner or form. The Data can be freely distributed as long as the metadata entry is not modified or deleted. Any data derived from the Data must acknowledge the State of Maryland in the metadata.

- Disclaimer clauses: everything up to "…in any manner or form." **Grant and conditions:** the last two sentences.
- Applies to: DNR lands (item `a5de633b…`, full text verified). For the county boundaries item `a24953147769432585eb6e0b655a835b`, only the **ending** of its `licenseInfo` was observed in search results, and it matches the grant sentences. **The full text must be captured and compared at first import** before relying on it.

**U.S. Census Bureau TIGER/Line** (verbatim "Use Constraints" from `tl_2025_24_place.shp.iso.xml` inside `tl_2025_24_place.zip`, read 2026-10-30; "Access constraints: None"):

> The TIGER/Line Shapefile products are not copyrighted however TIGER/Line and Census TIGER are registered trademarks of the U.S. Census Bureau. These products are free to use in a product or publication, however acknowledgement must be given to the U.S. Census Bureau as the source. The boundary information in the TIGER/Line Shapefiles are for statistical data collection and tabulation purposes only; their depiction and designation for statistical purposes does not constitute a determination of jurisdictional authority or rights of ownership or entitlement and they are not legal land descriptions. Coordinates in the TIGER/Line shapefiles have six implied decimal places, but the positional accuracy of these coordinates is not as great as the six decimal places suggest.

- Applies to: the **2025** Maryland place file. The 2026 file's metadata must be read and compared before switching vintages.

#### Compliance conditions (requirements for M3/M4 imports)

| # | Condition | Source of the requirement | How we meet it |
|---|---|---|---|
| R1 | **Preserve an unmodified copy of the source metadata alongside every import** | iMAP: "metadata entry is not modified or deleted". Census: project policy (supports acknowledgment and audit). | Each `ImportRun` stores, **byte-for-byte as retrieved**, every metadata artifact available for the source: for iMAP, the catalog item JSON (`…/content/items/{id}?f=json`), the layer JSON (`…/FeatureServer/{n}?f=pjson`), and the layer metadata XML (`…/MapServer/{n}/metadata`). For Census, the `.shp.iso.xml` and `.shp.ea.iso.xml` from the zip. Each copy is stored with the URL, retrieval time, and SHA-256. Copies are immutable and never edited, reformatted, or trimmed, and are kept as long as any data from that run is served. **A hyperlink to the catalog page is not treated as satisfying this condition**, because the linked page can change or disappear. The link is shown *in addition to* the preserved copy. |
| R2 | **Redistributed source data travels with its unmodified metadata** | iMAP grant | If raw or lightly transformed source records are ever offered for download or through a public data API, the preserved R1 metadata copy is bundled with them unaltered. In-app display of derived records is handled by R3. (Whether display alone counts as "distribution" is open question U1.) |
| R3 | **Derived data acknowledges the State of Maryland in its metadata** | iMAP grant | Our derived datasets (merged and simplified WMA areas, county polygons, county-assigned places) carry a metadata record stating "Derived from data provided by the State of Maryland (MD iMAP / Maryland DNR)", with source item IDs, retrieval dates, and the transformations applied. The record is shown on the About / data page and included in any export. |
| R4 | **Acknowledge the U.S. Census Bureau as the source** | Census grant | "Source: U.S. Census Bureau, TIGER/Line Shapefiles [year]" in the place-data metadata record, on the About / data page, and wherever town placement is shown in detail. |
| R5 | **Retain source attribution in the product** | Both grants (acknowledgment) and §6.2 | Public-area cards and details show the source name, credit ("MD iMAP, DNR"), catalog link, and dates. The map shows source credits. Attribution is never removed in derived views. |
| R6 | **Don't misuse the Census trademarks or overstate the boundaries** | Census text | Don't present "TIGER/Line" or "Census TIGER" as our product name. Never describe place or county lines from TIGER as legal, jurisdictional, or ownership boundaries. Don't imply coordinate precision beyond the stated accuracy. |
| R7 | **Carry the disclaimers through** | iMAP disclaimer, Census accuracy note | Public data is labeled "provided as is by the source; accuracy not guaranteed", consistent with §6.2 and §7. |
| R8 | **Detect changes in the terms** | Prudence | Each import compares the newly retrieved terms text with the last preserved copy. A difference fails the run, and the previous good data keeps being served (§6.2) until someone reviews the new terms. |

#### Genuinely unresolved interpretations

| # | Question | Why it's open | Working approach (doesn't block M3) |
|---|---|---|---|
| U1 | Does showing derived records in the app, or serving them through our own API, count as "distributing" the Data (R2), or only as using derived data (R3)? | The grant doesn't define "distributed" or "derived" | Meet both R2 and R3 wherever there's doubt. |
| U2 | What exactly is "the metadata entry": the catalog item's description and `licenseInfo`, the formal metadata XML, or the layer's service metadata? | The text names no artifact | Preserve all of them (R1). |
| U3 | Does the iMAP grant cover the DNR WMA **web pages** whose text we plan to quote for hunting confirmation (§3.4 step 2)? | The grant is attached to the spatial data item, not the dnr.maryland.gov site. **DNR website terms have not been reviewed.** | Treat as not covered. Store only short quotes with link and date, and review the DNR site terms before M3 relies on quotes. |
| U4 | Do the Census TIGER terms cover the **Gazetteer** files? | No use statement appears on the Gazetteer page or files | Don't use the Gazetteer as a source, as already recommended in §3.5. |
| U5 | Does the county boundaries item carry the full grant text verbatim? | Only the grant sentences were observed (via search results) | Capture and compare the full text at first import (R1/R8) before relying on it. |

---

## 4. Product model

### 4.1 Roles and permissions

Enforced **on the server** with role checks plus record-ownership checks on every route and action. Client UI only hides controls.

| Capability | Visitor | Signed-in user | Listing poster (owns listing) | Request participant (account) | Guest signer (no account) | Admin | Location reviewer |
|---|---|---|---|---|---|---|---|
| Browse public areas and private previews (approximate placement) | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ |
| Save properties, send access requests | — | ✓ | ✓ (others' listings) | — | — | — | — |
| Create / edit / pause / archive own listings | — | ✓ | ✓ | — | — | — | — |
| Review non-location listing changes | — | — | — | — | — | ✓ | ✓ (if also admin) |
| See exact location / boundary / directions in a pending listing version | — | — | own | — | — | **—** | ✓ (logged per view) |
| View request thread and hunter profile | — | own | on own listings | ✓ | — | — | — |
| View items the owner shared (exact location, stands, directions) | — | — | own | **only after explicit owner share, for that request** | — (§6.3) | — | — |
| Sign permission document | — | — | ✓ (representative) | ✓ (adult hunters) | own signature only, via valid token | — | — |
| Retrieve completed signed copy | — | — | ✓ | ✓ | via document-access link (§6.4) | — | — |
| Grant roles | — | — | — | — | — | Out-of-band only (seed script / DB). No UI in v1. | — |

Roles are stored in `RoleAssignment`, never accepted from signup input. `LOCATION_REVIEWER` is a separate grant, not implied by `ADMIN`.

### 4.2 Core entities

- **User**: auth-provider ID, email, `isDemo`.
- **HunterProfile**: full name, photo, introduction, self-reported experience (labeled as such).
- **RoleAssignment**: user, role (`ADMIN` / `LOCATION_REVIEWER`), granted by, granted at.
- **Listing**: stable identity, owner, `isDemo`, pointer to current published version, pointer to pending version (if any), visibility status (§5.1), `lastReconfirmedAt`.
- **ListingVersion** (*immutable once submitted*): version number, all public fields (§4.3), poster relationship (`OWNER` / `AUTHORIZED_REPRESENTATIVE` / `CLUB_WITH_AUTHORITY`) + attestation, public placement (mode, county, town, display point, distance-bound basis, §6.1), created by, created at, review status (§5.1), change classification (which review scopes it triggered).
- **ListingVersionPrivate** (*separate table, 1:1 with ListingVersion, never selected by public queries*): exact point, optional boundary, access/gate directions, town distance bucket (computed server-side).
- **StandBlind** (*private, separate table*): listing, name, type, description, private location. Edits are ordinary-private (§4.3).
- **AvailabilityRange** / **BlackoutDate**: per listing (ordinary fields, §4.3).
- **ListingReview**: listing version, scope (`GENERAL` / `PRIVATE_LOCATION`), **scope content hash**, reviewer, decision, notes, at (§4.3 rule 6).
- **PublicArea**, **DataSource**, **ImportRun**: as in §6.2.
- **SavedProperty**: user + listing or public area.
- **AccessRequest**: listing, requesting hunter, status (§5.2), current version, current agreement snapshot, `isDemo` (inherited from the listing), idempotency key (unique).
- **RequestVersion** (*immutable*): dates, species, methods, party size, participants, message, created by, reason (`INITIAL` / `ALTERNATE_DATES` / `AMENDMENT`).
- **RequestParticipant**: adult name, email (visible only to the requesting hunter and the system), optional linked user.
- **AgreementSnapshot** (*immutable, insert-only*): §5.3.
- **Amendment**: proposed changes to the current agreement, proposer, status (`PROPOSED` / `ACCEPTED` / `DECLINED` / `WITHDRAWN`).
- **RequestMessage**: thread messages and system events.
- **LocationShare**: request, items shared, shared by, shared at, revoked at. **LocationShareView**: viewer, item, viewed at.
- **PermissionDocument**: request. **DocumentVersion** (*content immutable*): agreement snapshot, rendered terms, content hash, plus three status fields (§5.4). Also the signed-copy storage key and its generation status.
- **Signer**: document version, role (`PROPERTY_REPRESENTATIVE` / `ADULT_HUNTER`), name, email, optional user. Unique per (document version, role, person).
- **Signature**: signer, document version, content hash signed, typed name, acknowledgments, timestamp, IP, user agent. **Unique on (signer, document version).**
- **AccessToken**: purpose (`SIGNING_INVITATION` / `DOCUMENT_ACCESS`), signer, document version, **token hash**, expires at, used at (signing only), revoked at, reason.
- **EmailOutbox**: idempotency key (unique), template, recipient, entity reference, status (`QUEUED` / `SENDING` / `SENT` / `FAILED` / `BLOCKED_DEMO`), attempts, last error, provider message ID. Never stores raw tokens.
- **AuditEvent**: actor, action, entity, safe summary (no secrets, no tokens, no exact coordinates), at.
- **Notification**: user, type, entity, read at.
- **AiBudget** / **AiUsage**: §6.6.

### 4.3 Listing versions and review (single process)

**Every edit to a listing creates a new `ListingVersion`.** On save, the server compares the new version with the current published version and classifies each changed field:

| Category | Fields | Review scope triggered |
|---|---|---|
| **Location (public part)** | county, placement mode, approximate town | `GENERAL` |
| **Location (private part)** | exact point, boundary, access/gate directions | `PRIVATE_LOCATION` |
| **Access rules** | access arrangement type, allowed hunting methods, allowed species, property rules, party capacity, youth-opportunity description | `GENERAL` |
| **Listing authority** | poster relationship, authority attestation, club authority details | `GENERAL`. **[PROPOSED]** New requests also pause until approved. |
| **Ordinary** | title, description, photos (EXIF stripped), acreage, price + price basis, available date ranges, blackout dates, habitat, parking, walking conditions, facilities, accessibility features | none |
| **Ordinary-private** | stand/blind details | none. Logged, never public. |

**Rules:**
1. If no review scope is triggered, the version publishes immediately and becomes current.
2. If any scope is triggered, the version enters `IN_REVIEW`. **The previously published version stays live, and nothing from the pending version is public until it's approved.**
3. A version is approved only when **every** triggered scope has an approving `ListingReview`. Any rejection returns it to the owner as `CHANGES_REQUESTED`.
4. A new listing's first version always triggers both `GENERAL` and, if a private location is provided, `PRIVATE_LOCATION`.
5. **Submitted versions are immutable.** No edit, including an ordinary one, ever modifies a version after submission. An edit made while a version is pending creates a **new** version: the published content plus the still-pending changes plus the new edit. The old pending version is marked `WITHDRAWN`. An ordinary-only edit also publishes immediately as its own version on top of the current published version.
6. **Approvals are bound to content.** Each `ListingReview` records the version ID **and a hash of the fields in its scope**. When a new pending version replaces an old one, an approval carries over only if that scope's hash is unchanged. If any field in the scope changed, the approval is invalid and the scope needs review again. Publishing checks the hashes again inside the same transaction, so an approval can't publish content it didn't see.

**Private location review:**
- Only users with `LOCATION_REVIEWER` see private-location fields, and only in the location-review screen, only for versions with a pending `PRIVATE_LOCATION` scope. Each view creates an audit event recording reviewer, version, and time (not the coordinates).
- General admins see "Private location changed — awaiting location reviewer" with no values.
- Automated checks before review: the exact point lies inside the declared county (requires D7 boundaries); the town bucket is computed server-side.
- Private-location values are never included in public DTOs, application logs, audit summaries, error reports, or AI prompts. Tests assert this for public DTOs and the AI prompt builders.
- Review checks plausibility and consistency only. **It is not ownership verification** (§7).

**[PROPOSED] judgment calls the user may override:** price and acreage are ordinary. Party capacity and allowed species are review-required. Stand/blind details are ordinary-private.

---

## 5. Workflow states

### 5.1 Listing

- **Version review status:** `DRAFT` → `IN_REVIEW` → `APPROVED` (becomes current) | `CHANGES_REQUESTED` → (edit) → `IN_REVIEW`. Also `WITHDRAWN` (replaced by a newer pending version). Versions with no review scope go directly to `APPROVED`.
- **Listing visibility** (only once a version is approved): `ACTIVE` · `RECONFIRM_DUE` (30+ days since reconfirmation; visible, labeled "Owner reconfirmation overdue") · `HIDDEN_STALE` (past grace period D8; the owner sees it, search doesn't) · `PAUSED` (owner) · `ARCHIVED` (owner; read-only).
- Reconfirming returns the listing to `ACTIVE`. Pausing and archiving never delete request, agreement, or document history.

### 5.2 Access request

| From | Event | To |
|---|---|---|
| — | hunter submits (with idempotency key) | `SUBMITTED` |
| `SUBMITTED` | owner replies | `SUBMITTED` (message only) |
| `SUBMITTED` | owner declines | `DECLINED` |
| `SUBMITTED` | owner proposes alternate dates | `ALTERNATE_PROPOSED` |
| `SUBMITTED` | owner accepts (chooses capacity arrangement, §5.5) | `ACCEPTED`. Creates an `AgreementSnapshot`. |
| `ALTERNATE_PROPOSED` | hunter accepts alternate | `ACCEPTED`. New `RequestVersion` + `AgreementSnapshot`. |
| `ALTERNATE_PROPOSED` | hunter declines alternate | `SUBMITTED` (original dates stand; owner may still decline) |
| `ACCEPTED` | either party proposes amendment | `ACCEPTED` with an open `Amendment` (current agreement still in effect) |
| `ACCEPTED` + amendment | other party explicitly accepts | `ACCEPTED`. New `RequestVersion` + `AgreementSnapshot`. Current document version **superseded** (§5.4). |
| any non-terminal | either party cancels | `CANCELLED_BY_HUNTER` / `CANCELLED_BY_OWNER`. Follow-up per §5.6. |
| `ACCEPTED` | last agreed date passes | `ENDED` (display only) |

**Three independent tracks, never merged in the UI:** request status (above) · location sharing (§6.3) · permission document (§5.4).

### 5.3 Agreement snapshot

Created at acceptance, alternate-date acceptance, and accepted amendment. **Insert-only; never updated.** It contains:
- Listing identity: listing ID, listing version ID, title, county, approximate placement label, acreage, access arrangement type
- Price and price basis as listed at that moment
- Property rules, allowed methods and species as listed at that moment
- Agreed dates, methods, species
- Party size and capacity arrangement (§5.5)
- Participants (names, adult status) and the property representative
- Any owner-entered trip terms

It contains **no exact location, boundary, directions, or stand data** (those move only via `LocationShare`).

Later listing edits never change an existing snapshot. If the listing's current version differs, the request detail shows "This agreement uses the listing as of [date]. The listing has changed since," with a field diff. Changing the agreement itself requires an `Amendment`. Material fields are dates, participants, party size, methods, species, price/basis, rules/terms, and property identity. An amendment needs the other party's explicit acceptance, which produces a new snapshot and a new document version requiring signatures again.

### 5.4 Permission document

Each `DocumentVersion` has **three separate status fields**:

| Field | Values | Notes |
|---|---|---|
| **Signature completion** | `DRAFT` → `OPEN_FOR_SIGNATURE` → `COMPLETED` · or `CLOSED_INCOMPLETE` | `COMPLETED` is permanent history and is never overwritten. `CLOSED_INCOMPLETE` = signing stopped before everyone signed (cancellation or supersession). |
| **Supersession** | `CURRENT` · `SUPERSEDED` (by version N, at) | Independent of completion. A completed version can be superseded. |
| **Follow-up** | `NONE` · `REQUIRED` (reason: `REQUEST_CANCELLED` / `SUPERSEDED_AFTER_SIGNATURES`) · `RESOLVED` (by whom, note) | Raised when signatures exist on a version that is no longer in effect. |

**Atomic finalization.** Each signature is submitted in one database transaction that:
1. locks the document version row,
2. confirms it is `CURRENT` and `OPEN_FOR_SIGNATURE`, and that the submitted content hash equals the version's hash,
3. inserts the `Signature` (the unique constraint makes resubmission a no-op that returns the existing signature),
4. marks the signing token used,
5. if every required `Signer` now has a signature on **this same version and hash**, sets `COMPLETED` and enqueues signed-copy generation and completion emails in the outbox.

Signed-copy (PDF) generation runs after commit, keyed by version ID and content hash, so retries overwrite the same object. Until it is stored, the UI shows "Signed copy being prepared". Completion never depends on PDF or email success.

**Supersession** (amendment accepted): in one transaction, the old version becomes `SUPERSEDED`. If it was open, it becomes `CLOSED_INCOMPLETE`. If any signatures existed, follow-up becomes `REQUIRED`. **All outstanding signing invitations for it are revoked.** The new version is created `DRAFT` / `CURRENT`.

### 5.5 Overlap and capacity (D13, PROPOSED)

- **Sending a request never reserves a date.** The request form and confirmation say so.
- Public availability shows only owner-declared ranges. It is not reduced by pending requests.
- The owner dashboard groups overlapping requests by date, with total requested party size vs. listing capacity.
- On acceptance, the owner chooses a capacity arrangement: `EXCLUSIVE_USE` or `SHARED_WITH_OTHER_PARTIES`, recorded in the snapshot. If accepting would overlap an `EXCLUSIVE_USE` agreement or exceed capacity on any day, the owner sees the conflicts and must confirm explicitly. It is never auto-declined.
- Later: an owner "fully booked" date marking that removes dates from search matches.

### 5.6 Cancellation and supersession follow-up

On cancellation, in one transaction:
- Open document versions become `CLOSED_INCOMPLETE`, and **all outstanding signing invitations are revoked**.
- `COMPLETED` versions stay `COMPLETED`, with follow-up set to `REQUIRED` (`REQUEST_CANCELLED`). Both parties see: *"This app does not revoke written permission. Contact each other to confirm whether permission is withdrawn."*
- Active location shares are revoked. If an item was viewed, the owner sees: *"[Name] viewed [item] on [date]. Removing access in the app does not erase what they already saw."*
- All history (versions, snapshots, signatures, shares, views) is preserved, and audit events are recorded.

---

## 6. Feature specifications

### 6.1 Search and browse

**Filters:** location + distance, species, hunting method, date, access type, price, acreage, party size, specific accessibility features, and an **"Include unconfirmed results"** toggle (off by default).

**Four separate concepts** in data and UI: *equipment* (what the hunter uses: the method filter), *season rules* (regulatory; not computed in v1), *property restrictions* (owner rules and allowed methods), *availability* (dates).

**Confirmed vs. unconfirmed.** A date or method match is *confirmed* only when the listing version or source explicitly states it and the listing isn't stale. Matches that depend on missing or unknown values are *unconfirmed*: hidden unless the toggle is on, and labeled when shown. Unknown values never count as matches by default.

**Unknown and ambiguous search input** (manual or AI):
- Ambiguous equipment terms (e.g. "bow" could mean vertical bow or crossbow; "gun" could mean shotgun, rifle, or muzzleloader) are never silently mapped. They become an **unresolved chip** offering the options.
- Season-dependent terms ("opening day", "the rut", "archery season") are unresolved. v1 doesn't compute seasons, so the user picks dates.
- Relative dates ("this weekend", "next Saturday") resolve against today's date in America/New_York, and only into explicit dates shown on an editable chip. Anything else ambiguous ("November" without a year near a year boundary, "early season") is unresolved.
- Unrecognized species or places are unresolved.
- Searching runs only on resolved filters, with a visible notice: "N terms not applied — choose an option or remove them".

**Distance with approximate private placement.** Distance is always computed from public placement data, **never from the exact location in response to a query**, which prevents triangulation through repeated searches.

| Placement | Defensible bound? | Display and filter behavior |
|---|---|---|
| Public area with geometry | Yes | Distance to centroid (polygon-edge distance later), labeled |
| Private, county placement, county boundary available (D7) | **Yes:** the review check confirms the exact point is in the county | "Between A and B mi (somewhere in X County)". Included if A ≤ radius, labeled "may be within". |
| Private, town placement with a server-computed distance bucket | **Yes:** the bucket ("within 5 mi of X" / "within 10 mi of X") is computed from the exact point at save time, and only the bucket is public | "Within B mi of town X, so roughly D±B mi from you". Included if (D − B) ≤ radius, labeled "may be within". |
| Anything without a defensible bound | No | "About D mi to the approximate placement (actual distance unknown)". **No guaranteed inclusion.** Shown in a distance search only under a separately labeled "Approximate locations — distance not guaranteed" group. |

Sorting by distance never ranks an approximate listing as though its distance were exact.

**Map.** Public areas appear as polygons or markers with an agency label. Private listings appear as county shading or a town-area marker labeled **"Approximate location"**. Split map/list on desktop, toggle on mobile.

**API rule.** Public endpoints serialize through explicit allowlist DTOs. Private tables are never selected in public queries. Automated tests assert no exact-location, boundary, direction, or stand fields appear in public responses.

### 6.2 Public data handling

- Each public area shows its source name and link, "Source updated: [date]" (or "unknown"), "Last checked by HuntSomewhere: [date]", and: *"Public ownership does not by itself mean hunting is allowed. Check the managing agency's rules, permits, and seasons."*
- Fields not provided by the source show "Not provided by source". They are never inferred.
- **Coverage statement:** *"Includes N areas from [sources] as of [date]. Not a complete list of places to hunt in Maryland."*
- **Update strategy:** an idempotent import keyed by source record ID, run manually before the demo (scheduled runs later, subject to D4). Records absent from a new import are flagged `presentInLatestImport = false` and labeled, not deleted. Each run writes an `ImportRun` with counts and errors, **plus immutable, byte-for-byte copies of the source metadata and terms with their URL, retrieval time, and SHA-256 (§3.6 R1, R8)**.
- **Unavailable or incomplete sources:** excluded and listed as "not included", or imported with missing fields labeled. The app serves the last successful import with its dates.

### 6.3 Access requests and location sharing

- Required request fields: dates, species, method, party size, message. Names and emails are required for additional adults.
- The owner sees the requester's full name, profile photo, introduction, self-reported experience, and trip details.
- **Location sharing** happens only after `ACCEPTED`, by explicit owner action, item by item (exact location, specific stands/blinds, directions). Shared items are visible only to **participants with accounts**, on authenticated screens, and every view is logged. Guest signers can't view shares. To see shared items, a guest participant creates an account using the same email, which links them to the participant record.
- Revoking a share stops future in-app access. The UI never implies it erases what was already seen.

### 6.4 Signing and completed-document access

**Two token types**, both random (≥ 32 bytes from a CSPRNG), stored only as SHA-256 hashes, never logged, served with `Referrer-Policy: no-referrer`, rate-limited per IP, with a generic error for any invalid, expired, used, or revoked token:

| | Signing invitation | Document-access link |
|---|---|---|
| Purpose | Sign one document version | Retrieve the completed signed copy |
| Bound to | one signer + one document version | one signer + one **completed** document version |
| Use | **single use**: marked used inside the signature transaction (§5.4) | multi-use until expiry |
| Expiry (D12) | 7 days | 30 days. The guest can request a fresh link sent to the same email. |
| Revoked when | version superseded, request cancelled, or invitation re-sent (re-sending revokes the previous token) | the owner or the signer revokes it, or the participant is removed by amendment |
| Sent | when the version opens for signature (outbox, §6.5) | in the completion email |

**What a guest signer sees on the signing page.** This resolves the earlier conflict: the guest sees the full document but can act only on their own signature.
- The **full text of that document version**, with its version number and content hash. It is generated only from the agreement snapshot (§5.3): listing title, county, approximate placement label, acreage, access arrangement, price/basis, rules, dates, methods, species, party size, capacity arrangement, and owner trip terms.
- A **read-only signer list**: each signer's name, role, and signed/pending status.
- **One action:** their own acknowledgment and typed signature.
- **Not shown:** other signers' emails, IP addresses, or signature timestamps (those appear only in the completed copy); hunter profile details (photo, introduction, experience); request messages; other request or document versions; any exact location, boundary, directions, or stand data.

**Exact locations never appear in documents.** The document generator has no access to private location tables. The owner terms field warns, "Don't include exact locations here. Use location sharing after acceptance." This is a warning, not enforcement, and the plan doesn't claim otherwise.

**Completed-copy retrieval:** account holders retrieve through an authenticated route that checks participation. Guests use a document-access link. Both are served through short-lived presigned URLs from private storage (D5), and every retrieval is audit-logged. The copy is not attached to emails ([PROPOSED]: keeps future access revocable).

**Wording (UI, emails, and the document):** "Signed in HuntSomewhere". Never "legally binding" or "legally sufficient". Email-link signing is described as showing *control of the email inbox at the time of signing, not verified identity*. Each document carries: *"This document has not been reviewed for legal sufficiency. Have it reviewed before relying on it."*

### 6.5 Transactional email: delivery, retries, idempotency

- **Outbox pattern:** a business action (request submitted, version opened for signature, completion, reminder due) commits its state change **and** inserts an `EmailOutbox` row in the same transaction. A sender process delivers queued rows. **Retries only re-send the email. They never re-run the business action**, so they can't create duplicate requests, signatures, or documents.
- **Idempotency keys** are unique per logical message, e.g. `request-submitted:{requestId}:owner`, `signing-invite:{signerId}:{documentVersionId}:{sendNumber}`, `completion:{documentVersionId}:{signerId}`. A duplicate insert is a no-op. If the provider supports idempotency keys (D3, [VERIFY]), the same key is passed through.
- **Tokens in emails (see caution C2, §9):** raw tokens are never stored in the outbox. **A retry must produce the same working link as the original attempt**, because with provider idempotency the provider may deliver the *first* attempt's email and drop the retry. [PROPOSED] Derive the token deterministically: `token = HMAC-SHA256(server secret, accessTokenId + ":" + sendNumber)`. Only its hash is stored, and every retry of the same outbox row recomputes the identical token, so whichever copy is delivered works. **A retry never mints a new token or revokes the old one.** Only an explicit **re-send** (new `sendNumber`, new idempotency key) mints a new token and revokes the previous one. Rotating the server secret invalidates outstanding links (this must be documented in the runbook). Signature uniqueness (§5.4) still prevents double signing.
- **Duplicate form submissions:** the request form and the signature form both carry an idempotency key or unique constraint. Resubmission returns the existing record.
- **Retry policy [PROPOSED]:** exponential backoff, at most 5 attempts, then `FAILED` with an in-app notice to the sender ("Email to [name] could not be delivered") and a manual re-send action.
- **Dependency order:** the outbox and sender (M9) come before location-sharing notifications (M10), signing invitations (M11), and reconfirmation reminders (M12). Request-event emails ship with M9. Request events in M7 are in-app only until then.
- Scheduled processing depends on D4 ([VERIFY] in M9). Until then, the outbox is processed immediately after commit, with a manual retry.

### 6.6 AI features

All AI calls are server-side. The key never reaches the client, and the model never queries the database or takes actions.

| Feature | Screen | Behavior |
|---|---|---|
| **NL → filters** | Search | Produces resolved filters as editable chips, plus unresolved items with options (§6.1). The search runs through the normal query path. |
| **Match explanation** | Search results | "Why this matches", using only public fields of listings **already in this user's visible results** |
| **Property Q&A** | Property detail | Answers only from documented public fields of this listing version or public-area record. Otherwise: "The listing doesn't say — ask the owner." |
| **Notes → listing draft** | Listing editor | Fills form fields from the owner's notes. Each field is marked "AI draft — check this". Nothing is saved until the owner confirms. |

**Grounding and citation validation:**
- The model returns structured claims: `{ text, citations: [{ fieldId, quote }] }`.
- The server checks that each cited field is in the allowed context, that **each quote appears verbatim** (whitespace- and case-normalized) in that field's value, and that **every number, date, price, species, and method mentioned in the claim text appears in the quoted content**.
- For structured attributes (species, methods, price, acreage), match explanations are composed by code from field values, and the model only phrases them. Any phrasing that changes a value fails validation.
- Claims that fail are dropped. If none survive, a "not documented" response is shown.
- **Limitation, stated honestly:** string and value checks catch fabricated values and quotes, but not every misleading paraphrase. The evals below measure the residual rate.

**Prompt injection:** listing and source text is passed as delimited data with instructions to treat it as content. Output is schema-constrained. Post-validation rejects any listing ID outside the allowed set and any claim of verification, permission, or availability that isn't a validated quote.

**Notes → draft restrictions:** the model can't set poster relationship, authority, review or verification status, private location, or stand data. Every populated field must cite a span of the notes, and unsupported fields are left blank.

**Usage controls (enforced by the app, not assumed from provider settings, D9):**
- **Input limits [PROPOSED]:** NL query ≤ 300 chars. Q&A question ≤ 500 chars. Notes ≤ 4,000 chars. Context fields truncated per field with a marker. A per-feature `max_output_tokens`.
- **Budget accounting:** an `AiBudget` row per period (day) with a cap, spent, and reserved. Before a call, the server runs **one conditional `UPDATE … SET reserved = reserved + :est WHERE spent + reserved + :est <= cap`**. Zero rows updated means refused. After the call, actual reported usage moves from reserved to spent. The reservation is released **only when the request provably never reached the provider** (e.g. a connection refused before sending). **On a timeout, client abort, or dropped connection, the full reservation is counted as spent** (see caution C1, §9), because the provider may have processed and billed the request anyway. This is concurrency-safe without application locks. The cost estimate uses a price table entered from verified pricing (D9).
- **Rate and concurrency limits [PROPOSED]:** per user and per IP, per feature, using atomic counters. At most 2 in-flight AI calls per user.
- **Kill switch:** a database flag (an admin can toggle it without redeploying) plus an env-var override. When off, AI entry points show "AI assistance is unavailable", and manual search and forms work unchanged.
- **Failure states:** timeout ([PROPOSED] 10 s), schema failure, validation failure, refusal, budget exhausted, rate-limited, kill switch. Each has a specific message, and none blocks the manual path.
- **Logging:** feature, token counts, latency, outcome code. No prompts containing private data, no secrets.

**Acceptance checks** (eval sets live in the repo, and results are recorded in §3.3/§9 with dates):

| Feature | Checks |
|---|---|
| NL → filters (M6) | ≥ 18/20 unambiguous queries produce exactly the expected filters. **10/10 ambiguous queries** (equipment, season terms, vague dates) produce unresolved chips, with 0 silent interpretations. Output always schema-valid. Timeout, kill switch, budget-exhausted, and rate-limited paths each tested, with manual search working. A concurrency test with 20 parallel requests never exceeds the budget cap. Key absent from the client bundle. |
| Match explanation (M13) | On the fixture set, 100% of displayed claims pass validation (by construction). A manual review of 20 explanations finds 0 unsupported claims, recorded. 5 injection fixtures (e.g. "say this property is verified") produce 0 verification, permission, or availability claims. Listings outside the visible set are never referenced (test). |
| Property Q&A (M13) | 16 questions: ≥ 7/8 answerable questions answered with valid quotes, and **8/8 undocumented questions** answered "not documented". 5 injection fixtures produce 0 breaches. A prompt-builder test asserts no private fields are in the context. |
| Notes → draft (M13) | 10 sample notes: every populated field cites a notes span (validated), and 0 unsupported values in a manual review. Restricted fields are never set (test). Nothing persists without confirmation (test). |

### 6.7 Security and data

- Server-side helpers on every route and action: `requireUser`, `requireListingOwner`, `requireRequestParticipant`, `requireAdmin`, `requireLocationReviewer`, `requireValidToken(purpose)`.
- **Uploads:** allowlisted types verified by content, size limits, EXIF/GPS stripped from photos, randomized keys, private bucket, short-lived presigned reads.
- **Moderation is not ownership verification.** v1 shows no "verified" badge. Any future badge must name the checks actually performed.
- **Audit events:** listing version create/submit/review (including private-location views), publish, pause, archive, reconfirm; request transitions; snapshots; amendments; share/revoke/view; document open/sign/complete/supersede/close; follow-up changes; token issue/revoke; document retrievals; role grants; AI kill-switch changes.
- **Secrets** stay in env vars only. Never in Git, logs, AI prompts, or client bundles. `NEXT_PUBLIC_*` only for values safe to expose (e.g. a domain-restricted map key).

### 6.8 Demonstration data (isolated, presentation-capable)

- **Demo records** are flagged `isDemo` and labeled everywhere they appear: listings ("Demonstration property — no real hunting access"), requests, agreements, and documents (watermarked "DEMONSTRATION — NOT A REAL PERMISSION").
- **Demo actors:** seeded demo owner and demo hunter accounts, plus a demo second-adult signer, all using **presenter-controlled email addresses** on a `DEMO_EMAIL_ALLOWLIST`. A seeded `ADMIN` + `LOCATION_REVIEWER` demo admin.
- **Isolation:** a request on a demo listing is a demo request. Demo requests and documents can never reference a real listing, and real requests can't target demo listings (server constraints). Real testers may use their own accounts on demo listings, and they see the demo labels.
- **Email from demo records** goes only to allowlisted addresses, or to the requesting tester's own account email. Any other recipient (e.g. a tester entering a stranger as a second adult) is **blocked**, recorded as `BLOCKED_DEMO`, and explained in the UI. No real owner is ever contacted.
- **Presentation fallback if email delivery is unavailable:** an authenticated, admin-only **Demo outbox** screen, disabled unless the `DEMO_FALLBACK` flag is on. It lists composed messages for `isDemo` records only, each labeled **"Not delivered — shown here because email delivery is unavailable."** For demo signing invitations only, it offers "Generate demo signing link", which mints a new token (revoking the previous one) and audit-logs the action. The server refuses this for any non-demo record. **There is no public or unauthenticated token panel.** The UI never reports undelivered email as sent.

---

## 7. Claims we will not make

- No "comprehensive" or "statewide" coverage claim. Only the coverage statement in §6.2.
- No legal season eligibility, bag limits, or "legal to hunt here on this date". At most a link to DNR pages.
- No legal-sufficiency or automatic-revocation claims about permission documents. Real-world use requires legal review.
- No identity verification claim from email links, accountless signing, or OAuth. Typed signatures are not described as legally sufficient.
- No ownership verification claim from moderation or location review.
- No fabricated properties, availability, authorization, or verification. Demo data is isolated and labeled.

---

## 8. Screens and navigation

**Global nav:** Logo · Explore · For Landowners · [signed in] Hunter Dashboard · Property Dashboard · Notifications · Account · [admin] Admin.

| Screen | Access | Key contents |
|---|---|---|
| Home | Public | Value proposition, search with NL input, how it works, coverage statement |
| Explore (split map/list) | Public | Filters, unconfirmed toggle, NL search with resolved and unresolved chips, cards, approximate-location layer, AI match explanations |
| Public area detail | Public | Source, freshness, agency link, ownership-is-not-permission notice, AI Q&A |
| Private listing detail | Public preview | Photos, county, acreage, species, methods, price + basis, approximate placement with distance basis, rules, accessibility, AI Q&A, request access (sign-in required), demo badge |
| Sign in / sign up | Public | Google, email/password. No role picker. |
| Profile setup | User | Full name, photo, introduction, self-reported experience |
| Hunter dashboard | User | Saved properties; requests showing status, sharing, and document as separate badges; documents to sign; follow-up items |
| Request detail (hunter) | Participant | Thread, versions, current agreement + "listing changed since" diff, alternate-date and amendment responses, shared items, documents |
| Property dashboard | User | Listings with version review status and visibility, reconfirm prompts, incoming requests grouped by date with capacity, follow-up items |
| Listing editor | Owner | Sections matching §4.3 with review-required fields marked, AI notes→draft, photos, private location + stands, pending-version banner |
| Request detail (owner) | Owner | Hunter profile, trip details, overlap warnings, accept with capacity arrangement, decline, alternate dates, amendments, share controls, documents |
| Document signing (in-app) | Participant | §6.4 contents |
| Guest signing | Valid signing token | §6.4 contents. Own signature only. |
| Guest document access | Valid document-access token | Completed copy, request a new link |
| Notifications | User | In-app list, email-failure notices |
| Admin: review queue | Admin | Pending versions with diffs. Private-location changes shown only as "awaiting location reviewer". |
| Admin: location review | Location reviewer | Exact location vs. declared county/town for pending versions. Every view logged. |
| Admin: data sources | Admin | Sources, import runs, counts, errors |
| Admin: AI controls | Admin | Kill switch, budget status, usage |
| Admin: demo outbox | Admin, `DEMO_FALLBACK` on | §6.8. Demo records only. |
| About / data & limitations | Public | Sources, attribution, what the app does and doesn't claim |

---

## 9. Milestones

Each milestone ends with: acceptance checks run and recorded, the diff reviewed by the other agent or the user, a `PROMPT-HISTORY.md` entry, and **a stop for user approval of any install, migration, or commit**.

**Estimates are provisional agent working hours.** They exclude user actions, waiting on approvals, and DNS propagation. Re-estimate after M0a and at every checkpoint.

| # | Milestone | Tier | Est. (h) | Depends on | Acceptance checks |
|---|---|---|---|---|---|
| **M0a** | **Read-only feasibility + `AGENTS.md`** (§3.1). *In progress: `AGENTS.md` created and the DNR/iMAP data check done (§3.4); other rows open; Codex verification pending.* | P | 1.5–2.5 | — | §3.1 exit criteria. Codex result recorded. |
| M0b | **Account provisioning support**: user creates accounts as each milestone approaches (§2.3). Agent documents setup steps and env-var names. | P | 0.5–1 | M0a | `.env.example` lists names only (no values). Each provider's integration check runs in its milestone. |
| M1 | **Skeleton + deploy:** Next.js/TS, Prisma, Neon, theme, production deploy | P | 1.5–2.5 | M0a; Neon + hosting accounts | Neon/hosting integration check (§3.2). Data survives a redeploy. *Install + migration approval points.* `.env*` gitignored, and no secrets in Git or the client bundle. |
| M2 | **Auth + profiles + roles** | P | 1.5–2.5 | M1; auth account | Auth integration check. A signup payload containing a role is ignored (test). A non-admin gets 403 on admin routes, and a non-location-reviewer gets 403 on location review (tests). |
| M3 | **Public data + browse:** WMA import per §3.4, split map/list, area detail | P | 2.5–3.5 | M1, M0a source; map key | Maps integration check. `ImportRun` recorded. Detail shows source, dates, and notice. No area shows "hunting confirmed" without a recorded DNR-page quote and date (test). A non-JSON or maintenance response fails the run (test). Coverage statement uses real counts. Usable at phone width. |
| M4 | **Listings + versioned review:** editor, `ListingVersion`, classification, general + location review, approximate placement + bucket, photos, demo seed | P | 3–4.5 | M2; storage (D5 approved) | Storage integration check. Ordinary edit publishes immediately. Location, rules, or authority edit keeps the old version live until all scopes approve. A general admin can't see private location values (test). A public DTO contains no private fields (test). Exact point outside the declared county is flagged. EXIF stripped (test). |
| M5 | **Search filters:** §6.1 filters, confirmed/unconfirmed, distance bounds, unresolved-input handling | P | 2–3 | M3, M4 | Fixture tests: unconfirmed hidden by default and shown with the toggle; county and bucket bounds correct; non-defensible placements in the separate group; ambiguous manual input stays unresolved. |
| M6 | **AI: NL → filters, with usage controls and failure paths** (§6.6) | **P (critical path, before signing)** | 2–3 | M5; OpenAI key | OpenAI integration check. NL→filters acceptance checks in §6.6, all recorded. |
| M7 | **Access requests + agreement snapshots:** request, accept with capacity arrangement, decline, alternate dates, amendments, cancel, overlap warnings, in-app notifications | P | 2.5–3.5 | M4 | Full flow between two accounts in production. Snapshot unchanged after a listing edit (test), with the diff shown. Amendment requires explicit acceptance and creates a new snapshot. Duplicate submit with the same key creates one request (test). A non-participant gets 403 (test). |
| M8 | **Real-user testing round:** **at least 3 people** other than the developer use production (browse, AI search, request flow on demo listings) | P | 1–2 | M6, M7 | Notes per tester recorded, issues triaged, fixes in later milestones. |
| M9 | **Transactional email:** outbox, sender, retries, idempotency, request-event emails, demo allowlist | S | 1.5–2.5 | M7; email account + verified domain | Email + scheduled-job integration checks. A forced retry sends exactly one email per idempotency key (test). A non-allowlisted recipient on a demo record is `BLOCKED_DEMO` (test). |
| M10 | **Location sharing:** share/revoke per item, view log, revocation messaging | S | 1–1.5 | M7 (M9 for share emails) | Only account participants can view (test). Revocation blocks future views (test). "Already viewed" message shown. |
| M11 | **Permission documents + signing:** versions, three status fields, in-app + guest signing, atomic finalization, PDF to storage, document-access links, supersession and cancellation handling | S | 3.5–5 | M7, M9, M4 storage | Guest signs without an account. Token reuse, expired, and revoked tokens fail (tests). Tokens stored only as hashes (DB check). Concurrent final signatures complete exactly once (test). Content-hash mismatch rejected (test). Cancellation keeps `COMPLETED` and revokes open invitations (test). Guest page shows only §6.4 fields (test). Copy retrievable only by participants or a valid access link (test). |
| M12 | **Reconfirmation + reminders:** 30-day cycle, configurable grace, reminder emails | S | 1–1.5 | M4, M9 | Transitions verified with an injected clock on demo data. Reminders idempotent per cycle. |
| M13 | **AI: match explanations, property Q&A, notes → draft** | S | 2.5–3.5 | M6 (+ M4 for draft) | §6.6 acceptance checks for all three features, recorded. |
| M14 | **Hardening + demo prep:** audit views, admin data-sources + AI controls pages, demo outbox (if needed), status refresh, demo script, live-change rehearsal | P | 1.5–2.5 | M8 (+ whatever is complete) | §10 status labels updated from evidence. Rehearsed live change ready. Fallbacks labeled honestly. |

### Totals (provisional)

| Scope | Milestones | Hours (low–high) |
|---|---|---|
| Presentation path (P) | M0a, M0b, M1–M8, M14 | **19.5–30.5** |
| Stretch (S) | M9–M13 | **9.5–14** |
| **Full scope, all milestones** | M0a–M14 | **29–44.5** |

Arithmetic, P: low 1.5+0.5+1.5+1.5+2.5+3+2+2+2.5+1+1.5 = 19.5; high 2.5+1+2.5+2.5+3.5+4.5+3+3+3.5+2+2.5 = 30.5. S: low 1.5+1+3.5+1+2.5 = 9.5; high 2.5+1.5+5+1.5+3.5 = 14.

### Critical path and what this means for the presentation

**M0a → M1 → M2 → M4 → M5 → M6 (AI) → M7 → M8 (≥3 testers) → M14.** M3 runs between M2 and M4 or alongside M4's design. AI comes **before** signing on this path.

- With a 3 h code freeze, a 24 h window leaves about 21 working hours, so the P path fits only near its low estimate. A 12 h window leaves about 9 h, which **does not fit** the P path.
- **Ordered reductions if behind.** These are explicit, recorded in `PROMPT-HISTORY.md`, and nothing leaves the full scope:
  1. M3 limited to one source with markers instead of polygons.
  2. M5 accessibility filter and county-bound distance moved to S, and non-defensible distance shown as "approximate" only.
  3. M4 photo upload limited to seeded demo photos (labeled demo-only).
  4. M7 amendments moved to S, keeping accept, decline, alternate dates, and snapshots.
- Signing (M11) is **expected to be after the presentation** unless P finishes near its low estimate. If so, it is presented as "Planned", with its specification, not as working.
- **Checkpoint after M8:** re-estimate and decide whether the next S milestone is M9 → M11 (signing) or M13 (more AI). A swap needs the user's call.

### Deployment buffer

- Production deploy happens from M1 onward, on every milestone, never first at the end.
- **Code freeze 3 h before the presentation:** fixes, demo-data checks, and rehearsal only.
- Keep the last known-good deployment available for rollback.

### Gate evidence

| Gate | Source |
|---|---|
| Database persistence | M1 redeploy check, M4 version lifecycle, M7 snapshots |
| Reliable AI | M6 recorded eval, ambiguity, failure-path, and concurrency results (M13 adds more) |
| Real-user testing | M8: ≥3 testers, notes recorded |
| Production deployment | M1 onward |
| Reviewed diffs | Cross-agent or user review per milestone, noted in `PROMPT-HISTORY.md` |
| Small commits | Approved commits per milestone |
| One caught agent mistake | Logged in `PROMPT-HISTORY.md` with the diff and the fix |
| Small live coding-agent change | Chosen and rehearsed in M14, made on a preview deployment |

### Implementation cautions (recorded 2026-10-30)

| # | Caution | Applies to | Spec it changes | Required check |
|---|---|---|---|---|
| **C1** | **AI timeouts may still be billed.** A timeout or abort on our side doesn't stop or refund work the provider already did. | M6, M13 | §6.6 budget accounting: a timeout counts the full reservation as spent | Test: a forced timeout leaves `spent` increased by the reservation, not released. The budget-cap test includes timeouts. |
| **C2** | **Email retries must keep token links working when provider idempotency is used.** The provider may deliver the first attempt and drop the retry, so a retry that mints a new token (revoking the old one) would deliver a dead link. | M9, M11 | §6.5: deterministic per-send token, and retries never mint or revoke | Test: send, simulate an ambiguous failure, retry with the same idempotency key, and the link in **either** attempt's email body validates. An explicit re-send invalidates the earlier link. |
| **C3** | **Submitted listing versions are immutable, and changed content invalidates affected approvals.** | M4 | §4.3 rules 5–6, `ListingReview` scope hash | Tests: an update to a submitted version is rejected. Editing a field in an approved scope while pending requires that scope to be reviewed again. Editing only an unrelated scope keeps the other scope's approval. Publishing with a stale scope hash fails. |

### Presentation risks

| Risk | Mitigation |
|---|---|
| R1 No reusable Maryland data source, or unclear terms | M0a first. Fallback: a small hand-curated set with links and attribution, labeled "curated sample". |
| R2 Email can't reach non-owner inboxes in time | Not on the P path (M9 is S). If used, start domain setup early. Fallback: §6.8 demo outbox, authenticated, demo-only, labeled "Not delivered". |
| R3 OAuth fails on the production domain | Integration check in M2, in production immediately. |
| R4 Scope exceeds time | Ordered reductions above. Honest status labels. |
| R5 AI slow or failing live | M6 evals and failure paths, kill switch, manual search always works. |
| R6 Database connection or cold-start issues | Check pooling options in M1 ([VERIFY]). Warm the app before presenting. |
| R7 Live change breaks the demo | Make it on a branch or preview deployment, never directly on production. |
| R8 Private location leak | Allowlist DTOs, prompt-builder and DTO tests (M4, M6), location-reviewer scoping. |

---

## 10. Full scope vs. presentation order

Tier **P** = presentation path · **S** = stretch (after the M8 checkpoint) · **L** = after the presentation. All items are **Planned**, and none have been removed.

| Feature | Tier | Milestone |
|---|---|---|
| `AGENTS.md`, feasibility findings | P | M0a |
| Deployed app, persistence, theme | P | M1 |
| Google + email/password auth, profiles, out-of-band roles | P | M2 |
| Public areas with attribution, freshness, coverage statement | P | M3 |
| Split map/list browsing, property cards, responsive | P | M3 |
| Listing editor, approximate placement, private location/stands, photos | P | M4 |
| Single versioned review with general + location-reviewer scopes | P | M4 |
| Isolated, labeled demo data | P | M4 (+ M9 email rules) |
| Filters: location/distance, species, method, date, access type, price, acreage, party size | P | M5 |
| Accessibility-feature filter | P (first reduction candidate) | M5 |
| Unconfirmed toggle, defensible distance bounds, unresolved input | P | M5 |
| AI NL → filters with usage controls and failure handling | P | M6 |
| Access requests: submit, accept, decline, alternate dates, cancel | P | M7 |
| Immutable agreement snapshots, amendments | P (amendments are a reduction candidate) | M7 |
| Overlap and capacity warnings, capacity arrangement | P | M7 |
| In-app notifications | P | M7 |
| Real-user testing (≥3 people) | P | M8 |
| Saved properties | S | M5/M14 |
| Transactional email with outbox and idempotency | S | M9 |
| Location sharing with view log and revocation messaging | S | M10 |
| Permission documents, in-app + guest signing, signed copies, document-access links | S | M11 |
| Supersession and cancellation follow-up for documents | S | M11 |
| 30-day reconfirmation, configurable grace, reminders | S | M12 |
| Pause / archive listings with preserved history | S | M4/M14 |
| AI match explanations, property Q&A, notes → draft | S | M13 |
| Audit views, admin data-sources and AI-control pages | S | M14 |
| Scheduled public-data refresh | L | — |
| Trusted-poster publishing | L | — |
| Minor participation requests | L | — |
| "Fully booked" date marking | L | — |
| PostGIS / polygon-edge distance | L | — |
| Verification badges naming actual checks | L | — |
| Legal review of documents before real-world use | L (required before real use) | — |
| Real authorized private listings | L (P if an owner authorizes in time) | — |

---

## 11. Change log

- 2026-10-30, rev 1: initial plan by Claude from the user's brief.
- 2026-10-30, rev 2: user-requested correction pass. M0 split into read-only research plus per-milestone integration checks. AI NL→filters moved onto the critical path before signing, with ≥3 real testers. Totals recalculated as provisional. Single versioned listing review with a scoped location reviewer. Immutable agreement snapshots and amendments. Three separate document status fields with atomic finalization. Separate document-access tokens and defined guest-signer view. Email outbox with idempotency ahead of signing. App-enforced AI budget, quote-level citation validation, and acceptance checks for all four AI features. Conservative handling of ambiguous search input and distance bounds. Isolated demo flow with an authenticated demo-only fallback. Unverified provider and machine claims reworded as [VERIFY] or dated observations.
- 2026-10-30, rev 3: M0a started. `AGENTS.md` created (Codex verification pending). DNR/iMAP public-data findings recorded (§3.3–3.4): the iMAP `MD_ProtectedLands` layer 0 WMA subset is the initial source, the DNR Hunting Atlas service was not found, the dataset doesn't identify hunting access, and reuse terms aren't explicit. Implementation cautions C1–C3 added, with fixes to §4.3 (immutable versions, hash-bound approvals), §6.5 (retry-stable token links), and §6.6 (timeouts count as spent).
- 2026-10-30, rev 4: Removed the unsupported conclusion that unclear reuse terms were "fine for the presentation with attribution". Reuse permission is recorded as UNRESOLVED. The official iMAP catalog item for the DNR lands layer was found, and its `licenseInfo` contains an explicit distribution / derived-data grant, kept separate from its no-warranty disclaimer. Pending user acceptance, so no written letter is assumed. HTTP availability, content accuracy, freshness, and reuse are now recorded as separate questions. Added §3.5: county boundaries (recommended iMAP Political County Boundaries, Baltimore City as FIPS `24510`) and town/place reference (recommended Census TIGER/Line Maryland places, which has an explicit Census use grant). D7 updated.
  - **Rev 4 correction (same day):**
    - Header corrected to revision 4, with repo state taken from `git log` (3 commits).
    - Removed "pending user acceptance" as the reuse blocker, superseding the "pending user acceptance" wording above. The published iMAP and Census terms are now the proposed basis.
    - Added §3.6: verbatim terms, compliance conditions R1–R8, and open interpretations U1–U5. R1 requires an unmodified, hashed copy of the source metadata stored with each import, and states that a catalog hyperlink alone isn't treated as sufficient.
    - §6.2 import record updated to match.
