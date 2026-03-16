import { Response } from "express";
import prisma from "../../prismaClient";
import { AuthRequest } from "../../shared/middlewares/authMiddleware";
import logger from "../../shared/utils/logger";

// ─── Listar logs de auditoría ───────────────────────────────

export const getAuditLogs = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { usuario_id, entidad, accion, desde, hasta, page = "1", limit = "50" } = req.query;

        const where: any = {};

        if (usuario_id) where.usuario_id = parseInt(usuario_id as string);
        if (entidad) where.entidad = entidad;
        if (accion) where.accion = accion;
        if (desde || hasta) {
            where.creado_at = {};
            if (desde) where.creado_at.gte = new Date(desde as string);
            if (hasta) {
                const hastaDate = new Date(hasta as string);
                hastaDate.setHours(23, 59, 59, 999);
                where.creado_at.lte = hastaDate;
            }
        }

        const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
        const take = parseInt(limit as string);

        const [logs, total] = await Promise.all([
            prisma.auditLog.findMany({
                where,
                orderBy: { creado_at: "desc" },
                skip,
                take,
                include: {
                    usuario: { select: { id: true, nombre: true, email: true } },
                },
            }),
            prisma.auditLog.count({ where }),
        ]);

        res.json({
            ok: true,
            data: logs,
            pagination: {
                page: parseInt(page as string),
                limit: take,
                total,
                pages: Math.ceil(total / take),
            },
        });
    } catch (err) {
        logger.error({ err }, "Error obteniendo logs de auditoría");
        res.status(500).json({ ok: false, message: "Error interno del servidor." });
    }
};
