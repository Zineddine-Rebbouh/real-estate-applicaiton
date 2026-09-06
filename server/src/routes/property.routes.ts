import { Router } from "express";
import {
  createProperty,
  deleteProperty,
  getProperties,
  getPropertyById,
  updateProperty,
} from "../controllers/property.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";

const router = Router();

router.get("/", getProperties);
router.get("/:id", getPropertyById);
router.post("/", authenticate, authorize("MANAGER"), createProperty);
router.put("/:id", authenticate, authorize("MANAGER"), updateProperty);
router.delete("/:id", authenticate, authorize("MANAGER"), deleteProperty);

export { router as propertyRouter };

