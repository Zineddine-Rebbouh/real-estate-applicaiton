import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import type { AuthenticatedRequest } from "../middleware/authenticate.js";
import { getOrCreateTenant } from "../middleware/authorize.js";

// Same property shape as the manager review queue so both sides can share
// the client type, plus the manager contact the tenant UI shows and the
// lease dates an approved application displays.
const propertySelect = {
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
  manager: {
    select: {
      phoneNumber: true,
      user: { select: { name: true, email: true } },
    },
  },
};

const leaseSelect = {
  select: { startDate: true, endDate: true },
};

// POST /api/applications — tenant submits an application for a property.
// Contact fields are snapshotted from the body (same contract as the
// client's applicationSchema); approval later reads propertyId/tenantId
// off this record to mint the lease.
export async function createApplication(req: Request, res: Response) {
  try {
    const user = (req as AuthenticatedRequest).user;
    const tenant = await getOrCreateTenant(user.id);
    const { propertyId, name, email, phoneNumber, message } = req.body;

    if (!propertyId || typeof propertyId !== "string")
      return res.status(400).json({ error: "propertyId is required" });
    if (!name || typeof name !== "string" || !name.trim())
      return res.status(400).json({ error: "Name is required" });
    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({ error: "A valid email is required" });
    if (!phoneNumber || typeof phoneNumber !== "string" || phoneNumber.trim().length < 10)
      return res.status(400).json({ error: "A valid phone number is required" });

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true },
    });
    if (!property)
      return res.status(404).json({ error: "Property not found" });

    const existingPending = await prisma.application.findFirst({
      where: { propertyId, tenantId: tenant.id, status: "Pending" },
      select: { id: true },
    });
    if (existingPending)
      return res.status(409).json({ error: "You already have a pending application for this property" });

    const application = await prisma.application.create({
      data: {
        propertyId,
        tenantId: tenant.id,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phoneNumber: phoneNumber.trim(),
        message: typeof message === "string" && message.trim() ? message.trim() : null,
      },
      include: { property: { select: propertySelect }, lease: leaseSelect },
    });

    return res.status(201).json({ application });
  } catch (error) {
    console.error("Error creating application:", error);
    return res.status(500).json({ error: "Failed to submit application" });
  }
}

// GET /api/applications — tenant's own applications, newest first.
export async function getTenantApplications(req: Request, res: Response) {
  try {
    const user = (req as AuthenticatedRequest).user;
    const tenant = await getOrCreateTenant(user.id);

    const applications = await prisma.application.findMany({
      where: { tenantId: tenant.id },
      orderBy: { applicationDate: "desc" },
      include: { property: { select: propertySelect }, lease: leaseSelect },
    });

    return res.json({ applications });
  } catch (error) {
    console.error("Error fetching tenant applications:", error);
    return res.status(500).json({ error: "Failed to fetch applications" });
  }
}

// PATCH /api/applications/:id/withdraw — soft withdraw. Only a Pending
// application can be withdrawn; an Approved one already minted a lease
// (withdrawing must not orphan it), so the tenant talks to the manager
// instead. History is preserved for both sides to see.
export async function withdrawApplication(req: Request, res: Response) {
  try {
    const user = (req as AuthenticatedRequest).user;
    const tenant = await getOrCreateTenant(user.id);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const application = await prisma.application.findUnique({
      where: { id },
    });
    if (!application || application.tenantId !== tenant.id)
      return res.status(404).json({ error: "Application not found" });
    if (application.status === "Withdrawn")
      return res.status(409).json({ error: "Application is already withdrawn" });
    if (application.status !== "Pending")
      return res.status(409).json({
        error:
          application.status === "Approved"
            ? "This application already created a lease — contact the property manager"
            : "Only a pending application can be withdrawn",
      });

    const updated = await prisma.application.update({
      where: { id },
      data: { status: "Withdrawn" },
      include: { property: { select: propertySelect }, lease: leaseSelect },
    });

    return res.json({ application: updated });
  } catch (error) {
    console.error("Error withdrawing application:", error);
    return res.status(500).json({ error: "Failed to withdraw application" });
  }
}
