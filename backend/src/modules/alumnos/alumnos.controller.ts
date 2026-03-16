import { Response } from "express";
import prisma from "../../prismaClient";
import { AuthRequest } from "../../shared/middlewares/authMiddleware";
import logger from "../../shared/utils/logger";
import { auditLog } from "../../shared/utils/auditLog";

export const getAlumnos = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { search, activo } = req.query;

        const where: any = {};
        if (activo !== undefined) where.activo = activo === "true";
        if (search && typeof search === "string") {
            where.OR = [
                { nombre: { contains: search, mode: "insensitive" as const } },
                { apellido: { contains: search, mode: "insensitive" as const } },
                { dni: { contains: search } },
            ];
        }

        const alumnos = await prisma.alumno.findMany({
            where,
            orderBy: [{ apellido: "asc" }, { nombre: "asc" }],
            include: {
                inscripciones: {
                    where: { activa: true },
                    include: { taller: { select: { id: true, nombre: true } } },
                },
            },
        });

        res.json({ ok: true, data: alumnos });
    } catch (err) {
        logger.error({ err }, "Error obteniendo alumnos");
        res.status(500).json({ ok: false, message: "Error interno del servidor." });
    }
};

export const getAlumnoById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id as string);
        const alumno = await prisma.alumno.findUnique({
            where: { id },
            include: {
                inscripciones: {
                    include: {
                        taller: true,
                        cuotas: { orderBy: { anio: "desc" }, take: 12 },
                        becas: { where: { activa: true } },
                    },
                },
            },
        });

        if (!alumno) {
            res.status(404).json({ ok: false, message: "Alumno no encontrado." });
            return;
        }
        res.json({ ok: true, data: alumno });
    } catch (err) {
        logger.error({ err }, "Error obteniendo alumno");
        res.status(500).json({ ok: false, message: "Error interno del servidor." });
    }
};

export const createAlumno = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const data = req.body;
        data.fecha_nacimiento = new Date(data.fecha_nacimiento);

        const existing = await prisma.alumno.findUnique({ where: { dni: data.dni } });
        if (existing) {
            res.status(409).json({ ok: false, message: "Ya existe un alumno con ese DNI." });
            return;
        }

        const alumno = await prisma.alumno.create({ data });
        await auditLog({ req, accion: 'crear', entidad: 'alumno', entidad_id: alumno.id, detalle: { nombre: alumno.nombre, apellido: alumno.apellido, dni: alumno.dni } });
        res.status(201).json({ ok: true, data: alumno });
    } catch (err) {
        logger.error({ err }, "Error creando alumno");
        res.status(500).json({ ok: false, message: "Error interno del servidor." });
    }
};

export const updateAlumno = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id as string);
        const data = req.body;
        if (data.fecha_nacimiento) data.fecha_nacimiento = new Date(data.fecha_nacimiento);

        const alumno = await prisma.alumno.update({ where: { id }, data });
        await auditLog({ req, accion: 'editar', entidad: 'alumno', entidad_id: id, detalle: data });
        res.json({ ok: true, data: alumno });
    } catch (err: any) {
        if (err.code === "P2025") {
            res.status(404).json({ ok: false, message: "Alumno no encontrado." });
            return;
        }
        logger.error({ err }, "Error actualizando alumno");
        res.status(500).json({ ok: false, message: "Error interno del servidor." });
    }
};

export const deleteAlumno = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id as string);
        await prisma.alumno.update({ where: { id }, data: { activo: false } });
        await auditLog({ req, accion: 'desactivar', entidad: 'alumno', entidad_id: id });
        res.json({ ok: true, message: "Alumno desactivado." });
    } catch (err: any) {
        if (err.code === "P2025") {
            res.status(404).json({ ok: false, message: "Alumno no encontrado." });
            return;
        }
        logger.error({ err }, "Error eliminando alumno");
        res.status(500).json({ ok: false, message: "Error interno del servidor." });
    }
};
