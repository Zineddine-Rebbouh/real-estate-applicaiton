import { Router } from "express";
import {
  addPaymentMethod,
  getPaymentMethods,
  removePaymentMethod,
  updatePaymentMethod,
} from "../controllers/payment-method.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";

const router = Router();

router.use(authenticate, authorize("TENANT"));

router.get("/", getPaymentMethods);
router.post("/", addPaymentMethod);
router.patch("/:id", updatePaymentMethod);
router.delete("/:id", removePaymentMethod);

export { router as paymentMethodRouter };
