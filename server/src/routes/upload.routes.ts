import { Router } from "express";
import {
  upload,
  uploadErrorHandler,
  uploadPhotos,
} from "../controllers/upload.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("MANAGER"),
  upload.array("photos", 10),
  uploadPhotos,
);
router.use(uploadErrorHandler);

export { router as uploadRouter };
