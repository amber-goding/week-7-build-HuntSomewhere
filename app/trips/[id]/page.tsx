import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { getPrisma } from "@/lib/db";
import { COUNTIES, METHODS, SPECIES, labelFor, type Option } from "@/lib/trips/options";
import { getTrip } from "@/lib/trips/store";
import { SiteHeader } from "../../site-header";

export const metadata: Metadata = {
  title: "Saved trip · HuntSomewhere",
  robots: { index: false, follow: false },
};

function Values({ label, options, values }: { label: string; options: Option[]; values: string[] }) {
  return (
    <div>
      <dt className="text-sm font-medium text-muted">{label}</dt>
      <dd className="mt-1">{values.length ? values.map((v) => labelFor(options, v)).join(", ") : "Any / not set"}</dd>
    </div>
  );
}

async function TripDetails({ params }: { params: Promise<{ id: string }> }) {
  // Read at request time, never during the build.
  await connection();
  const { id } = await params;

  let trip;
  try {
    trip = await getTrip(getPrisma(), id);
  } catch (error) {
    console.error("trips: failed to load", error instanceof Error ? error.name : "unknown");
    return (
      <p role="alert" className="rounded-xl bg-cream-deep px-5 py-4 text-forest-deep dark:bg-surface dark:text-foreground">
        This trip couldn&apos;t be loaded right now. Please try again later.
      </p>
    );
  }
  if (!trip) notFound();

  const { preferences: p } = trip;
  const dates =
    p.startDate || p.endDate ? `${p.startDate ?? "any"} to ${p.endDate ?? "any"}` : "Any / not set";

  return (
    <div className="space-y-6">
      {trip.isSynthetic ? (
        <p className="rounded-lg bg-cream-deep px-4 py-2 text-sm text-forest-deep">Synthetic test record</p>
      ) : null}
      <dl className="space-y-4 rounded-2xl border border-border bg-surface p-6">
        <Values label="Counties" options={COUNTIES} values={p.counties} />
        <Values label="Species" options={SPECIES} values={p.species} />
        <Values label="Methods" options={METHODS} values={p.methods} />
        <div>
          <dt className="text-sm font-medium text-muted">Dates</dt>
          <dd className="mt-1">{dates}</dd>
        </div>
      </dl>
      <p className="text-sm text-muted">
        Saved {trip.createdAt.toISOString().slice(0, 10)}
        {trip.aiAssisted ? " · started from an AI suggestion and reviewed before saving" : ""}.
      </p>
      <Link
        href={`/trips/${trip.id}/areas`}
        className="inline-block rounded-md bg-forest px-4 py-2 text-sm font-medium text-cream hover:bg-forest-deep dark:bg-cream dark:text-forest-deep dark:hover:bg-cream-deep"
      >
        Discover public areas
      </Link>
    </div>
  );
}

export default function TripPage({ params }: PageProps<"/trips/[id]">) {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="text-3xl font-semibold tracking-tight text-forest dark:text-cream sm:text-4xl">
          Saved trip preferences
        </h1>
        <p className="mt-4 leading-7 text-muted">
          Anyone with this link can view these preferences. They describe what you&apos;re looking for.
          They don&apos;t confirm seasons, legality, permission, availability, or any property.
        </p>
        <div className="mt-8">
          <Suspense fallback={<p className="text-muted">Loading trip…</p>}>
            <TripDetails params={params} />
          </Suspense>
        </div>
        <Link
          href="/plan"
          className="mt-8 inline-block font-medium text-forest underline underline-offset-4 dark:text-cream"
        >
          Plan another trip
        </Link>
      </main>
    </div>
  );
}
