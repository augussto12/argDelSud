import { Router } from "express";
import { getBecas, createBeca, updateBeca, desactivarBeca, getInscripcionesActivas } from "./becas.controller";
import { validate } from "../../shared/middlewares/validate";
import { createBecaSchema, updateBecaSchema } from "./becas.validator";
import { authenticateToken } from "../../shared/middlewares/authMiddleware";

const router = Router();

router.use(authenticateToken);

// Helper: inscripciones activas para el form
router.get("/inscripciones", getInscripcionesActivas);

router.get("/", getBecas);
router.post("/", validate(createBecaSchema), createBeca);
router.patch("/:id", validate(updateBecaSchema), updateBeca);
router.patch("/:id/desactivar", desactivarBeca);

export default router;
