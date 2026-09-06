"use client";

import { useState } from "react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ListIcon,
  MapIcon,
  SlidersHorizontalIcon,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { FilterState, RentalProperty } from "@/src/data/rentals-data";
import { FilterSidebar } from "./filter-sidebar";
import { ResultsPanel, SortOption } from "./results-panel";

interface MobileBottomSheetProps {
  properties: RentalProperty[];
  totalCount: number;
  selectedPropertyId: string | null;
  hoveredPropertyId: string | null;
  onSelectProperty: (property: RentalProperty) => void;
  onHoverProperty: (id: string | null) => void;
  onResetFilters: () => void;
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  isFilterSheetOpen: boolean;
  onFilterSheetOpenChange: (open: boolean) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

type SheetSnap = "collapsed" | "half" | "full";

export function MobileBottomSheet({
  properties,
  totalCount,
  selectedPropertyId,
  hoveredPropertyId,
  onSelectProperty,
  onHoverProperty,
  onResetFilters,
  filters,
  onFilterChange,
  isFilterSheetOpen,
  onFilterSheetOpenChange,
  sortBy,
  onSortChange,
}: MobileBottomSheetProps) {
  const [snap, setSnap] = useState<SheetSnap>("half");

  const toggleSnap = () => {
    if (snap === "collapsed") setSnap("half");
    else if (snap === "half") setSnap("full");
    else setSnap("half");
  };

  return (
    <>
      {/* Slide-over Filter Sheet for Mobile Viewports (< lg) */}
      <Sheet open={isFilterSheetOpen} onOpenChange={onFilterSheetOpenChange}>
        <SheetContent side="left" className="p-0 sm:max-w-md w-full">
          <SheetHeader className="sr-only">
            <SheetTitle>Search Filters</SheetTitle>
          </SheetHeader>
          <FilterSidebar
            filters={filters}
            onFilterChange={onFilterChange}
            onResetFilters={onResetFilters}
            isMobileDrawer={true}
            className="h-full w-full border-none"
          />
        </SheetContent>
      </Sheet>

      {/* Draggable Bottom Sheet for Results (Mobile Map-App Pattern) */}
      <div
        className={`lg:hidden fixed inset-x-0 bottom-0 z-30 flex flex-col bg-card rounded-t-2xl shadow-2xl border-t border-border/80 transition-all duration-300 ease-in-out ${
          snap === "collapsed"
            ? "h-16"
            : snap === "half"
            ? "h-[50vh]"
            : "h-[86vh]"
        }`}
      >
        {/* Grab Handle & Sheet Toggle Bar */}
        <button
          type="button"
          onClick={toggleSnap}
          className="flex h-14 w-full shrink-0 flex-col items-center justify-center gap-1 border-b border-border/60 px-4 active:bg-muted/40"
        >
          {/* Draggable Pill Indicator */}
          <span className="h-1.5 w-10 rounded-full bg-muted-foreground/30" />
          <div className="flex w-full items-center justify-between text-xs">
            <span className="font-semibold text-foreground">
              {properties.length} rentals in Wrocław
            </span>
            <div className="flex items-center gap-1 text-muted-foreground">
              <span>{snap === "full" ? "Collapse" : "Expand"}</span>
              {snap === "full" ? (
                <ChevronDownIcon className="size-3.5" />
              ) : (
                <ChevronUpIcon className="size-3.5" />
              )}
            </div>
          </div>
        </button>

        {/* Results Panel inside sheet */}
        <div className="flex-1 overflow-hidden">
          <ResultsPanel
            properties={properties}
            totalCount={totalCount}
            selectedPropertyId={selectedPropertyId}
            hoveredPropertyId={hoveredPropertyId}
            onSelectProperty={(prop) => {
              onSelectProperty(prop);
              // On mobile, collapse to half or preview so map is visible
              setSnap("half");
            }}
            onHoverProperty={onHoverProperty}
            onResetFilters={onResetFilters}
            sortBy={sortBy}
            onSortChange={onSortChange}
            className="h-full border-none"
          />
        </div>
      </div>

      {/* Floating Toggle Pill: "Map" / "List" for rapid mobile toggling */}
      <div className="lg:hidden fixed bottom-20 left-1/2 -translate-x-1/2 z-40">
        <button
          type="button"
          onClick={() => setSnap((current) => (current === "full" ? "collapsed" : "full"))}
          className="flex h-11 items-center gap-2 rounded-full border border-border bg-foreground px-5 text-xs font-semibold text-background shadow-xl active:scale-95 transition-transform"
        >
          {snap === "full" ? (
            <>
              <MapIcon className="size-4" />
              <span>Show Map</span>
            </>
          ) : (
            <>
              <ListIcon className="size-4" />
              <span>Show List ({properties.length})</span>
            </>
          )}
        </button>
      </div>
    </>
  );
}

