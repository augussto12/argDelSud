import { Router } from "express";
import { getAlumnos, getAlumnoById, createAlumno, updateAlumno, deleteAlumno } from "./alumnos.controller";
import { validate } from "../../shared/middlewares/validate";
import { createAlumnoSchema, updateAlumnoSchema } from "./alumnos.validator";
import { authenticateToken } from "../../shared/middlewares/authMiddleware";

const router = Router();

router.use(authenticateToken);

router.get("/", getAlumnos);
router.get("/:id", getAlumnoById);
router.post("/", validate(createAlumnoSchema), createAlumno);
router.put("/:id", validate(updateAlumnoSchema), updateAlumno);
router.delete("/:id", deleteAlumno);

export default router;
