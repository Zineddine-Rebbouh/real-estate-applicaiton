import { BadgeCheck, Headphones, ReceiptText } from "lucide-react";

const care = [
  {
    title: "Verified listings",
    copy: "We review each address, price, and availability date before it goes live.",
    icon: BadgeCheck,
    label: "Checked",
  },
  {
    title: "Real people, responsive help",
    copy: "Questions about a showing or a lease? Get a straightforward answer from our local team.",
    icon: Headphones,
    label: "Here when needed",
  },
  {
    title: "Fees in plain view",
    copy: "See deposits, utilities, and application costs before you make a decision.",
    icon: ReceiptText,
    label: "No surprises",
  },
];

export function CareSection() {
  return (
    <section
      className="overflow-hidden bg-[var(--paper)] pb-20 sm:pb-28"
      id="features"
    >
      <div className="mx-auto max-w-7xl border-t border-[var(--blueprint-line)]/70 px-5 pt-16 sm:px-8 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[.9fr_1.1fr] lg:items-end">
          <div>
            {/* <p className="mb-4 text-sm text-[var(--stone)]">The Habitat standard</p> */}
            <h2 className="font-display max-w-lg text-4xl font-semibold leading-none tracking-[-.04em] sm:text-5xl">
              A little more care at every step.
            </h2>
            <p className="mt-6 max-w-md leading-7 text-[var(--stone)]">
              The practical details deserve as much attention as the beautiful
              ones. We make the path from shortlist to signed lease feel clear.
            </p>
          </div>
          <div className="relative min-h-[260px] overflow-hidden border border-[var(--blueprint-line)]/70 bg-[var(--blueprint)] p-7 text-white sm:p-9">
            <svg
              aria-hidden="true"
              viewBox="0 0 520 270"
              className="absolute inset-0 h-full w-full text-[var(--blueprint-line)] opacity-80"
            >
              <path
                d="M22 220H248V48h165v172h84M78 220V110h170M248 140h165M335 48v172M22 235h475M22 229v12m475-12v12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
              <circle cx="78" cy="110" r="5" fill="currentColor" />
              <circle cx="248" cy="140" r="5" fill="currentColor" />
              <circle cx="413" cy="220" r="5" fill="currentColor" />
              <path
                d="M38 29h100M38 24v10m100-10v10"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
            </svg>
            <div className="relative flex h-full flex-col justify-between">
              <div className="flex items-center gap-3 text-xs text-[var(--blueprint-line)]">
                <span className="flex size-7 items-center justify-center rounded-full border border-[var(--blueprint-line)]">
                  H
                </span>
                <span>Habitat care plan / 01</span>
              </div>
              <div>
                <p className="font-display max-w-sm text-3xl font-semibold leading-tight sm:text-4xl">
                  The details that let you settle in.
                </p>
                <p className="mt-3 text-sm text-white/65">
                  A clearer route from first search to front door.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {care.map(({ title, copy, icon: Icon, label }, index) => (
            <article
              key={title}
              className="group relative border-t border-[var(--blueprint-line)] pt-6"
            >
              <div className="flex items-start justify-between">
                <span className="flex size-11 items-center justify-center border border-[var(--blueprint-line)] text-[var(--blueprint)] transition-colors group-hover:bg-[var(--blueprint)] group-hover:text-white">
                  <Icon className="size-5" />
                </span>
                <span className="text-xs text-[var(--stone)]">
                  0{index + 1}
                </span>
              </div>
              <p className="mt-7 text-xs text-[var(--brass)]">{label}</p>
              <h3 className="mt-2 font-display text-2xl font-semibold">
                {title}
              </h3>
              <p className="mt-3 max-w-sm text-sm leading-6 text-[var(--stone)]">
                {copy}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
