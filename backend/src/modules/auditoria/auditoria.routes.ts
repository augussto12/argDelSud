import { Router } from "express";
import { getAuditLogs } from "./auditoria.controller";
import { authenticateToken } from "../../shared/middlewares/authMiddleware";

const router = Router();

router.use(authenticateToken);

router.get("/", getAuditLogs);

export default router;
