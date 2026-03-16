import { Router } from "express";
import { login, me } from "./auth.controller";
import { validate } from "../../shared/middlewares/validate";
import { loginSchema } from "./auth.validator";
import { authenticateToken } from "../../shared/middlewares/authMiddleware";

const router = Router();

router.post("/login", validate(loginSchema), login);
router.get("/me", authenticateToken, me);

export default router;
