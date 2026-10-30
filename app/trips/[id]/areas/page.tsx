import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { getPrisma } from "@/lib/db";
import { AREA_SOURCE, areasInCounties, coveredCounties } from "@/lib/areas/curated";
import { COUNTIES, labelFor } from "@/lib/trips/options";
import { getTrip } from "@/lib/trips/store";
import { AreaCard, AreaNotices } from "../../../areas/area-card";
import { SiteHeader } from "../../../site-header";

export const metadata: Metadata = {
  title: "Public areas for your trip · HuntSomewhere",
  robots: { index: false, follow: false },
};

async function Discovery({ params }: { params: Promise<{ id: string }> }) {
  // Read at request time, never during the build.
  await connection();
  const { id } = await params;

  let trip;
  try {
    trip = await getTrip(getPrisma(), id);
  } catch (error) {
    console.error("areas: failed to load trip", error instanceof Error ? error.name : "unknown");
    return (
      <p role="alert" className="rounded-xl bg-cream-deep px-5 py-4 text-forest-deep dark:bg-surface dark:text-foreground">
        This trip couldn&apos;t be loaded right now. Please try again later.
      </p>
    );
  }
  if (!trip) notFound();

  const selected = trip.preferences.counties;
  const matches = areasInCounties(selected);
  const covered = coveredCounties().map((c) => labelFor(COUNTIES, c)).join(", ");

  return (
    <div className="space-y-6">
      <p className="leading-7">
        Your trip&apos;s counties:{" "}
        <strong className="font-semibold">
          {selected.length ? selected.map((c) => labelFor(COUNTIES, c)).join(", ") : "none selected"}
        </strong>
      </p>

      <p role="note" className="rounded-xl border border-border bg-surface px-5 py-4 text-sm leading-6">
        <strong className="font-semibold">These results match county only.</strong> Species, methods, dates, and
        hunting access are not confirmed by this feature. A result is not a recommendation or a confirmed place to
        hunt.
      </p>

      {matches.length > 0 ? (
        <>
          <h2 className="text-xl font-semibold text-forest dark:text-cream">
            {matches.length} {matches.length === 1 ? "area" : "areas"} in your trip&apos;s{" "}
            {selected.length === 1 ? "county" : "counties"}
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2">
            {matches.map((area) => (
              <AreaCard key={area.id} area={area} />
            ))}
          </ul>
        </>
      ) : (
        <div className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="text-xl font-semibold text-forest dark:text-cream">No listed areas for this trip</h2>
          <p className="mt-2 leading-7 text-muted">
            {selected.length === 0
              ? "This trip doesn't have a county selected, so there's nothing to match yet."
              : "None of the areas on our short list are in your trip's counties. That doesn't mean there's no public land there: our list is small."}{" "}
            HuntSomewhere currently lists areas only in {covered}.
          </p>
          <a
            href={AREA_SOURCE.dnrDirectoryUrl}
            rel="noopener noreferrer"
            className="mt-4 inline-block font-medium text-forest underline underline-offset-4 dark:text-cream"
          >
            Browse Maryland DNR&apos;s public lands by region
          </a>
        </div>
      )}

      <AreaNotices />

      <Link
        href={`/trips/${trip.id}`}
        className="inline-block font-medium text-forest underline underline-offset-4 dark:text-cream"
      >
        Back to your trip
      </Link>
    </div>
  );
}

export default function TripAreasPage({ params }: PageProps<"/trips/[id]/areas">) {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="text-3xl font-semibold tracking-tight text-forest dark:text-cream sm:text-4xl">
          Public areas for your trip
        </h1>
        <div className="mt-8">
          <Suspense fallback={<p className="text-muted">Loading…</p>}>
            <Discovery params={params} />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
