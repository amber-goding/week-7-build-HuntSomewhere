# Curated public areas: provenance and derived-data metadata

**Derived from data provided by the State of Maryland (MD iMAP / Maryland DNR).** (project-plan.md §3.6, R3)

This folder holds the source artifacts behind the small curated area list in `lib/areas/curated.ts`. The artifacts are stored **byte-for-byte as retrieved** and must never be edited, reformatted, or trimmed (§3.6 R1). `.gitattributes` turns off line-ending conversion for `data/sources/**`, so the hashes below stay valid.

## Source

- **Dataset:** "Maryland Protected Lands - DNR Owned Properties and Conservation Easements". The official catalog item is [`a5de633b6ebf450b94dcb08b519c3414`](https://www.arcgis.com/home/item.html?id=a5de633b6ebf450b94dcb08b519c3414), owned by `mdimapdatacatalog`, with credit "MD iMAP, DNR". Its catalog date is 2025-05-12. That's a catalog date, not a data-edit date, so the source update date is **unknown**.
- **Layer:** `https://mdgeodata.md.gov/imap/rest/services/Environment/MD_ProtectedLands/FeatureServer/0`
- **Reuse basis:** the published grant in the catalog item's `licenseInfo` (§3.6). Its SHA-256 on 2026-10-30 was `2555e9bc6280c3ed421e03aa25f5a25546d5ebbeb5733641348c44dd477794da`, which is identical to the hash recorded in `prisma/seed.ts`, so the terms are unchanged (§3.6 R8).

## Artifacts (retrieved 2026-10-30, UTC)

| File | URL | Retrieved | SHA-256 |
|---|---|---|---|
| `layer_query.json` | `…/FeatureServer/0/query?where=DESIG%3D%27WMA%27&outFields=OBJECTID,DNRName,County,WebLink,DESIG,DNRType,LandIntere&returnGeometry=false&orderByFields=DNRName&f=json` | 15:57:18Z | `4af24eb987f74e70fa8d6e6005405758a0932a421559de241832d312df328ad6` |
| `catalog_item.json` | `https://www.arcgis.com/sharing/rest/content/items/a5de633b6ebf450b94dcb08b519c3414?f=json` | 15:58:32Z | `0dee6a169ec844cbe7189e149c8aeecf2cbfec38fa900223238a9b30dd447382` |
| `layer.json` | `…/FeatureServer/0?f=pjson` | 15:58:32Z | `6f4c110a03136fe357a0a37c62d7e95497dbb472f2d157efcbf8e1b5e5c84837` |
| `layer_metadata.xml` | `https://mdgeodata.md.gov/imap/rest/services/Environment/MD_ProtectedLands/MapServer/0/metadata` | 15:58:32Z | `eacea0cee8d9abaed8562f6087cf922d576d9f9c3bd956cbe9812e2184a9eede` |

`layer_query.json` holds attributes only, with no geometry. It's kept so the selection can be re-checked, and it travels with the unmodified metadata above (§3.6 R2).

## Transformations applied

1. Kept only records with `DESIG = 'WMA'` (92 records).
2. Selected 6 areas by hand, using these rules:
   - every record for the area has a named county (no `Multiple`);
   - the source `WebLink` is present;
   - the linked DNR page loads, names the area, and mentions only the same county.
3. Trimmed whitespace. Names are title-cased from `DNRName`, and the verbatim source name is kept beside them.
4. Counties are mapped to FIPS keys (§3.5). An area takes **every** county named by its records.
5. `http://` WebLinks are recorded alongside the `https://` URL they redirect to, which returned HTTP 200 on 2026-10-30.

No geometry, descriptions, or DNR page text were copied. A DNR page was read only to check that it loads and to compare its name and county with the source.

## Selected areas

| Area (source `DNRName`) | `OBJECTID`s | County (source) | DNR page (checked 2026-10-30) |
|---|---|---|---|
| MT. NEBO WMA | 328 | Garrett | `https://dnr.maryland.gov/wildlife/Pages/publiclands/western/mtnebo.aspx` |
| CUNNINGHAM SWAMP WMA | 361, 369 | Garrett | `https://dnr.maryland.gov/wildlife/Pages/publiclands/western/cunninghamswamp.aspx` |
| DANS MOUNTAIN WMA | 301 | Allegany | `https://dnr.maryland.gov/wildlife/Pages/publiclands/western/danswma.aspx` |
| INDIAN SPRINGS WMA | 320 | Washington | `https://dnr.maryland.gov/wildlife/Pages/publiclands/western/indiansprings.aspx` |
| MCKEE BESHERS WMA | 326 | Montgomery | `https://dnr.maryland.gov/wildlife/Pages/publiclands/central/mckeebeshers.aspx` |
| STRIDER WMA | 338 | Montgomery | `https://dnr.maryland.gov/wildlife/Pages/publiclands/central/strider.aspx` |

## Excluded, with reasons

- **Frederick County:** the source has 2 Frederick WMAs (Gravel Hill Swamp, Ridenour Swamp), and **neither has a DNR `WebLink`**. DNR's region directory (`https://dnr.maryland.gov/wildlife/pages/publiclands/allbyregion.aspx`) doesn't mention them. No official DNR information page could be established, so they were omitted.
- **Areas whose county is `Multiple`** (e.g. Sideling Hill, Nanticoke River, South Marsh Island, Hugg-Thomas, Islands of the Potomac): the source doesn't say which counties, so they were omitted.

## Limits

This is **limited coverage**: 6 of the 65 WMA names in the source, not a statewide inventory. Hunting status, species, methods, seasons, and access are **not** recorded here. The source data is provided "as is" without warranty (§3.6 R7).
