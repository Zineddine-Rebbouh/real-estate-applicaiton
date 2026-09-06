import Link from "next/link";
export function CTABanner() {
  return (
    <section className="bg-[var(--blueprint)] px-5 py-24 text-white sm:px-8 sm:py-32 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl border-l border-[var(--blueprint-line)] pl-6 sm:pl-10">
          {/* <p className="mb-5 text-sm text-[var(--blueprint-line)]">
            Your next home is out there.
          </p> */}
          <h2 className="font-display text-5xl font-semibold leading-[.94] tracking-[-.05em] sm:text-7xl">
            Make room for what comes next.
          </h2>
          <p className="mt-7 max-w-xl leading-7 text-white/75">
            Start with the places that meet your real life your commute, your
            budget, and the way you want to spend a Sunday.
          </p>
          <Link
            href="/sign-up"
            className="mt-10 inline-flex bg-[var(--brass)] px-6 py-4 text-sm font-semibold text-white transition-colors hover:bg-[#9c7027] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            Start application
          </Link>
        </div>
      </div>
    </section>
  );
}
