import { Router } from "express";
import {
  createReview,
  deleteReview,
  getPropertyReviews,
} from "../controllers/review.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { writeRateLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.get("/property/:propertyId", getPropertyReviews);
router.post("/property/:propertyId", authenticate, authorize("TENANT"), writeRateLimiter, createReview);
router.delete("/:id", authenticate, authorize("TENANT"), deleteReview);

export { router as reviewRouter };
