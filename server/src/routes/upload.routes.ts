import { Router } from "express";
import {
  upload,
  uploadErrorHandler,
  uploadPhotos,
} from "../controllers/upload.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { uploadRateLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("MANAGER"),
  uploadRateLimiter,
  upload.array("photos", 10),
  uploadPhotos,
);
router.use(uploadErrorHandler);

export { router as uploadRouter };
