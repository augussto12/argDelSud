import { Response } from "express";
import prisma from "../../prismaClient";
import { AuthRequest } from "../../shared/middlewares/authMiddleware";
import logger from "../../shared/utils/logger";

// Pasar lista masivo (un taller, una fecha, todos los alumnos)
export const registrarAsistencia = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { taller_id, fecha, asistencias } = req.body;
        const fechaDate = new Date(fecha);
        const userId = req.user?.id || null;

        // Upsert de cada asistencia
        const results = await Promise.all(
            asistencias.map((a: { alumno_id: number; presente: boolean }) =>
                prisma.asistencia.upsert({
                    where: {
                        alumno_id_taller_id_fecha: {
                            alumno_id: a.alumno_id,
                            taller_id,
                            fecha: fechaDate,
                        },
                    },
                    update: { presente: a.presente, marcada_por_id: userId },
                    create: {
                        alumno_id: a.alumno_id,
                        taller_id,
                        fecha: fechaDate,
                        presente: a.presente,
                        marcada_por_id: userId,
                    },
                })
            )
        );

        res.json({ ok: true, data: results, message: `${results.length} registros guardados.` });
    } catch (err) {
        logger.error({ err }, "Error registrando asistencia");
        res.status(500).json({ ok: false, message: "Error interno del servidor." });
    }
};

// Obtener asistencia de un taller en una fecha
export const getAsistenciaPorTallerFecha = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const taller_id = parseInt(req.params.taller_id as string);
        const { fecha } = req.query;

        if (!fecha || typeof fecha !== "string") {
            res.status(400).json({ ok: false, message: "La fecha es requerida (query param: fecha)." });
            return;
        }

        // Obtener alumnos inscriptos
        const inscripciones = await prisma.inscripcion.findMany({
            where: { taller_id, activa: true },
            include: { alumno: { select: { id: true, nombre: true, apellido: true, dni: true } } },
        });

        // Obtener asistencias existentes para esa fecha
        const asistencias = await prisma.asistencia.findMany({
            where: { taller_id, fecha: new Date(fecha) },
        });

        const asistenciaMap = new Map(asistencias.map((a: any) => [a.alumno_id, a.presente]));

        const lista = inscripciones.map((i: any) => ({
            alumno: i.alumno,
            presente: asistenciaMap.get(i.alumno_id) ?? null, // null = no marcado aún
        }));

        res.json({ ok: true, data: lista });
    } catch (err) {
        logger.error({ err }, "Error obteniendo asistencia");
        res.status(500).json({ ok: false, message: "Error interno del servidor." });
    }
};

// Historial de asistencia de un alumno
export const getAsistenciaAlumno = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const alumno_id = parseInt(req.params.alumno_id as string);
        const { taller_id, desde, hasta } = req.query;

        const where: any = { alumno_id };
        if (taller_id) where.taller_id = parseInt(taller_id as string);
        if (desde || hasta) {
            where.fecha = {};
            if (desde) where.fecha.gte = new Date(desde as string);
            if (hasta) where.fecha.lte = new Date(hasta as string);
        }

        const asistencias = await prisma.asistencia.findMany({
            where,
            include: { taller: { select: { id: true, nombre: true } } },
            orderBy: { fecha: "desc" },
        });

        const total = asistencias.length;
        const presentes = asistencias.filter((a: any) => a.presente).length;

        res.json({
            ok: true,
            data: asistencias,
            resumen: { total, presentes, ausentes: total - presentes },
        });
    } catch (err) {
        logger.error({ err }, "Error obteniendo asistencia de alumno");
        res.status(500).json({ ok: false, message: "Error interno del servidor." });
    }
};
