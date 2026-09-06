"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowUpDownIcon,
  BathIcon,
  BedDoubleIcon,
  CheckIcon,
  ChevronDownIcon,
  DollarSignIcon,
  HomeIcon,
  LayoutGridIcon,
  ListIcon,
  MapIcon,
  RotateCcwIcon,
  SearchIcon,
  SlidersHorizontalIcon,
  XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FilterState,
  INITIAL_FILTERS,
  PropertyType,
} from "@/src/data/rentals-data";

export type BrowseSortOption =
  | "popular"
  | "newest"
  | "price-asc"
  | "price-desc"
  | "rating";

export type BrowseViewMode = "grid" | "list";

interface BrowseFilterBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  sortBy: BrowseSortOption;
  onSortChange: (sort: BrowseSortOption) => void;
  viewMode: BrowseViewMode;
  onViewModeChange: (mode: BrowseViewMode) => void;
  onOpenAllFilters: () => void;
  totalCount: number;
}

type OpenDropdown = "price" | "beds" | "baths" | "propertyType" | null;

const PRICE_PRESETS = [1000, 1500, 2000, 2500, 3000, 3500, 4500];
const PROPERTY_TYPES: PropertyType[] = [
  "Apartment",
  "House",
  "Condo",
  "Townhouse",
  "Studio",
  "Loft",
];

export function BrowseFilterBar({
  filters,
  onFilterChange,
  onResetFilters,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  onOpenAllFilters,
  totalCount,
}: BrowseFilterBarProps) {
  const [openDropdown, setOpenDropdown] = useState<OpenDropdown>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Detect scroll to collapse sticky filter bar
  useEffect(() => {
    const handleScroll = () => {
      // Collapse when scrolled past the page header
      setIsScrolled(window.scrollY > 140);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleDropdown = (name: OpenDropdown) => {
    setOpenDropdown((curr) => (curr === name ? null : name));
  };

  const isPriceActive =
    filters.minPrice > INITIAL_FILTERS.minPrice ||
    filters.maxPrice < INITIAL_FILTERS.maxPrice;
  const isBedsActive = filters.beds !== null;
  const isBathsActive = filters.baths !== null;
  const isTypeActive = filters.propertyTypes.length > 0;

  const activeFiltersCount = [
    isPriceActive,
    isBedsActive,
    isBathsActive,
    isTypeActive,
    filters.minSqft > INITIAL_FILTERS.minSqft ||
      filters.maxSqft < INITIAL_FILTERS.maxSqft,
    filters.amenities.length > 0,
    Boolean(filters.locationQuery.trim()),
    filters.petFriendlyOnly,
    filters.parkingOnly,
  ].filter(Boolean).length;

  return (
    <div
      ref={containerRef}
      className={`sticky top-[72px] z-30 w-full border-b border-border bg-card/95 backdrop-blur-md transition-all duration-200 ${
        isScrolled ? "shadow-md py-1.5" : "py-2.5"
      }`}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-3 sm:px-4 lg:px-6">
        {/* Left Side: Either Compact or Full Quick Filter Pills */}
        {isScrolled ? (
          /* Collapsed Compact State on Scroll */
          <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none min-w-0">
            {/* Quick All Filters trigger button with count */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onOpenAllFilters}
              className="min-h-[44px] gap-2 rounded-full border-primary/30 bg-primary/5 px-4 text-xs font-semibold text-primary hover:bg-primary/10 shadow-2xs shrink-0"
            >
              <SlidersHorizontalIcon className="size-3.5" />
              <span>
                Filters{" "}
                {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ""}
              </span>
            </Button>

            {/* Quick search display or input */}
            <div className="relative min-w-[160px] sm:min-w-[220px] max-w-[280px] shrink-0">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search city, neighborhood..."
                value={filters.locationQuery}
                onChange={(e) =>
                  onFilterChange({ locationQuery: e.target.value })
                }
                className="h-9 w-full rounded-full border border-border bg-background pl-8 pr-7 text-xs placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {filters.locationQuery && (
                <button
                  type="button"
                  aria-label="Clear location search"
                  onClick={() => onFilterChange({ locationQuery: "" })}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                >
                  <XIcon className="size-3" />
                </button>
              )}
            </div>

            {/* Total Results Summary in compact mode */}
            <span className="hidden md:inline text-xs font-medium text-muted-foreground shrink-0 pl-1">
              {totalCount} {totalCount === 1 ? "listing" : "listings"}
            </span>
          </div>
        ) : (
          /* Normal Expanded Quick Filter Pills */
          <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none min-w-0 flex-1">
            {/* Location Search Input */}
            <div className="relative min-w-[170px] sm:min-w-[220px] max-w-[280px] shrink-0">
              <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search city or neighborhood..."
                value={filters.locationQuery}
                onChange={(e) =>
                  onFilterChange({ locationQuery: e.target.value })
                }
                className="h-10 w-full rounded-full border border-border bg-background pl-9 pr-8 text-xs placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {filters.locationQuery && (
                <button
                  type="button"
                  aria-label="Clear location search"
                  onClick={() => onFilterChange({ locationQuery: "" })}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                >
                  <XIcon className="size-3.5" />
                </button>
              )}
            </div>

            <div className="hidden md:block h-6 w-px bg-border/70 shrink-0 mx-0.5" />

            {/* Quick Pills (desktop & tablet) */}
            <div className="hidden sm:flex items-center gap-2 shrink-0">
              {/* Price Pill Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => toggleDropdown("price")}
                  className={`flex min-h-[44px] items-center gap-1.5 rounded-full px-3.5 text-xs font-medium transition-all ${
                    isPriceActive
                      ? "border border-primary bg-primary/10 text-primary shadow-2xs font-semibold"
                      : "border border-border/80 bg-background text-foreground hover:border-border hover:bg-muted/50"
                  }`}
                >
                  <DollarSignIcon className="size-3.5 text-muted-foreground" />
                  <span>
                    {isPriceActive
                      ? `$${filters.minPrice} - $${
                          filters.maxPrice >= 4500 ? "4.5k+" : filters.maxPrice
                        }`
                      : "Price"}
                  </span>
                  <ChevronDownIcon
                    className={`size-3.5 text-muted-foreground transition-transform duration-200 ${
                      openDropdown === "price" ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openDropdown === "price" && (
                  <div className="absolute left-0 top-full mt-2 w-64 rounded-xl border border-border bg-popover p-3 text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95 duration-150 z-50">
                    <p className="mb-2 text-xs font-semibold text-muted-foreground">
                      Quick Price Ranges
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { label: "Under $1,500", min: 800, max: 1500 },
                        { label: "$1,500 - $2,500", min: 1500, max: 2500 },
                        { label: "$2,500 - $3,500", min: 2500, max: 3500 },
                        { label: "$3,500+", min: 3500, max: 4500 },
                      ].map((range) => (
                        <button
                          key={range.label}
                          type="button"
                          onClick={() => {
                            onFilterChange({
                              minPrice: range.min,
                              maxPrice: range.max,
                            });
                            setOpenDropdown(null);
                          }}
                          className={`rounded-lg px-2 py-1.5 text-xs text-left transition-colors ${
                            filters.minPrice === range.min &&
                            filters.maxPrice === range.max
                              ? "bg-primary text-primary-foreground font-semibold"
                              : "hover:bg-muted text-foreground"
                          }`}
                        >
                          {range.label}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          onFilterChange({
                            minPrice: INITIAL_FILTERS.minPrice,
                            maxPrice: INITIAL_FILTERS.maxPrice,
                          });
                          setOpenDropdown(null);
                        }}
                        className="col-span-2 mt-1 rounded-md px-2 py-1.5 text-center text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        Reset Price Range
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Beds Pill Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => toggleDropdown("beds")}
                  className={`flex min-h-[44px] items-center gap-1.5 rounded-full px-3.5 text-xs font-medium transition-all ${
                    isBedsActive
                      ? "border border-primary bg-primary/10 text-primary shadow-2xs font-semibold"
                      : "border border-border/80 bg-background text-foreground hover:border-border hover:bg-muted/50"
                  }`}
                >
                  <BedDoubleIcon className="size-3.5 text-muted-foreground" />
                  <span>
                    {filters.beds === null
                      ? "Beds"
                      : filters.beds === 0
                        ? "Studio"
                        : `${filters.beds}+ Beds`}
                  </span>
                  <ChevronDownIcon
                    className={`size-3.5 text-muted-foreground transition-transform duration-200 ${
                      openDropdown === "beds" ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openDropdown === "beds" && (
                  <div className="absolute left-0 top-full mt-2 w-48 rounded-xl border border-border bg-popover p-2.5 text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95 duration-150 z-50">
                    <p className="mb-2 px-1 text-xs font-semibold text-muted-foreground">
                      Bedrooms
                    </p>
                    <div className="flex flex-col gap-1">
                      {[
                        { label: "Any Bedrooms", val: null },
                        { label: "Studio", val: 0 },
                        { label: "1+ Bedroom", val: 1 },
                        { label: "2+ Bedrooms", val: 2 },
                        { label: "3+ Bedrooms", val: 3 },
                        { label: "4+ Bedrooms", val: 4 },
                      ].map((opt) => (
                        <button
                          key={String(opt.val)}
                          type="button"
                          onClick={() => {
                            onFilterChange({ beds: opt.val });
                            setOpenDropdown(null);
                          }}
                          className={`flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs text-left transition-colors ${
                            filters.beds === opt.val
                              ? "bg-primary text-primary-foreground font-semibold"
                              : "hover:bg-muted text-foreground"
                          }`}
                        >
                          <span>{opt.label}</span>
                          {filters.beds === opt.val && (
                            <CheckIcon className="size-3.5" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Baths Pill Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => toggleDropdown("baths")}
                  className={`flex min-h-[44px] items-center gap-1.5 rounded-full px-3.5 text-xs font-medium transition-all ${
                    isBathsActive
                      ? "border border-primary bg-primary/10 text-primary shadow-2xs font-semibold"
                      : "border border-border/80 bg-background text-foreground hover:border-border hover:bg-muted/50"
                  }`}
                >
                  <BathIcon className="size-3.5 text-muted-foreground" />
                  <span>
                    {filters.baths === null
                      ? "Baths"
                      : `${filters.baths}+ Baths`}
                  </span>
                  <ChevronDownIcon
                    className={`size-3.5 text-muted-foreground transition-transform duration-200 ${
                      openDropdown === "baths" ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openDropdown === "baths" && (
                  <div className="absolute left-0 top-full mt-2 w-44 rounded-xl border border-border bg-popover p-2.5 text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95 duration-150 z-50">
                    <p className="mb-2 px-1 text-xs font-semibold text-muted-foreground">
                      Bathrooms
                    </p>
                    <div className="flex flex-col gap-1">
                      {[
                        { label: "Any Bathrooms", val: null },
                        { label: "1+ Bathroom", val: 1 },
                        { label: "2+ Bathrooms", val: 2 },
                        { label: "3+ Bathrooms", val: 3 },
                      ].map((opt) => (
                        <button
                          key={String(opt.val)}
                          type="button"
                          onClick={() => {
                            onFilterChange({ baths: opt.val });
                            setOpenDropdown(null);
                          }}
                          className={`flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs text-left transition-colors ${
                            filters.baths === opt.val
                              ? "bg-primary text-primary-foreground font-semibold"
                              : "hover:bg-muted text-foreground"
                          }`}
                        >
                          <span>{opt.label}</span>
                          {filters.baths === opt.val && (
                            <CheckIcon className="size-3.5" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Property Type Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => toggleDropdown("propertyType")}
                  className={`flex min-h-[44px] items-center gap-1.5 rounded-full px-3.5 text-xs font-medium transition-all ${
                    isTypeActive
                      ? "border border-primary bg-primary/10 text-primary shadow-2xs font-semibold"
                      : "border border-border/80 bg-background text-foreground hover:border-border hover:bg-muted/50"
                  }`}
                >
                  <HomeIcon className="size-3.5 text-muted-foreground" />
                  <span>
                    {filters.propertyTypes.length === 0
                      ? "Property Type"
                      : filters.propertyTypes.length === 1
                        ? filters.propertyTypes[0]
                        : `${filters.propertyTypes.length} Types`}
                  </span>
                  <ChevronDownIcon
                    className={`size-3.5 text-muted-foreground transition-transform duration-200 ${
                      openDropdown === "propertyType" ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openDropdown === "propertyType" && (
                  <div className="absolute left-0 top-full mt-2 w-52 rounded-xl border border-border bg-popover p-3 text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95 duration-150 z-50">
                    <p className="mb-2 text-xs font-semibold text-muted-foreground">
                      Property Types
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {PROPERTY_TYPES.map((type) => {
                        const isSelected = filters.propertyTypes.includes(type);
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => {
                              const updated = isSelected
                                ? filters.propertyTypes.filter(
                                    (t) => t !== type,
                                  )
                                : [...filters.propertyTypes, type];
                              onFilterChange({ propertyTypes: updated });
                            }}
                            className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                              isSelected
                                ? "bg-primary/10 text-primary font-semibold"
                                : "hover:bg-muted text-foreground"
                            }`}
                          >
                            <span>{type}</span>
                            {isSelected && (
                              <CheckIcon className="size-3.5 text-primary" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* All Filters Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onOpenAllFilters}
              className="min-h-[44px] gap-2 rounded-full border-border/80 px-4 text-xs font-medium hover:bg-muted shrink-0"
            >
              <SlidersHorizontalIcon className="size-3.5" />
              <span>All Filters</span>
              {activeFiltersCount > 0 && (
                <Badge
                  variant="secondary"
                  className="rounded-full bg-primary text-primary-foreground px-1.5 py-0 text-[10px]"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>
        )}

        {/* Right Side: Sort Dropdown & View Mode Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Sort Dropdown */}
          <div className="relative flex items-center">
            <div className="relative flex min-h-[44px] items-center rounded-lg border border-border bg-background px-2.5 text-xs text-foreground hover:border-primary/40 focus-within:ring-2 focus-within:ring-primary/20">
              <ArrowUpDownIcon className="size-3.5 text-muted-foreground mr-1.5 pointer-events-none" />
              <select
                value={sortBy}
                aria-label="Sort listings by"
                onChange={(e) =>
                  onSortChange(e.target.value as BrowseSortOption)
                }
                className="h-8 bg-transparent pr-4 text-xs font-medium text-foreground focus:outline-none cursor-pointer"
              >
                <option value="popular">Most Popular</option>
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* View Mode Toggle: Grid / List / Map */}
          <div className="flex min-h-[44px] items-center rounded-lg border border-border bg-muted/40 p-0.5 text-muted-foreground">
            {/* Grid view button */}
            <button
              type="button"
              title="Grid View"
              aria-label="Switch to Grid View"
              onClick={() => onViewModeChange("grid")}
              className={`flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors ${
                viewMode === "grid"
                  ? "bg-card text-foreground shadow-2xs"
                  : "hover:text-foreground"
              }`}
            >
              <LayoutGridIcon className="size-3.5" />
              <span className="hidden sm:inline">Grid</span>
            </button>

            {/* List view button */}
            <button
              type="button"
              title="List View"
              aria-label="Switch to List View"
              onClick={() => onViewModeChange("list")}
              className={`flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors ${
                viewMode === "list"
                  ? "bg-card text-foreground shadow-2xs"
                  : "hover:text-foreground"
              }`}
            >
              <ListIcon className="size-3.5" />
              <span className="hidden sm:inline">List</span>
            </button>

            {/* Map link button */}
            {/* Map link button — always links to /explore (never a local viewMode state) */}
            {/* Map link button — always links to /explore */}
            <Link
              href="/explore"
              title="Map Search View"
              aria-label="Switch to Map Search View"
              className="flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors hover:text-foreground"
            >
              <MapIcon className="size-3.5" />
              <span className="hidden sm:inline">Map</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
