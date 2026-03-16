import { Router } from "express";
import { getProfesores, getProfesorById, createProfesor, updateProfesor, deleteProfesor } from "./profesores.controller";
import { validate } from "../../shared/middlewares/validate";
import { createProfesorSchema, updateProfesorSchema } from "./profesores.validator";
import { authenticateToken, authorizeRole } from "../../shared/middlewares/authMiddleware";

const router = Router();

router.use(authenticateToken);

router.get("/", getProfesores);
router.get("/:id", getProfesorById);
router.post("/", authorizeRole(["superadmin", "admin"]), validate(createProfesorSchema), createProfesor);
router.put("/:id", authorizeRole(["superadmin", "admin"]), validate(updateProfesorSchema), updateProfesor);
router.delete("/:id", authorizeRole(["superadmin", "admin"]), deleteProfesor);

export default router;
