const steps = [
  [
    "Search",
    "Set your neighborhood, budget, and move-in date. Save what feels promising.",
  ],
  [
    "Tour",
    "Choose a time that works. We’ll confirm the address and access details.",
  ],
  ["Apply", "Send one clear application with your documents and references."],
  [
    "Move in",
    "Review your lease, get your keys, and settle into the good part.",
  ],
];
export function HowItWorks() {
  return (
    <section className="bg-[var(--paper)] py-20 sm:py-28" id="how-it-works">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="max-w-2xl">
          {/* <p className="mb-4 text-sm text-[var(--stone)]">
            From first look to first night
          </p> */}
          <h2 className="font-display text-4xl font-semibold leading-none tracking-[-.04em] sm:text-5xl">
            A clear path to your next set of keys.
          </h2>
        </div>
        <ol className="relative mt-16 grid gap-10 md:grid-cols-4 md:gap-7">
          <div
            aria-hidden="true"
            className="absolute left-0 right-0 top-4 hidden border-t border-[var(--blueprint-line)] md:block"
          />
          {steps.map(([title, copy], index) => (
            <li key={title} className="relative">
              <span className="flex size-9 items-center justify-center rounded-full border border-[var(--blueprint-line)] bg-[var(--paper)] font-display text-lg text-[var(--blueprint)]">
                {index + 1}
              </span>
              <h3 className="mt-6 font-display text-2xl font-semibold">
                {title}
              </h3>
              <p className="mt-3 max-w-xs text-sm leading-6 text-[var(--stone)]">
                {copy}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
