import { Router } from "express";
import { getUsuarios, getUsuarioById, createUsuario, updateUsuario, deleteUsuario, getRoles } from "./usuarios.controller";
import { validate } from "../../shared/middlewares/validate";
import { createUsuarioSchema, updateUsuarioSchema } from "./usuarios.validator";
import { authenticateToken, authorizeRole } from "../../shared/middlewares/authMiddleware";

const router = Router();

router.use(authenticateToken);
router.use(authorizeRole(["superadmin"]));

// Roles
router.get("/roles", getRoles);

// Usuarios CRUD
router.get("/", getUsuarios);
router.get("/:id", getUsuarioById);
router.post("/", validate(createUsuarioSchema), createUsuario);
router.put("/:id", validate(updateUsuarioSchema), updateUsuario);
router.delete("/:id", deleteUsuario);

export default router;
