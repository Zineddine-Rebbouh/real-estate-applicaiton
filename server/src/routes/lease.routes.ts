import { Router } from "express";
import {
  getLeaseAgreement,
  getPaymentReceipt,
} from "../controllers/lease.controller.js";
import { authenticate } from "../middleware/authenticate.js";

const router = Router();

router.get("/:leaseId/agreement", authenticate, getLeaseAgreement);
router.get("/payments/:paymentId/receipt", authenticate, getPaymentReceipt);

export { router as leaseRouter };
