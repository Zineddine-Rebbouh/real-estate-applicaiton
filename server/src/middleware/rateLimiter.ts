import rateLimit from "express-rate-limit";

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 7,
});
export const signupRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
});
export const refreshRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
});
