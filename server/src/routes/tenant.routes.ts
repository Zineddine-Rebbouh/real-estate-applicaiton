import { Router } from "express";
import {
  getCurrentLease,
  getPaymentStatement,
  getTenantPayments,
  payInvoice,
} from "../controllers/tenant.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";

const router = Router();

router.use(authenticate, authorize("TENANT"));

router.get("/current-lease", getCurrentLease);
router.get("/payments", getTenantPayments);
router.get("/payments/statement", getPaymentStatement);
router.patch("/payments/:paymentId/pay", payInvoice);

export { router as tenantRouter };
