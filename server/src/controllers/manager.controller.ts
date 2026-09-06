import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import type { AuthenticatedRequest } from "../middleware/authenticate.js";
import { getOrCreateManager } from "../middleware/authorize.js";
import type { ApplicationStatus } from "@prisma/client";

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
    const { status } = req.body;
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

