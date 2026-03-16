import { Router } from "express";
import { registrarAsistencia, getAsistenciaPorTallerFecha, getAsistenciaAlumno } from "./asistencia.controller";
import { validate } from "../../shared/middlewares/validate";
import { registrarAsistenciaSchema } from "./asistencia.validator";
import { authenticateToken } from "../../shared/middlewares/authMiddleware";

const router = Router();

router.use(authenticateToken);

router.post("/", validate(registrarAsistenciaSchema), registrarAsistencia);
router.get("/taller/:taller_id", getAsistenciaPorTallerFecha);
router.get("/alumno/:alumno_id", getAsistenciaAlumno);

export default router;
