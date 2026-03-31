import { Response } from "express";
import prisma from "../../prismaClient";
import { AuthRequest } from "../../shared/middlewares/authMiddleware";
import logger from "../../shared/utils/logger";

// ─── Stats generales del dashboard ──────────────────────────

export const getStats = async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [alumnosActivos, profesores, talleresActivos, asistenciaHoy] = await Promise.all([
            prisma.alumno.count({ where: { activo: true } }),
            prisma.profesor.count({ where: { activo: true } }),
            prisma.taller.count({ where: { activo: true } }),
            prisma.asistencia.count({
                where: {
                    fecha: today,
                    presente: true,
                },
            }),
        ]);

        res.json({
            ok: true,
            data: {
                alumnos_activos: alumnosActivos,
                profesores,
                talleres_activos: talleresActivos,
                asistencia_hoy: asistenciaHoy,
            },
        });
    } catch (err) {
        logger.error({ err }, "Error obteniendo stats del dashboard");
        res.status(500).json({ ok: false, message: "Error interno del servidor." });
    }
};

// ─── Recaudación mensual ────────────────────────────────────
// Devuelve recaudación por taller para los últimos N meses

export const getRecaudacion = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const meses = parseInt((req.query.meses as string) || "6");
        const now = new Date();

        // Calcular rango de fechas
        const fechaDesde = new Date(now.getFullYear(), now.getMonth() - meses + 1, 1);
        const mesDesde = fechaDesde.getMonth() + 1;
        const anioDesde = fechaDesde.getFullYear();

        // Obtener talleres activos
        const talleres = await prisma.taller.findMany({
            where: { activo: true },
            select: { id: true, nombre: true },
            orderBy: { nombre: "asc" },
        });

        // UNA sola query agrupada: pagos por taller/mes/año
        const pagosAgrupados = await prisma.pago.groupBy({
            by: ["cuota_id"],
            _sum: { monto_abonado: true },
            where: {
                cuota: {
                    OR: Array.from({ length: meses }, (_, i) => {
                        const fecha = new Date(now.getFullYear(), now.getMonth() - i, 1);
                        return { mes: fecha.getMonth() + 1, anio: fecha.getFullYear() };
                    }),
                },
            },
        });

        // Obtener las cuotas con su taller para poder pivotar
        const cuotaIds = pagosAgrupados.map((p) => p.cuota_id);
        const cuotas = cuotaIds.length > 0
            ? await prisma.cuota.findMany({
                where: { id: { in: cuotaIds } },
                select: {
                    id: true,
                    mes: true,
                    anio: true,
                    inscripcion: { select: { taller_id: true } },
                },
            })
            : [];

        // Mapear cuota_id → { mes, anio, taller_id }
        const cuotaMap = new Map(cuotas.map((c) => [c.id, c]));

        // Construir resultado pivotado
        const MESES_NOMBRE = [
            "", "Ene", "Feb", "Mar", "Abr", "May", "Jun",
            "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
        ];

        const resultado: any[] = [];
        for (let i = meses - 1; i >= 0; i--) {
            const fecha = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const mes = fecha.getMonth() + 1;
            const anio = fecha.getFullYear();

            const entry: any = {
                periodo: `${MESES_NOMBRE[mes]} ${anio}`,
                mes,
                anio,
                total: 0,
            };

            for (const taller of talleres) {
                entry[taller.nombre] = 0;
            }

            resultado.push(entry);
        }

        // Llenar con datos
        for (const pago of pagosAgrupados) {
            const cuota = cuotaMap.get(pago.cuota_id);
            if (!cuota) continue;

            const taller = talleres.find((t) => t.id === cuota.inscripcion.taller_id);
            if (!taller) continue;

            const entry = resultado.find((r) => r.mes === cuota.mes && r.anio === cuota.anio);
            if (!entry) continue;

            const monto = Number(pago._sum.monto_abonado || 0);
            entry[taller.nombre] = (entry[taller.nombre] || 0) + monto;
            entry.total += monto;
        }

        // Cobrabilidad del mes actual
        const mesActual = now.getMonth() + 1;
        const anioActual = now.getFullYear();

        const [cuotasMesActual, cuotasPagadasMesActual] = await Promise.all([
            prisma.cuota.count({
                where: { mes: mesActual, anio: anioActual, estado: { not: "anulada" } },
            }),
            prisma.cuota.count({
                where: { mes: mesActual, anio: anioActual, estado: "pagada" },
            }),
        ]);

        const cobrabilidad = cuotasMesActual > 0
            ? Math.round((cuotasPagadasMesActual / cuotasMesActual) * 100)
            : 0;

        res.json({
            ok: true,
            data: {
                recaudacion: resultado,
                talleres: talleres.map((t) => t.nombre),
                cobrabilidad,
                cuotas_total: cuotasMesActual,
                cuotas_pagadas: cuotasPagadasMesActual,
            },
        });
    } catch (err) {
        logger.error({ err }, "Error obteniendo recaudación");
        res.status(500).json({ ok: false, message: "Error interno del servidor." });
    }
};

// ─── Calendario semanal ─────────────────────────────────────
// Devuelve los talleres organizados por día de la semana con horario

export const getCalendario = async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
        const tallerDias = await prisma.tallerDia.findMany({
            where: {
                taller: { activo: true },
            },
            include: {
                taller: {
                    select: {
                        id: true,
                        nombre: true,
                        categoria: true,
                        profesor: { select: { nombre: true, apellido: true } },
                        _count: { select: { inscripciones: { where: { activa: true } } } },
                        cupo_maximo: true,
                    },
                },
                dia: { select: { id: true, nombre: true } },
            },
            orderBy: [{ dia_id: "asc" }, { hora_inicio: "asc" }],
        });

        // Agrupar por día
        const calendario: Record<string, any[]> = {};
        const diasOrden = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

        for (const dia of diasOrden) {
            calendario[dia] = [];
        }

        for (const td of tallerDias) {
            const diaName = td.dia.nombre;
            calendario[diaName]?.push({
                taller_id: td.taller.id,
                nombre: td.taller.nombre,
                categoria: td.taller.categoria,
                profesor: `${td.taller.profesor.nombre} ${td.taller.profesor.apellido}`,
                hora_inicio: td.hora_inicio.toISOString().substring(11, 16),
                hora_fin: td.hora_fin.toISOString().substring(11, 16),
                inscriptos: td.taller._count.inscripciones,
                cupo_maximo: td.taller.cupo_maximo,
            });
        }

        res.json({ ok: true, data: calendario });
    } catch (err) {
        logger.error({ err }, "Error obteniendo calendario");
        res.status(500).json({ ok: false, message: "Error interno del servidor." });
    }
};
