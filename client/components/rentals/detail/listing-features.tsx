import {
  AirVentIcon,
  ChevronsUpDownIcon,
  DogIcon,
  DoorClosedIcon,
  DumbbellIcon,
  FlameIcon,
  LayersIcon,
  RefrigeratorIcon,
  SunMediumIcon,
  UtensilsIcon,
  WavesIcon,
  WifiIcon,
  ZapIcon,
  WashingMachineIcon,
  SparklesIcon,
} from "lucide-react";

interface ListingFeaturesProps {
  amenities: string[];
}

const FEATURE_DEFINITIONS: Record<
  string,
  { label: string; description: string; icon: React.ComponentType<{ className?: string }> }
> = {
  washer_dryer: {
    label: "Washer & Dryer",
    description: "In-unit washer & dryer setup",
    icon: WashingMachineIcon,
  },
  air_conditioning: {
    label: "A/C Climate Control",
    description: "Multi-zone smart cooling & heat",
    icon: AirVentIcon,
  },
  dishwasher: {
    label: "Dishwasher",
    description: "Quiet integrated dishwasher",
    icon: UtensilsIcon,
  },
  wifi: {
    label: "Gigabit Wi-Fi",
    description: "1 Gbps fiber optic ready",
    icon: WifiIcon,
  },
  hardwood: {
    label: "Hardwood Floors",
    description: "Natural oak engineered planks",
    icon: LayersIcon,
  },
  walk_in_closet: {
    label: "Walk-in Closets",
    description: "Custom modular wardrobe shelving",
    icon: DoorClosedIcon,
  },
  microwave: {
    label: "Built-in Microwave",
    description: "Convection speed-oven microwave",
    icon: FlameIcon,
  },
  refrigerator: {
    label: "Stainless Refrigerator",
    description: "French-door frost-free fridge",
    icon: RefrigeratorIcon,
  },
  balcony: {
    label: "Private Balcony",
    description: "Terrace with courtyard outlook",
    icon: SunMediumIcon,
  },
  elevator: {
    label: "Elevator Access",
    description: "High-speed keycard elevator",
    icon: ChevronsUpDownIcon,
  },
  pool: {
    label: "Swimming Pool",
    description: "Heated indoor resident lap pool",
    icon: WavesIcon,
  },
  gym: {
    label: "Fitness Center",
    description: "24/7 cardiovascular & weights gym",
    icon: DumbbellIcon,
  },
  ev_charging: {
    label: "EV Charging Stall",
    description: "Level 2 charging compatibility",
    icon: ZapIcon,
  },
  pet_friendly: {
    label: "Pet Friendly",
    description: "Dedicated pet wash station",
    icon: DogIcon,
  },
};

// Fallback list if listing only has a few amenities
const DEFAULT_FALLBACK_FEATURES = [
  "washer_dryer",
  "air_conditioning",
  "dishwasher",
  "wifi",
  "hardwood",
  "walk_in_closet",
  "refrigerator",
  "microwave",
];

export function ListingFeatures({ amenities }: ListingFeaturesProps) {
  // Combine specified amenities with fallbacks if list is small, ensuring at least 8 items
  const combinedKeys = Array.from(
    new Set([...amenities, ...DEFAULT_FALLBACK_FEATURES])
  ).slice(0, 12);

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
          Features & Amenities
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Standard comforts and building conveniences included with this rental
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {combinedKeys.map((key) => {
          const item = FEATURE_DEFINITIONS[key] || {
            label: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
            description: "Verified home amenity",
            icon: SparklesIcon,
          };
          const IconComponent = item.icon;

          return (
            <div
              key={key}
              className="flex flex-col gap-2 rounded-xl border border-border/80 bg-card p-3.5 sm:p-4 shadow-2xs transition-all hover:border-primary/40 hover:bg-muted/20"
            >
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <IconComponent className="size-4.5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-foreground leading-snug">
                  {item.label}
                </h4>
                <p className="mt-0.5 text-[11px] text-muted-foreground line-clamp-1">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

