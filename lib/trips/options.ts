// Allowed trip-preference values. Counties use 5-digit FIPS keys (project-plan.md §3.5);
// species and methods come from the §3.7 taxonomy. These describe what a hunter wants,
// never whether a hunt is legal, permitted, or available.

export type Option = { value: string; label: string };

export const COUNTIES: Option[] = [
  { value: "24001", label: "Allegany County" },
  { value: "24003", label: "Anne Arundel County" },
  { value: "24005", label: "Baltimore County" },
  { value: "24510", label: "Baltimore City" },
  { value: "24009", label: "Calvert County" },
  { value: "24011", label: "Caroline County" },
  { value: "24013", label: "Carroll County" },
  { value: "24015", label: "Cecil County" },
  { value: "24017", label: "Charles County" },
  { value: "24019", label: "Dorchester County" },
  { value: "24021", label: "Frederick County" },
  { value: "24023", label: "Garrett County" },
  { value: "24025", label: "Harford County" },
  { value: "24027", label: "Howard County" },
  { value: "24029", label: "Kent County" },
  { value: "24031", label: "Montgomery County" },
  { value: "24033", label: "Prince George's County" },
  { value: "24035", label: "Queen Anne's County" },
  { value: "24037", label: "St. Mary's County" },
  { value: "24039", label: "Somerset County" },
  { value: "24041", label: "Talbot County" },
  { value: "24043", label: "Washington County" },
  { value: "24045", label: "Wicomico County" },
  { value: "24047", label: "Worcester County" },
];

export const SPECIES: Option[] = [
  { value: "white_tailed_deer", label: "White-tailed deer" },
  { value: "sika_deer", label: "Sika deer" },
  { value: "wild_turkey", label: "Wild turkey" },
  { value: "black_bear", label: "Black bear" },
  { value: "eastern_cottontail", label: "Eastern cottontail" },
  { value: "gray_squirrel", label: "Gray squirrel" },
  { value: "red_squirrel", label: "Red (piney) squirrel" },
  { value: "eastern_fox_squirrel", label: "Eastern fox squirrel" },
  { value: "ruffed_grouse", label: "Ruffed grouse" },
  { value: "pheasant", label: "Pheasant" },
  { value: "quail", label: "Quail (group)" },
  { value: "crow", label: "Crow (group)" },
  { value: "ducks", label: "Ducks (group)" },
  { value: "canada_goose", label: "Canada goose" },
  { value: "light_geese", label: "Light geese (group)" },
  { value: "brant", label: "Brant" },
  { value: "coots", label: "Coots (group)" },
  { value: "clapper_rail", label: "Clapper rail" },
  { value: "king_rail", label: "King rail" },
  { value: "sora", label: "Sora" },
  { value: "virginia_rail", label: "Virginia rail" },
  { value: "mourning_dove", label: "Mourning dove" },
  { value: "woodcock", label: "Woodcock" },
  { value: "common_snipe", label: "Common snipe" },
  { value: "coyote", label: "Coyote" },
  { value: "red_fox", label: "Red fox" },
  { value: "gray_fox", label: "Gray fox" },
  { value: "raccoon", label: "Raccoon" },
  { value: "opossum", label: "Opossum" },
  { value: "skunk", label: "Skunk" },
];

export const METHODS: Option[] = [
  { value: "vertical_bow", label: "Vertical bow" },
  { value: "traditional_bow", label: "Traditional bow (long bow / recurve)" },
  { value: "crossbow", label: "Crossbow" },
  { value: "muzzleloader", label: "Muzzleloader" },
  { value: "shotgun", label: "Shotgun" },
  { value: "rifle_straight_walled", label: "Rifle (straight-walled cartridge)" },
  { value: "rifle_bottleneck", label: "Rifle (bottleneck cartridge)" },
  { value: "handgun_straight_walled", label: "Handgun (straight-walled cartridge)" },
  { value: "handgun_bottleneck", label: "Handgun (bottleneck cartridge)" },
  { value: "air_gun", label: "Air gun" },
  { value: "falconry", label: "Falconry" },
];

// Broad terms the AI may return; code (not the model) expands them into
// visible, editable member values (§3.7 "expand by default").
export const SPECIES_GROUPS: Record<string, { label: string; members: string[] }> = {
  deer: { label: "deer", members: ["white_tailed_deer", "sika_deer"] },
  squirrels: { label: "squirrels", members: ["gray_squirrel", "red_squirrel", "eastern_fox_squirrel"] },
  geese: { label: "geese", members: ["canada_goose", "light_geese", "brant"] },
  waterfowl: {
    label: "waterfowl",
    members: ["ducks", "canada_goose", "light_geese", "brant", "coots"],
  },
  rails: { label: "rails", members: ["clapper_rail", "king_rail", "sora", "virginia_rail"] },
  foxes: { label: "foxes", members: ["red_fox", "gray_fox"] },
  upland_birds: { label: "upland birds", members: ["ruffed_grouse", "pheasant", "quail"] },
};

export const METHOD_GROUPS: Record<string, { label: string; members: string[] }> = {
  archery: { label: "archery / bow", members: ["vertical_bow", "crossbow"] },
  firearms: {
    label: "firearms / gun",
    members: [
      "shotgun",
      "rifle_straight_walled",
      "rifle_bottleneck",
      "handgun_straight_walled",
      "handgun_bottleneck",
    ],
  },
  rifle: { label: "rifle", members: ["rifle_straight_walled", "rifle_bottleneck"] },
  handgun: { label: "handgun", members: ["handgun_straight_walled", "handgun_bottleneck"] },
};

export const COUNTY_VALUES = COUNTIES.map((o) => o.value);
export const SPECIES_VALUES = SPECIES.map((o) => o.value);
export const METHOD_VALUES = METHODS.map((o) => o.value);

export function labelFor(options: Option[], value: string): string {
  return options.find((o) => o.value === value)?.label ?? value;
}
