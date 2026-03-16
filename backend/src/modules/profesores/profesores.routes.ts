import { Router } from "express";
import { getProfesores, getProfesorById, createProfesor, updateProfesor, deleteProfesor } from "./profesores.controller";
import { validate } from "../../shared/middlewares/validate";
import { createProfesorSchema, updateProfesorSchema } from "./profesores.validator";
import { authenticateToken } from "../../shared/middlewares/authMiddleware";

const router = Router();

router.use(authenticateToken);

router.get("/", getProfesores);
router.get("/:id", getProfesorById);
router.post("/", validate(createProfesorSchema), createProfesor);
router.put("/:id", validate(updateProfesorSchema), updateProfesor);
router.delete("/:id", deleteProfesor);

export default router;
