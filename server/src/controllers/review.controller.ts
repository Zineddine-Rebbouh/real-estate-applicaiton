import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import type { AuthenticatedRequest } from "../middleware/authenticate.js";
import { getOrCreateTenant } from "../middleware/authorize.js";

// A tenant may only review a property they have actually held a lease on.
// Enforced here in application logic, deliberately not as a DB rule.
async function hasLeaseHistory(tenantId: string, propertyId: string) {
  const lease = await prisma.lease.findFirst({
    where: {
      tenantId,
      propertyId,
      startDate: { lte: new Date() },
    },
    select: { id: true },
  });
  return Boolean(lease);
}

export async function getPropertyReviews(req: Request, res: Response) {
  try {
    const propertyId = Array.isArray(req.params.propertyId)
      ? req.params.propertyId[0]
      : req.params.propertyId;

    const reviews = await prisma.review.findMany({
      where: { propertyId },
      orderBy: { createdAt: "desc" },
      include: {
        tenant: {
          select: {
            user: { select: { id: true, name: true } },
          },
        },
      },
    });

    const aggregate = await prisma.review.aggregate({
      where: { propertyId },
      _avg: { rating: true },
      _count: true,
    });

    return res.json({
      reviews,
      averageRating: aggregate._avg.rating,
      numberOfReviews: aggregate._count,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return res.status(500).json({ error: "Failed to fetch reviews" });
  }
}

export async function createReview(req: Request, res: Response) {
  try {
    const user = (req as AuthenticatedRequest).user;
    const tenant = await getOrCreateTenant(user.id);
    const propertyId = Array.isArray(req.params.propertyId)
      ? req.params.propertyId[0]
      : req.params.propertyId;
    const { rating, comment } = req.body;

    if (!Number.isInteger(rating) || rating < 1 || rating > 5)
      return res.status(400).json({ error: "Rating must be an integer from 1 to 5" });

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true },
    });
    if (!property)
      return res.status(404).json({ error: "Property not found" });

    if (!(await hasLeaseHistory(tenant.id, propertyId)))
      return res.status(403).json({ error: "You can only review a property you have leased" });

    try {
      const review = await prisma.review.create({
        data: {
          propertyId,
          tenantId: tenant.id,
          rating,
          comment: typeof comment === "string" && comment.trim() ? comment.trim() : null,
        },
      });
      return res.status(201).json({ review });
    } catch (err: unknown) {
      if (
        err instanceof Error &&
        err.constructor.name === "PrismaClientKnownRequestError"
      ) {
        return res.status(409).json({ error: "You have already reviewed this property" });
      }
      throw err;
    }
  } catch (error) {
    console.error("Error creating review:", error);
    return res.status(500).json({ error: "Failed to create review" });
  }
}

export async function deleteReview(req: Request, res: Response) {
  try {
    const user = (req as AuthenticatedRequest).user;
    const tenant = await getOrCreateTenant(user.id);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review)
      return res.status(404).json({ error: "Review not found" });
    if (review.tenantId !== tenant.id)
      return res.status(403).json({ error: "Forbidden: You can only remove your own review" });

    await prisma.review.delete({ where: { id } });
    return res.status(204).send();
    } catch (error) {
    console.error("Error deleting review:", error);
    return res.status(500).json({ error: "Failed to delete review" });
  }
}
