"use client";

import { useMemo, useState, type ComponentType } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPinIcon,
  NavigationIcon,
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
  XIcon,
} from "lucide-react";
import { SAMPLE_POIS, type PointOfInterest } from "@/src/data/rental-details-data";
import type { RentalProperty } from "@/src/data/rentals-data";
import { formatPriceValue } from "@/lib/utils";
import { layoutListingCoords } from "@/lib/listings";
import dynamic from "next/dynamic";

const GoogleMap = dynamic(
  () => import("../google-map").then((m) => m.GoogleMap),
  { ssr: false },
);

const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;


interface ListingMapSectionProps {
  propertyTitle: string;
  address: string;
  city: string;
  neighborhood: string;
  price: number;
  coords: { x: number; y: number; lat: number; lng: number };
  pois: PointOfInterest[];
  listing?: RentalProperty;
  nearbyProperties?: RentalProperty[];
  detailsHref?: (property: RentalProperty) => string;
}

type POICategory =
  | "all"
  | "school"
  | "transit"
  | "grocery"
  | "restaurant"
  | "fitness"
  | "bank";

const CATEGORIES: {
  id: POICategory;
  label: string;
  icon: ComponentType<{ className?: string }>;
}[] = [
  { id: "all", label: "All Nearby", icon: CompassIcon },
  { id: "school", label: "Schools", icon: GraduationCapIcon },
  { id: "transit", label: "Transit", icon: NavigationIcon },
  { id: "grocery", label: "Grocery", icon: ShoppingBagIcon },
  { id: "restaurant", label: "Dining & Cafes", icon: UtensilsIcon },
  { id: "fitness", label: "Fitness", icon: DumbbellIcon },
  { id: "bank", label: "Banks & ATMs", icon: LandmarkIcon },
];

export function ListingMapSection({
  address,
  city,
  neighborhood,
  coords,
  pois,
  listing,
  nearbyProperties = [],
  detailsHref = (p) => `/tenant/rentals/${p.id}`,
}: ListingMapSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<POICategory>("all");
  const [activePoiId, setActivePoiId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  // Selected map pin. X clears it to null and the card stays hidden until
  // the next pin click.
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
    listing?.id ?? null,
  );

  // Current listing + nearby rentals, deduped. layoutListingCoords backfills
  // x/y for the fallback vector map when server data has none.
  const mapProperties = useMemo(() => {
    if (!listing) return [];
    const seen = new Set<string>();
    const combined = [listing, ...nearbyProperties].filter((p) => {
      if (!p || seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });
    return layoutListingCoords(combined);
  }, [listing, nearbyProperties]);

  const selectedProperty =
    mapProperties.find((p) => p.id === selectedPropertyId) ?? null;

  const focusSelectedOnMap = () => {    document
      .getElementById("location-map-canvas")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleSelectNearby = (property: RentalProperty) => {
    setSelectedPropertyId(property.id);
    focusSelectedOnMap();
  };

  const hasRealCoords = coords.lat !== 0 || coords.lng !== 0;
  const useRealMap = Boolean(GOOGLE_MAPS_KEY && hasRealCoords && listing);

  const effectivePois = pois && pois.length > 0 ? pois : SAMPLE_POIS;

  const openGoogleMapsDirections = () => {
    const query = encodeURIComponent(`${address}, ${neighborhood}, ${city}`);
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${query}`,
      "_blank",
    );
  };

  const filteredPois =
    selectedCategory === "all"
      ? effectivePois
      : effectivePois.filter((poi) => poi.category === selectedCategory);

  return (
    <div
      id="location-map"
      className="space-y-4 pt-6 border-t border-border/80 scroll-mt-20"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
            Location &amp; Surrounding Area
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {address}, {neighborhood}, {city}
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

      {/* Map Canvas */}
      {useRealMap && listing ? (
        <div
          id="location-map-canvas"
          className="relative h-[340px] sm:h-[420px] w-full overflow-hidden rounded-xl border border-border/80 shadow-inner"
        >
          <GoogleMap
            properties={mapProperties}
            selectedPropertyId={selectedPropertyId}
            hoveredPropertyId={null}
            pois={filteredPois}
            activePoiId={activePoiId}
            onHoverPoi={setActivePoiId}
            // POI taps open this listing's full property card, not a place card.
            onSelectPoi={() => {
              if (listing) setSelectedPropertyId(listing.id);
            }}
            onSelectProperty={(p) => setSelectedPropertyId(p.id)}
            onHoverProperty={() => {}}
            onDeselectProperty={() => setSelectedPropertyId(null)}
            detailsHref={detailsHref}
          />
        </div>
      ) : (
        <div
          id="location-map-canvas"
          className="relative h-[340px] sm:h-[420px] w-full overflow-hidden rounded-xl border border-border/80 bg-muted/40 shadow-inner"
        >
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
                <pattern
                  id="detailStreetGrid"
                  width="36"
                  height="36"
                  patternUnits="userSpaceOnUse"
                >
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
          </div>

          {/* POI Markers Placed on Map (click opens this listing's card) */}
          {filteredPois.map((poi) => {
            const isEmphasized = activePoiId === poi.id;
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
                onClick={() => {
                  setActivePoiId(poi.id);
                  if (listing) setSelectedPropertyId(listing.id);
                }}
              >
                <div
                  className={`flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold shadow-md transition-all cursor-pointer ${
                    isEmphasized
                      ? "bg-foreground text-background scale-110 ring-2 ring-primary ring-offset-1"
                      : "bg-card/90 text-foreground border border-border/80 backdrop-blur-xs hover:bg-card"
                  }`}
                >
                  <MapPinIcon className="size-3 text-primary shrink-0" />
                  <span className="truncate max-w-[90px] sm:max-w-[120px]">
                    {poi.name}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Property Pins (current + nearby rentals) */}
          {(mapProperties.length > 0
            ? mapProperties
            : listing
              ? [{ ...listing, coords: { ...listing.coords, x: 48, y: 44 } }]
              : []
          ).map((p) => {
            const isSelected = selectedPropertyId === p.id;
            const isCurrent = listing?.id === p.id;
            return (
              <div
                key={p.id}
                style={{
                  left: `${p.coords?.x ?? 48}%`,
                  top: `${p.coords?.y ?? 44}%`,
                  transform: "translate(-50%, -50%)",
                }}
                className={`absolute pointer-events-auto ${isSelected ? "z-30" : "z-20"}`}
              >
                <button
                  type="button"
                  onClick={() => setSelectedPropertyId(p.id)}
                  aria-label={`Show ${p.title} on map`}
                  className="group relative flex flex-col items-center"
                >
                  <div
                    className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold shadow-lg transition-transform hover:scale-105 ${
                      isSelected
                        ? "bg-primary text-primary-foreground ring-4 ring-primary/25"
                        : isCurrent
                          ? "bg-primary text-primary-foreground ring-4 ring-primary/25"
                          : "bg-card text-foreground border border-border/80 hover:bg-primary hover:text-primary-foreground"
                    }`}
                  >
                    <MapPinIcon className="size-3.5 fill-current" />
                    <span>{formatPriceValue(p.price)}/mo</span>
                  </div>
                  <div
                    className={`h-2 w-2 rotate-45 -mt-1 shadow-xs ${isSelected || isCurrent ? "bg-primary" : "bg-card group-hover:bg-primary"}`}
                  />
                  {isCurrent && (
                    <div className="absolute -inset-2 -z-10 animate-ping rounded-full bg-primary/20 duration-1000" />
                  )}
                </button>
              </div>
            );
          })}

          {/* Selected Property Popup Card (X hides it until next pin click) */}
          {selectedProperty && (
            <div
              style={{
                left: `${selectedProperty.coords?.x ?? 48}%`,
                top: `${selectedProperty.coords?.y ?? 44}%`,
              }}
              className="absolute -translate-x-1/2 -translate-y-[135%] z-40 w-60 rounded-xl border border-border bg-card p-2.5 shadow-xl animate-in fade-in-0 zoom-in-95 duration-150 pointer-events-auto"
            >
              <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted mb-2">
                <Image
                  src={selectedProperty.image}
                  alt={selectedProperty.title}
                  fill
                  className="object-cover"
                  sizes="240px"
                />
                <button
                  type="button"
                  aria-label="Close property preview"
                  onClick={() => setSelectedPropertyId(null)}
                  className="absolute top-1.5 right-1.5 size-6 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
                >
                  <XIcon className="size-3.5" />
                </button>
                <div className="absolute bottom-1.5 left-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-xs">
                  {selectedProperty.propertyType}
                </div>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-foreground truncate">
                  {selectedProperty.title}
                </h4>
                <p className="text-[11px] text-muted-foreground truncate">
                  {selectedProperty.address}
                </p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-sm font-bold text-foreground">
                    {formatPriceValue(selectedProperty.price)}
                    <span className="text-[10px] font-normal text-muted-foreground">
                      /mo
                    </span>
                  </span>
                  <Link
                    href={detailsHref(selectedProperty)}
                    className="rounded-md bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary hover:bg-primary/20 transition-colors"
                  >
                    View Listing
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Map watermark / badge bottom-left */}
          <div className="absolute bottom-2.5 left-2.5 z-20 rounded-md bg-background/80 px-2 py-1 text-[10px] font-medium text-muted-foreground backdrop-blur-xs border border-border/60">
            Interactive Neighborhood Basemap · {neighborhood}
          </div>
        </div>
      )}

      {/* Nearby rentals quick-pick: jumps the map card to that property */}
      {mapProperties.length > 1 && (
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Nearby rentals on this map
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {mapProperties.map((p) => {
              const isActive = selectedPropertyId === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectNearby(p)}
                  className={`flex min-h-[44px] items-center gap-2 rounded-full px-4 text-xs sm:text-sm font-semibold transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    isActive
                      ? "bg-foreground text-background shadow-sm"
                      : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/70"
                  }`}
                >
                  <MapPinIcon
                    className={`size-4 ${isActive ? "text-background" : "text-primary"}`}
                  />
                  <span className="truncate max-w-[160px]">{p.title}</span>
                  <span className="font-bold">{formatPriceValue(p.price)}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

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
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setActivePoiId(null);
                  // Full property card of this listing on the map.
                  if (listing) {
                    setSelectedPropertyId(listing.id);
                    focusSelectedOnMap();
                  }
                }}
                className={`flex min-h-[44px] items-center gap-2 rounded-full px-4 text-xs sm:text-sm font-semibold transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  isActive
                    ? "bg-foreground text-background shadow-sm"
                    : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/70"
                }`}
              >
                <Icon
                  className={`size-4 ${isActive ? "text-background" : "text-primary"}`}
                />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Nearby Places List Grid (click opens this listing's card on the map) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
        {filteredPois.slice(0, 6).map((poi) => (
          <button
            key={poi.id}
            type="button"
            onClick={() => {
              // Full property card, same as the map pins.
              setActivePoiId(poi.id);
              if (listing) setSelectedPropertyId(listing.id);
              focusSelectedOnMap();
            }}
            onMouseEnter={() => setActivePoiId(poi.id)}
            onMouseLeave={() => setActivePoiId(null)}
            className={`flex items-center justify-between rounded-xl border p-3 text-xs text-left transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              activePoiId === poi.id
                ? "border-primary bg-primary/[0.04]"
                : "border-border/70 bg-card hover:border-border"
            }`}
          >
            <div className="min-w-0 flex-1 pr-2">
              <div className="font-semibold text-foreground truncate">
                {poi.name}
              </div>
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
          </button>
        ))}
      </div>
    </div>
  );
}
