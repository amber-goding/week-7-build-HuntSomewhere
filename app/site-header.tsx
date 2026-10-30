import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-border">
      <nav
        aria-label="Main"
        className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-4 sm:px-6"
      >
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-forest dark:text-cream"
        >
          HuntSomewhere
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/plan"
            className="rounded-md px-2 py-1 text-sm font-medium text-forest underline-offset-4 hover:underline dark:text-cream"
          >
            Plan a trip
          </Link>
          <Link
            href="/areas"
            className="rounded-md px-2 py-1 text-sm font-medium text-forest underline-offset-4 hover:underline dark:text-cream"
          >
            Areas
          </Link>
          <Link
            href="/sources"
            className="rounded-md px-2 py-1 text-sm font-medium text-forest underline-offset-4 hover:underline dark:text-cream"
          >
            Sources
          </Link>
        </div>
      </nav>
    </header>
  );
}
