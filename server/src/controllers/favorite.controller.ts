import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import type { AuthenticatedRequest } from "../middleware/authenticate.js";
import { getOrCreateTenant } from "../middleware/authorize.js";
import { withReviewStats } from "./property.controller.js";

export async function getFavorites(req: Request, res: Response) {
  try {
    const user = (req as AuthenticatedRequest).user;
    const tenant = await getOrCreateTenant(user.id);

    const favorites = await prisma.favorite.findMany({
      where: { tenantId: tenant.id },
      orderBy: { createdAt: "desc" },
      include: { property: true },
    });

    const withStats = new Map(
      (await withReviewStats(favorites.map((f) => f.property))).map((p) => [p.id, p]),
    );

    return res.json({
      favorites: favorites.map((f) => ({
        ...f,
        property: withStats.get(f.property.id) ?? f.property,
      })),
    });
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return res.status(500).json({ error: "Failed to fetch favorites" });
  }
}

export async function addFavorite(req: Request, res: Response) {
  try {
    const user = (req as AuthenticatedRequest).user;
    const tenant = await getOrCreateTenant(user.id);
    const { propertyId } = req.body;

    if (!propertyId || typeof propertyId !== "string")
      return res.status(400).json({ error: "propertyId is required" });

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true },
    });
    if (!property)
      return res.status(404).json({ error: "Property not found" });

    try {
      const favorite = await prisma.favorite.create({
        data: { tenantId: tenant.id, propertyId },
        include: { property: true },
      });
      return res.status(201).json({ favorite });
    } catch (err: unknown) {
      if (
        err instanceof Error &&
        err.constructor.name === "PrismaClientKnownRequestError"
      ) {
        return res.status(409).json({ error: "Property already favorited" });
      }
      throw err;
    }
  } catch (error) {
    console.error("Error adding favorite:", error);
    return res.status(500).json({ error: "Failed to add favorite" });
  }
}

export async function removeFavorite(req: Request, res: Response) {
  try {
    const user = (req as AuthenticatedRequest).user;
    const tenant = await getOrCreateTenant(user.id);
    const propertyId = Array.isArray(req.params.propertyId)
      ? req.params.propertyId[0]
      : req.params.propertyId;

    await prisma.favorite.deleteMany({
      where: { tenantId: tenant.id, propertyId },
    });

    return res.status(204).send();
  } catch (error) {
    console.error("Error removing favorite:", error);
    return res.status(500).json({ error: "Failed to remove favorite" });
  }
}
