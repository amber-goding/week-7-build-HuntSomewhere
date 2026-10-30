import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { getPrisma } from "@/lib/db";
import { SiteHeader } from "../site-header";

export const metadata: Metadata = {
  title: "Data sources · HuntSomewhere",
  description:
    "The published datasets HuntSomewhere uses, with their attribution and reuse terms.",
};

type PublicSource = {
  id: string;
  name: string;
  url: string;
  attribution: string;
  reuseTerms: string;
};

type SourcesResult =
  | { ok: true; sources: PublicSource[] }
  | { ok: false };

async function loadSources(): Promise<SourcesResult> {
  try {
    const sources = await getPrisma().dataSource.findMany({
      select: { id: true, name: true, url: true, attribution: true, reuseTerms: true },
      orderBy: { name: "asc" },
    });
    return { ok: true, sources };
  } catch (error) {
    // Log only the error class: database messages can include connection details.
    console.error("sources: failed to load", error instanceof Error ? error.name : "unknown");
    return { ok: false };
  }
}

// Only http(s) URLs become links; anything else is shown as plain text.
function safeHref(url: string): string | null {
  try {
    const { protocol } = new URL(url);
    return protocol === "https:" || protocol === "http:" ? url : null;
  } catch {
    return null;
  }
}

async function SourcesList() {
  // Read at request time, never during the build.
  await connection();
  const result = await loadSources();

  if (!result.ok) {
    return (
      <p role="alert" className="rounded-xl bg-cream-deep px-5 py-4 text-forest-deep dark:bg-surface dark:text-foreground">
        Sources couldn&apos;t be loaded right now. Please try again later.
      </p>
    );
  }

  if (result.sources.length === 0) {
    return <p className="text-muted">No data sources have been added yet.</p>;
  }

  return (
    <ul className="space-y-6">
      {result.sources.map((source) => {
        const href = safeHref(source.url);
        return (
          <li key={source.id} className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="text-lg font-semibold text-forest dark:text-cream">{source.name}</h2>
            <dl className="mt-4 space-y-4">
              <div>
                <dt className="text-sm font-medium text-muted">Attribution</dt>
                <dd className="mt-1">{source.attribution}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted">Official source</dt>
                <dd className="mt-1 break-words">
                  {href ? (
                    <a
                      href={href}
                      rel="noopener noreferrer"
                      className="font-medium text-forest underline underline-offset-4 dark:text-cream"
                    >
                      {source.url}
                    </a>
                  ) : (
                    source.url
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted">Reuse terms (as published)</dt>
                <dd className="mt-1 leading-7 whitespace-pre-line">{source.reuseTerms}</dd>
              </div>
            </dl>
          </li>
        );
      })}
    </ul>
  );
}

export default function SourcesPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="text-3xl font-semibold tracking-tight text-forest dark:text-cream sm:text-4xl">
          Data sources
        </h1>
        <p className="mt-4 max-w-2xl leading-7 text-muted">
          The published datasets HuntSomewhere draws on, with the credit and reuse terms each
          publisher requires. Inclusion here doesn&apos;t mean every listed area is open to hunting.
        </p>
        <div className="mt-10">
          <Suspense fallback={<p className="text-muted">Loading sources…</p>}>
            <SourcesList />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
