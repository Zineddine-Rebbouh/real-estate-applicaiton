import crypto from "node:crypto";
import jwt, { type JwtPayload } from "jsonwebtoken";
import type { CookieOptions } from "express";
import { env } from "../config/env.js";

export const ACCESS_TOKEN_MAX_AGE_MS = 15 * 60 * 1000;
export const REFRESH_TOKEN_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

type RefreshClaims = { sub: string; tokenVersion: number };

export function hashRefreshToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function signAccessToken(userId: string) {
  return jwt.sign({ sub: userId }, env.JWT_ACCESS_SECRET, { expiresIn: "15m" });
}

export function signRefreshToken(userId: string, tokenVersion: number) {
  return jwt.sign({ sub: userId, tokenVersion }, env.JWT_REFRESH_SECRET, {
    expiresIn: "30d",
  });
}

function verifySubject(token: string, secret: string) {
  const payload = jwt.verify(token, secret) as JwtPayload;
  if (typeof payload.sub !== "string") {
    throw new Error("Invalid token claims");
  }
  return { sub: payload.sub };
}

export function verifyAccessToken(token: string) {
  return verifySubject(token, env.JWT_ACCESS_SECRET);
}

export function verifyRefreshToken(token: string): RefreshClaims {
  const payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
  if (
    typeof payload.sub !== "string" ||
    typeof payload.tokenVersion !== "number"
  ) {
    throw new Error("Invalid token claims");
  }
  return { sub: payload.sub, tokenVersion: payload.tokenVersion };
}

const baseCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax",
};

export function accessCookieOptions(): CookieOptions {
  return { ...baseCookieOptions, maxAge: ACCESS_TOKEN_MAX_AGE_MS, path: "/" };
}

export function refreshCookieOptions(): CookieOptions {
  return {
    ...baseCookieOptions,
    maxAge: REFRESH_TOKEN_MAX_AGE_MS,
    path: "/api/auth/refresh",
  };
}

export function clearAccessCookieOptions(): CookieOptions {
  return { ...baseCookieOptions, path: "/" };
}

export function clearRefreshCookieOptions(): CookieOptions {
  return { ...baseCookieOptions, path: "/api/auth/refresh" };
}
