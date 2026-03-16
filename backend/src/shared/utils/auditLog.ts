import prisma from "../../prismaClient";
import { AuthRequest } from "../middlewares/authMiddleware";

interface AuditOptions {
    req: AuthRequest;
    accion: string;
    entidad: string;
    entidad_id?: number;
    detalle?: Record<string, any>;
}

/**
 * Registra una acción en el log de auditoría.
 * Llamar después de cada operación importante.
 */
export async function auditLog({ req, accion, entidad, entidad_id, detalle }: AuditOptions): Promise<void> {
    try {
        const usuario_id = req.user?.id || null;
        const ip = req.ip || req.headers["x-forwarded-for"]?.toString() || null;

        await prisma.auditLog.create({
            data: {
                usuario_id,
                accion,
                entidad,
                entidad_id: entidad_id || null,
                detalle: detalle ?? undefined,
                ip,
            },
        });
    } catch (err) {
        // No falla silenciosamente — solo logueamos por si algo sale mal
        console.error("[AuditLog] Error registrando acción:", err);
    }
}
