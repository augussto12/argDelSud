import { Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../../prismaClient";
import { AuthRequest } from "../../shared/middlewares/authMiddleware";
import logger from "../../shared/utils/logger";
import { auditLog } from "../../shared/utils/auditLog";

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        const usuario = await prisma.usuario.findUnique({
            where: { email },
            include: { rol: true },
        });

        if (!usuario || !usuario.activo) {
            res.status(401).json({ ok: false, message: "Credenciales inválidas." });
            return;
        }

        const passwordMatch = await bcrypt.compare(password, usuario.password);
        if (!passwordMatch) {
            res.status(401).json({ ok: false, message: "Credenciales inválidas." });
            return;
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) throw new Error("JWT_SECRET no configurado");

        const token = jwt.sign(
            { id: usuario.id, email: usuario.email, rol: usuario.rol.nombre },
            secret,
            { expiresIn: "4h" }
        );

        // Simular user en req para el auditLog
        req.user = { id: usuario.id, email: usuario.email, rol: usuario.rol.nombre };
        await auditLog({ req, accion: 'login', entidad: 'usuario', entidad_id: usuario.id, detalle: { email: usuario.email } });

        res.json({
            ok: true,
            token,
            user: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol.nombre,
            },
        });
    } catch (err) {
        logger.error({ err }, "Error en login");
        res.status(500).json({ ok: false, message: "Error interno del servidor." });
    }
};

export const me = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ ok: false, message: "No autenticado." });
            return;
        }

        const usuario = await prisma.usuario.findUnique({
            where: { id: req.user.id },
            include: { rol: true },
        });

        if (!usuario || !usuario.activo) {
            res.status(404).json({ ok: false, message: "Usuario no encontrado." });
            return;
        }

        res.json({
            ok: true,
            user: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol.nombre,
            },
        });
    } catch (err) {
        logger.error({ err }, "Error en /me");
        res.status(500).json({ ok: false, message: "Error interno del servidor." });
    }
};

