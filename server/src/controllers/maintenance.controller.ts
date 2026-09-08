import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import type { AuthenticatedRequest } from "../middleware/authenticate.js";
import { getOrCreateManager, getOrCreateTenant } from "../middleware/authorize.js";
import type { MaintenanceStatus } from "@prisma/client";

const propertySelect = {
  id: true,
  name: true,
  address: true,
  city: true,
  photoUrls: true,
};

function getId(req: Request): string {
  return Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
}

// POST /api/maintenance — tenant reports an issue on a property. The
// tenant's current lease on that property (if any) is snapshotted as
// leaseId for manager context.
export async function createMaintenanceRequest(req: Request, res: Response) {
  try {
    const user = (req as AuthenticatedRequest).user;
    const tenant = await getOrCreateTenant(user.id);
    const { propertyId, title, description } = req.body;

    if (!propertyId || typeof propertyId !== "string")
      return res.status(400).json({ error: "propertyId is required" });
    if (!title || typeof title !== "string" || !title.trim() || title.length > 120)
      return res.status(400).json({ error: "A title (max 120 characters) is required" });
    if (!description || typeof description !== "string" || !description.trim() || description.length > 2000)
      return res.status(400).json({ error: "A description (max 2000 characters) is required" });

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true },
    });
    if (!property)
      return res.status(404).json({ error: "Property not found" });

    const now = new Date();
    const currentLease = await prisma.lease.findFirst({
      where: {
        tenantId: tenant.id,
        propertyId,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      select: { id: true },
    });

    const request = await prisma.maintenanceRequest.create({
      data: {
        propertyId,
        tenantId: tenant.id,
        leaseId: currentLease?.id ?? null,
        title: title.trim(),
        description: description.trim(),
      },
      include: { property: { select: propertySelect } },
    });

    return res.status(201).json({ maintenanceRequest: request });
  } catch (error) {
    console.error("Error creating maintenance request:", error);
    return res.status(500).json({ error: "Failed to submit maintenance request" });
  }
}

// GET /api/maintenance — tenant's own requests, newest first.
export async function getTenantMaintenanceRequests(req: Request, res: Response) {
  try {
    const user = (req as AuthenticatedRequest).user;
    const tenant = await getOrCreateTenant(user.id);

    const requests = await prisma.maintenanceRequest.findMany({
      where: { tenantId: tenant.id },
      orderBy: { createdAt: "desc" },
      include: { property: { select: propertySelect } },
    });

    return res.json({ maintenanceRequests: requests });
  } catch (error) {
    console.error("Error fetching maintenance requests:", error);
    return res.status(500).json({ error: "Failed to fetch maintenance requests" });
  }
}

// GET /api/manager/maintenance — requests on the manager's properties.
export async function getManagerMaintenanceRequests(req: Request, res: Response) {
  try {
    const user = (req as AuthenticatedRequest).user;
    const manager = await getOrCreateManager(user.id);

    const requests = await prisma.maintenanceRequest.findMany({
      where: { property: { managerId: manager.id } },
      orderBy: { createdAt: "desc" },
      include: {
        property: { select: propertySelect },
        tenant: {
          select: {
            phoneNumber: true,
            user: { select: { name: true, email: true } },
          },
        },
      },
    });

    return res.json({ maintenanceRequests: requests });
  } catch (error) {
    console.error("Error fetching manager maintenance requests:", error);
    return res.status(500).json({ error: "Failed to fetch maintenance requests" });
  }
}

const validStatuses: MaintenanceStatus[] = ["Open", "InProgress", "Resolved"];

// PATCH /api/maintenance/:id — manager moves a request along. Any
// transition is allowed; the queue is a workflow aid, not a state machine.
export async function updateMaintenanceStatus(req: Request, res: Response) {
  try {
    const user = (req as AuthenticatedRequest).user;
    const manager = await getOrCreateManager(user.id);
    const id = getId(req);
    const { status } = req.body;

    if (!status || !validStatuses.includes(status as MaintenanceStatus))
      return res.status(400).json({ error: "Invalid status. Allowed: Open, InProgress, Resolved" });

    const existing = await prisma.maintenanceRequest.findUnique({
      where: { id },
      include: { property: { select: { managerId: true } } },
    });
    if (!existing)
      return res.status(404).json({ error: "Maintenance request not found" });
    if (existing.property.managerId !== manager.id)
      return res.status(403).json({ error: "Forbidden: You do not manage this property" });

    const updated = await prisma.maintenanceRequest.update({
      where: { id },
      data: { status: status as MaintenanceStatus },
      include: { property: { select: propertySelect } },
    });

    return res.json({ maintenanceRequest: updated });
  } catch (error) {
    console.error("Error updating maintenance request:", error);
    return res.status(500).json({ error: "Failed to update maintenance request" });
  }
}
