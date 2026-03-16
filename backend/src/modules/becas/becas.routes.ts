import { Router } from "express";
import { getBecas, createBeca, updateBeca, desactivarBeca, getInscripcionesActivas } from "./becas.controller";
import { validate } from "../../shared/middlewares/validate";
import { createBecaSchema, updateBecaSchema } from "./becas.validator";
import { authenticateToken, authorizeRole } from "../../shared/middlewares/authMiddleware";

const router = Router();

router.use(authenticateToken);

// Helper: inscripciones activas para el form
router.get("/inscripciones", getInscripcionesActivas);

router.get("/", getBecas);
router.post("/", authorizeRole(["superadmin", "admin"]), validate(createBecaSchema), createBeca);
router.patch("/:id", authorizeRole(["superadmin", "admin"]), validate(updateBecaSchema), updateBeca);
router.patch("/:id/desactivar", authorizeRole(["superadmin", "admin"]), desactivarBeca);

export default router;
