import Image from "next/image";

const features = [
  {
    icon: "/landing-icon-calendar.png",
    title: "Schedule viewings",
    description: "Book property tours at your convenience with our easy scheduling system",
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
    <section className="py-16 lg:py-24 bg-muted/30" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center sm:items-start text-center sm:text-left"
            >
              <div className="w-16 h-16 mb-4 relative">
                <Image
                  src={feature.icon}
                  alt=""
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
