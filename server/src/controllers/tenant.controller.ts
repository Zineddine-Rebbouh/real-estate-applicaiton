import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import type { AuthenticatedRequest } from "../middleware/authenticate.js";
import { getOrCreateTenant } from "../middleware/authorize.js";

const leaseWithProperty = {
  property: true,
};

// A tenant's current residence is whichever lease's date range includes
// today. Only one lease is treated as active at a time (enforced when a
// lease is created on application approval).
export async function getCurrentLease(req: Request, res: Response) {
  try {
    const user = (req as AuthenticatedRequest).user;
    const tenant = await getOrCreateTenant(user.id);
    const now = new Date();

    const currentLease = await prisma.lease.findFirst({
      where: {
        tenantId: tenant.id,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: { startDate: "desc" },
      include: leaseWithProperty,
    });

    const pastLeases = await prisma.lease.findMany({
      where: {
        tenantId: tenant.id,
        endDate: { lt: now },
      },
      orderBy: { endDate: "desc" },
      include: leaseWithProperty,
    });

    return res.json({ currentLease, pastLeases });
  } catch (error) {
    console.error("Error fetching current lease:", error);
    return res.status(500).json({ error: "Failed to fetch current lease" });
  }
}

// Read-only payment history across all of the tenant's leases.
export async function getTenantPayments(req: Request, res: Response) {
  try {
    const user = (req as AuthenticatedRequest).user;
    const tenant = await getOrCreateTenant(user.id);

    const payments = await prisma.payment.findMany({
      where: { lease: { tenantId: tenant.id } },
      orderBy: { dueDate: "desc" },
      include: {
        lease: {
          select: {
            id: true,
            startDate: true,
            endDate: true,
            property: {
              select: { id: true, name: true, address: true },
            },
          },
        },
      },
    });

    return res.json({ payments });
  } catch (error) {
    console.error("Error fetching tenant payments:", error);
    return res.status(500).json({ error: "Failed to fetch payments" });
  }
}
