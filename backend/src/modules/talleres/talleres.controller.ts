import { Response } from "express";
import prisma from "../../prismaClient";
import { AuthRequest } from "../../shared/middlewares/authMiddleware";
import logger from "../../shared/utils/logger";

export const getTalleres = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { search, activo } = req.query;
        const where: any = {};
        if (activo !== undefined) where.activo = activo === "true";
        if (search && typeof search === "string") {
            where.nombre = { contains: search, mode: "insensitive" };
        }

        const talleres = await prisma.taller.findMany({
            where,
            orderBy: { nombre: "asc" },
            include: {
                profesor: { select: { id: true, nombre: true, apellido: true } },
                tallerDias: { include: { dia: true }, orderBy: { dia_id: "asc" } },
                _count: { select: { inscripciones: { where: { activa: true } } } },
            },
        });

        res.json({ ok: true, data: talleres });
    } catch (err) {
        logger.error({ err }, "Error obteniendo talleres");
        res.status(500).json({ ok: false, message: "Error interno del servidor." });
    }
};

export const getTallerById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id as string);
        const taller = await prisma.taller.findUnique({
            where: { id },
            include: {
                profesor: true,
                tallerDias: { include: { dia: true }, orderBy: { dia_id: "asc" } },
                inscripciones: {
                    where: { activa: true },
                    include: { alumno: { select: { id: true, nombre: true, apellido: true, dni: true } } },
                },
            },
        });
        if (!taller) {
            res.status(404).json({ ok: false, message: "Taller no encontrado." });
            return;
        }
        res.json({ ok: true, data: taller });
    } catch (err) {
        logger.error({ err }, "Error obteniendo taller");
        res.status(500).json({ ok: false, message: "Error interno del servidor." });
    }
};

export const createTaller = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { dias, ...tallerData } = req.body;
        tallerData.fecha_inicio = new Date(tallerData.fecha_inicio);
        tallerData.fecha_fin = new Date(tallerData.fecha_fin);

        const taller = await prisma.taller.create({
            data: {
                ...tallerData,
                tallerDias: {
                    create: dias.map((d: any) => ({
                        dia_id: d.dia_id,
                        hora_inicio: new Date(`1970-01-01T${d.hora_inicio}:00`),
                        hora_fin: new Date(`1970-01-01T${d.hora_fin}:00`),
                    })),
                },
            },
            include: {
                profesor: { select: { id: true, nombre: true, apellido: true } },
                tallerDias: { include: { dia: true } },
            },
        });

        res.status(201).json({ ok: true, data: taller });
    } catch (err) {
        logger.error({ err }, "Error creando taller");
        res.status(500).json({ ok: false, message: "Error interno del servidor." });
    }
};

export const updateTaller = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id as string);
        const { dias, ...tallerData } = req.body;

        if (tallerData.fecha_inicio) tallerData.fecha_inicio = new Date(tallerData.fecha_inicio);
        if (tallerData.fecha_fin) tallerData.fecha_fin = new Date(tallerData.fecha_fin);

        // Si vienen días, los reemplazamos
        if (dias) {
            await prisma.tallerDia.deleteMany({ where: { taller_id: id } });
            await prisma.tallerDia.createMany({
                data: dias.map((d: any) => ({
                    taller_id: id,
                    dia_id: d.dia_id,
                    hora_inicio: new Date(`1970-01-01T${d.hora_inicio}:00`),
                    hora_fin: new Date(`1970-01-01T${d.hora_fin}:00`),
                })),
            });
        }

        const taller = await prisma.taller.update({
            where: { id },
            data: tallerData,
            include: {
                profesor: { select: { id: true, nombre: true, apellido: true } },
                tallerDias: { include: { dia: true } },
            },
        });

        res.json({ ok: true, data: taller });
    } catch (err: any) {
        if (err.code === "P2025") {
            res.status(404).json({ ok: false, message: "Taller no encontrado." });
            return;
        }
        logger.error({ err }, "Error actualizando taller");
        res.status(500).json({ ok: false, message: "Error interno del servidor." });
    }
};

export const deleteTaller = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id as string);
        await prisma.taller.update({ where: { id }, data: { activo: false } });
        res.json({ ok: true, message: "Taller desactivado." });
    } catch (err: any) {
        if (err.code === "P2025") {
            res.status(404).json({ ok: false, message: "Taller no encontrado." });
            return;
        }
        logger.error({ err }, "Error eliminando taller");
        res.status(500).json({ ok: false, message: "Error interno del servidor." });
    }
};

// ─── Inscripciones ───────────────────────────────────────

export const inscribirAlumno = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const taller_id = parseInt(req.params.id as string);
        const { alumno_id } = req.body;

        // Verificar cupo
        const taller = await prisma.taller.findUnique({
            where: { id: taller_id },
            include: { _count: { select: { inscripciones: { where: { activa: true } } } } },
        });

        if (!taller) {
            res.status(404).json({ ok: false, message: "Taller no encontrado." });
            return;
        }

        if (taller._count.inscripciones >= taller.cupo_maximo) {
            res.status(409).json({ ok: false, message: "El taller está lleno." });
            return;
        }

        const inscripcion = await prisma.inscripcion.upsert({
            where: { alumno_id_taller_id: { alumno_id, taller_id } },
            update: { activa: true },
            create: { alumno_id, taller_id },
        });

        res.status(201).json({ ok: true, data: inscripcion });
    } catch (err) {
        logger.error({ err }, "Error inscribiendo alumno");
        res.status(500).json({ ok: false, message: "Error interno del servidor." });
    }
};

export const desinscribirAlumno = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const taller_id = parseInt(req.params.id as string);
        const alumno_id = parseInt(req.params.alumno_id as string);

        await prisma.inscripcion.update({
            where: { alumno_id_taller_id: { alumno_id, taller_id } },
            data: { activa: false },
        });

        res.json({ ok: true, message: "Alumno desinscripto." });
    } catch (err: any) {
        if (err.code === "P2025") {
            res.status(404).json({ ok: false, message: "Inscripción no encontrada." });
            return;
        }
        logger.error({ err }, "Error desinscribiendo alumno");
        res.status(500).json({ ok: false, message: "Error interno del servidor." });
    }
};

// ─── Días disponibles ────────────────────────────────────

export const getDias = async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
        const dias = await prisma.dia.findMany({ orderBy: { id: "asc" } });
        res.json({ ok: true, data: dias });
    } catch (err) {
        logger.error({ err }, "Error obteniendo días");
        res.status(500).json({ ok: false, message: "Error interno del servidor." });
    }
};
