"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
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

export interface GoogleMapProps {
  properties: RentalProperty[];
  selectedPropertyId: string | null;
  hoveredPropertyId: string | null;
  onSelectProperty: (property: RentalProperty) => void;
  onHoverProperty: (id: string | null) => void;
  className?: string;
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
  onClose,
  onViewListing,
}: {
  property: RentalProperty;
  onClose: () => void;
  onViewListing: (p: RentalProperty) => void;
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
          <button
            type="button"
            onClick={() => onViewListing(property)}
            className="rounded-md bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary hover:bg-primary/20 transition-colors"
          >
            View Listing
          </button>
        </div>
      </div>
    </div>
  );
}

function PricePillMarker({
  property,
  isSelected,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: {
  property: RentalProperty;
  isSelected: boolean;
  isHovered: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  const active = isSelected || isHovered;
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
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
    </button>
  );
}

export function GoogleMap({
  properties,
  selectedPropertyId,
  hoveredPropertyId,
  onSelectProperty,
  onHoverProperty,
  className = "",
}: GoogleMapProps) {
  const [activeInfoWindow, setActiveInfoWindow] = useState<RentalProperty | null>(null);

  const geo = properties.filter(hasGeo);
  const skipped = properties.length - geo.length;

  useEffect(() => {
    if (!selectedPropertyId) return;
    const match = geo.find((p) => p.id === selectedPropertyId);
    setActiveInfoWindow(match ?? null);
  }, [selectedPropertyId, geo]);

  const defaultCenter =
    geo.length > 0
      ? {
          lat: geo.reduce((s, p) => s + p.coords.lat, 0) / geo.length,
          lng: geo.reduce((s, p) => s + p.coords.lng, 0) / geo.length,
        }
      : { lat: 51.1079, lng: 17.0385 };

  const handleMarkerClick = (property: RentalProperty) => {
    setActiveInfoWindow(property);
    onSelectProperty(property);
  };

  const handleCloseInfo = () => {
    setActiveInfoWindow(null);
  };

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
              >
                <PricePillMarker
                  property={property}
                  isSelected={isSelected}
                  isHovered={isHovered}
                  onClick={() => handleMarkerClick(property)}
                  onMouseEnter={() => onHoverProperty(property.id)}
                  onMouseLeave={() => onHoverProperty(null)}
                />
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
                onClose={handleCloseInfo}
                onViewListing={(p) => {
                  onSelectProperty(p);
                  handleCloseInfo();
                }}
              />
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