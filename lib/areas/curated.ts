// A small, hand-curated list of Maryland Wildlife Management Areas for the public-area
// discovery feature. Limited coverage, not a statewide inventory. Provenance, hashes of
// the preserved source metadata, and selection rules:
// data/sources/md-imap-dnr-owned-lands/2026-10-30/PROVENANCE.md (project-plan.md §3.6).
//
// Records only what the source establishes: name, county, and the DNR page link.
// Hunting status, species, methods, seasons, and access are deliberately absent.

export type CuratedArea = {
  id: string;
  // Title-cased display name, and the verbatim (trimmed) source DNRName.
  name: string;
  sourceName: string;
  // FIPS keys (lib/trips/options.ts) of every county the source records for this area.
  counties: string[];
  sourceRecordIds: number[];
  // The source WebLink, and the https URL it resolved to when checked.
  dnrPageUrl: string;
  sourceWebLink: string;
  dnrPageCheckedOn: string; // YYYY-MM-DD: the page loaded (HTTP 200). Not a hunting confirmation.
};

export const AREA_SOURCE = {
  name: "Maryland Protected Lands - DNR Owned Properties and Conservation Easements",
  credit: "MD iMAP, DNR",
  catalogUrl: "https://www.arcgis.com/home/item.html?id=a5de633b6ebf450b94dcb08b519c3414",
  layerUrl: "https://mdgeodata.md.gov/imap/rest/services/Environment/MD_ProtectedLands/FeatureServer/0",
  retrievedOn: "2026-10-30",
  sourceUpdated: null, // the source exposes no data-edit date
  acknowledgment: "Derived from data provided by the State of Maryland (MD iMAP / Maryland DNR).",
  disclaimer: "Provided as is by the source; accuracy not guaranteed.",
  dnrDirectoryUrl: "https://dnr.maryland.gov/wildlife/pages/publiclands/allbyregion.aspx",
} as const;

export const CURATED_AREAS: CuratedArea[] = [
  {
    id: "mt-nebo-wma",
    name: "Mt. Nebo WMA",
    sourceName: "MT. NEBO WMA",
    counties: ["24023"],
    sourceRecordIds: [328],
    dnrPageUrl: "https://dnr.maryland.gov/wildlife/Pages/publiclands/western/mtnebo.aspx",
    sourceWebLink: "http://dnr.maryland.gov/wildlife/Pages/publiclands/western/mtnebo.aspx",
    dnrPageCheckedOn: "2026-10-30",
  },
  {
    id: "cunningham-swamp-wma",
    name: "Cunningham Swamp WMA",
    sourceName: "CUNNINGHAM SWAMP WMA",
    counties: ["24023"],
    sourceRecordIds: [361, 369],
    dnrPageUrl: "https://dnr.maryland.gov/wildlife/Pages/publiclands/western/cunninghamswamp.aspx",
    sourceWebLink: "http://dnr.maryland.gov/wildlife/Pages/publiclands/western/cunninghamswamp.aspx",
    dnrPageCheckedOn: "2026-10-30",
  },
  {
    id: "dans-mountain-wma",
    name: "Dans Mountain WMA",
    sourceName: "DANS MOUNTAIN WMA",
    counties: ["24001"],
    sourceRecordIds: [301],
    dnrPageUrl: "https://dnr.maryland.gov/wildlife/Pages/publiclands/western/danswma.aspx",
    sourceWebLink: "http://dnr.maryland.gov/wildlife/Pages/publiclands/western/danswma.aspx",
    dnrPageCheckedOn: "2026-10-30",
  },
  {
    id: "indian-springs-wma",
    name: "Indian Springs WMA",
    sourceName: "INDIAN SPRINGS WMA",
    counties: ["24043"],
    sourceRecordIds: [320],
    dnrPageUrl: "https://dnr.maryland.gov/wildlife/Pages/publiclands/western/indiansprings.aspx",
    sourceWebLink: "http://dnr.maryland.gov/wildlife/Pages/publiclands/western/indiansprings.aspx",
    dnrPageCheckedOn: "2026-10-30",
  },
  {
    id: "mckee-beshers-wma",
    name: "McKee Beshers WMA",
    sourceName: "MCKEE BESHERS WMA",
    counties: ["24031"],
    sourceRecordIds: [326],
    dnrPageUrl: "https://dnr.maryland.gov/wildlife/Pages/publiclands/central/mckeebeshers.aspx",
    sourceWebLink: "http://dnr.maryland.gov/wildlife/Pages/publiclands/central/mckeebeshers.aspx",
    dnrPageCheckedOn: "2026-10-30",
  },
  {
    id: "strider-wma",
    name: "Strider WMA",
    sourceName: "STRIDER WMA",
    counties: ["24031"],
    sourceRecordIds: [338],
    dnrPageUrl: "https://dnr.maryland.gov/wildlife/Pages/publiclands/central/strider.aspx",
    sourceWebLink: "http://dnr.maryland.gov/wildlife/Pages/publiclands/central/strider.aspx",
    dnrPageCheckedOn: "2026-10-30",
  },
];

// Areas whose recorded counties include any of the selected counties. County only:
// says nothing about species, methods, dates, or whether hunting is allowed.
export function areasInCounties(counties: string[], areas: CuratedArea[] = CURATED_AREAS): CuratedArea[] {
  const wanted = new Set(counties);
  return areas.filter((a) => a.counties.some((c) => wanted.has(c)));
}

export function coveredCounties(areas: CuratedArea[] = CURATED_AREAS): string[] {
  return [...new Set(areas.flatMap((a) => a.counties))];
}
