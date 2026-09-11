"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BedDoubleIcon, BathIcon, XIcon } from "lucide-react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
} from "@vis.gl/react-google-maps";
import type { RentalProperty } from "@/src/data/rentals-data";
import { formatPriceValue } from "@/lib/utils";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
const GOOGLE_MAPS_MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID ?? "";

export interface MapPoi {
  id: string;
  name: string;
  category: string;
  coords?: { lat?: number; lng?: number; x?: number; y?: number };
  distance?: string;
  walkTime?: string;
}

export interface GoogleMapProps {
  properties: RentalProperty[];
  selectedPropertyId: string | null;
  hoveredPropertyId: string | null;
  onSelectProperty: (property: RentalProperty) => void;
  onHoverProperty: (id: string | null) => void;
  onDeselectProperty?: () => void;
  detailsHref?: (property: RentalProperty) => string;
  className?: string;
  pois?: MapPoi[];
  activePoiId?: string | null;
  onHoverPoi?: (id: string | null) => void;
  selectedPoiId?: string | null;
  onSelectPoi?: (id: string | null) => void;
}

const hasGeo = (p: RentalProperty) => p.coords.lat !== 0 || p.coords.lng !== 0;

function MapController({
  geo,
  selectedPropertyId,
}: {
  geo: RentalProperty[];
  selectedPropertyId: string | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map || geo.length === 0) return;
    if (geo.length === 1) {
      map.panTo({ lat: geo[0].coords.lat, lng: geo[0].coords.lng });
      map.setZoom(14);
    } else {
      const bounds = new google.maps.LatLngBounds();
      geo.forEach((p) => bounds.extend({ lat: p.coords.lat, lng: p.coords.lng }));
      map.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });
    }
  }, [map, geo]);

  useEffect(() => {
    if (!map || !selectedPropertyId) return;
    const prop = geo.find((p) => p.id === selectedPropertyId);
    if (prop) map.panTo({ lat: prop.coords.lat, lng: prop.coords.lng });
  }, [map, selectedPropertyId, geo]);

  return null;
}

function PropertyInfoCard({
  property,
  href,
  onClose,
}: {
  property: RentalProperty;
  href: string;
  onClose: () => void;
}) {
  return (
    <div className="w-60 rounded-xl overflow-hidden bg-card text-foreground shadow-none">
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        <Image
          src={property.image}
          alt={property.title}
          fill
          className="object-cover"
          sizes="240px"
        />
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute top-1.5 right-1.5 size-6 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors z-10"
        >
          <XIcon className="size-3.5" />
        </button>
        <div className="absolute bottom-1.5 left-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-xs">
          {property.propertyType}
        </div>
      </div>

      <div className="p-2.5 space-y-1">
        <h4 className="text-xs font-semibold text-foreground truncate">
          {property.title}
        </h4>
        <p className="text-[11px] text-muted-foreground truncate">
          {property.address}
        </p>

        <div className="flex items-center gap-2.5 text-[11px] text-muted-foreground">
          {property.beds > 0 ? (
            <span className="flex items-center gap-1">
              <BedDoubleIcon className="size-3 text-primary" />
              {property.beds} {property.beds === 1 ? "bed" : "beds"}
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <BedDoubleIcon className="size-3 text-primary" />
              Studio
            </span>
          )}
          <span className="flex items-center gap-1">
            <BathIcon className="size-3 text-primary" />
            {property.baths} {property.baths === 1 ? "bath" : "baths"}
          </span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-sm font-bold text-foreground">
            {formatPriceValue(property.price)}
            <span className="text-[10px] font-normal text-muted-foreground">
              /mo
            </span>
          </span>
          <Link
            href={href}
            className="rounded-md bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary hover:bg-primary/20 transition-colors"
          >
            View Listing
          </Link>
        </div>
      </div>
    </div>
  );
}

function PricePillMarker({
  property,
  isSelected,
  isHovered,
}: {
  property: RentalProperty;
  isSelected: boolean;
  isHovered: boolean;
}) {
  const active = isSelected || isHovered;
  // Visual only: click/hover handlers live on AdvancedMarker itself, since
  // @vis.gl disables pointer events on marker content without them.
  return (
    <div
      className={[
        "relative flex items-center rounded-full px-2.5 py-1 text-xs font-bold",
        "shadow-md transition-all duration-150 cursor-pointer",
        active
          ? "bg-primary text-primary-foreground shadow-lg scale-110 ring-[3px] ring-primary/30"
          : "bg-card text-foreground border border-border/80 hover:bg-primary hover:text-primary-foreground hover:scale-105",
      ].join(" ")}
    >
      {formatPriceValue(property.price)}
      <span
        className={[
          "absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full",
          "border-solid border-t-[5px] border-x-[5px] border-b-0 border-x-transparent",
          active ? "border-t-primary" : "border-t-card",
        ].join(" ")}
      />
    </div>
  );
}

export function GoogleMap({
  properties,
  selectedPropertyId,
  hoveredPropertyId,
  onSelectProperty,
  onHoverProperty,
  onDeselectProperty,
  detailsHref = (p) => `/tenant/rentals/${p.id}`,
  className = "",
  pois = [],
  activePoiId = null,
  onHoverPoi,
  selectedPoiId = null,
  onSelectPoi,
}: GoogleMapProps) {
  // Card is derived from the selection: X clears the selection so the card
  // stays hidden until the next marker click. hiddenId covers callers that
  // don't wire onDeselectProperty.
  const [hiddenId, setHiddenId] = useState<string | null>(null);

  // Memoized so MapController's fitBounds only refires when the result
  // set actually changes — not on every selection/hover rerender (which
  // would snap the zoom back to default on each pin click).
  const geo = useMemo(() => properties.filter(hasGeo), [properties]);
  const skipped = properties.length - geo.length;

  const activeInfoWindow =
    selectedPropertyId && selectedPropertyId !== hiddenId
      ? (geo.find((p) => p.id === selectedPropertyId) ?? null)
      : null;

  const defaultCenter =
    geo.length > 0
      ? {
          lat: geo.reduce((s, p) => s + p.coords.lat, 0) / geo.length,
          lng: geo.reduce((s, p) => s + p.coords.lng, 0) / geo.length,
        }
      : { lat: 51.1079, lng: 17.0385 };

  const handleMarkerClick = (property: RentalProperty) => {
    setHiddenId(null);
    onSelectProperty(property);
  };

  const handleCloseInfo = () => {
    setHiddenId(selectedPropertyId);
    onDeselectProperty?.();
  };

  // POI position: real lat/lng when available, otherwise offset from the
  // first listing (same math as the fallback vector map's x/y placement).
  const getPoiPosition = (poi: MapPoi) => {
    const anchor = geo[0];
    const lat =
      poi.coords?.lat ??
      (anchor
        ? anchor.coords.lat + ((poi.coords?.y ?? 50) - 50) * 0.0003
        : 0);
    const lng =
      poi.coords?.lng ??
      (anchor
        ? anchor.coords.lng + ((poi.coords?.x ?? 50) - 50) * 0.0004
        : 0);
    return lat && lng ? { lat, lng } : null;
  };

  const selectedPoi = selectedPoiId
    ? (pois.find((p) => p.id === selectedPoiId) ?? null)
    : null;
  const selectedPoiPosition = selectedPoi
    ? getPoiPosition(selectedPoi)
    : null;

  return (
    <div className={`relative h-full w-full ${className}`}>
      <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
        <Map
          mapId={GOOGLE_MAPS_MAP_ID || null}
          defaultCenter={defaultCenter}
          defaultZoom={12}
          gestureHandling="greedy"
          className="h-full w-full"
          streetViewControl={false}
          mapTypeControl={false}
          fullscreenControl={false}
        >
          <MapController geo={geo} selectedPropertyId={selectedPropertyId} />

          {geo.map((property) => {
            const isSelected = selectedPropertyId === property.id;
            const isHovered = hoveredPropertyId === property.id;

            return (
              <AdvancedMarker
                key={property.id}
                position={{ lat: property.coords.lat, lng: property.coords.lng }}
                zIndex={isSelected || isHovered ? 30 : 10}
                onClick={() => handleMarkerClick(property)}
                onMouseEnter={() => onHoverProperty(property.id)}
                onMouseLeave={() => onHoverProperty(null)}
              >
                <PricePillMarker
                  property={property}
                  isSelected={isSelected}
                  isHovered={isHovered}
                />
              </AdvancedMarker>
            );
          })}

          {pois.map((poi) => {
            const position = getPoiPosition(poi);
            if (!position) return null;
            const isEmphasized =
              poi.id === selectedPoiId || poi.id === activePoiId;

            return (
              <AdvancedMarker
                key={poi.id}
                position={position}
                zIndex={isEmphasized ? 40 : 15}
                onClick={() => {
                  if (onSelectPoi)
                    onSelectPoi(selectedPoiId === poi.id ? null : poi.id);
                  else onHoverPoi?.(activePoiId === poi.id ? null : poi.id);
                }}
                onMouseEnter={() => onHoverPoi?.(poi.id)}
                onMouseLeave={() => onHoverPoi?.(null)}
              >
                <div
                  className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-md transition-all cursor-pointer ${
                    isEmphasized
                      ? "bg-foreground text-background scale-110 ring-2 ring-primary ring-offset-1"
                      : "bg-card/95 text-foreground border border-border/80 backdrop-blur-xs hover:bg-card hover:scale-105"
                  }`}
                >
                  <span className="size-2 rounded-full bg-primary inline-block shrink-0" />
                  <span className="truncate max-w-[120px]">{poi.name}</span>
                </div>
              </AdvancedMarker>
            );
          })}

          {activeInfoWindow && (
            <InfoWindow
              position={{
                lat: activeInfoWindow.coords.lat,
                lng: activeInfoWindow.coords.lng,
              }}
              onCloseClick={handleCloseInfo}
              pixelOffset={[0, -44]}
              disableAutoPan={false}
            >
              <PropertyInfoCard
                property={activeInfoWindow}
                href={detailsHref(activeInfoWindow)}
                onClose={handleCloseInfo}
              />
            </InfoWindow>
          )}

          {selectedPoi && selectedPoiPosition && (
            <InfoWindow
              position={selectedPoiPosition}
              onCloseClick={() => onSelectPoi?.(null)}
              pixelOffset={[0, -32]}
              disableAutoPan={false}
            >
              <div className="w-52 p-2.5 space-y-1 bg-card text-foreground">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-semibold truncate">
                    {selectedPoi.name}
                  </h4>
                  <button
                    type="button"
                    aria-label="Close place preview"
                    onClick={() => onSelectPoi?.(null)}
                    className="size-6 shrink-0 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                  >
                    <XIcon className="size-3.5" />
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground capitalize">
                  {selectedPoi.category}
                  {selectedPoi.distance
                    ? ` · ${selectedPoi.distance}`
                    : ""}
                  {selectedPoi.walkTime ? ` · ${selectedPoi.walkTime}` : ""}
                </p>
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>

      {skipped > 0 && (
        <p className="absolute bottom-2 left-2 z-10 rounded-md bg-background/90 px-2 py-1 text-[11px] text-muted-foreground backdrop-blur-xs border border-border/50">
          {skipped} listing{skipped === 1 ? "" : "s"} without map coordinates
        </p>
      )}
    </div>
  );
}