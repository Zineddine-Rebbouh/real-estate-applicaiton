import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import {
  loginRateLimiter,
  refreshRateLimiter,
  signupRateLimiter,
} from "../middleware/rateLimiter.js";
import {
  login,
  logout,
  me,
  refresh,
  signup,
  updateMe,
} from "../controllers/auth.controller.js";

export const authRouter = Router();
authRouter.post("/signup", signupRateLimiter, signup);
authRouter.post("/login", loginRateLimiter, login);
authRouter.post("/logout", logout);
authRouter.post("/refresh", refreshRateLimiter, refresh);
authRouter.get("/me", authenticate, me);
authRouter.patch("/me", authenticate, updateMe);
