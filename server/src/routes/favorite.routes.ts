import { Router } from "express";
import {
  addFavorite,
  getFavorites,
  removeFavorite,
} from "../controllers/favorite.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";

const router = Router();

router.use(authenticate, authorize("TENANT"));

router.get("/", getFavorites);
router.post("/", addFavorite);
router.delete("/:propertyId", removeFavorite);

export { router as favoriteRouter };
