import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import type { AuthenticatedRequest } from "../middleware/authenticate.js";
import { getOrCreateManager } from "../middleware/authorize.js";
import type { AmenityEnum, HighlightEnum, PropertyType } from "@prisma/client";

function getIdParam(req: Request): string {
  return Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function sanitizeDecimal(value: unknown): number | string {
  if (typeof value === "number" || typeof value === "string") return value;
  return 0;
}

function parseEnumArray<T>(val: unknown): T[] {
  if (Array.isArray(val)) return val as T[];
  if (typeof val === "string") {
    return val
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean) as T[];
  }
  return [];
}

function parseCoordinate(value: unknown): number | null | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const num = typeof value === "string" ? Number(value.trim()) : Number(value);
  if (!Number.isFinite(num)) return null;
  return num;
}

// averageRating/numberOfReviews are computed from Review rows on read —
// they are not stored on Property. Exported for reuse by other
// property-embedding reads (e.g. favorites) so they stay consistent.
export async function withReviewStats<T extends { id: string }>(properties: T[]) {
  if (properties.length === 0) return properties.map((p) => ({ ...p, averageRating: null as number | null, numberOfReviews: 0 }));
  const stats = await prisma.review.groupBy({
    by: ["propertyId"],
    where: { propertyId: { in: properties.map((p) => p.id) } },
    _avg: { rating: true },
    _count: true,
  });
  const byProperty = new Map(stats.map((s) => [s.propertyId, s]));
  return properties.map((p) => ({
    ...p,
    averageRating: byProperty.get(p.id)?._avg.rating ?? null,
    numberOfReviews: byProperty.get(p.id)?._count ?? 0,
  }));
}

export async function getProperties(req: Request, res: Response) {
  try {
    const { city, propertyType, beds, baths, minPrice, maxPrice } = req.query;

    const where: Record<string, unknown> = {};
    if (city && typeof city === "string") {
      where.city = { contains: city, mode: "insensitive" };
    }
    if (propertyType && typeof propertyType === "string") {
      where.propertyType = propertyType as PropertyType;
    }
    if (beds) {
      where.beds = { gte: Number(beds) };
    }
    if (baths) {
      where.baths = { gte: Number(baths) };
    }
    if (minPrice || maxPrice) {
      const priceFilter: Record<string, number> = {};
      if (minPrice) priceFilter.gte = Number(minPrice);
      if (maxPrice) priceFilter.lte = Number(maxPrice);
      where.pricePerMonth = priceFilter;
    }

    const properties = await prisma.property.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        manager: {
          select: {
            id: true,
            phoneNumber: true,
            user: { select: { name: true, email: true } },
          },
        },
      },
    });

    return res.json({ properties: await withReviewStats(properties) });
  } catch (error) {
    console.error("Error fetching properties:", error);
    return res.status(500).json({ error: "Failed to fetch properties" });
  }
}

export async function getPropertyById(req: Request, res: Response) {
  try {
    const id = getIdParam(req);
    if (!isUuid(id)) {
      return res.status(404).json({ error: "Property not found" });
    }
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        manager: {
          select: {
            id: true,
            phoneNumber: true,
            user: { select: { name: true, email: true } },
          },
        },
        leases: {
          take: 5,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    const [withStats] = await withReviewStats([property]);
    return res.json({ property: withStats });
  } catch (error) {
    console.error("Error fetching property by ID:", error);
    return res.status(500).json({ error: "Failed to fetch property" });
  }
}

export async function createProperty(req: Request, res: Response) {
  try {
    const user = (req as AuthenticatedRequest).user;
    const manager = await getOrCreateManager(user.id);

    const {
      name,
      description,
      pricePerMonth,
      securityDeposit,
      applicationFee,
      photoUrls,
      amenities,
      highlights,
      isPetsAllowed,
      isParkingIncluded,
      beds,
      baths,
      squareFeet,
      propertyType,
      address,
      city,
      state,
      country,
      postalCode,
      latitude,
      longitude,
    } = req.body;

    if (!name || !pricePerMonth || !address || !city || !state || !country || !postalCode) {
      return res.status(400).json({ error: "Missing required listing fields" });
    }

    const lat = parseCoordinate(latitude);
    const lng = parseCoordinate(longitude);
    if (lat === null || lng === null) {
      return res.status(400).json({ error: "Latitude and longitude must be valid numbers" });
    }

    const property = await prisma.property.create({
      data: {
        managerId: manager.id,
        name: String(name),
        description: String(description || ""),
        pricePerMonth: sanitizeDecimal(pricePerMonth),
        securityDeposit: sanitizeDecimal(securityDeposit ?? 0),
        applicationFee: sanitizeDecimal(applicationFee ?? 0),
        photoUrls: Array.isArray(photoUrls) ? photoUrls : [],
        amenities: parseEnumArray<AmenityEnum>(amenities),
        highlights: parseEnumArray<HighlightEnum>(highlights),
        isPetsAllowed: Boolean(isPetsAllowed),
        isParkingIncluded: Boolean(isParkingIncluded),
        beds: Number(beds) || 1,
        baths: Number(baths) || 1,
        squareFeet: Number(squareFeet) || 500,
        propertyType: (propertyType as PropertyType) || "Apartment",
        address: String(address),
        city: String(city),
        state: String(state),
        country: String(country),
        postalCode: String(postalCode),
        ...(lat !== undefined ? { latitude: lat } : {}),
        ...(lng !== undefined ? { longitude: lng } : {}),
      },
      include: {
        manager: {
          select: {
            id: true,
            phoneNumber: true,
            user: { select: { name: true, email: true } },
          },
        },
      },
    });

    return res.status(201).json({ property });
  } catch (error) {
    console.error("Error creating property:", error);
    return res.status(500).json({ error: "Failed to create property" });
  }
}

export async function updateProperty(req: Request, res: Response) {
  try {
    const id = getIdParam(req);
    const user = (req as AuthenticatedRequest).user;
    const manager = await getOrCreateManager(user.id);

    const existingProperty = await prisma.property.findUnique({
      where: { id },
    });

    if (!existingProperty) {
      return res.status(404).json({ error: "Property not found" });
    }

    // Ownership check: manager must own this property
    if (existingProperty.managerId !== manager.id) {
      return res.status(403).json({ error: "Forbidden: You do not own this property" });
    }

    const {
      name,
      description,
      pricePerMonth,
      securityDeposit,
      applicationFee,
      photoUrls,
      amenities,
      highlights,
      isPetsAllowed,
      isParkingIncluded,
      beds,
      baths,
      squareFeet,
      propertyType,
      address,
      city,
      state,
      country,
      postalCode,
      latitude,
      longitude,
    } = req.body;

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = String(name);
    if (description !== undefined) data.description = String(description);
    if (pricePerMonth !== undefined) data.pricePerMonth = sanitizeDecimal(pricePerMonth);
    if (securityDeposit !== undefined) data.securityDeposit = sanitizeDecimal(securityDeposit);
    if (applicationFee !== undefined) data.applicationFee = sanitizeDecimal(applicationFee);
    if (photoUrls !== undefined) data.photoUrls = Array.isArray(photoUrls) ? photoUrls : [];
    if (amenities !== undefined) data.amenities = parseEnumArray<AmenityEnum>(amenities);
    if (highlights !== undefined) data.highlights = parseEnumArray<HighlightEnum>(highlights);
    if (isPetsAllowed !== undefined) data.isPetsAllowed = Boolean(isPetsAllowed);
    if (isParkingIncluded !== undefined) data.isParkingIncluded = Boolean(isParkingIncluded);
    if (beds !== undefined) data.beds = Number(beds);
    if (baths !== undefined) data.baths = Number(baths);
    if (squareFeet !== undefined) data.squareFeet = Number(squareFeet);
    if (propertyType !== undefined) data.propertyType = propertyType as PropertyType;
    if (address !== undefined) data.address = String(address);
    if (city !== undefined) data.city = String(city);
    if (state !== undefined) data.state = String(state);
    if (country !== undefined) data.country = String(country);
    if (postalCode !== undefined) data.postalCode = String(postalCode);
    if (latitude !== undefined || longitude !== undefined) {
      const lat = parseCoordinate(latitude ?? null);
      const lng = parseCoordinate(longitude ?? null);
      if (lat === null || lng === null) {
        return res.status(400).json({ error: "Latitude and longitude must be valid numbers" });
      }
      // Explicit null clears a coordinate; undefined leaves it untouched.
      if (latitude !== undefined) data.latitude = latitude === null ? null : lat;
      if (longitude !== undefined) data.longitude = longitude === null ? null : lng;
    }

    const updatedProperty = await prisma.property.update({
      where: { id },
      data,
      include: {
        manager: {
          select: {
            id: true,
            phoneNumber: true,
            user: { select: { name: true, email: true } },
          },
        },
      },
    });

    return res.json({ property: updatedProperty });
  } catch (error) {
    console.error("Error updating property:", error);
    return res.status(500).json({ error: "Failed to update property" });
  }
}

export async function deleteProperty(req: Request, res: Response) {
  try {
    const id = getIdParam(req);
    const user = (req as AuthenticatedRequest).user;
    const manager = await getOrCreateManager(user.id);

    const existingProperty = await prisma.property.findUnique({
      where: { id },
    });

    if (!existingProperty) {
      return res.status(404).json({ error: "Property not found" });
    }

    // Ownership check: manager must own this property
    if (existingProperty.managerId !== manager.id) {
      return res.status(403).json({ error: "Forbidden: You do not own this property" });
    }

    await prisma.property.delete({
      where: { id },
    });

    return res.status(204).send();
  } catch (error) {
    console.error("Error deleting property:", error);
    return res.status(500).json({ error: "Failed to delete property" });
  }
}

