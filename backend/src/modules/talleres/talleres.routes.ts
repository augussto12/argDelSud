import { Router } from "express";
import {
    getTalleres, getTallerById, createTaller, updateTaller, deleteTaller,
    inscribirAlumno, desinscribirAlumno, getDias
} from "./talleres.controller";
import { validate } from "../../shared/middlewares/validate";
import { createTallerSchema, updateTallerSchema, inscribirAlumnoSchema } from "./talleres.validator";
import { authenticateToken, authorizeRole } from "../../shared/middlewares/authMiddleware";

const router = Router();

router.use(authenticateToken);

// Días (catálogo)
router.get("/dias", getDias);

// Talleres CRUD
router.get("/", getTalleres);
router.get("/:id", getTallerById);
router.post("/", authorizeRole(["superadmin", "admin"]), validate(createTallerSchema), createTaller);
router.put("/:id", authorizeRole(["superadmin", "admin"]), validate(updateTallerSchema), updateTaller);
router.delete("/:id", authorizeRole(["superadmin", "admin"]), deleteTaller);

// Inscripciones
router.post("/:id/inscribir", authorizeRole(["superadmin", "admin"]), validate(inscribirAlumnoSchema), inscribirAlumno);
router.delete("/:id/desinscribir/:alumno_id", authorizeRole(["superadmin", "admin"]), desinscribirAlumno);

export default router;
