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
            { expiresIn: "12h" }
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

// ⚠️ TEMPORAL: Crear superadmin inicial sin auth
export const setup = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { nombre, email, password } = req.body;

        if (!nombre || !email || !password) {
            res.status(400).json({ ok: false, message: "nombre, email y password son requeridos." });
            return;
        }

        // Solo funciona si NO hay superadmins activos
        const rolSuperadmin = await prisma.rol.findUnique({ where: { nombre: "superadmin" } });
        if (!rolSuperadmin) {
            res.status(500).json({ ok: false, message: "El rol 'superadmin' no existe. Ejecutá el seed primero." });
            return;
        }

        const existingSuperadmin = await prisma.usuario.findFirst({
            where: { rol_id: rolSuperadmin.id, activo: true },
        });

        if (existingSuperadmin) {
            res.status(403).json({ ok: false, message: "Ya existe un superadmin. Usá /login para ingresar." });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const usuario = await prisma.usuario.create({
            data: {
                nombre,
                email,
                password: hashedPassword,
                rol_id: rolSuperadmin.id,
            },
        });

        logger.info({ email }, "Superadmin creado via /setup");
        res.status(201).json({ ok: true, message: "Superadmin creado. Ya podés loguearte.", user: { id: usuario.id, nombre, email } });
    } catch (err: any) {
        if (err.code === "P2002") {
            res.status(409).json({ ok: false, message: "Ya existe un usuario con ese email." });
            return;
        }
        logger.error({ err }, "Error en /setup");
        res.status(500).json({ ok: false, message: "Error interno del servidor." });
    }
};
