"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { TopFilterBar, ViewMode } from "@/components/rentals/top-filter-bar";
import { FilterSidebar } from "@/components/rentals/filter-sidebar";
import { InteractiveMap } from "@/components/rentals/interactive-map";
import { ResultsPanel, SortOption } from "@/components/rentals/results-panel";
import { MobileBottomSheet } from "@/components/rentals/mobile-bottom-sheet";
import {
  FilterState,
  INITIAL_FILTERS,
  RentalProperty,
} from "@/src/data/rentals-data";
import {
  applyListingFilters,
  layoutListingCoords,
  mapPropertyToListing,
  toPropertyQuery,
} from "@/lib/listings";
import { useGetPropertiesQuery } from "@/state/api";
import { requestLocationOncePerSession } from "@/hooks/use-geolocation";
import { SearchPreferencesOnboarding } from "@/components/tenant-dashboard/search-preferences-onboarding";

interface RentalsExplorerProps {
  isDashboard?: boolean;
}

export function RentalsExplorer({ isDashboard = false }: RentalsExplorerProps) {
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  // In dashboard view, start collapsed on medium/desktop viewports for optimal map space
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(isDashboard);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [hoveredPropertyId, setHoveredPropertyId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("recommended");

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  // Server-filtered listings (price/type/beds/baths) mapped onto the
  // RentalProperty contract, with the remaining filters applied locally.
  const { data: propertiesData } = useGetPropertiesQuery(
    toPropertyQuery(filters),
  );
  const serverListings = useMemo(
    () => (propertiesData?.properties ?? []).map(mapPropertyToListing),
    [propertiesData],
  );

  // Instant reactive client-side filtering with zero page reload
  const filteredProperties = useMemo(() => {
    const sorted = applyListingFilters(serverListings, filters).sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return b.rating - a.rating;
    });
    return layoutListingCoords(sorted);
  }, [serverListings, filters, sortBy]);

  const handleSelectProperty = (property: RentalProperty) => {
    setSelectedPropertyId(property.id);
  };

  const handleDeselectProperty = () => {
    setSelectedPropertyId(null);
  };

  const handleHoverProperty = (id: string | null) => {
    setHoveredPropertyId(id);
  };

  // Ephemeral geolocation prefill — once per tab session, no server writes.
  // Asks the browser for location (hooks/use-geolocation.ts gates the prompt
  // with a sessionStorage flag), reverse-geocodes to a city, and prefills the
  // search field only if the user hasn't already typed a location. The
  // resolved city is session-only (FilterState.locationQuery) and never
  // persisted — there is no preferredLatitude/preferredLongitude in the schema.
  const geolocationStarted = useRef(false);
  useEffect(() => {
    if (geolocationStarted.current) return;
    geolocationStarted.current = true;
    requestLocationOncePerSession((city) => {
      setFilters((prev) =>
        prev.locationQuery.trim() ? prev : { ...prev, locationQuery: city },
      );
    });
  }, []);

  return (
    <div
      className={`flex w-full flex-col overflow-hidden bg-background ${
        isDashboard ? "h-[calc(100svh-72px)]" : "h-screen"
      }`}
    >
      {/* 1. Fixed Top Filter Bar */}
      <TopFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenMobileFilters={() => setIsMobileFilterOpen(true)}
        totalCount={filteredProperties.length}
        hideBrandLogo={isDashboard}
      />

      {/* 2. Main Three-Panel Viewport */}
      <main className="relative flex flex-1 h-[calc(100%-4rem)] overflow-hidden">
        {/* Left Filter Sidebar (Desktop, scrollable, collapsible) */}
        <FilterSidebar
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
          className={`hidden lg:flex transition-all duration-200 ${
            isSidebarCollapsed ? "w-14" : "w-80 shrink-0"
          }`}
        />

        {/* Center Interactive Map */}
        <div
          className={`relative h-full flex-1 transition-all duration-200 ${
            viewMode === "list-focus" ? "hidden" : "flex"
          }`}
        >
          <InteractiveMap
            properties={filteredProperties}
            selectedPropertyId={selectedPropertyId}
            hoveredPropertyId={hoveredPropertyId}
            onSelectProperty={handleSelectProperty}
            onHoverProperty={handleHoverProperty}
            onDeselectProperty={handleDeselectProperty}
          />
        </div>

        {/* Right Scrollable Results Panel (Desktop) */}
        <div
          className={`hidden lg:flex flex-col h-full transition-all duration-200 ${
            viewMode === "map-focus"
              ? "hidden"
              : viewMode === "list-focus"
              ? "flex-1 max-w-5xl mx-auto"
              : "w-[420px] xl:w-[450px] shrink-0"
          }`}
        >
          <ResultsPanel
            properties={filteredProperties}
            totalCount={filteredProperties.length}
            selectedPropertyId={selectedPropertyId}
            hoveredPropertyId={hoveredPropertyId}
            onSelectProperty={handleSelectProperty}
            onHoverProperty={handleHoverProperty}
            onResetFilters={handleResetFilters}
            sortBy={sortBy}
            onSortChange={setSortBy}
            className="h-full"
          />
        </div>

        {/* 3. Mobile Responsive Bottom Sheet & Slide-over (< lg) */}
        <MobileBottomSheet
          properties={filteredProperties}
          totalCount={filteredProperties.length}
          selectedPropertyId={selectedPropertyId}
          hoveredPropertyId={hoveredPropertyId}
          onSelectProperty={handleSelectProperty}
          onHoverProperty={handleHoverProperty}
          onResetFilters={handleResetFilters}
          filters={filters}
          onFilterChange={handleFilterChange}
          isFilterSheetOpen={isMobileFilterOpen}
          onFilterSheetOpenChange={setIsMobileFilterOpen}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {/* One-time search-preference onboarding popup (skippable, centered
            modal). Save applies the preferences to FilterState so the explore
            page behind the popup is already filtered once it closes. */}
        <SearchPreferencesOnboarding onApplyPreferences={handleFilterChange} />
      </main>
    </div>
  );
}

