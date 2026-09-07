import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import type { AuthenticatedRequest } from "../middleware/authenticate.js";
import { getOrCreateManager } from "../middleware/authorize.js";
import type { ApplicationStatus, PaymentStatus } from "@prisma/client";

export async function getManagerProperties(req: Request, res: Response) {
  try {
    const user = (req as AuthenticatedRequest).user;
    const manager = await getOrCreateManager(user.id);

    const properties = await prisma.property.findMany({
      where: { managerId: manager.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            applications: true,
            leases: true,
          },
        },
        applications: {
          where: { status: "Pending" },
          select: { id: true },
        },
        leases: {
          select: {
            id: true,
            startDate: true,
            endDate: true,
            rent: true,
          },
        },
      },
    });

    const formatted = properties.map((p) => ({
      ...p,
      pendingApplicationsCount: p.applications.length,
      totalApplicationsCount: p._count.applications,
      activeLeasesCount: p._count.leases,
    }));

    return res.json({ properties: formatted });
  } catch (error) {
    console.error("Error fetching manager properties:", error);
    return res.status(500).json({ error: "Failed to fetch manager properties" });
  }
}

export async function getManagerApplications(req: Request, res: Response) {
  try {
    const user = (req as AuthenticatedRequest).user;
    const manager = await getOrCreateManager(user.id);

    const applications = await prisma.application.findMany({
      where: {
        property: {
          managerId: manager.id,
        },
      },
      orderBy: { applicationDate: "desc" },
      include: {
        property: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            state: true,
            pricePerMonth: true,
            photoUrls: true,
            beds: true,
            baths: true,
            squareFeet: true,
          },
        },
        tenant: {
          select: {
            id: true,
            phoneNumber: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return res.json({ applications });
  } catch (error) {
    console.error("Error fetching manager applications:", error);
    return res.status(500).json({ error: "Failed to fetch applications" });
  }
}

export async function updateApplicationStatus(req: Request, res: Response) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { status, startDate } = req.body;
    const user = (req as AuthenticatedRequest).user;
    const manager = await getOrCreateManager(user.id);

    const validStatuses: ApplicationStatus[] = ["Pending", "Approved", "Denied"];
    if (!status || !validStatuses.includes(status as ApplicationStatus)) {
      return res.status(400).json({ error: "Invalid application status. Allowed: Pending, Approved, Denied" });
    }

    const application = await prisma.application.findUnique({
      where: { id },
    });

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    const property = await prisma.property.findUnique({
      where: { id: application.propertyId },
    });

    // Ownership check: verify application's property belongs to the requesting manager
    if (!property || property.managerId !== manager.id) {
      return res.status(403).json({ error: "Forbidden: You do not own the property for this application" });
    }

    // Approving mints the lease in the same transaction: rent/deposit come
    // from the property, term defaults to 12 months from the approval date
    // (or a manager-supplied start date). Re-approving an application that
    // already produced a lease does not mint a second one.
    if ((status as ApplicationStatus) === "Approved" && !application.leaseId) {
      const leaseStart = startDate ? new Date(startDate) : new Date();
      if (Number.isNaN(leaseStart.getTime())) {
        return res.status(400).json({ error: "Invalid lease start date" });
      }
      const leaseEnd = new Date(leaseStart);
      leaseEnd.setMonth(leaseEnd.getMonth() + 12);

      // One active lease per tenant: reject when the new term would overlap
      // an existing lease for this tenant.
      const overlapping = await prisma.lease.findFirst({
        where: {
          tenantId: application.tenantId,
          startDate: { lte: leaseEnd },
          endDate: { gte: leaseStart },
        },
        select: { id: true },
      });
      if (overlapping) {
        return res.status(409).json({ error: "Tenant already has a lease overlapping this term" });
      }

      const { updatedApplication, lease } = await prisma.$transaction(async (tx) => {
        const createdLease = await tx.lease.create({
          data: {
            propertyId: application.propertyId,
            tenantId: application.tenantId,
            startDate: leaseStart,
            endDate: leaseEnd,
            rent: property.pricePerMonth,
            deposit: property.securityDeposit,
          },
        });
        const updated = await tx.application.update({
          where: { id },
          data: { status: "Approved", leaseId: createdLease.id },
          include: {
            property: {
              select: {
                id: true,
                name: true,
                address: true,
              },
            },
          },
        });
        return { updatedApplication: updated, lease: createdLease };
      });

      return res.json({ application: updatedApplication, lease });
    }

    const updatedApplication = await prisma.application.update({
      where: { id },
      data: {
        status: status as ApplicationStatus,
      },
      include: {
        property: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
      },
    });

    return res.json({ application: updatedApplication });
  } catch (error) {
    console.error("Error updating application status:", error);
    return res.status(500).json({ error: "Failed to update application status" });
  }
}

const validPaymentStatuses: PaymentStatus[] = ["Pending", "Paid", "PartiallyPaid", "Overdue"];

// Manual invoice creation for a lease. No automated recurring billing —
// a manager creates each payment record against a lease they manage.
export async function createLeasePayment(req: Request, res: Response) {
  try {
    const user = (req as AuthenticatedRequest).user;
    const manager = await getOrCreateManager(user.id);
    const leaseId = Array.isArray(req.params.leaseId)
      ? req.params.leaseId[0]
      : req.params.leaseId;
    const { amountDue, amountPaid, dueDate, paymentDate, paymentStatus } = req.body;

    if (typeof amountDue !== "number" && typeof amountDue !== "string")
      return res.status(400).json({ error: "amountDue is required" });
    if (!dueDate || Number.isNaN(new Date(dueDate).getTime()))
      return res.status(400).json({ error: "A valid dueDate is required" });
    if (paymentStatus !== undefined && !validPaymentStatuses.includes(paymentStatus as PaymentStatus))
      return res.status(400).json({ error: "Invalid payment status. Allowed: Pending, Paid, PartiallyPaid, Overdue" });

    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
      include: { property: { select: { managerId: true } } },
    });
    if (!lease)
      return res.status(404).json({ error: "Lease not found" });
    if (lease.property.managerId !== manager.id)
      return res.status(403).json({ error: "Forbidden: You do not manage this lease" });

    const payment = await prisma.payment.create({
      data: {
        leaseId,
        amountDue,
        amountPaid:
          typeof amountPaid === "number" || typeof amountPaid === "string"
            ? amountPaid
            : 0,
        dueDate: new Date(dueDate),
        paymentDate: paymentDate ? new Date(paymentDate) : null,
        paymentStatus: (paymentStatus as PaymentStatus) ?? "Pending",
      },
    });

    return res.status(201).json({ payment });
  } catch (error) {
    console.error("Error creating payment:", error);
    return res.status(500).json({ error: "Failed to create payment" });
  }
}

