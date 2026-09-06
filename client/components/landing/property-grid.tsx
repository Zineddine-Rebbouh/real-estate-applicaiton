"use client";

import { useState } from "react";
import { Grid3X3, List, RotateCcw, SlidersHorizontal } from "lucide-react";
import { PropertyCard } from "./property-card";
import { Pagination } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const sampleProperties = [
  {
    id: 1,
    image: "/property-small-flat.jpg",
    images: ["/property-small-flat.jpg", "/property-small-flat-2.jpg"],
    title: "Small Flat",
    totalArea: 45,
    bedrooms: 1,
    baths: 1,
    propertyType: "Apartment",
    floor: 3,
    price: 250000,
    status: "available" as const,
    href: "#",
  },
  {
    id: 2,
    image: "/property-large-flat.jpg",
    images: ["/property-large-flat.jpg", "/property-large-flat-2.jpg"],
    title: "Large Flat",
    totalArea: 120,
    bedrooms: 3,
    baths: 2,
    propertyType: "Apartment",
    floor: 5,
    price: 580000,
    status: "available" as const,
    href: "#",
  },
  {
    id: 3,
    image: "/property-medium-flat.jpg",
    images: ["/property-medium-flat.jpg"],
    title: "Medium Flat",
    totalArea: 75,
    bedrooms: 2,
    baths: 1,
    propertyType: "Condo",
    floor: 2,
    price: 390000,
    status: "pending" as const,
    href: "#",
  },
  {
    id: 4,
    image: "/property-studio.jpg",
    images: ["/property-studio.jpg"],
    title: "Studio",
    totalArea: 35,
    bedrooms: 1,
    baths: 1,
    propertyType: "Studio",
    floor: 1,
    price: 195000,
    status: "available" as const,
    href: "#",
  },
];

export function PropertyGrid() {
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [bedrooms, setBedrooms] = useState("all");
  const [baths, setBaths] = useState("all");
  const [propertyType, setPropertyType] = useState("all");

  const filteredProperties = sampleProperties.filter((property) => {
    const matchesMinPrice =
      minPrice === "" || property.price >= Number(minPrice);
    const matchesMaxPrice =
      maxPrice === "" || property.price <= Number(maxPrice);
    const matchesBedrooms =
      bedrooms === "all" || property.bedrooms >= Number(bedrooms);
    const matchesBaths = baths === "all" || property.baths >= Number(baths);
    const matchesPropertyType =
      propertyType === "all" || property.propertyType === propertyType;

    return (
      matchesMinPrice &&
      matchesMaxPrice &&
      matchesBedrooms &&
      matchesBaths &&
      matchesPropertyType
    );
  });

  const clearFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setBedrooms("all");
    setBaths("all");
    setPropertyType("all");
    setCurrentPage(1);
  };

  return (
    <section className="py-16 lg:py-24 bg-background" id="listings">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              The collection
            </p>
            <h2 className="font-display text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
              Homes with room to grow.
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="#listing-filters"
              className="text-sm font-medium text-primary hover:underline"
            >
              Refine your search
            </a>

            {/* View Toggle */}
            <div
              className="flex items-center gap-1 rounded-lg bg-muted p-1"
              aria-label="Choose listing view"
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode("grid")}
                data-active={viewMode === "grid"}
                className="data-[active=true]:bg-background"
                aria-pressed={viewMode === "grid"}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode("list")}
                data-active={viewMode === "list"}
                className="data-[active=true]:bg-background"
                aria-pressed={viewMode === "list"}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div
          id="listing-filters"
          className="mb-8 rounded-xl border border-border/70 bg-card p-4 shadow-xs sm:p-5"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="size-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">
                Filter listings
              </h3>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="gap-1.5 text-xs"
            >
              <RotateCcw className="size-3.5" />
              Clear
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-1.5">
              <Label htmlFor="min-price" className="text-xs">
                Min price
              </Label>
              <Input
                id="min-price"
                type="number"
                min="0"
                placeholder="$0"
                value={minPrice}
                onChange={(event) => setMinPrice(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="max-price" className="text-xs">
                Max price
              </Label>
              <Input
                id="max-price"
                type="number"
                min="0"
                placeholder="Any"
                value={maxPrice}
                onChange={(event) => setMaxPrice(event.target.value)}
              />
            </div>
            <label className="space-y-1.5 text-xs font-medium text-foreground">
              <span className="block">Bedrooms</span>
              <select
                value={bedrooms}
                onChange={(event) => setBedrooms(event.target.value)}
                className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm font-normal"
              >
                <option value="all">Any</option>
                <option value="1">1+ bedroom</option>
                <option value="2">2+ bedrooms</option>
                <option value="3">3+ bedrooms</option>
              </select>
            </label>
            <label className="space-y-1.5 text-xs font-medium text-foreground">
              <span className="block">Bathrooms</span>
              <select
                value={baths}
                onChange={(event) => setBaths(event.target.value)}
                className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm font-normal"
              >
                <option value="all">Any</option>
                <option value="1">1+ bathroom</option>
                <option value="2">2+ bathrooms</option>
              </select>
            </label>
            <label className="space-y-1.5 text-xs font-medium text-foreground">
              <span className="block">Property type</span>
              <select
                value={propertyType}
                onChange={(event) => setPropertyType(event.target.value)}
                className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm font-normal"
              >
                <option value="all">Any type</option>
                <option value="Apartment">Apartment</option>
                <option value="Condo">Condo</option>
                <option value="Studio">Studio</option>
              </select>
            </label>
          </div>
        </div>

        {/* Grid */}
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
              : "grid grid-cols-1 gap-4"
          }
        >
          {filteredProperties.map((property) => (
            <PropertyCard key={property.id} {...property} layout={viewMode} />
          ))}
        </div>

        {filteredProperties.length === 0 && (
          <div className="border-border/70 bg-card mt-6 rounded-xl border p-8 text-center">
            <p className="text-sm font-medium text-foreground">
              No homes match those filters.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Try widening your price range or selecting Any for another option.
            </p>
          </div>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={3}
          onPageChange={setCurrentPage}
          className="mt-12"
        />
      </div>
    </section>
  );
}
