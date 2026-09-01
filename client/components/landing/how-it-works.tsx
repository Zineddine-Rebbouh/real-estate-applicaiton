import Image from "next/image";

const steps = [
  {
    number: 1,
    image: "/landing-search1.png",
    title: "Search properties",
    description: "Browse our extensive database of premium listings with advanced filters",
  },
  {
    number: 2,
    image: "/landing-search2.png",
    title: "Schedule a visit",
    description: "Book a viewing at your preferred time with our property specialists",
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
    <section className="py-16 lg:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-12">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-3">
            How it works
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Find your perfect property in three simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {steps.map((step) => (
            <div key={step.number} className="space-y-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground text-lg font-semibold">
                {step.number}
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
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
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
