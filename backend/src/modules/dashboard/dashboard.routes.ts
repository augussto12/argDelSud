import { Router } from "express";
import { getStats, getRecaudacion, getCalendario } from "./dashboard.controller";
import { authenticateToken } from "../../shared/middlewares/authMiddleware";

const router = Router();

router.use(authenticateToken);

router.get("/stats", getStats);
router.get("/recaudacion", getRecaudacion);
router.get("/calendario", getCalendario);

export default router;
