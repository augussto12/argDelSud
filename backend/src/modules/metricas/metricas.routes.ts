import { Router } from "express";
import { getMetricas } from "./metricas.controller";
import { authenticateToken, authorizeRole } from "../../shared/middlewares/authMiddleware";

const router = Router();

router.use(authenticateToken);
router.use(authorizeRole(["superadmin", "admin"]));

router.get("/", getMetricas);

export default router;
