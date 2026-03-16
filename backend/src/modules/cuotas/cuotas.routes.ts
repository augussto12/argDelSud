import { Router } from "express";
import {
    getCuotas, getCuotaById, generarCuotas, anularCuota,
    registrarPago, getPagos, deletePago,
    generarCuotasMasivo, getDeudores, getCuentaAlumno
} from "./cuotas.controller";
import { validate } from "../../shared/middlewares/validate";
import { generarCuotasSchema, registrarPagoSchema, generarMasivoSchema } from "./cuotas.validator";
import { authenticateToken, authorizeRole } from "../../shared/middlewares/authMiddleware";

const router = Router();

router.use(authenticateToken);

// ─── Cuotas ──────────────────────────────────────────
router.get("/", getCuotas);
router.get("/deudores", getDeudores);
router.get("/cuenta/:alumno_id", getCuentaAlumno);
router.get("/:id", getCuotaById);
router.post("/generar", authorizeRole(["superadmin", "admin"]), validate(generarCuotasSchema), generarCuotas);
router.post("/generar-masivo", authorizeRole(["superadmin", "admin"]), validate(generarMasivoSchema), generarCuotasMasivo);
router.patch("/:id/anular", authorizeRole(["superadmin", "admin"]), anularCuota);

// ─── Pagos ───────────────────────────────────────────
router.get("/pagos", getPagos);
router.post("/pagos", authorizeRole(["superadmin", "admin"]), validate(registrarPagoSchema), registrarPago);
router.delete("/pagos/:id", authorizeRole(["superadmin", "admin"]), deletePago);

export default router;
