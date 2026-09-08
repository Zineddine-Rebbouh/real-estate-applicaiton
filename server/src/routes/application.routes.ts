import { Router } from "express";
import {
  createApplication,
  getTenantApplications,
  withdrawApplication,
} from "../controllers/application.controller.js";
import { updateApplicationStatus } from "../controllers/manager.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";

const router = Router();

router.get("/", authenticate, authorize("TENANT"), getTenantApplications);
router.post("/", authenticate, authorize("TENANT"), createApplication);
router.patch("/:id/withdraw", authenticate, authorize("TENANT"), withdrawApplication);
router.patch("/:id", authenticate, authorize("MANAGER"), updateApplicationStatus);

export { router as applicationRouter };

