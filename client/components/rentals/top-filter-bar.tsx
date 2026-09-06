"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  BathIcon,
  BedDoubleIcon,
  CheckIcon,
  ChevronDownIcon,
  Columns2Icon,
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
import { formatPriceValue } from "@/lib/utils";

export type ViewMode = "split" | "list-focus" | "map-focus";

interface TopFilterBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onOpenMobileFilters: () => void;
  totalCount: number;
  hideBrandLogo?: boolean;
}

type OpenDropdown = "minPrice" | "maxPrice" | "beds" | "baths" | "propertyType" | null;

const PRICE_PRESETS = [1000, 1500, 2000, 2500, 3000, 3500, 4500];
const PROPERTY_TYPES: PropertyType[] = [
  "Apartment",
  "House",
  "Condo",
  "Townhouse",
  "Studio",
  "Loft",
];

export function TopFilterBar({
  filters,
  onFilterChange,
  onResetFilters,
  viewMode,
  onViewModeChange,
  onOpenMobileFilters,
  totalCount,
  hideBrandLogo = false,
}: TopFilterBarProps) {
  const [openDropdown, setOpenDropdown] = useState<OpenDropdown>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
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

  const toggleDropdown = (name: OpenDropdown) => {
    setOpenDropdown((current) => (current === name ? null : name));
  };

  const isMinPriceActive = filters.minPrice > INITIAL_FILTERS.minPrice;
  const isMaxPriceActive = filters.maxPrice < INITIAL_FILTERS.maxPrice;
  const isBedsActive = filters.beds !== null;
  const isBathsActive = filters.baths !== null;
  const isTypeActive = filters.propertyTypes.length > 0;

  const hasAnyFilterActive =
    isMinPriceActive ||
    isMaxPriceActive ||
    isBedsActive ||
    isBathsActive ||
    isTypeActive ||
    filters.locationQuery !== "" ||
    filters.amenities.length > 0;

  return (
    <header
      ref={containerRef}
      className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-card/95 px-4 backdrop-blur-md transition-colors sm:px-6"
    >
      <div className="flex items-center gap-2.5 overflow-x-auto py-2 scrollbar-none sm:gap-3 flex-1 min-w-0 mr-3">
        {/* Brand Home Link */}
        <Link
          href="/"
          className="flex items-center gap-2 mr-1 shrink-0 group"
          title="Return to Home"
        >
          <Image
            src="/logo.svg"
            alt="Logo"
            width={28}
            height={28}
            className="size-7 transition-transform group-hover:scale-105"
          />
          <span className="font-bold text-sm tracking-tight text-foreground hidden xl:inline">
            Chata
          </span>
        </Link>
        {/* Brand Home Link (standalone mode only) */}
        {!hideBrandLogo && (
          <Link
            href="/"
            className="flex items-center gap-2 mr-1 shrink-0 group"
            title="Return to Home"
          >
            <Image
              src="/logo.svg"
              alt="Logo"
              width={28}
              height={28}
              className="size-7 transition-transform group-hover:scale-105"
            />
            <span className="font-bold text-sm tracking-tight text-foreground hidden xl:inline">
              Chata
            </span>
          </Link>
        )}

        {/* Quick Location Search Input */}
        <div className="relative min-w-[190px] max-w-[260px] shrink-0">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search city or neighborhood..."
            value={filters.locationQuery}
            onChange={(e) => onFilterChange({ locationQuery: e.target.value })}
            className="h-9 w-full rounded-full border border-border bg-background pl-9 pr-8 text-xs placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          {filters.locationQuery && (
            <button
              type="button"
              onClick={() => onFilterChange({ locationQuery: "" })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <XIcon className="size-3.5" />
            </button>
          )}
        </div>

        <div className="h-5 w-px bg-border/80 shrink-0 hidden md:block" />

        {/* Quick-filter Pills Container */}
        <div className="hidden items-center gap-2 md:flex shrink-0">
          {/* Min Price Dropdown Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleDropdown("minPrice")}
              className={`flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-all ${
                isMinPriceActive
                  ? "border border-primary bg-primary/10 text-primary shadow-2xs"
                  : "border border-border/80 bg-background text-foreground hover:border-border hover:bg-muted/50"
              }`}
            >
              <span>
                {isMinPriceActive ? `Min $${filters.minPrice}` : "Min Price"}
              </span>
              <ChevronDownIcon
                className={`size-3.5 text-muted-foreground transition-transform duration-200 ${
                  openDropdown === "minPrice" ? "rotate-180" : ""
                }`}
              />
            </button>

            {openDropdown === "minPrice" && (
              <div className="absolute left-0 top-full mt-2 w-56 rounded-xl border border-border bg-popover p-3 text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95 duration-150 z-50">
                <p className="mb-2 text-xs font-semibold text-muted-foreground">
                  Minimum Monthly Rent
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {PRICE_PRESETS.map((price) => (
                    <button
                      key={price}
                      type="button"
                      onClick={() => {
                        onFilterChange({ minPrice: price });
                        setOpenDropdown(null);
                      }}
                      className={`rounded-md px-2 py-1.5 text-xs text-left transition-colors ${
                        filters.minPrice === price
                          ? "bg-primary text-primary-foreground font-semibold"
                          : "hover:bg-muted text-foreground"
                      }`}
                    >
                      ${price.toLocaleString()}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      onFilterChange({ minPrice: INITIAL_FILTERS.minPrice });
                      setOpenDropdown(null);
                    }}
                    className="col-span-2 mt-1 rounded-md px-2 py-1 text-center text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    Reset Min Price
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Max Price Dropdown Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleDropdown("maxPrice")}
              className={`flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-all ${
                isMaxPriceActive
                  ? "border border-primary bg-primary/10 text-primary shadow-2xs"
                  : "border border-border/80 bg-background text-foreground hover:border-border hover:bg-muted/50"
              }`}
            >
              <span>
                {isMaxPriceActive ? `Max $${filters.maxPrice}` : "Max Price"}
              </span>
              <ChevronDownIcon
                className={`size-3.5 text-muted-foreground transition-transform duration-200 ${
                  openDropdown === "maxPrice" ? "rotate-180" : ""
                }`}
              />
            </button>

            {openDropdown === "maxPrice" && (
              <div className="absolute left-0 top-full mt-2 w-56 rounded-xl border border-border bg-popover p-3 text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95 duration-150 z-50">
                <p className="mb-2 text-xs font-semibold text-muted-foreground">
                  Maximum Monthly Rent
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {PRICE_PRESETS.map((price) => (
                    <button
                      key={price}
                      type="button"
                      onClick={() => {
                        onFilterChange({ maxPrice: price });
                        setOpenDropdown(null);
                      }}
                      className={`rounded-md px-2 py-1.5 text-xs text-left transition-colors ${
                        filters.maxPrice === price
                          ? "bg-primary text-primary-foreground font-semibold"
                          : "hover:bg-muted text-foreground"
                      }`}
                    >
                      ${price.toLocaleString()}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      onFilterChange({ maxPrice: INITIAL_FILTERS.maxPrice });
                      setOpenDropdown(null);
                    }}
                    className="col-span-2 mt-1 rounded-md px-2 py-1 text-center text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    Any Max
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Beds Dropdown Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleDropdown("beds")}
              className={`flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-all ${
                isBedsActive
                  ? "border border-primary bg-primary/10 text-primary shadow-2xs"
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
                  Number of Bedrooms
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

          {/* Baths Dropdown Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleDropdown("baths")}
              className={`flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-all ${
                isBathsActive
                  ? "border border-primary bg-primary/10 text-primary shadow-2xs"
                  : "border border-border/80 bg-background text-foreground hover:border-border hover:bg-muted/50"
              }`}
            >
              <BathIcon className="size-3.5 text-muted-foreground" />
              <span>
                {filters.baths === null ? "Baths" : `${filters.baths}+ Baths`}
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
                  Number of Bathrooms
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

          {/* Property Type Dropdown Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleDropdown("propertyType")}
              className={`flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-all ${
                isTypeActive
                  ? "border border-primary bg-primary/10 text-primary shadow-2xs"
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
                  Select Property Types
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
                            ? filters.propertyTypes.filter((t) => t !== type)
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
                        {isSelected && <CheckIcon className="size-3.5 text-primary" />}
                      </button>
                    );
                  })}
                  {filters.propertyTypes.length > 0 && (
                    <button
                      type="button"
                      onClick={() => onFilterChange({ propertyTypes: [] })}
                      className="mt-1 text-center text-[11px] text-muted-foreground hover:text-primary hover:underline"
                    >
                      Clear Types
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Clear Filters Button */}
        {hasAnyFilterActive && (
          <button
            type="button"
            onClick={onResetFilters}
            className="flex h-8 items-center gap-1 rounded-md px-2 text-xs font-medium text-muted-foreground hover:text-destructive transition-colors shrink-0"
          >
            <RotateCcwIcon className="size-3" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        )}
      </div>

      {/* Right Controls: Mobile Filter Button & View Toggle */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Mobile Filter Sheet Trigger (< md) */}
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenMobileFilters}
          className="flex md:hidden h-9 items-center gap-1.5 rounded-full px-3 text-xs"
        >
          <SlidersHorizontalIcon className="size-3.5" />
          <span>Filters</span>
          {hasAnyFilterActive && (
            <span className="size-2 rounded-full bg-primary" />
          )}
        </Button>

        {/* View Toggle Control on far right */}
        <div className="flex items-center rounded-lg border border-border bg-muted/40 p-0.5 text-muted-foreground">
          <Link
            href="/rentals"
            title="Grid View (Browse Listings)"
            className="flex h-8 items-center gap-1 rounded-md px-2.5 text-xs font-medium transition-colors hover:text-foreground"
          >
            <LayoutGridIcon className="size-3.5" />
            <span className="hidden lg:inline">Grid</span>
          </Link>

          <button
            type="button"
            title="Split View (Map + List)"
            onClick={() => onViewModeChange("split")}
            className={`flex h-8 items-center gap-1 rounded-md px-2.5 text-xs font-medium transition-colors ${
              viewMode === "split"
                ? "bg-card text-foreground shadow-2xs"
                : "hover:text-foreground"
            }`}
          >
            <Columns2Icon className="size-3.5" />
            <span className="hidden lg:inline">Split</span>
          </button>

          <button
            type="button"
            title="List Focus"
            onClick={() => onViewModeChange("list-focus")}
            className={`flex h-8 items-center gap-1 rounded-md px-2.5 text-xs font-medium transition-colors ${
              viewMode === "list-focus"
                ? "bg-card text-foreground shadow-2xs"
                : "hover:text-foreground"
            }`}
          >
            <ListIcon className="size-3.5" />
            <span className="hidden lg:inline">List</span>
          </button>

          <button
            type="button"
            title="Map Focus"
            onClick={() => onViewModeChange("map-focus")}
            className={`flex h-8 items-center gap-1 rounded-md px-2.5 text-xs font-medium transition-colors ${
              viewMode === "map-focus"
                ? "bg-card text-foreground shadow-2xs"
                : "hover:text-foreground"
            }`}
          >
            <MapIcon className="size-3.5" />
            <span className="hidden lg:inline">Map</span>
          </button>
        </div>
      </div>
    </header>
  );
}
