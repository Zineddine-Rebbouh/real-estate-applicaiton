import { Router } from "express";
import { createContactMessage } from "../controllers/inquiry.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { writeRateLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.post("/", authenticate, authorize("TENANT"), writeRateLimiter, createContactMessage);

export { router as messageRouter };
