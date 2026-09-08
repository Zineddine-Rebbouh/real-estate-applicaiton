import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import type { AuthenticatedRequest } from "../middleware/authenticate.js";
import { getOrCreateManager, getOrCreateTenant } from "../middleware/authorize.js";
import type { TourStatus, TourType } from "@prisma/client";

const propertySelect = {
  id: true,
  name: true,
  address: true,
  city: true,
  photoUrls: true,
};

const requesterSelect = {
  phoneNumber: true,
  user: { select: { name: true, email: true } },
};

function getId(req: Request): string {
  return Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
}

const validTourTypes: TourType[] = ["InPerson", "Video"];

// POST /api/tours — tenant requests a tour with the slot labels picked in
// the modal. Contact snapshot comes from the session.
export async function createTourRequest(req: Request, res: Response) {
  try {
    const authUser = (req as AuthenticatedRequest).user;
    const tenant = await getOrCreateTenant(authUser.id);
    const { propertyId, tourType, preferredDate, preferredTime, note } = req.body;

    if (!propertyId || typeof propertyId !== "string")
      return res.status(400).json({ error: "propertyId is required" });
    if (!tourType || !validTourTypes.includes(tourType as TourType))
      return res.status(400).json({ error: "tourType must be InPerson or Video" });
    if (!preferredDate || typeof preferredDate !== "string" || !preferredDate.trim())
      return res.status(400).json({ error: "A preferred date is required" });
    if (!preferredTime || typeof preferredTime !== "string" || !preferredTime.trim())
      return res.status(400).json({ error: "A preferred time is required" });

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true },
    });
    if (!property)
      return res.status(404).json({ error: "Property not found" });

    const tour = await prisma.tourRequest.create({
      data: {
        propertyId,
        tenantId: tenant.id,
        name: authUser.name,
        email: authUser.email,
        tourType: tourType as TourType,
        preferredDate: preferredDate.trim(),
        preferredTime: preferredTime.trim(),
        note: typeof note === "string" && note.trim() ? note.trim().slice(0, 1000) : null,
      },
      include: { property: { select: propertySelect } },
    });

    return res.status(201).json({ tourRequest: tour });
  } catch (error) {
    console.error("Error creating tour request:", error);
    return res.status(500).json({ error: "Failed to request tour" });
  }
}

// POST /api/messages — tenant messages a property's manager.
export async function createContactMessage(req: Request, res: Response) {
  try {
    const authUser = (req as AuthenticatedRequest).user;
    const tenant = await getOrCreateTenant(authUser.id);
    const { propertyId, message } = req.body;

    if (!propertyId || typeof propertyId !== "string")
      return res.status(400).json({ error: "propertyId is required" });
    if (!message || typeof message !== "string" || !message.trim() || message.length > 2000)
      return res.status(400).json({ error: "A message (max 2000 characters) is required" });

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true },
    });
    if (!property)
      return res.status(404).json({ error: "Property not found" });

    const contact = await prisma.contactMessage.create({
      data: {
        propertyId,
        tenantId: tenant.id,
        name: authUser.name,
        email: authUser.email,
        message: message.trim(),
      },
      include: { property: { select: propertySelect } },
    });

    return res.status(201).json({ contactMessage: contact });
  } catch (error) {
    console.error("Error creating contact message:", error);
    return res.status(500).json({ error: "Failed to send message" });
  }
}

// GET /api/manager/tours — tour requests on the manager's properties.
export async function getManagerTourRequests(req: Request, res: Response) {
  try {
    const user = (req as AuthenticatedRequest).user;
    const manager = await getOrCreateManager(user.id);

    const tours = await prisma.tourRequest.findMany({
      where: { property: { managerId: manager.id } },
      orderBy: { createdAt: "desc" },
      include: {
        property: { select: propertySelect },
        tenant: { select: requesterSelect },
      },
    });

    return res.json({ tourRequests: tours });
  } catch (error) {
    console.error("Error fetching tour requests:", error);
    return res.status(500).json({ error: "Failed to fetch tour requests" });
  }
}

// GET /api/manager/messages — contact messages on the manager's properties.
export async function getManagerContactMessages(req: Request, res: Response) {
  try {
    const user = (req as AuthenticatedRequest).user;
    const manager = await getOrCreateManager(user.id);

    const messages = await prisma.contactMessage.findMany({
      where: { property: { managerId: manager.id } },
      orderBy: { createdAt: "desc" },
      include: {
        property: { select: propertySelect },
        tenant: { select: requesterSelect },
      },
    });

    return res.json({ contactMessages: messages });
  } catch (error) {
    console.error("Error fetching contact messages:", error);
    return res.status(500).json({ error: "Failed to fetch contact messages" });
  }
}

const validTourStatuses: TourStatus[] = ["Pending", "Confirmed", "Declined"];

// PATCH /api/tours/:id — manager confirms or declines (ownership-checked).
export async function updateTourStatus(req: Request, res: Response) {
  try {
    const user = (req as AuthenticatedRequest).user;
    const manager = await getOrCreateManager(user.id);
    const id = getId(req);
    const { status } = req.body;

    if (!status || !validTourStatuses.includes(status as TourStatus))
      return res.status(400).json({ error: "Invalid status. Allowed: Pending, Confirmed, Declined" });

    const existing = await prisma.tourRequest.findUnique({
      where: { id },
      include: { property: { select: { managerId: true } } },
    });
    if (!existing)
      return res.status(404).json({ error: "Tour request not found" });
    if (existing.property.managerId !== manager.id)
      return res.status(403).json({ error: "Forbidden: You do not manage this property" });

    const updated = await prisma.tourRequest.update({
      where: { id },
      data: { status: status as TourStatus },
      include: { property: { select: propertySelect } },
    });

    return res.json({ tourRequest: updated });
  } catch (error) {
    console.error("Error updating tour request:", error);
    return res.status(500).json({ error: "Failed to update tour request" });
  }
}
