import type { Metadata } from "next";
import { SiteHeader } from "../site-header";
import { TripPlanner } from "./trip-planner";

export const metadata: Metadata = {
  title: "Plan a trip · HuntSomewhere",
  description: "Describe a Maryland hunting trip and save your preferences.",
};

export default function PlanPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="text-3xl font-semibold tracking-tight text-forest dark:text-cream sm:text-4xl">
          Plan a trip
        </h1>
        <p className="mt-4 leading-7 text-muted">
          Describe the hunt you have in mind. AI suggests county, species, method, and dates as
          preferences you can review and change, then you save them to a private link.
        </p>
        <TripPlanner />
        <p className="mt-10 text-sm leading-6 text-muted">
          HuntSomewhere doesn&apos;t check seasons, bag limits, permission, or availability, and
          saving preferences doesn&apos;t find or reserve land. Check Maryland DNR for the rules.
        </p>
      </main>
    </div>
  );
}
