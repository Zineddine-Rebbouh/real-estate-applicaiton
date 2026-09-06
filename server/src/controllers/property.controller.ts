import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import type { AuthenticatedRequest } from "../middleware/authenticate.js";
import { getOrCreateManager } from "../middleware/authorize.js";
import type { AmenityEnum, HighlightEnum, PropertyType } from "@prisma/client";

function getIdParam(req: Request): string {
  return Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
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

    return res.json({ properties });
  } catch (error) {
    console.error("Error fetching properties:", error);
    return res.status(500).json({ error: "Failed to fetch properties" });
  }
}

export async function getPropertyById(req: Request, res: Response) {
  try {
    const id = getIdParam(req);
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

    return res.json({ property });
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
    } = req.body;

    if (!name || !pricePerMonth || !address || !city || !state || !country || !postalCode) {
      return res.status(400).json({ error: "Missing required listing fields" });
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

