import Image from "next/image";

const steps = [
  {
    number: 1,
    image: "/landing-search1.png",
    title: "Search properties",
    description:
      "Browse our extensive database of premium listings with advanced filters",
  },
  {
    number: 2,
    image: "/landing-search2.png",
    title: "Schedule a visit",
    description:
      "Book a viewing at your preferred time with our property specialists",
  },
  {
    number: 3,
    image: "/landing-search3.png",
    title: "Get your keys",
    description: "Complete the process and move into your dream property",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-background py-16 lg:py-24" id="how-it-works">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              From search to keys
            </p>
            <h2 className="font-display text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
              The easy part starts here.
            </h2>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            No noise, no endless tabs. Just a clear path to a place that feels
            right.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-6">
          {steps.map((step) => (
            <div key={step.number} className="relative space-y-5 lg:pr-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {step.number}
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  Step 0{step.number}
                </span>
              </div>

              <div className="relative aspect-[4/3] rounded-xl overflow-hidden ring-1 ring-foreground/10">
                <Image
                  src={step.image}
                  alt={step.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
