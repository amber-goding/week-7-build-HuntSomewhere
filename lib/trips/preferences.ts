import { z } from "zod";
import {
  COUNTY_VALUES,
  METHOD_GROUPS,
  METHOD_VALUES,
  SPECIES_GROUPS,
  SPECIES_VALUES,
} from "./options";

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((s) => {
    const d = new Date(`${s}T00:00:00Z`);
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
  }, "Not a real date");

const unique = <T extends z.ZodType<string>>(item: T, max: number) =>
  z
    .array(item)
    .max(max)
    .refine((a) => new Set(a).size === a.length, "Duplicate values");

// What gets saved: option values and dates only, never free text.
export const tripPreferencesSchema = z
  .object({
    counties: unique(z.enum(COUNTY_VALUES as [string, ...string[]]), COUNTY_VALUES.length),
    species: unique(z.enum(SPECIES_VALUES as [string, ...string[]]), SPECIES_VALUES.length),
    methods: unique(z.enum(METHOD_VALUES as [string, ...string[]]), METHOD_VALUES.length),
    startDate: isoDate.nullable(),
    endDate: isoDate.nullable(),
  })
  .strict()
  .refine((p) => !p.startDate || !p.endDate || p.startDate <= p.endDate, {
    message: "The end date is before the start date",
    path: ["endDate"],
  })
  .refine(
    (p) => p.counties.length + p.species.length + p.methods.length > 0 || p.startDate || p.endDate,
    { message: "Choose at least one preference before saving" },
  );

export type TripPreferences = z.infer<typeof tripPreferencesSchema>;

export const DESCRIPTION_MAX_CHARS = 300;

export const descriptionSchema = z
  .string()
  .trim()
  .min(3, "Describe your trip in a few words")
  .max(DESCRIPTION_MAX_CHARS, `Keep the description under ${DESCRIPTION_MAX_CHARS} characters`);

const AI_SPECIES = [...SPECIES_VALUES, ...Object.keys(SPECIES_GROUPS)];
const AI_METHODS = [...METHOD_VALUES, ...Object.keys(METHOD_GROUPS)];

export const UNRESOLVED_REASONS = [
  "season_term",
  "vague_date",
  "unknown_species",
  "unknown_method",
  "unknown_or_ambiguous_place",
  "other",
] as const;

// JSON schema sent to the model (strict structured output). Every field is required;
// absent information is an empty array or null.
export const aiOutputJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["counties", "species", "methods", "start_date", "end_date", "unresolved"],
  properties: {
    counties: { type: "array", items: { type: "string", enum: COUNTY_VALUES } },
    species: { type: "array", items: { type: "string", enum: AI_SPECIES } },
    methods: { type: "array", items: { type: "string", enum: AI_METHODS } },
    start_date: { type: ["string", "null"] },
    end_date: { type: ["string", "null"] },
    unresolved: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["term", "reason"],
        properties: {
          term: { type: "string" },
          reason: { type: "string", enum: [...UNRESOLVED_REASONS] },
        },
      },
    },
  },
} as const;

// The same contract, enforced again on our side: the model's output is untrusted.
export const aiOutputSchema = z
  .object({
    counties: z.array(z.enum(COUNTY_VALUES as [string, ...string[]])).max(24),
    species: z.array(z.enum(AI_SPECIES as [string, ...string[]])).max(40),
    methods: z.array(z.enum(AI_METHODS as [string, ...string[]])).max(15),
    start_date: z.string().nullable(),
    end_date: z.string().nullable(),
    unresolved: z
      .array(z.object({ term: z.string().max(200), reason: z.enum(UNRESOLVED_REASONS) }).strict())
      .max(10),
  })
  .strict();

export type Unresolved = { term: string; reason: (typeof UNRESOLVED_REASONS)[number] };

export type Suggestion = {
  preferences: TripPreferences;
  // e.g. { "white_tailed_deer": "deer" } so the UI can say "expanded from 'deer'".
  expandedFrom: Record<string, string>;
  unresolved: Unresolved[];
};

function expand(
  values: string[],
  groups: Record<string, { label: string; members: string[] }>,
  expandedFrom: Record<string, string>,
): string[] {
  const out: string[] = [];
  for (const v of values) {
    const group = groups[v];
    for (const member of group ? group.members : [v]) {
      if (!out.includes(member)) out.push(member);
      if (group && !(member in expandedFrom)) expandedFrom[member] = group.label;
    }
  }
  return out;
}

// Turns validated model output into editable preferences. Groups expand in code;
// dates that aren't real or are out of order become unresolved instead of applied.
export function toSuggestion(raw: z.infer<typeof aiOutputSchema>): Suggestion {
  const expandedFrom: Record<string, string> = {};
  const unresolved: Unresolved[] = raw.unresolved
    .map((u) => ({ term: u.term.trim().slice(0, 60), reason: u.reason }))
    .filter((u) => u.term.length > 0);

  let startDate = raw.start_date && isoDate.safeParse(raw.start_date).success ? raw.start_date : null;
  let endDate = raw.end_date && isoDate.safeParse(raw.end_date).success ? raw.end_date : null;
  if ((raw.start_date && !startDate) || (raw.end_date && !endDate)) {
    unresolved.push({ term: "dates", reason: "vague_date" });
  }
  if (startDate && endDate && startDate > endDate) {
    unresolved.push({ term: `${startDate} to ${endDate}`, reason: "vague_date" });
    startDate = null;
    endDate = null;
  }

  return {
    preferences: {
      counties: [...new Set(raw.counties)],
      species: expand(raw.species, SPECIES_GROUPS, expandedFrom),
      methods: expand(raw.methods, METHOD_GROUPS, expandedFrom),
      startDate,
      endDate,
    },
    expandedFrom,
    unresolved: unresolved.slice(0, 10),
  };
}
