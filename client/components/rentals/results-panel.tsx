"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowUpDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  RotateCcwIcon,
  SparklesIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RentalProperty } from "@/src/data/rentals-data";
import { RentalCard } from "./rental-card";

export type SortOption = "recommended" | "price-asc" | "price-desc" | "rating";

interface ResultsPanelProps {
  properties: RentalProperty[];
  totalCount: number;
  locationName?: string;
  selectedPropertyId: string | null;
  hoveredPropertyId: string | null;
  onSelectProperty: (property: RentalProperty) => void;
  onHoverProperty: (id: string | null) => void;
  onResetFilters: () => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  className?: string;
}

const ITEMS_PER_PAGE = 6;

export function ResultsPanel({
  properties,
  totalCount,
  locationName = "Wrocław",
  selectedPropertyId,
  hoveredPropertyId,
  onSelectProperty,
  onHoverProperty,
  onResetFilters,
  sortBy,
  onSortChange,
  className = "",
}: ResultsPanelProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const totalPages = Math.ceil(properties.length / ITEMS_PER_PAGE) || 1;
  const paginatedProperties = properties.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Auto-scroll to selected card when clicked from map
  useEffect(() => {
    if (selectedPropertyId && scrollContainerRef.current) {
      // Find card element
      const cardElement = document.getElementById(
        `property-card-${selectedPropertyId}`
      );
      if (cardElement) {
        cardElement.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        // If property is on another page, navigate to that page
        const propIndex = properties.findIndex((p) => p.id === selectedPropertyId);
        if (propIndex !== -1) {
          const targetPage = Math.floor(propIndex / ITEMS_PER_PAGE) + 1;
          if (targetPage !== currentPage) {
            setCurrentPage(targetPage);
          }
        }
      }
    }
  }, [selectedPropertyId, properties, currentPage]);

  return (
    <section
      className={`flex flex-col border-l border-border bg-card overflow-hidden ${className}`}
      aria-label="Rental property search results"
    >
      {/* Panel Header: Result Count & Sort Dropdown */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border/70 px-5 bg-card/80 backdrop-blur-xs">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            {properties.length} places in {locationName}
          </h2>
          <p className="text-[11px] text-muted-foreground">
            Verified monthly rental listings
          </p>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-1.5">
          <ArrowUpDownIcon className="size-3.5 text-muted-foreground" />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="h-8 rounded-md border border-border bg-background px-2 text-xs font-medium text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 cursor-pointer"
          >
            <option value="recommended">Recommended</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      {/* Scrollable Listings List */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-5 py-4 space-y-4"
      >
        {properties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
              <SparklesIcon className="size-6" />
            </div>
            <h3 className="text-base font-semibold text-foreground">
              No matching rentals found
            </h3>
            <p className="mt-1 max-w-xs text-xs text-muted-foreground">
              Try adjusting your price range, expanding room counts, or removing some amenities.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={onResetFilters}
              className="mt-4 gap-1.5"
            >
              <RotateCcwIcon className="size-3.5" />
              <span>Clear all filters</span>
            </Button>
          </div>
        ) : (
          paginatedProperties.map((property) => (
            <RentalCard
              key={property.id}
              property={property}
              isHighlighted={
                selectedPropertyId === property.id ||
                hoveredPropertyId === property.id
              }
              onHover={onHoverProperty}
              onClickPin={onSelectProperty}
            />
          ))
        )}
      </div>

      {/* Pagination Controls (Min 44x44px touch targets) */}
      {totalPages > 1 && (
        <nav
          aria-label="Search results pages"
          className="flex h-16 shrink-0 items-center justify-between border-t border-border/70 px-5 bg-card"
        >
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center gap-1 rounded-lg border border-border px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-40 disabled:pointer-events-none"
          >
            <ChevronLeftIcon className="size-4" />
            <span className="hidden sm:inline">Prev</span>
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-xs font-semibold transition-all ${
                  currentPage === page
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center gap-1 rounded-lg border border-border px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-40 disabled:pointer-events-none"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRightIcon className="size-4" />
          </button>
        </nav>
      )}
    </section>
  );
}

