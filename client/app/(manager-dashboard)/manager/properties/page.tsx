"use client";

import * as React from "react";
import Link from "next/link";
import {
  Building2Icon,
  EyeIcon,
  MapPinIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useGetManagerPropertiesQuery,
  useDeletePropertyMutation,
  type Property,
} from "@/state/api";

export default function ManagerPropertiesPage() {
  const { data, isLoading, refetch } = useGetManagerPropertiesQuery();
  const [deleteProperty, { isLoading: isDeleting }] = useDeletePropertyMutation();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedType, setSelectedType] = React.useState<string>("All");
  const [deletingProperty, setDeletingProperty] = React.useState<Property | null>(null);

  const properties = data?.properties ?? [];

  const propertyTypes = React.useMemo(() => {
    const types = new Set(properties.map((p) => p.propertyType));
    return ["All", ...Array.from(types)];
  }, [properties]);

  const filteredProperties = properties.filter((p) => {
    const matchesSearch =
      searchQuery === "" ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedType === "All" || p.propertyType === selectedType;
    return matchesSearch && matchesType;
  });

  const handleDelete = async () => {
    if (!deletingProperty) return;
    try {
      await deleteProperty(deletingProperty.id).unwrap();
      toast.success(`Property "${deletingProperty.name}" deleted successfully`);
      setDeletingProperty(null);
      refetch();
    } catch {
      toast.error("Failed to delete property. Please try again.");
    }
  };

  return (
    <main className="min-h-full">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              My Properties
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your published listings, update pricing, and track tenant interest.
            </p>
          </div>
          <Button
            nativeButton={false}
            render={<Link href="/manager/properties/new" className="flex items-center gap-1.5" />}
            size="sm"
          >
            <PlusIcon className="size-4" />
            <span>Add Property</span>
          </Button>
        </header>

        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, city, or address..."
              className="h-9 pl-9 text-xs bg-card"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            )}
          </div>

          {/* Type filters */}
          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            {propertyTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  selectedType === type
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Listings Grid */}
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-80 rounded-2xl" />
            <Skeleton className="h-80 rounded-2xl" />
            <Skeleton className="h-80 rounded-2xl" />
          </div>
        ) : filteredProperties.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProperties.map((property) => (
              <Card
                key={property.id}
                className="overflow-hidden flex flex-col justify-between transition-all hover:shadow-md"
              >
                <div>
                  <div className="relative aspect-16/9 w-full bg-muted overflow-hidden">
                    <img
                      src={property.photoUrls?.[0] || "/singlelisting-1.jpg"}
                      alt={property.name}
                      className="size-full object-cover transition-transform hover:scale-105 duration-300"
                    />
                    <Badge className="absolute top-3 left-3 bg-background/90 text-foreground font-semibold backdrop-blur-xs">
                      {property.propertyType}
                    </Badge>
                    {property.pendingApplicationsCount && property.pendingApplicationsCount > 0 ? (
                      <Badge className="absolute top-3 right-3 bg-amber-500 text-white font-semibold shadow-xs">
                        {property.pendingApplicationsCount} New Application{property.pendingApplicationsCount > 1 ? "s" : ""}
                      </Badge>
                    ) : null}
                  </div>

                  <div className="p-5 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-base text-foreground leading-snug line-clamp-1">
                        {property.name}
                      </h3>
                    </div>

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
                    variant="outline"
                    nativeButton={false}
                    render={<Link href={`/tenant/rentals/${property.id}`} />}
                    className="text-xs gap-1"
                    title="View public listing page"
                  >
                    <EyeIcon className="size-3.5" />
                    <span>Public View</span>
                  </Button>

                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="secondary"
                      nativeButton={false}
                      render={<Link href={`/manager/properties/${property.id}`} />}
                      className="text-xs gap-1"
                    >
                      <PencilIcon className="size-3.5" />
                      <span>Edit</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="size-8 p-0 text-destructive hover:bg-destructive/10"
                      onClick={() => setDeletingProperty(property)}
                      title="Delete Property"
                    >
                      <Trash2Icon className="size-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border-dashed">
            <Building2Icon className="size-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-base font-semibold text-foreground">No properties found</h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm">
              {searchQuery
                ? `No properties matched "${searchQuery}". Try clearing search filters.`
                : "You have not created any property listings yet."}
            </p>
            {searchQuery ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="mt-4"
              >
                Clear Search
              </Button>
            ) : (
              <Button
                size="sm"
                nativeButton={false}
                render={<Link href="/manager/properties/new" />}
                className="mt-4"
              >
                <PlusIcon className="size-3.5 mr-1" />
                Add Your First Property
              </Button>
            )}
          </Card>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={Boolean(deletingProperty)}
        onOpenChange={(open) => !open && setDeletingProperty(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Property Listing?</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete{" "}
              <strong className="text-foreground">{deletingProperty?.name}</strong>?
              This action cannot be undone and will remove all associated listing data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeletingProperty(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting…" : "Delete Property"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

