"use client";

import { useRef } from "react";
import { ChevronLeftIcon, ChevronRightIcon, SparklesIcon } from "lucide-react";
import { RentalProperty } from "@/src/data/rentals-data";
import { RentalCard } from "@/components/rentals/rental-card";

interface SimilarListingsCarouselProps {
  currentPropertyId: string;
  properties: RentalProperty[];
  neighborhood: string;
}

export function SimilarListingsCarousel({
  currentPropertyId,
  properties,
  neighborhood,
}: SimilarListingsCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Filter out the current listing and prioritize same neighborhood or city
  const similar = properties
    .filter((p) => p.id !== currentPropertyId)
    .slice(0, 6);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const offset = direction === "left" ? -360 : 360;
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  if (similar.length === 0) return null;

  return (
    <div className="space-y-4 pt-8 pb-12 border-t border-border/80">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            <SparklesIcon className="size-3.5" />
            <span>Recommended for You</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground mt-0.5">
            Similar Homes in {neighborhood}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scroll("left")}
            aria-label="Previous similar listings"
            className="flex size-9 items-center justify-center rounded-full border border-border/80 bg-card text-foreground shadow-xs transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ChevronLeftIcon className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            aria-label="Next similar listings"
            className="flex size-9 items-center justify-center rounded-full border border-border/80 bg-card text-foreground shadow-xs transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ChevronRightIcon className="size-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 pt-1 scroll-smooth scrollbar-none snap-x snap-mandatory"
      >
        {similar.map((prop) => (
          <div
            key={prop.id}
            className="w-[280px] sm:w-[320px] md:w-[340px] shrink-0 snap-start"
          >
            <RentalCard property={prop} viewMode="grid" />
          </div>
        ))}
      </div>
    </div>
  );
}

