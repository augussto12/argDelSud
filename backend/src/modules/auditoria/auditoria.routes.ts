import { Router } from "express";
import { getAuditLogs } from "./auditoria.controller";
import { authenticateToken, authorizeRole } from "../../shared/middlewares/authMiddleware";

const router = Router();

router.use(authenticateToken);

router.get("/", authorizeRole(["superadmin"]), getAuditLogs);

export default router;
