"use client";

import { useState } from "react";
import {
  MapPinIcon,
  NavigationIcon,
  HotelIcon,
  UtensilsIcon,
  LandmarkIcon,
  GraduationCapIcon,
  ShoppingBagIcon,
  DumbbellIcon,
  ExternalLinkIcon,
  CompassIcon,
  PlusIcon,
  MinusIcon,
  FootprintsIcon,
} from "lucide-react";
import { PointOfInterest } from "@/src/data/rental-details-data";
import { formatPriceValue } from "@/lib/utils";

interface ListingMapSectionProps {
  propertyTitle: string;
  address: string;
  city: string;
  neighborhood: string;
  price: number;
  coords: { x: number; y: number; lat: number; lng: number };
  pois: PointOfInterest[];
}

type POICategory = "all" | "hotel" | "restaurant" | "bank" | "school" | "shop" | "fitness";

const CATEGORIES: { id: POICategory; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "all", label: "All POIs", icon: CompassIcon },
  { id: "restaurant", label: "Restaurants", icon: UtensilsIcon },
  { id: "shop", label: "Shops & Deli", icon: ShoppingBagIcon },
  { id: "hotel", label: "Hotels", icon: HotelIcon },
  { id: "fitness", label: "Fitness", icon: DumbbellIcon },
  { id: "school", label: "Schools", icon: GraduationCapIcon },
  { id: "bank", label: "Banks & ATMs", icon: LandmarkIcon },
];

export function ListingMapSection({
  propertyTitle,
  address,
  city,
  neighborhood,
  price,
  coords,
  pois,
}: ListingMapSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<POICategory>("all");
  const [activePoiId, setActivePoiId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  const filteredPois =
    selectedCategory === "all"
      ? pois
      : pois.filter((poi) => poi.category === selectedCategory);

  const openGoogleMapsDirections = () => {
    const query = encodeURIComponent(`${address}, ${neighborhood}, ${city}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
  };

  return (
    <div id="location-map" className="space-y-4 pt-6 border-t border-border/80 scroll-mt-20">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
            Location & Surrounding Area
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {address}, {neighborhood}, {city} — WalkScore: 96 (Walker&apos;s Paradise)
          </p>
        </div>

        <button
          type="button"
          onClick={openGoogleMapsDirections}
          className="flex min-h-[44px] items-center gap-1.5 rounded-lg border border-border/80 bg-card px-3.5 py-2 text-xs sm:text-sm font-semibold text-foreground shadow-xs transition-colors hover:bg-muted hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <NavigationIcon className="size-4 text-primary" />
          <span>Get Directions</span>
          <ExternalLinkIcon className="size-3 text-muted-foreground ml-0.5" />
        </button>
      </div>

      {/* Embedded Map Canvas */}
      <div className="relative h-[340px] sm:h-[420px] w-full overflow-hidden rounded-xl border border-border/80 bg-muted/40 shadow-inner">
        {/* Map Zoom Controls */}
        <div className="absolute top-3 right-3 z-20 flex flex-col rounded-lg border border-border/80 bg-card/95 shadow-sm backdrop-blur-md overflow-hidden">
          <button
            type="button"
            aria-label="Zoom in"
            onClick={() => setZoomLevel((z) => Math.min(1.6, z + 0.2))}
            className="flex size-9 items-center justify-center text-foreground hover:bg-muted transition-colors border-b border-border/60"
          >
            <PlusIcon className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Zoom out"
            onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.2))}
            className="flex size-9 items-center justify-center text-foreground hover:bg-muted transition-colors"
          >
            <MinusIcon className="size-4" />
          </button>
        </div>

        {/* Scaled Basemap SVG Layer */}
        <div
          className="absolute inset-0 h-full w-full transition-transform duration-200 ease-out"
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: "center center",
          }}
        >
          <svg
            viewBox="0 0 1000 700"
            preserveAspectRatio="xMidYMid slice"
            className="h-full w-full pointer-events-none"
          >
            <defs>
              <pattern id="detailStreetGrid" width="36" height="36" patternUnits="userSpaceOnUse">
                <path
                  d="M 36 0 L 0 0 0 36"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-border/40"
                />
              </pattern>
            </defs>

            {/* Background Texture */}
            <rect width="1000" height="700" fill="url(#detailStreetGrid)" />

            {/* River & Waterways */}
            <path
              d="M -50 280 Q 220 240, 360 210 T 520 190 T 700 240 T 1050 340 L 1050 390 Q 720 290, 530 240 T 360 260 T -50 330 Z"
              className="fill-blue-400/25 dark:fill-blue-950/40 stroke-blue-400/40 stroke-[1.5]"
            />

            {/* Green Park Polygons */}
            <path
              d="M 580 180 C 660 160, 720 220, 690 300 C 650 340, 570 310, 580 180 Z"
              className="fill-emerald-500/20 dark:fill-emerald-950/30"
            />
            <path
              d="M 160 320 C 210 300, 250 350, 220 410 C 180 430, 140 380, 160 320 Z"
              className="fill-emerald-500/20 dark:fill-emerald-950/30"
            />

            {/* Major Arterial Roads */}
            <path
              d="M 500 -50 L 500 750"
              className="stroke-background dark:stroke-muted stroke-[6]"
            />
            <path
              d="M 500 -50 L 500 750"
              className="stroke-amber-400/30 dark:stroke-amber-500/20 stroke-[2]"
            />
            <path
              d="M -50 350 L 1050 350"
              className="stroke-background dark:stroke-muted stroke-[5]"
            />
            <path
              d="M 250 -50 L 750 750"
              className="stroke-background dark:stroke-muted stroke-[4]"
            />
          </svg>

          {/* POI Markers Placed on Map */}
          {filteredPois.map((poi) => {
            const isHovered = activePoiId === poi.id;
            return (
              <div
                key={poi.id}
                style={{
                  left: `${poi.coords.x}%`,
                  top: `${poi.coords.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
                className="absolute z-10 pointer-events-auto"
                onMouseEnter={() => setActivePoiId(poi.id)}
                onMouseLeave={() => setActivePoiId(null)}
              >
                <div
                  className={`flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold shadow-md transition-all cursor-pointer ${
                    isHovered
                      ? "bg-foreground text-background scale-110 ring-2 ring-primary ring-offset-1"
                      : "bg-card/90 text-foreground border border-border/80 backdrop-blur-xs hover:bg-card"
                  }`}
                >
                  <MapPinIcon className="size-3 text-primary shrink-0" />
                  <span className="truncate max-w-[90px] sm:max-w-[120px]">{poi.name}</span>
                </div>
              </div>
            );
          })}

          {/* Primary Property Marker Pin */}
          <div
            style={{
              left: `${coords?.x || 48}%`,
              top: `${coords?.y || 44}%`,
              transform: "translate(-50%, -50%)",
            }}
            className="absolute z-20 pointer-events-auto"
          >
            <div className="group relative flex flex-col items-center">
              {/* Price Pill */}
              <div className="flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-lg ring-4 ring-primary/25 transition-transform hover:scale-105">
                <MapPinIcon className="size-3.5 fill-current" />
                <span>{formatPriceValue(price)}/mo</span>
              </div>
              <div className="h-2 w-2 rotate-45 bg-primary -mt-1 shadow-xs" />

              {/* Pulsing ring indicator */}
              <div className="absolute -inset-2 -z-10 animate-ping rounded-full bg-primary/20 duration-1000" />
            </div>
          </div>
        </div>

        {/* Map watermark / badge bottom-left */}
        <div className="absolute bottom-2.5 left-2.5 z-20 rounded-md bg-background/80 px-2 py-1 text-[10px] font-medium text-muted-foreground backdrop-blur-xs border border-border/60">
          Interactive Neighborhood Basemap · Stare Miasto
        </div>
      </div>

      {/* Horizontal Category Filter Strip (44x44px minimum touch targets) */}
      <div className="space-y-2">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Filter Nearby Points of Interest
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex min-h-[44px] items-center gap-2 rounded-full px-4 text-xs sm:text-sm font-semibold transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  isActive
                    ? "bg-foreground text-background shadow-sm"
                    : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/70"
                }`}
              >
                <Icon className={`size-4 ${isActive ? "text-background" : "text-primary"}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Nearby Places List Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
        {filteredPois.slice(0, 6).map((poi) => (
          <div
            key={poi.id}
            onMouseEnter={() => setActivePoiId(poi.id)}
            onMouseLeave={() => setActivePoiId(null)}
            className={`flex items-center justify-between rounded-xl border p-3 text-xs transition-colors cursor-pointer ${
              activePoiId === poi.id
                ? "border-primary bg-primary/[0.04]"
                : "border-border/70 bg-card hover:border-border"
            }`}
          >
            <div className="min-w-0 flex-1 pr-2">
              <div className="font-semibold text-foreground truncate">{poi.name}</div>
              <div className="text-[11px] text-muted-foreground capitalize mt-0.5">
                {poi.category}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="font-bold text-foreground">{poi.distance}</div>
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground justify-end mt-0.5">
                <FootprintsIcon className="size-3" />
                <span>{poi.walkTime}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

