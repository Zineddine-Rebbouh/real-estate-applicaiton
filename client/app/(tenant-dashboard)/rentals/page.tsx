"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2Icon,
  CheckCircle2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CompassIcon,
  EyeIcon,
  HomeIcon,
  MapIcon,
  MapPinIcon,
  RotateCcwIcon,
  SearchIcon,
  SlidersHorizontalIcon,
  SparklesIcon,
  XIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  RentalCard,
  RentalCardSkeleton,
} from "@/components/rentals/rental-card";
import {
  BrowseFilterBar,
  BrowseSortOption,
  BrowseViewMode,
} from "@/components/rentals/browse-filter-bar";
import { FilterDrawer } from "@/components/rentals/filter-drawer";
import {
  FilterState,
  INITIAL_FILTERS,
  MOCK_RENTALS,
  PropertyType,
  RentalProperty,
  AMENITIES_LIST,
} from "@/src/data/rentals-data";

const ITEMS_PER_PAGE = 8;

export default function BrowseRentalsPage() {
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [sortBy, setSortBy] = useState<BrowseSortOption>("popular");
  const [viewMode, setViewMode] = useState<BrowseViewMode>("grid");
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showSkeletonDemo, setShowSkeletonDemo] = useState(false);

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setCurrentPage(1);
  };

  // Filter listings based on active filter state
  const filteredProperties = useMemo(() => {
    return MOCK_RENTALS.filter((property) => {
      // Location search
      if (filters.locationQuery.trim()) {
        const query = filters.locationQuery.toLowerCase().trim();
        const matchesLocation =
          property.title.toLowerCase().includes(query) ||
          property.address.toLowerCase().includes(query) ||
          property.neighborhood.toLowerCase().includes(query) ||
          property.city.toLowerCase().includes(query);
        if (!matchesLocation) return false;
      }

      // Price range
      if (property.price < filters.minPrice) return false;
      if (filters.maxPrice < 4500 && property.price > filters.maxPrice)
        return false;

      // Property type
      if (
        filters.propertyTypes.length > 0 &&
        !filters.propertyTypes.includes(property.propertyType)
      ) {
        return false;
      }

      // Bedrooms
      if (filters.beds !== null) {
        if (filters.beds === 0 && property.beds !== 0) return false;
        if (filters.beds > 0 && property.beds < filters.beds) return false;
      }

      // Bathrooms
      if (filters.baths !== null && property.baths < filters.baths) {
        return false;
      }

      // Square footage
      if (property.sqft < filters.minSqft) return false;
      if (filters.maxSqft < 2800 && property.sqft > filters.maxSqft)
        return false;

      // Amenities
      if (filters.amenities.length > 0) {
        const hasAllAmenities = filters.amenities.every((amenity) =>
          property.amenities.includes(amenity),
        );
        if (!hasAllAmenities) return false;
      }

      // Pet friendly
      if (filters.petFriendlyOnly && !property.petFriendly) return false;

      // Parking
      if (filters.parkingOnly && !property.parkingIncluded) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "newest")
        return b.availableDate.localeCompare(a.availableDate);
      // "popular" (default)
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return b.reviewCount - a.reviewCount;
    });
  }, [filters, sortBy]);

  // Paginated subset
  const totalPages = Math.ceil(filteredProperties.length / ITEMS_PER_PAGE) || 1;
  const paginatedListings = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProperties.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProperties, currentPage]);

  // Active filter pills list for the header chips strip
  const activeChips = useMemo(() => {
    const chips: { id: string; label: string; onRemove: () => void }[] = [];

    if (filters.locationQuery.trim()) {
      chips.push({
        id: "location",
        label: `Location: "${filters.locationQuery.trim()}"`,
        onRemove: () => handleFilterChange({ locationQuery: "" }),
      });
    }

    if (
      filters.minPrice > INITIAL_FILTERS.minPrice ||
      filters.maxPrice < INITIAL_FILTERS.maxPrice
    ) {
      chips.push({
        id: "price",
        label: `$${filters.minPrice} - $${
          filters.maxPrice >= 4500 ? "4,500+" : filters.maxPrice
        }`,
        onRemove: () =>
          handleFilterChange({
            minPrice: INITIAL_FILTERS.minPrice,
            maxPrice: INITIAL_FILTERS.maxPrice,
          }),
      });
    }

    if (filters.beds !== null) {
      chips.push({
        id: "beds",
        label: filters.beds === 0 ? "Studio" : `${filters.beds}+ Beds`,
        onRemove: () => handleFilterChange({ beds: null }),
      });
    }

    if (filters.baths !== null) {
      chips.push({
        id: "baths",
        label: `${filters.baths}+ Baths`,
        onRemove: () => handleFilterChange({ baths: null }),
      });
    }

    filters.propertyTypes.forEach((type) => {
      chips.push({
        id: `type-${type}`,
        label: type,
        onRemove: () =>
          handleFilterChange({
            propertyTypes: filters.propertyTypes.filter((t) => t !== type),
          }),
      });
    });

    if (
      filters.minSqft > INITIAL_FILTERS.minSqft ||
      filters.maxSqft < INITIAL_FILTERS.maxSqft
    ) {
      chips.push({
        id: "sqft",
        label: `${filters.minSqft} - ${
          filters.maxSqft >= 2800 ? "2,800+" : filters.maxSqft
        } sq ft`,
        onRemove: () =>
          handleFilterChange({
            minSqft: INITIAL_FILTERS.minSqft,
            maxSqft: INITIAL_FILTERS.maxSqft,
          }),
      });
    }

    filters.amenities.forEach((amenityId) => {
      const match = AMENITIES_LIST.find((a) => a.id === amenityId);
      chips.push({
        id: `amenity-${amenityId}`,
        label: match ? match.label : amenityId.replace(/_/g, " "),
        onRemove: () =>
          handleFilterChange({
            amenities: filters.amenities.filter((id) => id !== amenityId),
          }),
      });
    });

    return chips;
  }, [filters]);

  const activeCityName = filters.locationQuery.trim() || "Wrocław";

  return (
    <div className="min-h-full bg-muted/30 pb-16">
      {/* 1. Page Header matching Overview page typography */}
      <header className="border-b border-border/60 bg-background/50 backdrop-blur-xs">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-3 py-8 sm:px-4 lg:px-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              {/* Display font title */}
              <div className="flex items-center gap-2.5">
                <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                  Browse Rental Listings
                </h1>
                {/* <Badge
                  variant="outline"
                  className="hidden sm:inline-flex gap-1 border-primary/20 bg-primary/5 text-primary text-xs font-semibold"
                >
                  <CompassIcon className="size-3 text-primary" />
                  Primary View
                </Badge> */}
              </div>
              {/* Lighter meta text below */}
              <p className="mt-1.5 text-sm text-muted-foreground">
                Discover modern verified flats, suites, and lofts with instant
                filtering and transparent pricing.
              </p>
            </div>

            {/* Right side helper controls */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowSkeletonDemo((prev) => !prev)}
                className="text-xs h-9 min-h-[44px] gap-1.5"
                title="Preview skeleton shimmer state"
              >
                <EyeIcon className="size-3.5 text-muted-foreground" />
                <span>
                  {showSkeletonDemo ? "Hide Skeleton" : "Preview Skeleton"}
                </span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="text-xs h-9 min-h-[44px] gap-1.5"
                render={
                  <Link href="/explore" className="flex items-center gap-1.5" />
                }
              >
                <MapIcon className="size-3.5 text-primary" />
                <span>Interactive Map</span>
              </Button>
            </div>
          </div>

          {/* Result Count and Active Filter Chips */}
          <div className="mt-2 flex flex-col gap-2.5 pt-2 border-t border-border/40">
            <div className="flex flex-wrap items-center justify-between gap-2">
              {/* Result count */}
              <span className="text-sm font-semibold tracking-tight text-foreground">
                {filteredProperties.length}{" "}
                {filteredProperties.length === 1 ? "place" : "places"} in{" "}
                {activeCityName}
              </span>

              {activeChips.length > 0 && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-destructive transition-colors p-1"
                >
                  <RotateCcwIcon className="size-3" />
                  <span>Reset all filters ({activeChips.length})</span>
                </button>
              )}
            </div>

            {/* Removable Pill Chips */}
            {activeChips.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {activeChips.map((chip) => (
                  <span
                    key={chip.id}
                    className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary shadow-2xs transition-all animate-in fade-in zoom-in-95 duration-150"
                  >
                    <span>{chip.label}</span>
                    <button
                      type="button"
                      aria-label={`Remove filter ${chip.label}`}
                      onClick={chip.onRemove}
                      className="flex size-5 items-center justify-center rounded-full text-primary/70 hover:bg-primary/20 hover:text-primary transition-colors"
                    >
                      <XIcon className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. Sticky Filter & Sort Bar */}
      <BrowseFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenAllFilters={() => setIsFilterDrawerOpen(true)}
        totalCount={filteredProperties.length}
      />

      {/* 3. Slide-over Filter Drawer (housing full FilterSidebar) */}
      <FilterDrawer
        open={isFilterDrawerOpen}
        onOpenChange={setIsFilterDrawerOpen}
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        totalCount={filteredProperties.length}
      />

      {/* 4. Main Listing Content Area */}
      <main className="mx-auto w-full max-w-7xl px-3 py-8 sm:px-4 lg:px-6">
        {/* Skeleton Shimmer Loading State */}
        {showSkeletonDemo || isLoading ? (
          <div
            className={
              viewMode === "list"
                ? "flex flex-col gap-4"
                : "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            }
          >
            {Array.from({ length: 8 }).map((_, idx) => (
              <RentalCardSkeleton key={idx} viewMode={viewMode} />
            ))}
          </div>
        ) : filteredProperties.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card/60 p-12 text-center shadow-xs">
            <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
              <SparklesIcon className="size-7" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              No listings match your filters
            </h2>
            <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
              We couldn't find any rentals matching your exact search criteria.
              Try expanding your price range, choosing different bedroom
              options, or resetting your filters.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <Button
                type="button"
                onClick={handleResetFilters}
                className="min-h-[44px] gap-2 rounded-lg bg-primary px-5 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90"
              >
                <RotateCcwIcon className="size-3.5" />
                <span>Reset all filters</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFilterDrawerOpen(true)}
                className="min-h-[44px] gap-2 rounded-lg text-xs"
              >
                <SlidersHorizontalIcon className="size-3.5" />
                <span>Adjust filters</span>
              </Button>
            </div>
          </div>
        ) : (
          /* Listing Grid or List View */
          <div>
            <div
              className={
                viewMode === "list"
                  ? "flex flex-col gap-4"
                  : "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              }
            >
              {paginatedListings.map((property) => (
                <RentalCard
                  key={property.id}
                  property={property}
                  viewMode={viewMode}
                  showCarousel={true}
                  onClickPin={() => {
                    // Navigate to map view focused on this property
                    window.location.href = `/explore`;
                  }}
                />
              ))}
            </div>

            {/* 5. Accessible Pagination Controls */}
            <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/70 pt-6 sm:flex-row">
              {/* Results Range Information */}
              <p className="text-xs text-muted-foreground">
                Showing{" "}
                <span className="font-semibold text-foreground">
                  {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-foreground">
                  {Math.min(
                    currentPage * ITEMS_PER_PAGE,
                    filteredProperties.length,
                  )}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-foreground">
                  {filteredProperties.length}
                </span>{" "}
                verified listings
              </p>

              {/* Numbered Pager with min 44x44px touch targets */}
              {totalPages > 1 && (
                <nav
                  aria-label="Pagination Navigation"
                  className="flex items-center gap-1.5"
                >
                  {/* Previous Button */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    aria-label="Go to previous page"
                    disabled={currentPage === 1}
                    onClick={() => {
                      setCurrentPage((p) => Math.max(1, p - 1));
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="min-h-[44px] min-w-[44px] rounded-lg px-2.5 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <ChevronLeftIcon className="size-4 mr-1" />
                    <span className="hidden sm:inline">Previous</span>
                  </Button>

                  {/* Page numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (pageNum) => (
                      <Button
                        key={pageNum}
                        type="button"
                        variant={
                          pageNum === currentPage ? "default" : "outline"
                        }
                        size="sm"
                        aria-label={`Page ${pageNum}`}
                        aria-current={
                          pageNum === currentPage ? "page" : undefined
                        }
                        onClick={() => {
                          setCurrentPage(pageNum);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className={`min-h-[44px] min-w-[44px] rounded-lg text-xs font-medium transition-all ${
                          pageNum === currentPage
                            ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {pageNum}
                      </Button>
                    ),
                  )}

                  {/* Next Button */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    aria-label="Go to next page"
                    disabled={currentPage === totalPages}
                    onClick={() => {
                      setCurrentPage((p) => Math.min(totalPages, p + 1));
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="min-h-[44px] min-w-[44px] rounded-lg px-2.5 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRightIcon className="size-4 ml-1" />
                  </Button>
                </nav>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
