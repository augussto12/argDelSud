import { Response } from "express";
import prisma from "../../prismaClient";
import { AuthRequest } from "../../shared/middlewares/authMiddleware";
import logger from "../../shared/utils/logger";
import bcrypt from "bcrypt";
import { auditLog } from "../../shared/utils/auditLog";
import { parseId } from "../../shared/utils/parseId";

const SALT_ROUNDS = 12;

// ─── Listar usuarios ────────────────────────────────────────

export const getUsuarios = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { search, activo } = req.query;

        const where: any = {};
        if (activo !== undefined) where.activo = activo === "true";
        if (search && typeof search === "string") {
            where.OR = [
                { nombre: { contains: search, mode: "insensitive" as const } },
                { email: { contains: search, mode: "insensitive" as const } },
            ];
        }

        const usuarios = await prisma.usuario.findMany({
            where,
            orderBy: { nombre: "asc" },
            select: {
                id: true,
                nombre: true,
                email: true,
                activo: true,
                creado_at: true,
                rol: { select: { id: true, nombre: true } },
            },
        });

        res.json({ ok: true, data: usuarios });
    } catch (err) {
        logger.error({ err }, "Error obteniendo usuarios");
        res.status(500).json({ ok: false, message: "Error interno del servidor." });
    }
};

// ─── Obtener usuario por ID ─────────────────────────────────

export const getUsuarioById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = parseId(req.params.id);
        const usuario = await prisma.usuario.findUnique({
            where: { id },
            select: {
                id: true,
                nombre: true,
                email: true,
                activo: true,
                creado_at: true,
                rol: { select: { id: true, nombre: true } },
            },
        });

        if (!usuario) {
            res.status(404).json({ ok: false, message: "Usuario no encontrado." });
            return;
        }
        res.json({ ok: true, data: usuario });
    } catch (err) {
        logger.error({ err }, "Error obteniendo usuario");
        res.status(500).json({ ok: false, message: "Error interno del servidor." });
    }
};

// ─── Crear usuario ──────────────────────────────────────────

export const createUsuario = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { nombre, email, password, rol_id } = req.body;

        const existing = await prisma.usuario.findUnique({ where: { email } });
        if (existing) {
            res.status(409).json({ ok: false, message: "Ya existe un usuario con ese email." });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const usuario = await prisma.usuario.create({
            data: { nombre, email, password: hashedPassword, rol_id },
            select: {
                id: true,
                nombre: true,
                email: true,
                activo: true,
                rol: { select: { id: true, nombre: true } },
            },
        });

        await auditLog({ req, accion: 'crear', entidad: 'usuario', entidad_id: usuario.id, detalle: { nombre, email, rol_id } });

        res.status(201).json({ ok: true, data: usuario });
    } catch (err) {
        logger.error({ err }, "Error creando usuario");
        res.status(500).json({ ok: false, message: "Error interno del servidor." });
    }
};

// ─── Actualizar usuario ─────────────────────────────────────

export const updateUsuario = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = parseId(req.params.id);
        const data: any = { ...req.body };

        // Si viene password, hashearla
        if (data.password) {
            data.password = await bcrypt.hash(data.password, SALT_ROUNDS);
        }

        const usuario = await prisma.usuario.update({
            where: { id },
            data,
            select: {
                id: true,
                nombre: true,
                email: true,
                activo: true,
                rol: { select: { id: true, nombre: true } },
            },
        });

        await auditLog({ req, accion: 'editar', entidad: 'usuario', entidad_id: id, detalle: { nombre: data.nombre, email: data.email } });

        res.json({ ok: true, data: usuario });
    } catch (err: any) {
        if (err.code === "P2025") {
            res.status(404).json({ ok: false, message: "Usuario no encontrado." });
            return;
        }
        logger.error({ err }, "Error actualizando usuario");
        res.status(500).json({ ok: false, message: "Error interno del servidor." });
    }
};

// ─── Desactivar usuario ─────────────────────────────────────

export const deleteUsuario = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = parseId(req.params.id);

        // No permitir desactivarse a sí mismo
        if (req.user?.id === id) {
            res.status(400).json({ ok: false, message: "No podés desactivar tu propio usuario." });
            return;
        }

        await prisma.usuario.update({ where: { id }, data: { activo: false } });
        await auditLog({ req, accion: 'desactivar', entidad: 'usuario', entidad_id: id });
        res.json({ ok: true, message: "Usuario desactivado." });
    } catch (err: any) {
        if (err.code === "P2025") {
            res.status(404).json({ ok: false, message: "Usuario no encontrado." });
            return;
        }
        logger.error({ err }, "Error desactivando usuario");
        res.status(500).json({ ok: false, message: "Error interno del servidor." });
    }
};

// ─── Obtener roles disponibles ──────────────────────────────

export const getRoles = async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
        const roles = await prisma.rol.findMany({ orderBy: { id: "asc" } });
        res.json({ ok: true, data: roles });
    } catch (err) {
        logger.error({ err }, "Error obteniendo roles");
        res.status(500).json({ ok: false, message: "Error interno del servidor." });
    }
};
