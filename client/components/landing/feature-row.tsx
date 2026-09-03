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
        <div className="mb-12 max-w-xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            The Habitat standard
          </p>
          <h2 className="font-display text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
            A little more care at every step.
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center border-border sm:items-start sm:border-l sm:pl-8 sm:text-left"
            >
              <div className="w-16 h-16 mb-5 relative">
                <Image
                  src={feature.icon}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-contain"
                />
              </div>
              <h3 className="mb-3 text-lg font-semibold">{feature.title}</h3>
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
