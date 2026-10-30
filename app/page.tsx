import { SiteHeader } from "./site-header";

const audiences = [
  {
    title: "For hunters",
    body: "Browse public hunting areas with links to their official sources, and preview private land listed by owners: county, acreage, species, methods, and price. Then send the owner an access request.",
  },
  {
    title: "For landowners",
    body: "List your property with the species, methods, dates, and rules you allow. Review each request, choose when to share exact locations, and keep a record of every agreement.",
  },
  {
    title: "Clear about what's known",
    body: "Public data shows its source and when it was last checked. Private locations stay approximate until the owner chooses to share them. Public ownership alone never means hunting is allowed.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <main className="flex-1">
        <section className="bg-forest text-cream">
          <div className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
            <p className="text-sm font-medium uppercase tracking-widest text-cream/80">
              Maryland hunting access
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-balance sm:text-5xl">
              Find a place to hunt in Maryland, and ask the right person for
              permission.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-cream/90">
              HuntSomewhere brings public hunting areas from official sources
              together with private land listed by owners, authorized
              representatives, and hunting clubs, so hunters and landowners can
              connect in one place.
            </p>
          </div>
        </section>

        <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {audiences.map((item) => (
              <li
                key={item.title}
                className="rounded-2xl border border-border bg-surface p-6"
              >
                <h2 className="text-lg font-semibold text-forest dark:text-cream">
                  {item.title}
                </h2>
                <p className="mt-2 leading-7 text-muted">{item.body}</p>
              </li>
            ))}
          </ul>

          <p className="mt-10 max-w-2xl rounded-xl bg-cream-deep px-5 py-4 leading-7 text-forest-deep dark:bg-surface dark:text-foreground">
            <strong className="font-semibold">In development.</strong> Search,
            accounts, listings, and access requests aren&apos;t available yet.
          </p>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto w-full max-w-5xl px-4 py-6 text-sm text-muted sm:px-6">
          Check Maryland DNR for seasons, licenses, and hunting rules.
          HuntSomewhere doesn&apos;t determine whether a hunt is legal.
        </div>
      </footer>
    </div>
  );
}
