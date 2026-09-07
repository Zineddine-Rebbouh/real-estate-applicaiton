import rateLimit from "express-rate-limit";

const jsonHandler = (_req: unknown, res: any) => {
  res.status(429).json({ error: "Too many attempts, please try again later" });
};

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: jsonHandler as any,
});
export const signupRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: jsonHandler as any,
});
export const refreshRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 120,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: jsonHandler as any,
});
