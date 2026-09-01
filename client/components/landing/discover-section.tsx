import Image from "next/image";
import { PropertyFilterPanel } from "./property-filter-panel";

const filterFields = [
  {
    label: "Total area",
    fromPlaceholder: "30",
    toPlaceholder: "120",
    unit: "m²",
  },
  {
    label: "Floor",
    fromPlaceholder: "1",
    toPlaceholder: "10",
  },
  {
    label: "Bedrooms",
    fromPlaceholder: "1",
    toPlaceholder: "4",
  },
  {
    label: "Bathrooms",
    fromPlaceholder: "1",
    toPlaceholder: "3",
  },
];

export function DiscoverSection() {
  return (
    <section className="relative py-16 lg:py-24">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/landing-discover-bg.jpg"
          alt=""
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-8">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white mb-3">
            Find perfect flat for you!
          </h2>
          <p className="text-sm sm:text-base text-white/90 leading-relaxed">
            Use our advanced filters to discover properties that match your exact requirements
          </p>
        </div>

        <PropertyFilterPanel fields={filterFields} />
      </div>
    </section>
  );
}
