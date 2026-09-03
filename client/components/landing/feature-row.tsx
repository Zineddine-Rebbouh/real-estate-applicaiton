import Image from "next/image";

const features = [
  {
    icon: "/landing-icon-calendar.png",
    title: "Schedule viewings",
    description:
      "Book property tours at your convenience with our easy scheduling system",
  },
  {
    icon: "/landing-icon-heart.png",
    title: "Save favorites",
    description: "Create your personalized collection of properties you love",
  },
  {
    icon: "/landing-icon-wand.png",
    title: "Smart matching",
    description: "Get AI-powered recommendations based on your preferences",
  },
];

export function FeatureRow() {
  return (
    <section
      className="border-y border-border bg-muted/30 py-16 lg:py-24"
      id="features"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              The Habitat standard
            </p>
            <h2 className="font-display text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
              A little more care at every step.
            </h2>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            Small touches that make finding — and falling for — the right home
            easier.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative flex flex-col rounded-2xl bg-card p-6 ring-1 ring-foreground/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg lg:p-8"
            >
              <span className="font-display absolute right-6 top-6 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground/50">
                0{index + 1}
              </span>

              <div className="relative mb-6 h-14 w-14 rounded-xl bg-primary/10 ring-1 ring-primary/20 transition-colors duration-300 group-hover:bg-primary/15">
                <Image
                  src={feature.icon}
                  alt=""
                  fill
                  sizes="56px"
                  className="object-contain p-3.5"
                />
              </div>

              <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
