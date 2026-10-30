import type { Metadata } from "next";
import { CURATED_AREAS, coveredCounties } from "@/lib/areas/curated";
import { COUNTIES, labelFor } from "@/lib/trips/options";
import { SiteHeader } from "../site-header";
import { AreaCard, AreaNotices } from "./area-card";

export const metadata: Metadata = {
  title: "Public areas · HuntSomewhere",
  description: "A small, sourced list of Maryland Wildlife Management Areas with links to official DNR pages.",
};

export default function AreasPage() {
  const counties = coveredCounties().map((c) => labelFor(COUNTIES, c));
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="text-3xl font-semibold tracking-tight text-forest dark:text-cream sm:text-4xl">
          Public areas
        </h1>
        <p className="mt-4 max-w-2xl leading-7 text-muted">
          Includes {CURATED_AREAS.length} Wildlife Management Areas in {counties.join(", ")} from MD iMAP / Maryland
          DNR data as of 2026-10-30. Not a complete list of places to hunt in Maryland.
        </p>
        <div className="mt-6">
          <AreaNotices />
        </div>
        <h2 className="sr-only">Areas</h2>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CURATED_AREAS.map((area) => (
            <AreaCard key={area.id} area={area} />
          ))}
        </ul>
      </main>
    </div>
  );
}
