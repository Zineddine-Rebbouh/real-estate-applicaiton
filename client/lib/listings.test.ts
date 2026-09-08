import { describe, expect, it } from "vitest";
import {
  applyListingFilters,
  layoutListingCoords,
  mapPropertyToListing,
  toPropertyQuery,
} from "./listings";
import type { Property } from "@/state/api";
import { INITIAL_FILTERS, type RentalProperty } from "@/src/data/rentals-data";

function property(overrides: Partial<Property> = {}): Property {
  return {
    id: "cc000000-0000-0000-0000-000000000001",
    managerId: "aa000000-0000-0000-0000-000000000001",
    name: "Sunny Downtown Apartment",
    description: "Bright rental.",
    pricePerMonth: 1500,
    securityDeposit: 1500,
    applicationFee: 50,
    photoUrls: ["/singlelisting-1.jpg"],
    amenities: ["WasherDryer", "Parking"],
    highlights: ["CloseToTransit"],
    isPetsAllowed: true,
    isParkingIncluded: false,
    beds: 2,
    baths: 1,
    squareFeet: 800,
    propertyType: "Apartment",
    address: "123 Colorado Blvd",
    city: "Pasadena",
    state: "CA",
    country: "United States",
    postalCode: "91105",
    ...overrides,
  };
}

function listing(overrides: Partial<RentalProperty> = {}): RentalProperty {
  return {
    id: "x",
    title: "T",
    address: "A",
    neighborhood: "N",
    city: "C",
    price: 1500,
    beds: 2,
    baths: 1,
    sqft: 800,
    propertyType: "Apartment",
    image: "/i.jpg",
    gallery: ["/i.jpg"],
    badges: [],
    rating: 4.5,
    reviewCount: 10,
    coords: { x: 50, y: 50, lat: 0, lng: 0 },
    amenities: ["washer_dryer", "pet_friendly"],
    petFriendly: true,
    parkingIncluded: false,
    availableDate: "Available Now",
    ...overrides,
  };
}

describe("mapPropertyToListing", () => {
  it("maps core fields and server amenity ids to filter ids", () => {
    const l = mapPropertyToListing(property());
    expect(l.title).toBe("Sunny Downtown Apartment");
    expect(l.price).toBe(1500);
    expect(l.amenities).toEqual(["washer_dryer"]);
    expect(l.petFriendly).toBe(true);
    // Parking has no mock amenity id — covered by the flag instead.
    expect(l.parkingIncluded).toBe(true);
    expect(l.amenities).not.toContain("parking");
  });

  it("falls back to placeholder image and zero rating", () => {
    const l = mapPropertyToListing(
      property({ photoUrls: [], averageRating: null, numberOfReviews: 0 }),
    );
    expect(l.image).toBe("/singlelisting-1.jpg");
    expect(l.gallery).toEqual(["/singlelisting-1.jpg"]);
    expect(l.rating).toBe(0);
  });

  it("reads Decimal-style string money", () => {
    const l = mapPropertyToListing(property({ pricePerMonth: "2450.5" }));
    expect(l.price).toBe(2450.5);
  });
});

describe("applyListingFilters", () => {
  const base = [listing()];

  it("matches location across title/address/neighborhood/city", () => {
    const f = { ...INITIAL_FILTERS, locationQuery: "pasadena" };
    expect(
      applyListingFilters([listing({ city: "Pasadena" })], f),
    ).toHaveLength(1);
    expect(applyListingFilters(base, { ...INITIAL_FILTERS, locationQuery: "zzz" })).toHaveLength(0);
  });

  it("enforces studio-exact beds=0 and gte otherwise", () => {
    expect(
      applyListingFilters([listing({ beds: 0 }), listing({ beds: 2 })], {
        ...INITIAL_FILTERS,
        beds: 0,
      }).map((l) => l.beds),
    ).toEqual([0]);
    expect(
      applyListingFilters([listing({ beds: 1 }), listing({ beds: 3 })], {
        ...INITIAL_FILTERS,
        beds: 2,
      }).map((l) => l.beds),
    ).toEqual([3]);
  });

  it("requires all selected amenities plus pet/parking flags", () => {
    const f = {
      ...INITIAL_FILTERS,
      amenities: ["washer_dryer", "pool"],
      petFriendlyOnly: true,
      parkingOnly: true,
    };
    expect(applyListingFilters(base, f)).toHaveLength(0);
    expect(
      applyListingFilters(
        [listing({ amenities: ["washer_dryer", "pool"], parkingIncluded: true })],
        f,
      ),
    ).toHaveLength(1);
  });
});

describe("toPropertyQuery", () => {
  it("passes only server-supported params", () => {
    expect(
      toPropertyQuery({
        ...INITIAL_FILTERS,
        locationQuery: "Linden",
        propertyTypes: ["Loft"],
        beds: 2,
        minPrice: 1000,
        maxPrice: 3000,
      }),
    ).toEqual({ propertyType: "Loft", beds: 2, minPrice: 1000, maxPrice: 3000 });
  });

  it("skips multi-type, studio beds, and default ranges", () => {
    expect(
      toPropertyQuery({
        ...INITIAL_FILTERS,
        propertyTypes: ["Loft", "Studio"],
        beds: 0,
      }),
    ).toEqual({ minPrice: 800 });
  });
});

describe("layoutListingCoords", () => {
  it("normalizes real lat/lng into percentage space", () => {
    const out = layoutListingCoords([
      listing({ id: "a", coords: { x: -1, y: -1, lat: 34, lng: -118 } }),
      listing({ id: "b", coords: { x: -1, y: -1, lat: 35, lng: -117 } }),
    ]);
    for (const l of out) {
      expect(l.coords.x).toBeGreaterThanOrEqual(10);
      expect(l.coords.x).toBeLessThanOrEqual(90);
      expect(l.coords.y).toBeGreaterThanOrEqual(10);
      expect(l.coords.y).toBeLessThanOrEqual(90);
    }
    // Higher latitude renders higher up (smaller y).
    expect(out[1].coords.y).toBeLessThan(out[0].coords.y);
  });

  it("gives coordinate-less listings stable hashed slots", () => {
    const a = layoutListingCoords([listing({ id: "stable-id" })])[0].coords;
    const b = layoutListingCoords([listing({ id: "stable-id" })])[0].coords;
    expect(a).toEqual(b);
    expect(a.x).not.toBe(-1);
  });
});
