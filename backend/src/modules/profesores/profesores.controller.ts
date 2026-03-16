import { Response } from "express";
import prisma from "../../prismaClient";
import { AuthRequest } from "../../shared/middlewares/authMiddleware";
import logger from "../../shared/utils/logger";

export const getProfesores = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { search, activo } = req.query;
        const where: any = {};
        if (activo !== undefined) where.activo = activo === "true";
        if (search && typeof search === "string") {
            where.OR = [
                { nombre: { contains: search, mode: "insensitive" } },
                { apellido: { contains: search, mode: "insensitive" } },
                { dni: { contains: search } },
            ];
        }

        const profesores = await prisma.profesor.findMany({
            where,
            orderBy: [{ apellido: "asc" }, { nombre: "asc" }],
            include: {
                talleres: { where: { activo: true }, select: { id: true, nombre: true } },
            },
        });

        res.json({ ok: true, data: profesores });
    } catch (err) {
        logger.error({ err }, "Error obteniendo profesores");
        res.status(500).json({ ok: false, message: "Error interno del servidor." });
    }
};

export const getProfesorById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id as string);
        const profesor = await prisma.profesor.findUnique({
            where: { id },
            include: { talleres: true },
        });
        if (!profesor) {
            res.status(404).json({ ok: false, message: "Profesor no encontrado." });
            return;
        }
        res.json({ ok: true, data: profesor });
    } catch (err) {
        logger.error({ err }, "Error obteniendo profesor");
        res.status(500).json({ ok: false, message: "Error interno del servidor." });
    }
};

export const createProfesor = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const existing = await prisma.profesor.findUnique({ where: { dni: req.body.dni } });
        if (existing) {
            res.status(409).json({ ok: false, message: "Ya existe un profesor con ese DNI." });
            return;
        }
        const profesor = await prisma.profesor.create({ data: req.body });
        res.status(201).json({ ok: true, data: profesor });
    } catch (err) {
        logger.error({ err }, "Error creando profesor");
        res.status(500).json({ ok: false, message: "Error interno del servidor." });
    }
};

export const updateProfesor = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id as string);
        const profesor = await prisma.profesor.update({ where: { id }, data: req.body });
        res.json({ ok: true, data: profesor });
    } catch (err: any) {
        if (err.code === "P2025") {
            res.status(404).json({ ok: false, message: "Profesor no encontrado." });
            return;
        }
        logger.error({ err }, "Error actualizando profesor");
        res.status(500).json({ ok: false, message: "Error interno del servidor." });
    }
};

export const deleteProfesor = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id as string);
        await prisma.profesor.update({ where: { id }, data: { activo: false } });
        res.json({ ok: true, message: "Profesor desactivado." });
    } catch (err: any) {
        if (err.code === "P2025") {
            res.status(404).json({ ok: false, message: "Profesor no encontrado." });
            return;
        }
        logger.error({ err }, "Error eliminando profesor");
        res.status(500).json({ ok: false, message: "Error interno del servidor." });
    }
};
