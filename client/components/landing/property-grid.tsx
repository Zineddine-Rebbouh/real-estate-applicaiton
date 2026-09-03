"use client";

import { useState } from "react";
import { Grid3X3, List } from "lucide-react";
import { PropertyCard } from "./property-card";
import { Pagination } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";

const sampleProperties = [
  {
    id: 1,
    image: "/landing-i1.png",
    title: "Small Flat",
    totalArea: 45,
    bedrooms: 1,
    floor: 3,
    price: 250000,
    status: "available" as const,
    href: "#",
  },
  {
    id: 2,
    image: "/landing-i2.png",
    title: "Large Flat",
    totalArea: 120,
    bedrooms: 3,
    floor: 5,
    price: 580000,
    status: "available" as const,
    href: "#",
  },
  {
    id: 3,
    image: "/landing-i3.png",
    title: "Medium Flat",
    totalArea: 75,
    bedrooms: 2,
    floor: 2,
    price: 390000,
    status: "pending" as const,
    href: "#",
  },
  {
    id: 4,
    image: "/landing-i4.png",
    title: "Studio",
    totalArea: 35,
    bedrooms: 1,
    floor: 1,
    price: 195000,
    status: "available" as const,
    href: "#",
  },
];

export function PropertyGrid() {
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

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
              href="#discover"
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

        {/* Grid */}
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
              : "grid grid-cols-1 gap-4"
          }
        >
          {sampleProperties.map((property) => (
            <PropertyCard key={property.id} {...property} layout={viewMode} />
          ))}
        </div>

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
