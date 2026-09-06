import { Router } from "express";
import {
  getManagerApplications,
  getManagerProperties,
} from "../controllers/manager.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";

const router = Router();

router.use(authenticate, authorize("MANAGER"));

router.get("/properties", getManagerProperties);
router.get("/applications", getManagerApplications);

export { router as managerRouter };

