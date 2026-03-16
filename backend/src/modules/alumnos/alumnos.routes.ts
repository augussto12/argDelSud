import { Router } from "express";
import { getAlumnos, getAlumnoById, createAlumno, updateAlumno, deleteAlumno } from "./alumnos.controller";
import { validate } from "../../shared/middlewares/validate";
import { createAlumnoSchema, updateAlumnoSchema } from "./alumnos.validator";
import { authenticateToken, authorizeRole } from "../../shared/middlewares/authMiddleware";

const router = Router();

router.use(authenticateToken);

router.get("/", getAlumnos);
router.get("/:id", getAlumnoById);
router.post("/", authorizeRole(["superadmin", "admin"]), validate(createAlumnoSchema), createAlumno);
router.put("/:id", authorizeRole(["superadmin", "admin"]), validate(updateAlumnoSchema), updateAlumno);
router.delete("/:id", authorizeRole(["superadmin", "admin"]), deleteAlumno);

export default router;
