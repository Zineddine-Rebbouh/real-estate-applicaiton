import { Router } from "express";
import {
  createLeasePayment,
  getManagerApplications,
  getManagerProperties,
} from "../controllers/manager.controller.js";
import { getManagerMaintenanceRequests } from "../controllers/maintenance.controller.js";
import {
  getManagerContactMessages,
  getManagerTourRequests,
} from "../controllers/inquiry.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";

const router = Router();

router.use(authenticate, authorize("MANAGER"));

router.get("/properties", getManagerProperties);
router.get("/applications", getManagerApplications);
router.get("/maintenance", getManagerMaintenanceRequests);
router.get("/tours", getManagerTourRequests);
router.get("/messages", getManagerContactMessages);
router.post("/leases/:leaseId/payments", createLeasePayment);

export { router as managerRouter };

