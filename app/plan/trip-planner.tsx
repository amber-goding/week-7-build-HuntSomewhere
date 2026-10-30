"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { COUNTIES, METHODS, SPECIES, labelFor, type Option } from "@/lib/trips/options";
import type { TripPreferences, Unresolved } from "@/lib/trips/preferences";
import { saveTripAction, suggestAction } from "./actions";

const DESCRIPTION_MAX = 300;

const EMPTY: TripPreferences = { counties: [], species: [], methods: [], startDate: null, endDate: null };

const REASON_TEXT: Record<Unresolved["reason"], string> = {
  season_term: "season terms aren't turned into dates",
  vague_date: "pick exact dates",
  unknown_species: "not a listed species",
  unknown_method: "not a listed method",
  unknown_or_ambiguous_place: "choose a county",
  other: "not applied",
};

function ChipPicker({
  legend,
  options,
  selected,
  expandedFrom,
  onChange,
}: {
  legend: string;
  options: Option[];
  selected: string[];
  expandedFrom: Record<string, string>;
  onChange: (next: string[]) => void;
}) {
  const remaining = options.filter((o) => !selected.includes(o.value));
  return (
    <fieldset className="rounded-xl border border-border bg-surface p-4">
      <legend className="px-1 text-sm font-semibold text-forest dark:text-cream">{legend}</legend>
      {selected.length === 0 ? (
        <p className="text-sm text-muted">None selected</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {selected.map((value) => (
            <li key={value}>
              <button
                type="button"
                onClick={() => onChange(selected.filter((v) => v !== value))}
                className="rounded-full bg-cream-deep px-3 py-1 text-sm text-forest-deep hover:bg-border dark:bg-forest dark:text-cream"
                aria-label={`Remove ${labelFor(options, value)}`}
              >
                {labelFor(options, value)}
                {expandedFrom[value] ? (
                  <span className="text-muted dark:text-cream/70"> · from &lsquo;{expandedFrom[value]}&rsquo;</span>
                ) : null}{" "}
                <span aria-hidden="true">×</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {remaining.length > 0 ? (
        <select
          aria-label={`Add ${legend.toLowerCase()}`}
          value=""
          onChange={(e) => e.target.value && onChange([...selected, e.target.value])}
          className="mt-3 w-full rounded-md border border-border bg-background px-3 py-2 text-sm sm:w-auto"
        >
          <option value="">Add {legend.toLowerCase()}…</option>
          {remaining.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : null}
    </fieldset>
  );
}

export function TripPlanner() {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [prefs, setPrefs] = useState<TripPreferences>(EMPTY);
  const [expandedFrom, setExpandedFrom] = useState<Record<string, string>>({});
  const [unresolved, setUnresolved] = useState<Unresolved[]>([]);
  const [aiAssisted, setAiAssisted] = useState(false);
  const [aiMessage, setAiMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [suggesting, startSuggest] = useTransition();
  const [saving, startSave] = useTransition();

  function suggest() {
    setAiMessage(null);
    startSuggest(async () => {
      const result = await suggestAction(description);
      if (!result.ok) {
        setAiMessage({ kind: "error", text: result.message });
        return;
      }
      setPrefs(result.suggestion.preferences);
      setExpandedFrom(result.suggestion.expandedFrom);
      setUnresolved(result.suggestion.unresolved);
      setAiAssisted(true);
      setAiMessage({ kind: "ok", text: "Suggested preferences are below. Check and change them before saving." });
    });
  }

  function save() {
    setSaveError(null);
    startSave(async () => {
      const result = await saveTripAction(prefs, aiAssisted);
      if (result.ok) router.push(`/trips/${result.id}`);
      else setSaveError(result.message);
    });
  }

  const set = <K extends keyof TripPreferences>(key: K, value: TripPreferences[K]) =>
    setPrefs((p) => ({ ...p, [key]: value }));

  return (
    <div className="mt-8 space-y-8">
      <section aria-labelledby="describe-heading" className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <h2 id="describe-heading" className="text-lg font-semibold text-forest dark:text-cream">
          1. Describe your trip
        </h2>
        <label htmlFor="trip-description" className="mt-3 block text-sm text-muted">
          For example: &ldquo;Bow hunting deer in Garrett County the weekend of November 14.&rdquo; Don&apos;t
          include names, contact details, or other personal information. Your description is sent to
          OpenAI to suggest preferences and isn&apos;t saved.
        </label>
        <textarea
          id="trip-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={DESCRIPTION_MAX}
          rows={3}
          className="mt-3 w-full rounded-md border border-border bg-background px-3 py-2 leading-7"
        />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm text-muted">
            {description.length}/{DESCRIPTION_MAX}
          </span>
          <button
            type="button"
            onClick={suggest}
            disabled={suggesting || description.trim().length < 3}
            className="rounded-md bg-forest px-4 py-2 text-sm font-medium text-cream hover:bg-forest-deep disabled:opacity-50 dark:bg-cream dark:text-forest-deep"
          >
            {suggesting ? "Suggesting…" : "Suggest preferences with AI"}
          </button>
        </div>
        {aiMessage ? (
          <p
            role={aiMessage.kind === "error" ? "alert" : "status"}
            className={`mt-3 rounded-lg px-4 py-3 text-sm ${
              aiMessage.kind === "error"
                ? "bg-cream-deep text-forest-deep dark:bg-background dark:text-foreground"
                : "text-muted"
            }`}
          >
            {aiMessage.text}
          </p>
        ) : null}
      </section>

      <section aria-labelledby="review-heading" className="space-y-4">
        <h2 id="review-heading" className="text-lg font-semibold text-forest dark:text-cream">
          2. Review your preferences
        </h2>
        <p className="text-sm text-muted">
          Set these yourself or adjust the AI&apos;s suggestion. Remove a value by selecting it.
        </p>

        {unresolved.length > 0 ? (
          <div role="status" className="rounded-xl border border-border bg-cream-deep p-4 text-sm text-forest-deep dark:bg-background dark:text-foreground">
            <p className="font-semibold">
              {unresolved.length} {unresolved.length === 1 ? "term wasn't" : "terms weren't"} applied. Choose an option below
              or ignore {unresolved.length === 1 ? "it" : "them"}:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {unresolved.map((u, i) => (
                <li key={`${u.term}-${i}`}>
                  &ldquo;{u.term}&rdquo;: {REASON_TEXT[u.reason]}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <ChipPicker legend="Counties" options={COUNTIES} selected={prefs.counties} expandedFrom={{}} onChange={(v) => set("counties", v)} />
        <ChipPicker legend="Species" options={SPECIES} selected={prefs.species} expandedFrom={expandedFrom} onChange={(v) => set("species", v)} />
        <ChipPicker legend="Methods" options={METHODS} selected={prefs.methods} expandedFrom={expandedFrom} onChange={(v) => set("methods", v)} />

        <fieldset className="rounded-xl border border-border bg-surface p-4">
          <legend className="px-1 text-sm font-semibold text-forest dark:text-cream">Dates</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm text-muted">
              From
              <input
                type="date"
                value={prefs.startDate ?? ""}
                onChange={(e) => set("startDate", e.target.value || null)}
                className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-foreground"
              />
            </label>
            <label className="text-sm text-muted">
              To
              <input
                type="date"
                value={prefs.endDate ?? ""}
                onChange={(e) => set("endDate", e.target.value || null)}
                className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-foreground"
              />
            </label>
          </div>
        </fieldset>
      </section>

      <section aria-labelledby="save-heading" className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <h2 id="save-heading" className="text-lg font-semibold text-forest dark:text-cream">
          3. Save
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Saving creates a random link. <strong className="font-semibold">Anyone with the link can view these preferences.</strong>{" "}
          Only the selected options and dates are saved: no description, names, or contact details.
        </p>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="mt-4 rounded-md bg-forest px-4 py-2 text-sm font-medium text-cream hover:bg-forest-deep disabled:opacity-50 dark:bg-cream dark:text-forest-deep"
        >
          {saving ? "Saving…" : "Save trip"}
        </button>
        {saveError ? (
          <p role="alert" className="mt-3 text-sm text-forest-deep dark:text-foreground">
            {saveError}
          </p>
        ) : null}
      </section>
    </div>
  );
}
