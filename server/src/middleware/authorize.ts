import type { NextFunction, Request, Response } from "express";
import type { AuthenticatedRequest } from "./authenticate.js";
import { prisma } from "../lib/prisma.js";

export function authorize(...roles: Array<"TENANT" | "MANAGER">) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthenticatedRequest).user;
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}

export async function getOrCreateManager(userId: string) {
  const existing = await prisma.manager.findUnique({
    where: { userId },
  });
  if (existing) return existing;

  return await prisma.manager.create({
    data: { userId },
  });
}
