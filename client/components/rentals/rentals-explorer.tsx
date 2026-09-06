"use client";

import { useMemo, useState } from "react";
import { TopFilterBar, ViewMode } from "@/components/rentals/top-filter-bar";
import { FilterSidebar } from "@/components/rentals/filter-sidebar";
import { InteractiveMap } from "@/components/rentals/interactive-map";
import { ResultsPanel, SortOption } from "@/components/rentals/results-panel";
import { MobileBottomSheet } from "@/components/rentals/mobile-bottom-sheet";
import {
  FilterState,
  INITIAL_FILTERS,
  MOCK_RENTALS,
  RentalProperty,
} from "@/src/data/rentals-data";

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

  // Instant reactive client-side filtering with zero page reload
  const filteredProperties = useMemo(() => {
    return MOCK_RENTALS.filter((property) => {
      // Location query search
      if (filters.locationQuery.trim()) {
        const query = filters.locationQuery.toLowerCase().trim();
        const matchesLocation =
          property.title.toLowerCase().includes(query) ||
          property.address.toLowerCase().includes(query) ||
          property.neighborhood.toLowerCase().includes(query) ||
          property.city.toLowerCase().includes(query);
        if (!matchesLocation) return false;
      }

      // Price range filter
      if (property.price < filters.minPrice) return false;
      if (filters.maxPrice < 4500 && property.price > filters.maxPrice) return false;

      // Property type filter
      if (
        filters.propertyTypes.length > 0 &&
        !filters.propertyTypes.includes(property.propertyType)
      ) {
        return false;
      }

      // Bedrooms filter
      if (filters.beds !== null) {
        if (filters.beds === 0 && property.beds !== 0) return false;
        if (filters.beds > 0 && property.beds < filters.beds) return false;
      }

      // Bathrooms filter
      if (filters.baths !== null && property.baths < filters.baths) {
        return false;
      }

      // Square footage filter
      if (property.sqft < filters.minSqft) return false;
      if (filters.maxSqft < 2800 && property.sqft > filters.maxSqft) return false;

      // Amenities multi-select filter
      if (filters.amenities.length > 0) {
        const hasAllAmenities = filters.amenities.every((amenity) =>
          property.amenities.includes(amenity)
        );
        if (!hasAllAmenities) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return b.rating - a.rating;
    });
  }, [filters, sortBy]);

  const handleSelectProperty = (property: RentalProperty) => {
    setSelectedPropertyId(property.id);
  };

  const handleHoverProperty = (id: string | null) => {
    setHoveredPropertyId(id);
  };

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
      </main>
    </div>
  );
}

