import { Router } from "express";
import {
  createMaintenanceRequest,
  getTenantMaintenanceRequests,
  updateMaintenanceStatus,
} from "../controllers/maintenance.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { writeRateLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.get("/", authenticate, authorize("TENANT"), getTenantMaintenanceRequests);
router.post("/", authenticate, authorize("TENANT"), writeRateLimiter, createMaintenanceRequest);
router.patch("/:id", authenticate, authorize("MANAGER"), updateMaintenanceStatus);

export { router as maintenanceRouter };
