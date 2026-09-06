import { Router } from "express";
import { updateApplicationStatus } from "../controllers/manager.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";

const router = Router();

router.patch("/:id", authenticate, authorize("MANAGER"), updateApplicationStatus);

export { router as applicationRouter };

