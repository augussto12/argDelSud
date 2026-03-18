import { Response } from "express";
import prisma from "../../prismaClient";
import { AuthRequest } from "../../shared/middlewares/authMiddleware";
import logger from "../../shared/utils/logger";
import { Decimal } from "@prisma/client/runtime/library";
import { auditLog } from "../../shared/utils/auditLog";
import { parseId } from "../../shared/utils/parseId";

// ─── Helper: aplicar beca a cuota actual pendiente ──────────

async function aplicarBecaACuotaActual(inscripcion_id: number, porcentaje_descuento: number | Decimal) {
    const ahora = new Date();
    const mesActual = ahora.getMonth() + 1;
    const anioActual = ahora.getFullYear();

    // Buscar cuota pendiente del mes actual
    const cuota = await prisma.cuota.findUnique({
        where: {
            inscripcion_id_mes_anio: {
                inscripcion_id,
                mes: mesActual,
                anio: anioActual,
            },
        },
        include: { pagos: true },
    });

    if (!cuota || cuota.estado !== "pendiente") return null;

    // Recalcular descuento
    const porcentaje = new Decimal(porcentaje_descuento.toString());
    const nuevoDescuento = cuota.monto_original.mul(porcentaje).div(100);
    const nuevoMontoFinal = cuota.monto_original.minus(nuevoDescuento);

    // Verificar que no haya pagado más de lo que debe con el nuevo descuento
    const totalAbonado = cuota.pagos.reduce(
        (sum: Decimal, p: any) => sum.plus(p.monto_abonado),
        new Decimal(0)
    );

    const updated = await prisma.cuota.update({
        where: { id: cuota.id },
        data: {
            descuento_aplicado: nuevoDescuento,
            monto_final: nuevoMontoFinal,
            // Si ya pagó más de lo que debe, marcar como pagada
            estado: totalAbonado.greaterThanOrEqualTo(nuevoMontoFinal) ? "pagada" : "pendiente",
        },
    });

    return updated;
}

// ─── Listar becas con filtros ───────────────────────────────

export const getBecas = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { alumno_id, taller_id, activa } = req.query;

        const where: any = {};
        if (activa !== undefined) where.activa = activa === "true";
        if (alumno_id || taller_id) {
            where.inscripcion = {};
            if (alumno_id) where.inscripcion.alumno_id = parseInt(alumno_id as string);
            if (taller_id) where.inscripcion.taller_id = parseInt(taller_id as string);
        }

        const becas = await prisma.beca.findMany({
            where,
            orderBy: { creado_at: "desc" },
            include: {
                inscripcion: {
                    include: {
                        alumno: { select: { id: true, nombre: true, apellido: true, dni: true } },
                        taller: { select: { id: true, nombre: true } },
                    },
                },
            },
        });

        res.json({ ok: true, data: becas });
    } catch (err) {
        logger.error({ err }, "Error obteniendo becas");
        res.status(500).json({ ok: false, message: "Error interno del servidor." });
    }
};

// ─── Crear beca ─────────────────────────────────────────────

export const createBeca = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { aplicar_cuota_actual, ...data } = req.body;
        data.fecha_inicio = new Date(data.fecha_inicio);
        data.fecha_fin = new Date(data.fecha_fin);

        // Verificar que la inscripción existe y está activa
        const inscripcion = await prisma.inscripcion.findUnique({
            where: { id: data.inscripcion_id },
        });

        if (!inscripcion) {
            res.status(404).json({ ok: false, message: "Inscripción no encontrada." });
            return;
        }

        if (!inscripcion.activa) {
            res.status(400).json({ ok: false, message: "La inscripción no está activa." });
            return;
        }

        const beca = await prisma.beca.create({
            data,
            include: {
                inscripcion: {
                    include: {
                        alumno: { select: { id: true, nombre: true, apellido: true } },
                        taller: { select: { id: true, nombre: true } },
                    },
                },
            },
        });

        // Aplicar a cuota actual si se pidió
        let cuotaActualizada = null;
        if (aplicar_cuota_actual) {
            cuotaActualizada = await aplicarBecaACuotaActual(data.inscripcion_id, data.porcentaje_descuento);
        }

        await auditLog({ req, accion: 'crear', entidad: 'beca', entidad_id: beca.id, detalle: { inscripcion_id: data.inscripcion_id, porcentaje: data.porcentaje_descuento } });

        res.status(201).json({
            ok: true,
            data: beca,
            cuotaActualizada: cuotaActualizada ? true : false,
        });
    } catch (err) {
        logger.error({ err }, "Error creando beca");
        res.status(500).json({ ok: false, message: "Error interno del servidor." });
    }
};

// ─── Actualizar beca ────────────────────────────────────────

export const updateBeca = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = parseId(req.params.id);
        const { aplicar_cuota_actual, ...data } = req.body;

        if (data.fecha_inicio) data.fecha_inicio = new Date(data.fecha_inicio);
        if (data.fecha_fin) data.fecha_fin = new Date(data.fecha_fin);

        const beca = await prisma.beca.update({
            where: { id },
            data,
            include: {
                inscripcion: {
                    include: {
                        alumno: { select: { id: true, nombre: true, apellido: true } },
                        taller: { select: { id: true, nombre: true } },
                    },
                },
            },
        });

        // Aplicar a cuota actual si se pidió
        let cuotaActualizada = null;
        if (aplicar_cuota_actual && data.porcentaje_descuento) {
            cuotaActualizada = await aplicarBecaACuotaActual(beca.inscripcion_id, data.porcentaje_descuento);
        }

        await auditLog({ req, accion: 'editar', entidad: 'beca', entidad_id: id, detalle: data });

        res.json({
            ok: true,
            data: beca,
            cuotaActualizada: cuotaActualizada ? true : false,
        });
    } catch (err: any) {
        if (err.code === "P2025") {
            res.status(404).json({ ok: false, message: "Beca no encontrada." });
            return;
        }
        logger.error({ err }, "Error actualizando beca");
        res.status(500).json({ ok: false, message: "Error interno del servidor." });
    }
};

// ─── Desactivar beca ────────────────────────────────────────

export const desactivarBeca = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = parseId(req.params.id);

        const beca = await prisma.beca.update({
            where: { id },
            data: { activa: false },
        });

        await auditLog({ req, accion: 'desactivar', entidad: 'beca', entidad_id: id });

        res.json({ ok: true, data: beca, message: "Beca desactivada." });
    } catch (err: any) {
        if (err.code === "P2025") {
            res.status(404).json({ ok: false, message: "Beca no encontrada." });
            return;
        }
        logger.error({ err }, "Error desactivando beca");
        res.status(500).json({ ok: false, message: "Error interno del servidor." });
    }
};

// ─── Obtener inscripciones activas (para seleccionar en el form) ─

export const getInscripcionesActivas = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { search } = req.query;

        const where: any = { activa: true };
        if (search && typeof search === "string") {
            where.alumno = {
                OR: [
                    { nombre: { contains: search, mode: "insensitive" as const } },
                    { apellido: { contains: search, mode: "insensitive" as const } },
                    { dni: { contains: search } },
                ],
            };
        }

        const inscripciones = await prisma.inscripcion.findMany({
            where,
            include: {
                alumno: { select: { id: true, nombre: true, apellido: true, dni: true } },
                taller: { select: { id: true, nombre: true } },
            },
            orderBy: { alumno: { apellido: "asc" } },
        });

        res.json({ ok: true, data: inscripciones });
    } catch (err) {
        logger.error({ err }, "Error obteniendo inscripciones");
        res.status(500).json({ ok: false, message: "Error interno del servidor." });
    }
};
