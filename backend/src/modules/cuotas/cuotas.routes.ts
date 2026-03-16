import { Router } from "express";
import {
    getCuotas, getCuotaById, generarCuotas, anularCuota,
    registrarPago, getPagos, deletePago,
    generarCuotasMasivo, getDeudores, getCuentaAlumno
} from "./cuotas.controller";
import { validate } from "../../shared/middlewares/validate";
import { generarCuotasSchema, registrarPagoSchema, generarMasivoSchema } from "./cuotas.validator";
import { authenticateToken } from "../../shared/middlewares/authMiddleware";

const router = Router();

router.use(authenticateToken);

// ─── Cuotas ──────────────────────────────────────────
router.get("/", getCuotas);
router.get("/deudores", getDeudores);
router.get("/cuenta/:alumno_id", getCuentaAlumno);
router.get("/:id", getCuotaById);
router.post("/generar", validate(generarCuotasSchema), generarCuotas);
router.post("/generar-masivo", validate(generarMasivoSchema), generarCuotasMasivo);
router.patch("/:id/anular", anularCuota);

// ─── Pagos ───────────────────────────────────────────
router.get("/pagos", getPagos);
router.post("/pagos", validate(registrarPagoSchema), registrarPago);
router.delete("/pagos/:id", deletePago);

export default router;
