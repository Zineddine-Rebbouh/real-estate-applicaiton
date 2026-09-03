import bcrypt from "bcrypt";
import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import {
  accessCookieOptions,
  clearAccessCookieOptions,
  clearRefreshCookieOptions,
  hashRefreshToken,
  refreshCookieOptions,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../lib/tokens.js";
import { loginSchema, signupSchema } from "../validators/auth.schema.js";
import type { AuthenticatedRequest } from "../middleware/authenticate.js";

const invalidCredentials = "Invalid email or password";

type PublicUser = {
  id: string;
  email: string;
  name: string;
  role: "TENANT" | "MANAGER";
};

function toPublicUser(user: PublicUser): PublicUser {
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

function setAuthCookies(res: Response, userId: string, tokenVersion: number) {
  const refreshToken = signRefreshToken(userId, tokenVersion);
  res.cookie("accessToken", signAccessToken(userId), accessCookieOptions());
  res.cookie("refreshToken", refreshToken, refreshCookieOptions());
  return refreshToken;
}

export async function signup(req: Request, res: Response) {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: "Invalid request" });

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  try {
    const user = await prisma.user.create({
      data: { name: parsed.data.name, email: parsed.data.email, passwordHash },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        refreshTokenVersion: true,
      },
    });
    const refreshToken = setAuthCookies(res, user.id, user.refreshTokenVersion);
    await prisma.user.update({
      where: { id: user.id },
      data: { currentRefreshTokenHash: hashRefreshToken(refreshToken) },
    });
    return res.status(201).json({ user: toPublicUser(user) });
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      error.constructor.name === "PrismaClientKnownRequestError"
    ) {
      return res
        .status(409)
        .json({ error: "An account with that email already exists" });
    }
    throw error;
  }
}

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(401).json({ error: invalidCredentials });

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  const passwordMatches = user
    ? await bcrypt.compare(parsed.data.password, user.passwordHash)
    : false;
  if (!user || !passwordMatches)
    return res.status(401).json({ error: invalidCredentials });

  const refreshToken = setAuthCookies(res, user.id, user.refreshTokenVersion);
  await prisma.user.update({
    where: { id: user.id },
    data: { currentRefreshTokenHash: hashRefreshToken(refreshToken) },
  });
  return res.json({ user: toPublicUser(user) });
}

export async function logout(req: Request, res: Response) {
  const token = req.cookies?.refreshToken;
  if (token) {
    try {
      const claims = verifyRefreshToken(token);
      await prisma.user.updateMany({
        where: { id: claims.sub },
        data: {
          refreshTokenVersion: { increment: 1 },
          currentRefreshTokenHash: null,
        },
      });
    } catch {
      // Cookie clearing remains safe even when the refresh token is expired or malformed.
    }
  }
  res.clearCookie("accessToken", clearAccessCookieOptions());
  res.clearCookie("refreshToken", clearRefreshCookieOptions());
  return res.status(204).send();
}

export async function refresh(req: Request, res: Response) {
  const oldToken = req.cookies?.refreshToken;
  if (!oldToken)
    return res.status(401).json({ error: "Authentication required" });

  try {
    const claims = verifyRefreshToken(oldToken);
    const user = await prisma.user.findUnique({
      where: { id: claims.sub },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        refreshTokenVersion: true,
        currentRefreshTokenHash: true,
      },
    });
    if (!user)
      return res.status(401).json({ error: "Authentication required" });

    const refreshToken = signRefreshToken(user.id, user.refreshTokenVersion);
    const rotated = await prisma.user.updateMany({
      where: {
        id: user.id,
        refreshTokenVersion: claims.tokenVersion,
        currentRefreshTokenHash: hashRefreshToken(oldToken),
      },
      data: { currentRefreshTokenHash: hashRefreshToken(refreshToken) },
    });

    if (rotated.count !== 1) {
      await prisma.user.updateMany({
        where: { id: user.id },
        data: {
          refreshTokenVersion: { increment: 1 },
          currentRefreshTokenHash: null,
        },
      });
      return res.status(401).json({ error: "Authentication required" });
    }

    res.cookie("accessToken", signAccessToken(user.id), accessCookieOptions());
    res.cookie("refreshToken", refreshToken, refreshCookieOptions());
    return res.json({ user: toPublicUser(user) });
  } catch {
    return res.status(401).json({ error: "Authentication required" });
  }
}

export function me(req: Request, res: Response) {
  const user = (req as AuthenticatedRequest).user;
  return res.json({ user: toPublicUser(user) });
}
