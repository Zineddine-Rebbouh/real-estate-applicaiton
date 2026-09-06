"use client";

import { SlidersHorizontalIcon, RotateCcwIcon, CheckIcon } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FilterState, INITIAL_FILTERS } from "@/src/data/rentals-data";
import { FilterSidebar } from "./filter-sidebar";

interface FilterDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  totalCount: number;
}

export function FilterDrawer({
  open,
  onOpenChange,
  filters,
  onFilterChange,
  onResetFilters,
  totalCount,
}: FilterDrawerProps) {
  // Count active filters
  const activeCount = [
    filters.minPrice > INITIAL_FILTERS.minPrice ||
      filters.maxPrice < INITIAL_FILTERS.maxPrice,
    filters.beds !== null,
    filters.baths !== null,
    filters.propertyTypes.length > 0,
    filters.minSqft > INITIAL_FILTERS.minSqft ||
      filters.maxSqft < INITIAL_FILTERS.maxSqft,
    filters.amenities.length > 0,
    Boolean(filters.locationQuery.trim()),
    filters.petFriendlyOnly,
    filters.parkingOnly,
  ].filter(Boolean).length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex h-full w-full flex-col p-0 sm:max-w-md md:max-w-lg border-l border-border bg-card shadow-2xl transition-all duration-200"
      >
        {/* Drawer Header */}
        <SheetHeader className="flex h-16 shrink-0 flex-row items-center justify-between border-b border-border/80 px-6 py-0">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <SlidersHorizontalIcon className="size-4" />
            </div>
            <div>
              <SheetTitle className="text-base font-semibold tracking-tight text-foreground">
                All Filters
              </SheetTitle>
              <p className="text-xs text-muted-foreground">
                Refine rental properties by specific criteria
              </p>
            </div>
            {activeCount > 0 && (
              <Badge variant="secondary" className="ml-1.5 px-2 py-0.5 text-xs font-semibold">
                {activeCount} active
              </Badge>
            )}
          </div>
        </SheetHeader>

        {/* Scrollable Filter Body */}
        <div className="flex-1 overflow-y-auto">
          <FilterSidebar
            filters={filters}
            onFilterChange={onFilterChange}
            onResetFilters={onResetFilters}
            isMobileDrawer={true}
            className="w-full border-none bg-transparent"
          />
        </div>

        {/* Sticky Drawer Footer */}
        <div className="flex h-20 shrink-0 items-center justify-between gap-3 border-t border-border/80 bg-card/95 px-6 py-4 backdrop-blur-xs">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            disabled={activeCount === 0}
            className="min-h-[44px] min-w-[44px] text-xs text-muted-foreground hover:text-destructive gap-1.5 px-3"
          >
            <RotateCcwIcon className="size-3.5" />
            <span>Reset all</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="min-h-[44px] px-6 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
          >
            <span>Show {totalCount} {totalCount === 1 ? "Place" : "Places"}</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
