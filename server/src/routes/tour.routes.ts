import { Router } from "express";
import {
  createTourRequest,
  updateTourStatus,
} from "../controllers/inquiry.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { writeRateLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.post("/", authenticate, authorize("TENANT"), writeRateLimiter, createTourRequest);
router.patch("/:id", authenticate, authorize("MANAGER"), updateTourStatus);

export { router as tourRouter };
