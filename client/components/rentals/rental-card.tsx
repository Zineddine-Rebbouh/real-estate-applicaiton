"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  BathIcon,
  BedDoubleIcon,
  CarIcon,
  CheckCircle2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  HeartIcon,
  MapPinIcon,
  Maximize2Icon,
  PawPrintIcon,
  ShieldCheckIcon,
  SparklesIcon,
  StarIcon,
  SunMediumIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RentalProperty } from "@/src/data/rentals-data";
import { formatPriceValue } from "@/lib/utils";

interface RentalCardProps {
  property: RentalProperty;
  isHighlighted?: boolean;
  viewMode?: "grid" | "list";
  showCarousel?: boolean;
  onHover?: (id: string | null) => void;
  onClickPin?: (property: RentalProperty) => void;
}

export function RentalCard({
  property,
  isHighlighted = false,
  viewMode = "grid",
  showCarousel = true,
  onHover,
  onClickPin,
}: RentalCardProps) {
  const [isFavorite, setIsFavorite] = useState(property.isFavorite || false);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const isList = viewMode === "list";
  const images = property.gallery?.length ? property.gallery : [property.image];

  const moveImage = (event: React.MouseEvent, direction: 1 | -1) => {
    event.stopPropagation();
    event.preventDefault();
    setCurrentImageIdx((index) =>
      direction === 1
        ? (index + 1) % images.length
        : (index - 1 + images.length) % images.length,
    );
  };

  const getBadgeIcon = (iconName?: string) => {
    switch (iconName) {
      case "pet":
        return <PawPrintIcon className="size-3 shrink-0" />;
      case "car":
        return <CarIcon className="size-3 shrink-0" />;
      case "badge-check":
        return <CheckCircle2Icon className="size-3 shrink-0" />;
      case "shield":
        return <ShieldCheckIcon className="size-3 shrink-0" />;
      case "sun":
        return <SunMediumIcon className="size-3 shrink-0" />;
      default:
        return <SparklesIcon className="size-3 shrink-0" />;
    }
  };

  return (
    <Card
      id={`property-card-${property.id}`}
      onMouseEnter={() => onHover?.(property.id)}
      onMouseLeave={() => onHover?.(null)}
      className={`group relative overflow-hidden rounded-xl border bg-card p-0 gap-0 ring-0 transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-lg ${isHighlighted ? "border-primary ring-2 ring-primary/30 shadow-md" : "border-border/80 hover:border-primary/40"} ${isList ? "flex h-full flex-col sm:flex-row" : "flex flex-col"}`}
    >
      <div
        className={`relative shrink-0 overflow-hidden bg-muted select-none ${isList ? "aspect-[16/9] w-full sm:aspect-auto sm:w-64 md:w-72 sm:min-h-[220px]" : "aspect-[16/9] w-full"}`}
      >
        <Link href={`/rentals/${property.id}`} className="absolute inset-0 z-0">
          <Image
            src={images[currentImageIdx]}
            alt={`${property.title} - photo ${currentImageIdx + 1}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 420px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-black/25" />
        </Link>

        <div className="absolute left-2.5 top-2.5 z-10 flex max-w-[calc(100%-4.5rem)] flex-wrap gap-1.5 min-h-8">
          {property.badges.slice(0, 2).map((badge, index) => (
            <Badge
              key={index}
              variant={badge.variant}
              className="gap-1 px-2 py-0.5 text-[11px] font-medium backdrop-blur-sm"
            >
              {getBadgeIcon(badge.iconName)}
              <span>{badge.label}</span>
            </Badge>
          ))}
        </div>

        <button
          type="button"
          aria-label={
            isFavorite ? "Remove from favorites" : "Save to favorites"
          }
          onClick={(event) => {
            event.stopPropagation();
            setIsFavorite((favorite) => !favorite);
          }}
          className="absolute right-1.5 top-1.5 z-10 flex size-11 items-center justify-center rounded-full"
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-black/40 backdrop-blur-md">
            <HeartIcon
              className={`size-4 ${isFavorite ? "fill-rose-500 text-rose-500" : "text-white"}`}
            />
          </span>
        </button>

        {showCarousel && images.length > 1 && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-between px-1">
            <button
              type="button"
              aria-label="Previous photo"
              onClick={(event) => moveImage(event, -1)}
              className="pointer-events-auto flex size-11 items-center justify-center opacity-0 group-hover:opacity-100"
            >
              <span className="flex size-7 items-center justify-center rounded-full bg-black/50 text-white">
                <ChevronLeftIcon className="size-4" />
              </span>
            </button>
            <button
              type="button"
              aria-label="Next photo"
              onClick={(event) => moveImage(event, 1)}
              className="pointer-events-auto flex size-11 items-center justify-center opacity-0 group-hover:opacity-100"
            >
              <span className="flex size-7 items-center justify-center rounded-full bg-black/50 text-white">
                <ChevronRightIcon className="size-4" />
              </span>
            </button>
          </div>
        )}

        {showCarousel && images.length > 1 && (
          <div className="absolute inset-x-0 bottom-10 z-10 flex justify-center gap-1.5">
            {images.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Go to photo ${index + 1}`}
                onClick={(event) => {
                  event.stopPropagation();
                  event.preventDefault();
                  setCurrentImageIdx(index);
                }}
                className={`rounded-full ${index === currentImageIdx ? "h-1.5 w-4 bg-white" : "size-1.5 bg-white/50"}`}
              />
            ))}
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-between bg-gradient-to-t from-black/50 to-transparent px-2.5 py-2 text-[11px] font-medium text-white/90">
          <span className="rounded bg-black/40 px-1.5 py-0.5">
            {property.propertyType}
          </span>
          <span>
            {property.availableDate === "Immediate"
              ? "Available now"
              : `From ${property.availableDate}`}
          </span>
        </div>
      </div>

      <div
        className={`flex flex-col gap-3 p-4 ${isList ? "flex-1 justify-between" : ""}`}
      >
        <div>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold leading-snug text-foreground group-hover:text-primary overflow-hidden line-clamp-2">
                <Link
                  href={`/rentals/${property.id}`}
                  className="hover:underline"
                >
                  {property.title}
                </Link>
              </h3>
              <p className="mt-0.5 flex flex-1 items-center gap-1 truncate text-xs text-muted-foreground">
                <MapPinIcon className="size-3 shrink-0" />
                {property.address}, {property.neighborhood}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <span className="text-base font-bold text-foreground">
                {formatPriceValue(property.price)}
              </span>
              <span className="ml-0.5 text-[11px] text-muted-foreground">
                /mo
              </span>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <StarIcon className="size-3.5 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-foreground">
              {property.rating.toFixed(1)}
            </span>
            <span>·</span>
            <span>{property.reviewCount} reviews</span>
          </div>
          {isList && property.amenities.length > 0 && (
            <div className="mt-3 hidden flex-wrap gap-1.5 sm:flex">
              {property.amenities.slice(0, 4).map((amenity) => (
                <span
                  key={amenity}
                  className="rounded-md bg-muted px-2 py-0.5 text-[11px] capitalize text-muted-foreground"
                >
                  {amenity.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border/60 pt-3 text-xs">
          <div className="flex items-center gap-3 flex-nowrap">
            <span className="flex items-center gap-1">
              <BedDoubleIcon className="size-3.5" />
              {property.beds === 0
                ? "Studio"
                : `${property.beds} Bed${property.beds > 1 ? "s" : ""}`}
            </span>
            <span className="flex items-center gap-1">
              <BathIcon className="size-3.5" />
              {property.baths} {property.baths === 1 ? "Bath" : "Baths"}
            </span>
            <span className="flex items-center gap-1">
              <Maximize2Icon className="size-3" />
              {property.sqft.toLocaleString()} ft²
            </span>
          </div>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onClickPin?.(property);
            }}
            className="flex min-h-[44px] items-center gap-1 px-1 text-[11px] font-medium text-primary hover:underline"
          >
            <MapPinIcon className="size-3" />
          </button>
        </div>
      </div>
    </Card>
  );
}

export function RentalCardSkeleton({
  viewMode = "grid",
}: {
  viewMode?: "grid" | "list";
}) {
  const isList = viewMode === "list";
  return (
    <div
      className={`overflow-hidden rounded-xl border border-border/70 bg-card ${isList ? "flex flex-col sm:flex-row" : "flex flex-col"}`}
    >
      <div
        className={`relative shrink-0 overflow-hidden bg-muted ${isList ? "aspect-[16/9] w-full sm:aspect-auto sm:w-64 md:w-72 sm:min-h-[220px]" : "aspect-[16/9] w-full"}`}
      >
        <Skeleton className="h-full w-full rounded-none" />
      </div>
      <div className="flex flex-1 flex-col justify-between gap-3 p-4">
        <div>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3.5 w-1/2" />
            </div>
            <Skeleton className="h-6 w-20" />
          </div>
          <div className="mt-2.5 flex gap-2">
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-border/60 pt-3">
          <div className="flex gap-3">
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}
