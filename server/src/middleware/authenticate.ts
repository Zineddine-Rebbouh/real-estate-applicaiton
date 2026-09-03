import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { verifyAccessToken } from "../lib/tokens.js";

export type AuthenticatedRequest = Request & {
  user: { id: string; email: string; name: string; role: "TENANT" | "MANAGER" };
};

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.cookies?.accessToken;
  if (!token) return res.status(401).json({ error: "Authentication required" });

  try {
    const claims = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: claims.sub },
      select: { id: true, email: true, name: true, role: true },
    });
    if (!user)
      return res.status(401).json({ error: "Authentication required" });
    (req as AuthenticatedRequest).user = user;
    next();
  } catch {
    return res.status(401).json({ error: "Authentication required" });
  }
}
