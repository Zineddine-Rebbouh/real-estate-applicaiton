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
    <section className="relative py-16 lg:py-24" id="discover">
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
        <div className="max-w-2xl mb-10">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
            Your search, refined
          </p>
          <h2 className="font-display text-3xl font-medium leading-tight tracking-tight text-white sm:text-4xl">
            Find the one that feels like yours.
          </h2>
          <p className="text-base text-white/90 leading-relaxed">
            Set your essentials and we&apos;ll narrow the collection down to
            spaces that fit your life.
          </p>
        </div>

        <PropertyFilterPanel fields={filterFields} />
      </div>
    </section>
  );
}
