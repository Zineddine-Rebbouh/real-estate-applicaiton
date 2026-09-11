"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeftIcon,
  Loader2Icon,
  MapPinIcon,
  PencilIcon,
  ShieldAlertIcon,
  StarIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PropertyThumb } from "@/components/rentals/property-thumb";
import { Card } from "@/components/ui/card";
import { KeyFactsStrip } from "@/components/rentals/detail/key-facts-strip";
import { ListingAbout } from "@/components/rentals/detail/listing-about";
import { ListingHighlights } from "@/components/rentals/detail/listing-highlights";
import { ListingFeatures } from "@/components/rentals/detail/listing-features";
import { ListingFeesPolicies } from "@/components/rentals/detail/listing-fees-policies";
import { ListingMapSection } from "@/components/rentals/detail/listing-map-section";
import { PropertyReviewsSection } from "@/components/rentals/detail/property-reviews";
import { generateNearbyPOIs } from "@/src/data/rental-details-data";
import { formatHighlights, mapPropertyToListing } from "@/lib/listings";
import {
  useGetManagerPropertiesQuery,
  useGetManagerPropertyByIdQuery,
} from "@/state/api";

function isForbiddenError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const status = (error as { status?: number }).status;
  const dataErr =
    typeof (error as { data?: { error?: string } }).data?.error === "string"
      ? (error as { data: { error: string } }).data.error
      : "";
  return status === 403 || dataErr.startsWith("Forbidden");
}

// Owned-only spectate detail. Uses GET /api/manager/properties/:id which
// 403s on other managers' listings — never the public /api/properties/:id.
export default function ManagerSpectatePage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : (params.id as string);

  const { data, isLoading, error } = useGetManagerPropertyByIdQuery(id, { skip: !id });
  const { data: allOwned } = useGetManagerPropertiesQuery();

  const property = data?.property;

  const similar = React.useMemo(() => {
    const owned = allOwned?.properties ?? [];
    return owned.filter((p) => p.id !== id).slice(0, 4);
  }, [allOwned, id]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2Icon className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !property) {
    const forbidden = error ? isForbiddenError(error) : false;
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center justify-center p-12 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-4">
          <ShieldAlertIcon className="size-7" />
        </div>
        <h2 className="text-lg font-bold text-foreground">
          {forbidden ? "Access Restricted" : "Property Not Found"}
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {forbidden
            ? "This listing belongs to another manager. You can only spectate your own properties."
            : "This listing could not be found in your portfolio."}
        </p>
        <Button className="mt-4" size="sm" nativeButton={false} render={<Link href="/manager/browse" />}>
          Back to My Listings
        </Button>
      </div>
    );
  }

  const listing = mapPropertyToListing(property);
  const price = Number(property.pricePerMonth);
  const photos = property.photoUrls?.length ? property.photoUrls : ["/singlelisting-2.jpg"];

  return (
    <main className="min-h-full">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link href="/manager/browse" />}
            className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeftIcon className="size-4" />
            <span>Back to My Listings</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href={`/manager/properties/${property.id}`} />}
            className="text-xs gap-1.5"
          >
            <PencilIcon className="size-3.5" />
            <span>Edit Listing</span>
          </Button>
        </div>

        {/* Photo gallery (plain preview — no tenant favorite actions) */}
        <div className="grid gap-3 sm:grid-cols-12">
          <div className="relative aspect-16/10 w-full overflow-hidden rounded-xl bg-muted sm:col-span-7">
            <PropertyThumb src={photos[0]} alt={property.name} fill sizes="100vw" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:col-span-5">
            {photos.slice(1, 5).map((url, i) => (
              <div key={i} className="relative aspect-16/10 w-full overflow-hidden rounded-xl bg-muted">
                <PropertyThumb src={url} alt={`${property.name} photo ${i + 2}`} fill sizes="40vw" />
              </div>
            ))}
          </div>
        </div>

        {/* Header */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-[11px] uppercase tracking-wider">
              {property.propertyType}
            </Badge>
            <Badge className="bg-emerald-500/10 text-emerald-700 text-[11px]">
              Your listing — tenant preview
            </Badge>
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {property.name}
          </h1>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPinIcon className="size-4 shrink-0" />
            {property.address}, {property.city}, {property.state} {property.postalCode}
          </p>
          {listing.reviewCount > 0 && (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <StarIcon className="size-3.5 fill-amber-400 text-amber-400" />
              {listing.rating.toFixed(1)} · {listing.reviewCount} review{listing.reviewCount > 1 ? "s" : ""}
            </p>
          )}
        </div>

        <KeyFactsStrip
          price={price}
          beds={property.beds}
          baths={property.baths}
          sqft={property.squareFeet}
          deposit={Number(property.securityDeposit)}
          availableDate="Available Now"
        />

        <ListingAbout
          paragraphs={[property.description || "No description provided yet."]}
          leaseTerm="12 Months"
        />

        <ListingHighlights highlights={formatHighlights(property.highlights)} />

        <ListingFeatures amenities={listing.amenities} />

        <ListingFeesPolicies
          feesBreakdown={{
            requiredFees: [
              { name: "Monthly rent", amount: `$${price.toLocaleString()}`, frequency: "per month", required: true },
              { name: "Security deposit", amount: `$${Number(property.securityDeposit).toLocaleString()}`, frequency: "one-time", required: true },
              { name: "Application fee", amount: `$${Number(property.applicationFee).toLocaleString()}`, frequency: "one-time", required: true },
            ],
            petFees: [],
            parkingFees: [],
          }}
          policies={{
            petPolicy: {
              allowed: property.isPetsAllowed,
              summary: property.isPetsAllowed ? "Pets are welcome at this property." : "Pets are not allowed at this property.",
              rules: [],
            },
            parkingPolicy: {
              included: property.isParkingIncluded,
              type: property.isParkingIncluded ? "Included" : "Not included",
              summary: property.isParkingIncluded ? "Parking is included with this listing." : "Parking is not included with this listing.",
              rules: [],
            },
          }}
        />

        <ListingMapSection
          propertyTitle={property.name}
          address={property.address}
          city={property.city}
          neighborhood={property.city}
          price={price}
          coords={listing.coords}
          pois={generateNearbyPOIs({
            id: property.id,
            name: property.name,
            city: property.city,
            address: property.address,
            coords: { lat: Number(property.latitude || 0), lng: Number(property.longitude || 0) },
          })}
          listing={listing}
          detailsHref={(p) => `/manager/browse/${p.id}`}
        />

        <PropertyReviewsSection propertyId={property.id} />

        {/* Owned-only similar — never links to other managers' listings */}
        {similar.length > 0 && (
          <section aria-label="More of your listings" className="space-y-3 pt-6 border-t border-border/80">
            <h2 className="text-lg font-bold tracking-tight text-foreground">More of your listings</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {similar.map((p) => (
                <Card key={p.id} className="overflow-hidden">
                  <div className="relative aspect-16/9 w-full bg-muted">
                    <PropertyThumb src={p.photoUrls?.[0]} alt={p.name} fill sizes="30vw" />
                  </div>
                  <div className="p-4">
                    <p className="truncate text-sm font-semibold text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground">${Number(p.pricePerMonth).toLocaleString()} / month</p>
                    <Button size="sm" variant="outline" nativeButton={false} render={<Link href={`/manager/browse/${p.id}`} />} className="mt-3 w-full text-xs">
                      Spectate
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
