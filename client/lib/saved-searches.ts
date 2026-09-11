import { FilterState, INITIAL_FILTERS } from "@/src/data/rentals-data";

export interface SavedSearch {
  id: string;
  name: string;
  createdAt: string;
  filters: FilterState;
  summary: string;
}

const STORAGE_KEY = "habitat_saved_searches";

export const STARTER_SAVED_SEARCHES: SavedSearch[] = [
  {
    id: "saved-1",
    name: "Pet-Friendly 2+ Beds under $3,000",
    createdAt: "2026-09-01T10:00:00.000Z",
    summary: "2+ Beds • Under $3,000 • Pets Welcome",
    filters: {
      ...INITIAL_FILTERS,
      beds: 2,
      maxPrice: 3000,
      petFriendlyOnly: true,
    },
  },
  {
    id: "saved-2",
    name: "Downtown Studios & 1-Beds with Parking",
    createdAt: "2026-09-05T14:30:00.000Z",
    summary: "Studio or 1 Bed • Parking Included",
    filters: {
      ...INITIAL_FILTERS,
      beds: 1,
      parkingOnly: true,
    },
  },
  {
    id: "saved-3",
    name: "Luxury Modern Flats & Penthouses",
    createdAt: "2026-09-07T09:15:00.000Z",
    summary: "Apartment or Loft • In-Unit Laundry",
    filters: {
      ...INITIAL_FILTERS,
      minPrice: 2000,
      propertyTypes: ["Apartment", "Loft"],
      amenities: ["In-unit Laundry"],
    },
  },
];

export function getSavedSearches(): SavedSearch[] {
  if (typeof window === "undefined") return STARTER_SAVED_SEARCHES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(STARTER_SAVED_SEARCHES));
      return STARTER_SAVED_SEARCHES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : STARTER_SAVED_SEARCHES;
  } catch {
    return STARTER_SAVED_SEARCHES;
  }
}

export function formatFilterSummary(filters: FilterState): string {
  const parts: string[] = [];

  if (filters.locationQuery) {
    parts.push(filters.locationQuery);
  }

  if (filters.beds !== null) {
    parts.push(filters.beds === 0 ? "Studio" : `${filters.beds}+ Beds`);
  }

  if (filters.baths !== null) {
    parts.push(`${filters.baths}+ Baths`);
  }

  if (filters.minPrice > 0 || filters.maxPrice < 10000) {
    if (filters.minPrice > 0 && filters.maxPrice < 10000) {
      parts.push(`$${filters.minPrice}–$${filters.maxPrice}`);
    } else if (filters.minPrice > 0) {
      parts.push(`From $${filters.minPrice}`);
    } else {
      parts.push(`Under $${filters.maxPrice}`);
    }
  }

  if (filters.petFriendlyOnly) {
    parts.push("Pet-Friendly");
  }

  if (filters.parkingOnly) {
    parts.push("Parking Included");
  }

  if (filters.propertyTypes && filters.propertyTypes.length > 0) {
    parts.push(filters.propertyTypes.join(", "));
  }

  return parts.length > 0 ? parts.join(" • ") : "All Available Rentals";
}

export function saveSearch(name: string, filters: FilterState): SavedSearch {
  const searches = getSavedSearches();
  const summary = formatFilterSummary(filters);
  const newSearch: SavedSearch = {
    id: `search-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: name.trim() || `Search (${summary.slice(0, 30)})`,
    createdAt: new Date().toISOString(),
    filters: { ...filters },
    summary,
  };

  const updated = [newSearch, ...searches.filter((s) => s.id !== newSearch.id)];
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
  return newSearch;
}

export function deleteSavedSearch(id: string): SavedSearch[] {
  const searches = getSavedSearches();
  const updated = searches.filter((s) => s.id !== id);
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
  return updated;
}

