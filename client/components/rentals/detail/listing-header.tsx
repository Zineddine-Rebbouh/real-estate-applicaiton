"use client";

import Link from "next/link";
import {
  ChevronRightIcon,
  MapPinIcon,
  ShieldCheckIcon,
  StarIcon,
  ArrowLeftIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ListingHeaderProps {
  title: string;
  address: string;
  city: string;
  neighborhood: string;
  rating: number;
  reviewCount: number;
  propertyType: string;
  breadcrumbs: {
    country: string;
    region: string;
    city: string;
    neighborhood: string;
  };
}

export function ListingHeader({
  title,
  address,
  city,
  neighborhood,
  rating,
  reviewCount,
  propertyType,
  breadcrumbs,
}: ListingHeaderProps) {
  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="space-y-3">
      {/* Breadcrumb Trail & Quick Back link */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 flex-wrap">
          <Link
            href="/tenant/rentals"
            className="flex items-center gap-1 font-medium transition-colors hover:text-foreground"
          >
            <ArrowLeftIcon className="size-3" />
            <span>Listings</span>
          </Link>
          <ChevronRightIcon className="size-3 text-muted-foreground/60" />
          <span>{breadcrumbs.country}</span>
          <ChevronRightIcon className="size-3 text-muted-foreground/60" />
          <span>{breadcrumbs.region}</span>
          <ChevronRightIcon className="size-3 text-muted-foreground/60" />
          <span className="text-foreground/80 font-medium">{breadcrumbs.city}</span>
          <ChevronRightIcon className="size-3 text-muted-foreground/60" />
          <span className="text-primary font-semibold">{breadcrumbs.neighborhood}</span>
        </nav>

        <Badge variant="outline" className="text-[11px] font-medium uppercase tracking-wider">
          {propertyType}
        </Badge>
      </div>

      {/* Main Title & Verified Status */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
            {title}
          </h1>
          <Badge
            variant="success"
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold"
          >
            <ShieldCheckIcon className="size-3.5 shrink-0" />
            <span>Verified Listing</span>
          </Badge>
        </div>

        {/* Location & Rating meta line */}
        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <MapPinIcon className="size-4 text-primary shrink-0" />
            <span className="text-foreground/90 font-medium">
              {address}, {neighborhood}, {city}
            </span>
            <button
              type="button"
              onClick={() => scrollToSection("location-map")}
              className="ml-1 text-xs font-semibold text-primary underline underline-offset-4 hover:text-primary/80"
            >
              Show on map
            </button>
          </div>

          <div className="hidden sm:inline-block text-border">·</div>

          <button
            type="button"
            onClick={() => scrollToSection("reviews-section")}
            className="flex items-center gap-1.5 transition-colors hover:text-foreground group text-left"
          >
            <div className="flex items-center gap-1">
              <StarIcon className="size-4 fill-amber-400 text-amber-400" />
              <span className="font-bold text-foreground">{rating.toFixed(2)}</span>
            </div>
            <span className="text-xs text-muted-foreground group-hover:underline">
              ({reviewCount} verified reviews)
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

