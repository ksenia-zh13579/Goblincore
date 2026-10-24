import { Router } from "express";
import { getMyPlaces } from "../controllers/places_controller";
import { authMiddleware } from "../middleware/auth_middleware";

const router = Router();

router.get("/", authMiddleware, getMyPlaces);

export default router;
