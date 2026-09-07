import { Router } from "express";
import {
  createLeasePayment,
  getManagerApplications,
  getManagerProperties,
} from "../controllers/manager.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";

const router = Router();

router.use(authenticate, authorize("MANAGER"));

router.get("/properties", getManagerProperties);
router.get("/applications", getManagerApplications);
router.post("/leases/:leaseId/payments", createLeasePayment);

export { router as managerRouter };

