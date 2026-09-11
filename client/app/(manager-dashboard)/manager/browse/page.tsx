"use client";

import * as React from "react";
import Link from "next/link";
import { Building2Icon, EyeIcon, MapPinIcon, PencilIcon, SearchIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PropertyThumb } from "@/components/rentals/property-thumb";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetManagerPropertiesQuery } from "@/state/api";

// Owned-only spectate list. Data comes from GET /api/manager/properties,
// so other managers' listings never reach this page.
export default function ManagerBrowsePage() {
  const { data, isLoading } = useGetManagerPropertiesQuery();
  const [searchQuery, setSearchQuery] = React.useState("");

  const properties = data?.properties ?? [];
  const filtered = properties.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.city.toLowerCase().includes(q) ||
      p.address.toLowerCase().includes(q)
    );
  });

  return (
    <main className="min-h-full">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
        <header>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Preview My Listings
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            See exactly what tenants see — only your own properties. Other managers&apos; listings are not accessible here.
          </p>
        </header>

        <div className="relative w-full sm:w-80">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your properties..."
            className="h-9 pl-9 text-xs bg-card"
          />
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-80 rounded-2xl" />
            <Skeleton className="h-80 rounded-2xl" />
            <Skeleton className="h-80 rounded-2xl" />
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((property) => (
              <Card key={property.id} className="overflow-hidden flex flex-col justify-between transition-all hover:shadow-md">
                <div>
                  <div className="relative aspect-16/9 w-full bg-muted overflow-hidden">
                    <PropertyThumb
                      src={property.photoUrls?.[0]}
                      alt={property.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="transition-transform hover:scale-105 duration-300"
                    />
                    <Badge className="absolute top-3 left-3 bg-background/90 text-foreground font-semibold backdrop-blur-xs">
                      {property.propertyType}
                    </Badge>
                  </div>
                  <div className="p-5 space-y-2">
                    <h3 className="font-semibold text-base text-foreground leading-snug line-clamp-1">
                      {property.name}
                    </h3>
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground line-clamp-1">
                      <MapPinIcon className="size-3.5 shrink-0" />
                      {property.address}, {property.city}, {property.state}
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t mt-3">
                      <div>
                        <span className="text-lg font-bold text-foreground">
                          ${Number(property.pricePerMonth).toLocaleString()}
                        </span>
                        <span className="text-xs text-muted-foreground"> / month</span>
                      </div>
                      <div className="text-xs text-muted-foreground font-medium">
                        {property.beds}b • {property.baths}ba • {property.squareFeet} sqft
                      </div>
                    </div>
                  </div>
                </div>
                <div className="border-t bg-muted/20 p-3 px-5 flex items-center justify-between gap-2">
                  <Button
                    size="sm"
                    nativeButton={false}
                    render={<Link href={`/manager/browse/${property.id}`} />}
                    className="text-xs gap-1"
                  >
                    <EyeIcon className="size-3.5" />
                    <span>Spectate</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    nativeButton={false}
                    render={<Link href={`/manager/properties/${property.id}`} />}
                    className="text-xs gap-1"
                  >
                    <PencilIcon className="size-3.5" />
                    <span>Edit</span>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border-dashed">
            <Building2Icon className="size-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-base font-semibold text-foreground">No properties to preview</h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm">
              {searchQuery
                ? `Nothing you own matched "${searchQuery}".`
                : "You don't own any listings yet. Add one to preview it here."}
            </p>
            {!searchQuery && (
              <Button size="sm" nativeButton={false} render={<Link href="/manager/properties/new" />} className="mt-4">
                Add Your First Property
              </Button>
            )}
          </Card>
        )}
      </div>
    </main>
  );
}
