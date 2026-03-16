import { Router } from "express";
import { getMetricas } from "./metricas.controller";
import { authenticateToken } from "../../shared/middlewares/authMiddleware";

const router = Router();

router.use(authenticateToken);

router.get("/", getMetricas);

export default router;
