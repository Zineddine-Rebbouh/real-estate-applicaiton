import { Router } from "express";
import {
  getCurrentLease,
  getTenantPayments,
} from "../controllers/tenant.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";

const router = Router();

router.use(authenticate, authorize("TENANT"));

router.get("/current-lease", getCurrentLease);
router.get("/payments", getTenantPayments);

export { router as tenantRouter };
