import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRentalDetailById } from "@/src/data/rental-details-data";
import { MOCK_RENTALS } from "@/src/data/rentals-data";
import { ListingGallery } from "@/components/rentals/detail/listing-gallery";
import { ListingHeader } from "@/components/rentals/detail/listing-header";
import { KeyFactsStrip } from "@/components/rentals/detail/key-facts-strip";
import { ListingAbout } from "@/components/rentals/detail/listing-about";
import { ListingHighlights } from "@/components/rentals/detail/listing-highlights";
import { ListingFeatures } from "@/components/rentals/detail/listing-features";
import { ListingFeesPolicies } from "@/components/rentals/detail/listing-fees-policies";
import { ListingMapSection } from "@/components/rentals/detail/listing-map-section";
import { ListingReviews } from "@/components/rentals/detail/listing-reviews";
import { ListingContactCard } from "@/components/rentals/detail/listing-contact-card";
import { SimilarListingsCarousel } from "@/components/rentals/detail/listing-similar-carousel";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const property = getRentalDetailById(id);
  if (!property) return { title: "Listing Not Found" };

  return {
    title: `${property.title} | ${property.neighborhood}, ${property.city} Rentals`,
    description: `Rent ${property.title} in ${property.neighborhood}. ${property.beds} beds, ${property.baths} baths, ${property.sqft} sq ft for $${property.price}/month. Verified listing with tour scheduling.`,
  };
}

export default async function RentalDetailPage({ params }: PageProps) {
  const { id } = await params;
  const property = getRentalDetailById(id);

  if (!property) {
    notFound();
  }

  return (
    <div className="min-h-full bg-muted/20 pb-20 sm:pb-16">
      <main className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-4 sm:py-8 lg:px-6 space-y-6 sm:space-y-8">
        {/* 1. PHOTO GALLERY (Hero 60% + 2x2 Grid 40% on desktop; Swipeable on mobile) */}
        <section aria-label="Photo gallery">
          <ListingGallery
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
            />

            {/* Verified Tenant Reviews with Rating Breakdown */}
            <ListingReviews
              overallRating={property.reviews.overall}
              totalReviews={property.reviews.totalReviews}
              breakdown={property.reviews.breakdown}
              reviews={property.reviews.list}
            />
          </div>

          {/* Sticky Contact Column (Right: 4 of 12 columns on desktop) */}
          <div className="lg:col-span-4 min-w-0">
            <ListingContactCard
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
            properties={MOCK_RENTALS}
            neighborhood={property.neighborhood}
          />
        </section>
      </main>
    </div>
  );
}

