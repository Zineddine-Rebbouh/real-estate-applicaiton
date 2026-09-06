"use client";

import { useId, useState } from "react";
import {
  AirVentIcon,
  BathIcon,
  BedDoubleIcon,
  Building2Icon,
  BuildingIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsUpDownIcon,
  DogIcon,
  DoorClosedIcon,
  DumbbellIcon,
  HomeIcon,
  LayersIcon,
  MinusIcon,
  PlusIcon,
  RotateCcwIcon,
  SearchIcon,
  SparklesIcon,
  SunIcon,
  UtensilsIcon,
  WashingMachineIcon,
  WavesIcon,
  WifiIcon,
  ZapIcon,
  MaximizeIcon,
  RefrigeratorIcon,
  CookingPotIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AMENITIES_LIST,
  FilterState,
  INITIAL_FILTERS,
  PropertyType,
} from "@/src/data/rentals-data";

interface FilterSidebarProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
  isMobileDrawer?: boolean;
}

const PROPERTY_TYPE_ITEMS: { type: PropertyType; label: string; icon: any }[] = [
  { type: "Apartment", label: "Apartment", icon: Building2Icon },
  { type: "House", label: "House", icon: HomeIcon },
  { type: "Condo", label: "Condo", icon: BuildingIcon },
  { type: "Townhouse", label: "Townhouse", icon: HomeIcon },
  { type: "Studio", label: "Studio", icon: MaximizeIcon },
  { type: "Loft", label: "Loft", icon: LayersIcon },
];

export function FilterSidebar({
  filters,
  onFilterChange,
  onResetFilters,
  isCollapsed = false,
  onToggleCollapse,
  className = "",
  isMobileDrawer = false,
}: FilterSidebarProps) {
  const [localSearch, setLocalSearch] = useState(filters.locationQuery);

  const getAmenityIcon = (icon: string) => {
    switch (icon) {
      case "washing-machine":
        return <WashingMachineIcon className="size-4 shrink-0" />;
      case "air-vent":
        return <AirVentIcon className="size-4 shrink-0" />;
      case "utensils":
        return <UtensilsIcon className="size-4 shrink-0" />;
      case "wifi":
        return <WifiIcon className="size-4 shrink-0" />;
      case "layers":
        return <LayersIcon className="size-4 shrink-0" />;
      case "door-closed":
        return <DoorClosedIcon className="size-4 shrink-0" />;
      case "microwave":
        return <CookingPotIcon className="size-4 shrink-0" />;
      case "refrigerator":
        return <RefrigeratorIcon className="size-4 shrink-0" />;
      case "waves":
        return <WavesIcon className="size-4 shrink-0" />;
      case "sun":
        return <SunIcon className="size-4 shrink-0" />;
      case "dumbbell":
        return <DumbbellIcon className="size-4 shrink-0" />;
      case "zap":
        return <ZapIcon className="size-4 shrink-0" />;
      case "chevrons-up-down":
        return <ChevronsUpDownIcon className="size-4 shrink-0" />;
      case "dog":
        return <DogIcon className="size-4 shrink-0" />;
      default:
        return <SparklesIcon className="size-4 shrink-0" />;
    }
  };

  const handleTypeToggle = (type: PropertyType) => {
    const isSelected = filters.propertyTypes.includes(type);
    const updated = isSelected
      ? filters.propertyTypes.filter((t) => t !== type)
      : [...filters.propertyTypes, type];
    onFilterChange({ propertyTypes: updated });
  };

  const handleAmenityToggle = (amenityId: string) => {
    const isSelected = filters.amenities.includes(amenityId);
    const updated = isSelected
      ? filters.amenities.filter((id) => id !== amenityId)
      : [...filters.amenities, amenityId];
    onFilterChange({ amenities: updated });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ locationQuery: localSearch });
  };

  if (isCollapsed && !isMobileDrawer) {
    return (
      <aside className="hidden lg:flex flex-col items-center border-r border-border bg-card py-4 px-2 w-14 shrink-0 transition-all duration-200">
        <button
          type="button"
          onClick={onToggleCollapse}
          title="Expand Filter Sidebar"
          className="flex size-10 items-center justify-center rounded-lg border border-border bg-background text-foreground hover:bg-muted transition-colors"
        >
          <ChevronRightIcon className="size-5" />
        </button>
        <span className="mt-8 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground [writing-mode:vertical-lr] rotate-180">
          Filters
        </span>
      </aside>
    );
  }

  return (
    <aside
      className={`flex flex-col border-r border-border bg-card overflow-hidden select-none ${className}`}
    >
      {/* Sidebar Header */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border/70 px-5">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Filters & Criteria
          </h2>
          {(filters.propertyTypes.length > 0 ||
            filters.amenities.length > 0 ||
            filters.beds !== null ||
            filters.baths !== null ||
            filters.minPrice > INITIAL_FILTERS.minPrice ||
            filters.maxPrice < INITIAL_FILTERS.maxPrice) && (
            <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
              Active
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onResetFilters}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            <RotateCcwIcon className="size-3" />
            <span>Reset</span>
          </button>

          {!isMobileDrawer && onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              title="Collapse Filter Sidebar"
              className="hidden lg:flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <ChevronLeftIcon className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Filter Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
        {/* Location Text Search with Icon Button */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Location
          </label>
          <form onSubmit={handleSearchSubmit} className="mt-2 flex items-center gap-1.5">
            <div className="relative flex-1">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="City, district, address..."
                value={localSearch}
                onChange={(e) => {
                  setLocalSearch(e.target.value);
                  onFilterChange({ locationQuery: e.target.value });
                }}
                className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-xs placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <Button
              type="submit"
              size="sm"
              className="h-10 px-3 bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
            >
              <SearchIcon className="size-4" />
            </Button>
          </form>
        </div>

        <div className="h-px bg-border/60" />

        {/* Property Type as a 2-column icon-grid */}
        <div>
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Property Type
            </label>
            {filters.propertyTypes.length > 0 && (
              <span className="text-[11px] text-muted-foreground">
                {filters.propertyTypes.length} selected
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Select one or more living styles
          </p>

          <div className="mt-3 grid grid-cols-2 gap-2">
            {PROPERTY_TYPE_ITEMS.map(({ type, label, icon: Icon }) => {
              const isSelected = filters.propertyTypes.includes(type);
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleTypeToggle(type)}
                  className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-center transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10 text-primary ring-1 ring-primary shadow-xs"
                      : "border-border/80 bg-background text-foreground hover:border-primary/40 hover:bg-muted/30"
                  }`}
                >
                  <Icon className="size-5" />
                  <span className="text-xs font-medium">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="h-px bg-border/60" />

        {/* Price Range as a Dual-handle Slider */}
        <div>
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Monthly Rent
            </label>
            <span className="text-xs font-semibold text-foreground">
              ${filters.minPrice} – ${filters.maxPrice >= 4500 ? "4,500+" : filters.maxPrice}
            </span>
          </div>

          <div className="mt-3 space-y-3">
            {/* Dual slider handles simulation */}
            <div className="relative py-2">
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden relative">
                <div
                  className="absolute top-0 bottom-0 bg-primary rounded-full transition-all"
                  style={{
                    left: `${((filters.minPrice - 800) / (4500 - 800)) * 100}%`,
                    right: `${100 - ((filters.maxPrice - 800) / (4500 - 800)) * 100}%`,
                  }}
                />
              </div>
              {/* Native range inputs layered */}
              <input
                type="range"
                min={800}
                max={4500}
                step={50}
                value={filters.minPrice}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val <= filters.maxPrice - 100) {
                    onFilterChange({ minPrice: val });
                  }
                }}
                className="absolute inset-x-0 top-1.5 h-3 w-full opacity-0 cursor-pointer pointer-events-auto"
              />
              <input
                type="range"
                min={800}
                max={4500}
                step={50}
                value={filters.maxPrice}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val >= filters.minPrice + 100) {
                    onFilterChange({ maxPrice: val });
                  }
                }}
                className="absolute inset-x-0 top-1.5 h-3 w-full opacity-0 cursor-pointer pointer-events-auto"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
              <span>$800</span>
              <span>$2,500</span>
              <span>$4,500+</span>
            </div>
          </div>
        </div>

        <div className="h-px bg-border/60" />

        {/* Beds & Baths Compact Stepper Controls */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Rooms & Layout
          </label>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {/* Beds Stepper */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-foreground flex items-center gap-1">
                <BedDoubleIcon className="size-3.5 text-muted-foreground" /> Beds
              </span>
              <div className="flex h-11 items-center justify-between rounded-lg border border-border bg-background px-1">
                <button
                  type="button"
                  aria-label="Decrease bedrooms"
                  disabled={filters.beds === null}
                  onClick={() => {
                    if (filters.beds === null) return;
                    if (filters.beds <= 1) onFilterChange({ beds: null });
                    else onFilterChange({ beds: filters.beds - 1 });
                  }}
                  className="flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:pointer-events-none"
                >
                  <MinusIcon className="size-3.5" />
                </button>
                <span className="text-xs font-semibold text-foreground">
                  {filters.beds === null ? "Any" : `${filters.beds}+`}
                </span>
                <button
                  type="button"
                  aria-label="Increase bedrooms"
                  onClick={() => {
                    if (filters.beds === null) onFilterChange({ beds: 1 });
                    else if (filters.beds < 4) onFilterChange({ beds: filters.beds + 1 });
                  }}
                  className="flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
                >
                  <PlusIcon className="size-3.5" />
                </button>
              </div>
            </div>

            {/* Baths Stepper */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-foreground flex items-center gap-1">
                <BathIcon className="size-3.5 text-muted-foreground" /> Baths
              </span>
              <div className="flex h-11 items-center justify-between rounded-lg border border-border bg-background px-1">
                <button
                  type="button"
                  aria-label="Decrease bathrooms"
                  disabled={filters.baths === null}
                  onClick={() => {
                    if (filters.baths === null) return;
                    if (filters.baths <= 1) onFilterChange({ baths: null });
                    else onFilterChange({ baths: filters.baths - 1 });
                  }}
                  className="flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:pointer-events-none"
                >
                  <MinusIcon className="size-3.5" />
                </button>
                <span className="text-xs font-semibold text-foreground">
                  {filters.baths === null ? "Any" : `${filters.baths}+`}
                </span>
                <button
                  type="button"
                  aria-label="Increase bathrooms"
                  onClick={() => {
                    if (filters.baths === null) onFilterChange({ baths: 1 });
                    else if (filters.baths < 3) onFilterChange({ baths: filters.baths + 1 });
                  }}
                  className="flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
                >
                  <PlusIcon className="size-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="h-px bg-border/60" />

        {/* Square Feet Dual Slider */}
        <div>
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Square Feet
            </label>
            <span className="text-xs font-semibold text-foreground">
              {filters.minSqft} – {filters.maxSqft >= 2800 ? "2,800+" : filters.maxSqft} sq ft
            </span>
          </div>

          <div className="mt-3 space-y-3">
            <div className="relative py-2">
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden relative">
                <div
                  className="absolute top-0 bottom-0 bg-primary rounded-full transition-all"
                  style={{
                    left: `${((filters.minSqft - 400) / (2800 - 400)) * 100}%`,
                    right: `${100 - ((filters.maxSqft - 400) / (2800 - 400)) * 100}%`,
                  }}
                />
              </div>
              <input
                type="range"
                min={400}
                max={2800}
                step={50}
                value={filters.minSqft}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val <= filters.maxSqft - 100) {
                    onFilterChange({ minSqft: val });
                  }
                }}
                className="absolute inset-x-0 top-1.5 h-3 w-full opacity-0 cursor-pointer pointer-events-auto"
              />
              <input
                type="range"
                min={400}
                max={2800}
                step={50}
                value={filters.maxSqft}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val >= filters.minSqft + 100) {
                    onFilterChange({ maxSqft: val });
                  }
                }}
                className="absolute inset-x-0 top-1.5 h-3 w-full opacity-0 cursor-pointer pointer-events-auto"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
              <span>400 sq ft</span>
              <span>1,600 sq ft</span>
              <span>2,800+ sq ft</span>
            </div>
          </div>
        </div>

        <div className="h-px bg-border/60" />

        {/* Amenities as a wrapped grid of pill/chip toggles */}
        <div>
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Amenities & Perks
            </label>
            {filters.amenities.length > 0 && (
              <button
                type="button"
                onClick={() => onFilterChange({ amenities: [] })}
                className="text-[11px] text-primary hover:underline"
              >
                Clear
              </button>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {AMENITIES_LIST.map(({ id, label, icon }) => {
              const isSelected = filters.amenities.includes(id);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleAmenityToggle(id)}
                  className={`flex min-h-[44px] items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground shadow-2xs"
                      : "border-border/80 bg-background text-foreground hover:border-primary/40 hover:bg-muted/40"
                  }`}
                >
                  {getAmenityIcon(icon)}
                  <span>{label}</span>
                  {isSelected && <CheckIcon className="size-3 ml-0.5" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}

