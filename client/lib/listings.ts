import type { Property } from "@/state/api";
import type { FilterState, RentalProperty } from "@/src/data/rentals-data";
import { formatEnumString } from "@/lib/utils";

// Maps server AmenityEnum values onto the mock amenity ids the filter UI
// speaks. Parking has no mock id — it is covered by parkingIncluded.
const SERVER_TO_MOCK_AMENITY: Record<string, string> = {
  WasherDryer: "washer_dryer",
  AirConditioning: "air_conditioning",
  Dishwasher: "dishwasher",
  WiFi: "wifi",
  HighSpeedInternet: "wifi",
  HardwoodFloors: "hardwood",
  WalkInClosets: "walk_in_closet",
  Microwave: "microwave",
  Refrigerator: "refrigerator",
  Pool: "pool",
  Gym: "gym",
  PetsAllowed: "pet_friendly",
};

export function mapPropertyToListing(p: Property): RentalProperty {
  const price = Number(p.pricePerMonth);
  const photos = p.photoUrls?.length ? p.photoUrls : ["/singlelisting-1.jpg"];
  const amenities = (p.amenities ?? [])
    .map((a) => SERVER_TO_MOCK_AMENITY[a])
    .filter((a): a is string => Boolean(a));
  const petFriendly = p.isPetsAllowed || (p.amenities ?? []).includes("PetsAllowed");
  const parkingIncluded =
    p.isParkingIncluded || (p.amenities ?? []).includes("Parking");

  return {
    id: p.id,
    title: p.name,
    address: p.address,
    neighborhood: p.city,
    city: p.city,
    price,
    beds: p.beds,
    baths: p.baths,
    sqft: p.squareFeet,
    propertyType: p.propertyType as RentalProperty["propertyType"],
    image: photos[0],
    gallery: photos,
    badges: [
      ...(petFriendly
        ? [{ label: "Pets Allowed", variant: "outline" as const, iconName: "pet" as const }]
        : []),
      ...(parkingIncluded
        ? [{ label: "Parking Included", variant: "secondary" as const, iconName: "car" as const }]
        : []),
    ],
    rating: p.averageRating != null ? Number(p.averageRating) : 0,
    reviewCount: p.numberOfReviews ?? 0,
    // x/y are laid out by layoutListingCoords once the result set is known;
    // lat/lng ride along for any future real-map work.
    coords: { x: -1, y: -1, lat: p.latitude ?? 0, lng: p.longitude ?? 0 },
    amenities,
    petFriendly,
    parkingIncluded,
    featured: false,
    availableDate: p.availableFrom
      ? new Date(p.availableFrom).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "Available Now",
  };
}

export function formatHighlights(highlights: string[] | undefined): string[] {
  return (highlights ?? []).map(formatEnumString);
}

// Positions map markers from real lat/lng, normalized over the visible
// result set. Listings without coordinates get a stable id-hashed slot so
// markers never stack at 0,0.
export function layoutListingCoords(listings: RentalProperty[]): RentalProperty[] {
  const geo = listings.filter((l) => l.coords.lat !== 0 || l.coords.lng !== 0);
  const lats = geo.map((l) => l.coords.lat);
  const lngs = geo.map((l) => l.coords.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const span = (v: number, min: number, max: number) =>
    max > min ? 10 + ((v - min) / (max - min)) * 80 : 50;

  return listings.map((l) => {
    if (l.coords.lat !== 0 || l.coords.lng !== 0) {
      return {
        ...l,
        coords: {
          ...l.coords,
          x: span(l.coords.lng, minLng, maxLng),
          y: 100 - span(l.coords.lat, minLat, maxLat),
        },
      };
    }
    let hash = 0;
    for (const ch of l.id) hash = (hash * 31 + ch.charCodeAt(0)) % 997;
    return {
      ...l,
      coords: { ...l.coords, x: 12 + (hash % 76), y: 12 + ((hash * 7) % 76) },
    };
  });
}

// Residual client-side filtering for everything the server query doesn't
// cover (multi-type, studio-exact, sqft, amenities, pets, parking, and the
// full location text). Runs over server results — harmless overlap with
// server params keeps one code path for both browse pages.
export function applyListingFilters(
  listings: RentalProperty[],
  filters: FilterState,
): RentalProperty[] {
  return listings.filter((property) => {
    if (filters.locationQuery.trim()) {
      const query = filters.locationQuery.toLowerCase().trim();
      const matchesLocation =
        property.title.toLowerCase().includes(query) ||
        property.address.toLowerCase().includes(query) ||
        property.neighborhood.toLowerCase().includes(query) ||
        property.city.toLowerCase().includes(query);
      if (!matchesLocation) return false;
    }

    if (property.price < filters.minPrice) return false;
    if (filters.maxPrice < 4500 && property.price > filters.maxPrice) return false;

    if (
      filters.propertyTypes.length > 0 &&
      !filters.propertyTypes.includes(property.propertyType)
    ) {
      return false;
    }

    if (filters.beds !== null) {
      if (filters.beds === 0 && property.beds !== 0) return false;
      if (filters.beds > 0 && property.beds < filters.beds) return false;
    }

    if (filters.baths !== null && property.baths < filters.baths) {
      return false;
    }

    if (property.sqft < filters.minSqft) return false;
    if (filters.maxSqft < 2800 && property.sqft > filters.maxSqft) return false;

    if (filters.amenities.length > 0) {
      const hasAllAmenities = filters.amenities.every((amenity) =>
        property.amenities.includes(amenity),
      );
      if (!hasAllAmenities) return false;
    }

    if (filters.petFriendlyOnly && !property.petFriendly) return false;
    if (filters.parkingOnly && !property.parkingIncluded) return false;

    return true;
  });
}

// Server-supported params for GET /api/properties. The location query is
// deliberately NOT passed: the server only matches it against city, while
// the UI searches title/address/neighborhood/city — that stays residual so
// behavior matches the old client-side search exactly.
export function toPropertyQuery(filters: FilterState): Record<string, unknown> {
  const params: Record<string, unknown> = {};
  if (filters.propertyTypes.length === 1)
    params.propertyType = filters.propertyTypes[0];
  if (filters.beds !== null && filters.beds > 0) params.beds = filters.beds;
  if (filters.baths !== null) params.baths = filters.baths;
  if (filters.minPrice > 0) params.minPrice = filters.minPrice;
  if (filters.maxPrice < 4500) params.maxPrice = filters.maxPrice;
  return params;
}
