import { Metadata } from "next";
import { notFound } from "next/navigation";
import type { RentalDetail } from "@/src/data/rental-details-data";
import { mapPropertyToListing, formatHighlights } from "@/lib/listings";
import { ListingGallery } from "@/components/rentals/detail/listing-gallery";
import { ListingHeader } from "@/components/rentals/detail/listing-header";
import { KeyFactsStrip } from "@/components/rentals/detail/key-facts-strip";
import { ListingAbout } from "@/components/rentals/detail/listing-about";
import { ListingHighlights } from "@/components/rentals/detail/listing-highlights";
import { ListingFeatures } from "@/components/rentals/detail/listing-features";
import { ListingFeesPolicies } from "@/components/rentals/detail/listing-fees-policies";
import { ListingMapSection } from "@/components/rentals/detail/listing-map-section";
import { PropertyReviewsSection } from "@/components/rentals/detail/property-reviews";
import { ListingContactCard } from "@/components/rentals/detail/listing-contact-card";
import { SimilarListingsCarousel } from "@/components/rentals/detail/listing-similar-carousel";
import type { Property } from "@/state/api";

interface PageProps {
  params: Promise<{ id: string }>;
}

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

async function fetchProperty(id: string): Promise<Property | null> {
  try {
    const res = await fetch(`${API}/api/properties/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.property ?? null;
  } catch {
    return null;
  }
}

async function fetchAllProperties(): Promise<Property[]> {
  try {
    const res = await fetch(`${API}/api/properties`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.properties ?? [];
  } catch {
    return [];
  }
}

// Core listing facts come from the real property. Sections with no backend
// counterpart (fee schedule beyond the stored amounts, pet/parking policy
// wording, host card, POIs) are derived from the stored fields where
// possible and fall back to neutral placeholders otherwise.
function toRentalDetail(p: Property): RentalDetail {
  const listing = mapPropertyToListing(p);
  const price = Number(p.pricePerMonth);
  const photos = p.photoUrls?.length ? p.photoUrls : ["/singlelisting-2.jpg"];
  const hostName = p.manager?.user?.name ?? "Property Manager";

  return {
    ...listing,
    breadcrumbs: {
      country: p.country,
      region: p.state,
      city: p.city,
      neighborhood: p.city,
    },
    deposit: Number(p.securityDeposit),
    leaseTerm: "12 Months",
    aboutText: [p.description || "No description provided yet."],
    highlights: formatHighlights(p.highlights),
    detailedGallery: photos.map((url, i) => ({
      url,
      caption: `${p.name} — photo ${i + 1}`,
    })),
    feesBreakdown: {
      requiredFees: [
        { name: "Monthly rent", amount: `$${price.toLocaleString()}`, frequency: "per month", required: true },
        { name: "Security deposit", amount: `$${Number(p.securityDeposit).toLocaleString()}`, frequency: "one-time", required: true },
        { name: "Application fee", amount: `$${Number(p.applicationFee).toLocaleString()}`, frequency: "one-time", required: true },
      ],
      petFees: [],
      parkingFees: [],
    },
    policies: {
      petPolicy: {
        allowed: p.isPetsAllowed,
        summary: p.isPetsAllowed ? "Pets are welcome at this property." : "Pets are not allowed at this property.",
        rules: [],
      },
      parkingPolicy: {
        included: p.isParkingIncluded,
        type: p.isParkingIncluded ? "Included" : "Not included",
        summary: p.isParkingIncluded
          ? "Parking is included with this listing."
          : "Parking is not included with this listing.",
        rules: [],
      },
    },
    host: {
      name: hostName,
      role: "Property Manager",
      company: "",
      avatar: "/landing-i1.png",
      phone: p.manager?.phoneNumber ?? "",
      email: p.manager?.user?.email ?? "",
      rating: listing.rating,
      reviewCount: listing.reviewCount,
      responseRate: "—",
      responseTime: "—",
      languages: ["English"],
      viewingHours: { weekdays: "By appointment", weekends: "By appointment" },
      verified: true,
    },
    nearbyPOIs: [],
    reviews: {
      overall: listing.rating,
      totalReviews: listing.reviewCount,
      breakdown: {
        cleanliness: listing.rating,
        accuracy: listing.rating,
        communication: listing.rating,
        location: listing.rating,
        value: listing.rating,
      },
      list: [],
    },
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const property = await fetchProperty(id);
  if (!property) return { title: "Listing Not Found" };

  return {
    title: `${property.name} | ${property.city} Rentals`,
    description: `Rent ${property.name} in ${property.city}. ${property.beds} beds, ${property.baths} baths, ${property.squareFeet} sq ft for $${Number(property.pricePerMonth).toLocaleString()}/month.`,
  };
}

export default async function RentalDetailPage({ params }: PageProps) {
  const { id } = await params;
  const raw = await fetchProperty(id);

  if (!raw) {
    notFound();
  }

  const property = toRentalDetail(raw);
  const similar = (await fetchAllProperties())
    .filter((p) => p.id !== raw.id)
    .map(mapPropertyToListing);

  return (
    <div className="min-h-full bg-muted/20 pb-20 sm:pb-16">
      <main className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-4 sm:py-8 lg:px-6 space-y-6 sm:space-y-8">
        {/* 1. PHOTO GALLERY (Hero 60% + 2x2 Grid 40% on desktop; Swipeable on mobile) */}
        <section aria-label="Photo gallery">
          <ListingGallery
            propertyId={property.id}
            images={property.detailedGallery}
            title={property.title}
            isFavorite={property.isFavorite}
          />
        </section>

        {/* 2. TWO-COLUMN MAIN BODY: Content Left + Sticky Contact Card Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Body (Left: 8 of 12 columns on desktop) */}
          <div className="lg:col-span-8 space-y-6 sm:space-y-8 min-w-0">
            {/* Header Block: Breadcrumbs, Title, Location, Rating, Verified Badge */}
            <ListingHeader
              title={property.title}
              address={property.address}
              city={property.city}
              neighborhood={property.neighborhood}
              rating={property.rating}
              reviewCount={property.reviewCount}
              propertyType={property.propertyType}
              breadcrumbs={property.breadcrumbs}
            />

            {/* Key Facts Strip: 4 stat boxes, rent visually dominant, 2x2 on mobile */}
            <KeyFactsStrip
              price={property.price}
              beds={property.beds}
              baths={property.baths}
              sqft={property.sqft}
              deposit={property.deposit}
              availableDate={property.availableDate}
            />

            {/* About Section: Multi-paragraph description with smooth read-more toggle */}
            <ListingAbout
              paragraphs={property.aboutText}
              leaseTerm={property.leaseTerm}
            />

            {/* Quick Highlights Checklist */}
            <ListingHighlights highlights={property.highlights} />

            {/* Features & Amenities Grid (4 cols desktop -> 2 cols mobile) */}
            <ListingFeatures amenities={property.amenities} />

            {/* Fees & Policies Tabbed Interface */}
            <ListingFeesPolicies
              feesBreakdown={property.feesBreakdown}
              policies={property.policies}
            />

            {/* Map & Location Section with POI category toggles */}
            <ListingMapSection
              propertyTitle={property.title}
              address={property.address}
              city={property.city}
              neighborhood={property.neighborhood}
              price={property.price}
              coords={property.coords}
              pois={property.nearbyPOIs}
              listing={property}
            />

            {/* Tenant reviews from real review data */}
            <PropertyReviewsSection propertyId={property.id} />
          </div>

          {/* Sticky Contact Column (Right: 4 of 12 columns on desktop) */}
          <div className="lg:col-span-4 min-w-0">
            <ListingContactCard
              propertyId={property.id}
              propertyTitle={property.title}
              price={property.price}
              deposit={property.deposit}
              availableDate={property.availableDate}
              host={property.host}
            />
          </div>
        </div>

        {/* 3. SIMILAR LISTINGS CAROUSEL */}
        <section aria-label="Similar listings">
          <SimilarListingsCarousel
            currentPropertyId={property.id}
            properties={similar}
            neighborhood={property.neighborhood}
          />
        </section>
      </main>
    </div>
  );
}
