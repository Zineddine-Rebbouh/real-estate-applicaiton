import Image from "next/image";
import Link from "next/link";
export function FeaturedListing() {
  return (
    <section className="bg-[var(--paper)] py-20 sm:py-28" id="about">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[1.15fr_.85fr] lg:px-10">
        <div className="relative min-h-[440px] overflow-hidden bg-[var(--blueprint)]">
          <Image
            src="/featured-listing.jpg"
            alt="Sunlit apartment overlooking Fort Greene Park"
            fill
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-cover"
          />
          <div className="absolute bottom-0 left-0 border-r border-t border-[var(--blueprint-line)] bg-[var(--blueprint)]/90 px-5 py-4 text-xs text-white">
            <span className="text-[var(--blueprint-line)]">N</span> &nbsp;
            Park-facing windows
          </div>
        </div>
        <div className="flex flex-col justify-center py-4 lg:pl-8">
          <p className="mb-5 text-sm text-[var(--stone)]">
            Featured home / Fort Greene
          </p>
          <h2 className="font-display text-4xl font-semibold leading-none tracking-[-.04em] sm:text-5xl">
            A home with a point of view.
          </h2>
          <p className="mt-6 max-w-md leading-7 text-[var(--stone)]">
            On a calm, tree-lined block near the park, this corner two-bedroom
            catches morning light in every room and has enough kitchen counter
            space for Sunday dinner.
          </p>
          <div className="relative mt-9 border-y border-[var(--blueprint-line)]/70 py-5">
            <svg
              aria-hidden="true"
              viewBox="0 0 210 76"
              className="absolute -right-2 -top-1 h-20 w-52 text-[var(--blueprint-line)]"
            >
              <path
                d="M4 10h114v22h70v34H72V47H4Z M35 10v37m83-15v34m35-34v34"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
              <path
                d="M4 4h184M4 1v7m184-7v7"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
            </svg>
            <div className="grid max-w-sm grid-cols-3 gap-4 text-sm">
              <div>
                <span className="block text-xs text-[var(--stone)]">Beds</span>
                <strong>2</strong>
              </div>
              <div>
                <span className="block text-xs text-[var(--stone)]">Baths</span>
                <strong>1</strong>
              </div>
              <div>
                <span className="block text-xs text-[var(--stone)]">
                  Interior
                </span>
                <strong>842 sqft</strong>
              </div>
            </div>
          </div>
          <div className="mt-7 flex items-center justify-between">
            <p className="font-display text-2xl">
              $3,150{" "}
              <span className="font-sans text-sm text-[var(--stone)]">
                / month
              </span>
            </p>
            <Link
              href="/tenant/rentals"
              className="border-b border-[var(--brass)] pb-1 text-sm font-semibold text-[var(--ink)] hover:text-[var(--brass)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--brass)]"
            >
              See this home
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
