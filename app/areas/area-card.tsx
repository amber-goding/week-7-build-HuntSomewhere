import { AREA_SOURCE, type CuratedArea } from "@/lib/areas/curated";
import { COUNTIES, labelFor } from "@/lib/trips/options";

export function AreaCard({ area }: { area: CuratedArea }) {
  return (
    <li className="flex flex-col rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <h3 className="text-lg font-semibold text-forest dark:text-cream">{area.name}</h3>
      <p className="mt-1 text-sm text-muted">
        {area.counties.length > 1 ? "Counties" : "County"}: {area.counties.map((c) => labelFor(COUNTIES, c)).join(", ")}
      </p>

      <dl className="mt-4 space-y-3 text-sm">
        <div>
          <dt className="font-medium text-muted">Official DNR page</dt>
          <dd className="mt-1 break-words">
            <a
              href={area.dnrPageUrl}
              rel="noopener noreferrer"
              className="font-medium text-forest underline underline-offset-4 dark:text-cream"
            >
              Maryland DNR: {area.name}
            </a>
            <span className="block text-muted">Link checked {area.dnrPageCheckedOn} (the page loaded)</span>
          </dd>
        </div>
        <div>
          <dt className="font-medium text-muted">Hunting eligibility</dt>
          <dd className="mt-1">
            <span className="inline-block rounded-full bg-cream-deep px-3 py-0.5 text-forest-deep">
              Not confirmed by HuntSomewhere
            </span>
            <span className="block text-muted">Check the DNR page for rules, permits, and seasons.</span>
          </dd>
        </div>
        <div>
          <dt className="font-medium text-muted">Dataset source</dt>
          <dd className="mt-1">
            <a
              href={AREA_SOURCE.catalogUrl}
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              {AREA_SOURCE.credit}
            </a>
            , checked {AREA_SOURCE.retrievedOn}. Source updated: unknown.
          </dd>
        </div>
      </dl>
    </li>
  );
}

export function AreaNotices() {
  return (
    <div className="space-y-2 rounded-xl bg-cream-deep px-5 py-4 text-sm leading-6 text-forest-deep dark:bg-surface dark:text-foreground">
      <p>
        <strong className="font-semibold">Limited coverage.</strong> This is a small, hand-checked list of
        Wildlife Management Areas, not a statewide inventory. Many public hunting areas are not listed.{" "}
        <a
          href={AREA_SOURCE.dnrDirectoryUrl}
          rel="noopener noreferrer"
          className="font-medium underline underline-offset-4"
        >
          See Maryland DNR&apos;s full list of public lands
        </a>
        .
      </p>
      <p>
        Public ownership does not by itself mean hunting is allowed. Check the managing agency&apos;s rules,
        permits, and seasons.
      </p>
      <p className="text-muted dark:text-muted">
        {AREA_SOURCE.acknowledgment} Data from &ldquo;{AREA_SOURCE.name}&rdquo; ({AREA_SOURCE.credit}).{" "}
        {AREA_SOURCE.disclaimer}
      </p>
    </div>
  );
}
