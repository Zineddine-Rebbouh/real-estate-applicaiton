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

// Tenant profile columns surfaced by GET /api/auth/me — the search-preference
// onboarding reads onboardingCompletedAt here to decide whether to show again.
const tenantPreferenceSelect = {
  phoneNumber: true,
  minBudget: true,
  maxBudget: true,
  desiredBeds: true,
  desiredBaths: true,
  householdSize: true,
  hasPets: true,
  petType: true,
  needsParking: true,
  moveInTimeline: true,
  preferredCity: true,
  onboardingCompletedAt: true,
} as const;

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
  const role = parsed.data.role || "TENANT";
  const inviteCode = parsed.data.inviteCode?.trim() || "";
  if (role === "MANAGER") {
    if (!inviteCode)
      return res
        .status(400)
        .json({ error: "Manager signup requires an invite code" });
    const code = await prisma.managerInviteCode.findUnique({
      where: { code: inviteCode },
    });
    if (!code || code.usedAt)
      return res
        .status(403)
        .json({ error: "Invalid or already-used invite code" });
  }
  try {
    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          name: parsed.data.name,
          email: parsed.data.email,
          passwordHash,
          role,
          ...(role === "MANAGER"
            ? { manager: { create: {} } }
            : { tenant: { create: {} } }),
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          refreshTokenVersion: true,
        },
      });
      if (role === "MANAGER") {
        // ponytail: consumption is conditional inside the txn — the pre-check above is a fast 403, this wins races
        const consumed = await tx.managerInviteCode.updateMany({
          where: { code: inviteCode, usedAt: null },
          data: { usedAt: new Date(), usedByUserId: created.id },
        });
        if (consumed.count !== 1)
          throw new Error("InviteCodeConsumed");
      }
      return created;
    });
    const refreshToken = setAuthCookies(res, user.id, user.refreshTokenVersion);
    await prisma.user.update({
      where: { id: user.id },
      data: { currentRefreshTokenHash: hashRefreshToken(refreshToken) },
    });
    return res.status(201).json({ user: toPublicUser(user) });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "InviteCodeConsumed") {
      return res
        .status(403)
        .json({ error: "Invalid or already-used invite code" });
    }
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
  if (!parsed.success) {
    // Log keys only — never password values.
    console.warn("Login validation failed", {
      bodyKeys: Object.keys(req.body ?? {}),
      issues: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
    });
    return res.status(401).json({ error: invalidCredentials });
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  const passwordMatches = user
    ? await bcrypt.compare(parsed.data.password, user.passwordHash)
    : false;

  if (!user || !passwordMatches) {
    // Never log the submitted password — only account diagnostics.
    console.warn("Login rejected: invalid email or password", {
      email: parsed.data.email,
      userFound: Boolean(user),
      storedHashPrefix: user ? user.passwordHash?.slice(0, 7) : null,
      storedHashLength: user ? user.passwordHash?.length : null,
    });
    return res.status(401).json({ error: invalidCredentials });
  }

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

export async function me(req: Request, res: Response) {
  const authUser = (req as AuthenticatedRequest).user;
  if (authUser.role === "TENANT") {
    const profile = await prisma.tenant.findUnique({
      where: { userId: authUser.id },
      select: tenantPreferenceSelect,
    });
    return res.json({
      user: {
        ...toPublicUser(authUser),
        ...(profile ?? {}),
        phoneNumber: profile?.phoneNumber ?? null,
      },
    });
  }
  const profile = await prisma.manager.findUnique({
    where: { userId: authUser.id },
    select: { phoneNumber: true },
  });
  return res.json({
    user: {
      ...toPublicUser(authUser),
      phoneNumber: profile?.phoneNumber ?? null,
    },
  });
}

export async function updateMe(req: Request, res: Response) {
  const authUser = (req as AuthenticatedRequest).user;
  const name =
    typeof req.body?.name === "string" ? req.body.name.trim() : undefined;
  const phoneNumber =
    req.body?.phoneNumber === null || req.body?.phoneNumber === ""
      ? null
      : typeof req.body?.phoneNumber === "string"
        ? req.body.phoneNumber.trim()
        : undefined;
  if (name !== undefined && (name.length < 2 || name.length > 100))
    return res.status(400).json({ error: "Name must be 2–100 characters" });
  if (
    phoneNumber !== undefined &&
    phoneNumber !== null &&
    phoneNumber.length > 30
  )
    return res.status(400).json({ error: "Phone number is too long" });
  if (name === undefined && phoneNumber === undefined)
    return res.status(400).json({ error: "Nothing to update" });

  if (name !== undefined)
    await prisma.user.update({ where: { id: authUser.id }, data: { name } });
  if (phoneNumber !== undefined) {
    const data = { phoneNumber };
    if (authUser.role === "MANAGER")
      await prisma.manager.upsert({
        where: { userId: authUser.id },
        create: { userId: authUser.id, ...data },
        update: data,
      });
    else
      await prisma.tenant.upsert({
        where: { userId: authUser.id },
        create: { userId: authUser.id, ...data },
        update: data,
      });
  }
  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { id: true, email: true, name: true, role: true },
  });
  if (!user) return res.status(404).json({ error: "User not found" });
  const profile =
    user.role === "MANAGER"
      ? await prisma.manager.findUnique({
          where: { userId: user.id },
          select: { phoneNumber: true },
        })
      : await prisma.tenant.findUnique({
          where: { userId: user.id },
          select: { phoneNumber: true },
        });
  return res.json({
    user: { ...toPublicUser(user), phoneNumber: profile?.phoneNumber ?? null },
  });
}
