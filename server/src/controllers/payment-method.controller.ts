import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import type { AuthenticatedRequest } from "../middleware/authenticate.js";
import { getOrCreateTenant } from "../middleware/authorize.js";
import type { PaymentMethodType } from "@prisma/client";

const validTypes: PaymentMethodType[] = ["Card", "Bank"];

function getPaymentMethodId(req: Request): string {
  return Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
}

function validateExpiry(expMonth: unknown, expYear: unknown): string | null {
  if (expMonth === undefined && expYear === undefined) return null;
  if (
    !Number.isInteger(expMonth) ||
    (expMonth as number) < 1 ||
    (expMonth as number) > 12 ||
    !Number.isInteger(expYear)
  ) {
    return "Expiry must be a valid month and year";
  }
  const now = new Date();
  if (
    (expYear as number) < now.getFullYear() ||
    ((expYear as number) === now.getFullYear() &&
      (expMonth as number) < now.getMonth() + 1)
  ) {
    return "Card is expired";
  }
  return null;
}

export async function getPaymentMethods(req: Request, res: Response) {
  try {
    const user = (req as AuthenticatedRequest).user;
    const tenant = await getOrCreateTenant(user.id);

    const methods = await prisma.paymentMethod.findMany({
      where: { tenantId: tenant.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return res.json({ paymentMethods: methods });
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    return res.status(500).json({ error: "Failed to fetch payment methods" });
  }
}

export async function addPaymentMethod(req: Request, res: Response) {
  try {
    const user = (req as AuthenticatedRequest).user;
    const tenant = await getOrCreateTenant(user.id);
    const { type, brand, last4, expMonth, expYear, accountHolder, isDefault } = req.body;

    if (!type || !validTypes.includes(type as PaymentMethodType))
      return res.status(400).json({ error: "Type must be Card or Bank" });
    if (!last4 || typeof last4 !== "string" || !/^\d{4}$/.test(last4))
      return res.status(400).json({ error: "last4 must be exactly 4 digits" });
    if (!accountHolder || typeof accountHolder !== "string" || !accountHolder.trim() || accountHolder.length > 100)
      return res.status(400).json({ error: "Account holder name is required" });
    if (type === "Card") {
      if (!brand || typeof brand !== "string" || !brand.trim())
        return res.status(400).json({ error: "Card brand is required" });
      if (expMonth === undefined || expYear === undefined)
        return res.status(400).json({ error: "Card expiry is required" });
    }
    const expiryError = validateExpiry(expMonth, expYear);
    if (expiryError) return res.status(400).json({ error: expiryError });

    const existingCount = await prisma.paymentMethod.count({
      where: { tenantId: tenant.id },
    });
    const makeDefault = isDefault === true || existingCount === 0;

    const method = await prisma.$transaction(async (tx) => {
      if (makeDefault) {
        await tx.paymentMethod.updateMany({
          where: { tenantId: tenant.id },
          data: { isDefault: false },
        });
      }
      return tx.paymentMethod.create({
        data: {
          tenantId: tenant.id,
          type: type as PaymentMethodType,
          brand: typeof brand === "string" && brand.trim() ? brand.trim() : null,
          last4,
          expMonth: expMonth ?? null,
          expYear: expYear ?? null,
          accountHolder: accountHolder.trim(),
          isDefault: makeDefault,
        },
      });
    });

    return res.status(201).json({ paymentMethod: method });
  } catch (error) {
    console.error("Error adding payment method:", error);
    return res.status(500).json({ error: "Failed to add payment method" });
  }
}

export async function updatePaymentMethod(req: Request, res: Response) {
  try {
    const user = (req as AuthenticatedRequest).user;
    const tenant = await getOrCreateTenant(user.id);
    const id = getPaymentMethodId(req);
    const { accountHolder, expMonth, expYear, isDefault } = req.body;

    const existing = await prisma.paymentMethod.findUnique({ where: { id } });
    if (!existing || existing.tenantId !== tenant.id)
      return res.status(404).json({ error: "Payment method not found" });

    if (accountHolder !== undefined) {
      if (typeof accountHolder !== "string" || !accountHolder.trim() || accountHolder.length > 100)
        return res.status(400).json({ error: "Account holder name is required" });
    }
    if (expMonth !== undefined || expYear !== undefined) {
      if (existing.type !== "Card")
        return res.status(400).json({ error: "Only cards have an expiry" });
      const expiryError = validateExpiry(
        expMonth ?? existing.expMonth,
        expYear ?? existing.expYear,
      );
      if (expiryError) return res.status(400).json({ error: expiryError });
    }

    const data: Record<string, unknown> = {};
    if (accountHolder !== undefined) data.accountHolder = (accountHolder as string).trim();
    if (expMonth !== undefined) data.expMonth = expMonth;
    if (expYear !== undefined) data.expYear = expYear;

    const method = await prisma.$transaction(async (tx) => {
      if (isDefault === true) {
        await tx.paymentMethod.updateMany({
          where: { tenantId: tenant.id },
          data: { isDefault: false },
        });
        data.isDefault = true;
      }
      return tx.paymentMethod.update({ where: { id }, data });
    });

    return res.json({ paymentMethod: method });
  } catch (error) {
    console.error("Error updating payment method:", error);
    return res.status(500).json({ error: "Failed to update payment method" });
  }
}

export async function removePaymentMethod(req: Request, res: Response) {
  try {
    const user = (req as AuthenticatedRequest).user;
    const tenant = await getOrCreateTenant(user.id);
    const id = getPaymentMethodId(req);

    const existing = await prisma.paymentMethod.findUnique({ where: { id } });
    if (!existing || existing.tenantId !== tenant.id)
      return res.status(404).json({ error: "Payment method not found" });

    await prisma.$transaction(async (tx) => {
      await tx.paymentMethod.delete({ where: { id } });
      if (existing.isDefault) {
        const next = await tx.paymentMethod.findFirst({
          where: { tenantId: tenant.id },
          orderBy: { createdAt: "desc" },
          select: { id: true },
        });
        if (next) {
          await tx.paymentMethod.update({
            where: { id: next.id },
            data: { isDefault: true },
          });
        }
      }
    });

    return res.status(204).send();
  } catch (error) {
    console.error("Error removing payment method:", error);
    return res.status(500).json({ error: "Failed to remove payment method" });
  }
}
