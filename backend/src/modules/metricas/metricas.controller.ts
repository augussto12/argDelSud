import { Response } from "express";
import prisma from "../../prismaClient";
import { AuthRequest } from "../../shared/middlewares/authMiddleware";
import logger from "../../shared/utils/logger";
import { Decimal } from "@prisma/client/runtime/library";

// ─── Métricas financieras completas (Cash Flow) ─────────────

export const getMetricas = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const meses = parseInt((req.query.meses as string) || "12");
        const now = new Date();
        const mesActual = now.getMonth() + 1;
        const anioActual = now.getFullYear();

        const MESES_NOMBRE = [
            "", "Ene", "Feb", "Mar", "Abr", "May", "Jun",
            "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
        ];

        // Generar lista de periodos
        const periodos = Array.from({ length: meses }, (_, i) => {
            const fecha = new Date(anioActual, mesActual - 1 - i, 1);
            return { mes: fecha.getMonth() + 1, anio: fecha.getFullYear() };
        }).reverse();

        const periodosFilter = periodos.map((p) => ({ mes: p.mes, anio: p.anio }));

        // ─── 1. Talleres activos ───
        const talleres = await prisma.taller.findMany({
            where: { activo: true },
            select: { id: true, nombre: true, precio_mensual: true },
            orderBy: { nombre: "asc" },
        });

        // ─── 2. Cash flow mensual con queries agrupadas ───
        const [facturadosPorPeriodo, cobradosPorPeriodo, cuotasTotales, cuotasPagadasTotales] = await Promise.all([
            // Facturado por mes/año
            prisma.cuota.groupBy({
                by: ["mes", "anio"],
                _sum: { monto_final: true },
                _count: true,
                where: { estado: { not: "anulada" }, OR: periodosFilter },
            }),
            // Cobrado por mes/año
            prisma.pago.findMany({
                where: { cuota: { OR: periodosFilter } },
                select: {
                    monto_abonado: true,
                    cuota: { select: { mes: true, anio: true } },
                },
            }),
            // Total cuotas (no anuladas) por periodo
            prisma.cuota.groupBy({
                by: ["mes", "anio"],
                _count: true,
                where: { estado: { not: "anulada" }, OR: periodosFilter },
            }),
            // Cuotas pagadas por periodo
            prisma.cuota.groupBy({
                by: ["mes", "anio"],
                _count: true,
                where: { estado: "pagada", OR: periodosFilter },
            }),
        ]);

        // Agrupar cobrados por mes/año
        const cobradosMap = new Map<string, number>();
        for (const pago of cobradosPorPeriodo) {
            const key = `${pago.cuota.mes}-${pago.cuota.anio}`;
            cobradosMap.set(key, (cobradosMap.get(key) || 0) + Number(pago.monto_abonado));
        }

        // Mapas de facturado, totales y pagadas
        const facturadoMap = new Map(facturadosPorPeriodo.map((f) => [`${f.mes}-${f.anio}`, Number(f._sum.monto_final || 0)]));
        const cuotasTotalMap = new Map(cuotasTotales.map((c) => [`${c.mes}-${c.anio}`, c._count]));
        const cuotasPagadasMap = new Map(cuotasPagadasTotales.map((c) => [`${c.mes}-${c.anio}`, c._count]));

        const cashFlow = periodos.map((p) => {
            const key = `${p.mes}-${p.anio}`;
            const facturado = facturadoMap.get(key) || 0;
            const cobrado = cobradosMap.get(key) || 0;
            const cuotasTotal = cuotasTotalMap.get(key) || 0;
            const cuotasPagadas = cuotasPagadasMap.get(key) || 0;

            return {
                periodo: `${MESES_NOMBRE[p.mes]} ${p.anio}`,
                mes: p.mes,
                anio: p.anio,
                facturado,
                cobrado,
                pendiente: facturado - cobrado,
                cobrabilidad: cuotasTotal > 0 ? Math.round((cuotasPagadas / cuotasTotal) * 100) : 0,
                cuotasTotal,
                cuotasPagadas,
            };
        });

        // ─── 3. Ranking de talleres (queries en paralelo) ───
        const rankingTalleres = await Promise.all(
            talleres.map(async (taller) => {
                const [recaudado, inscriptosActivos, cuotasPendientes] = await Promise.all([
                    prisma.pago.aggregate({
                        _sum: { monto_abonado: true },
                        where: { cuota: { inscripcion: { taller_id: taller.id } } },
                    }),
                    prisma.inscripcion.count({
                        where: { taller_id: taller.id, activa: true },
                    }),
                    prisma.cuota.count({
                        where: { inscripcion: { taller_id: taller.id }, estado: "pendiente" },
                    }),
                ]);

                return {
                    id: taller.id,
                    nombre: taller.nombre,
                    precio_mensual: Number(taller.precio_mensual),
                    recaudado: Number(recaudado._sum.monto_abonado || 0),
                    inscriptos: inscriptosActivos,
                    cuotasPendientes,
                    proyeccion_mensual: inscriptosActivos * Number(taller.precio_mensual),
                };
            })
        );

        rankingTalleres.sort((a, b) => b.recaudado - a.recaudado);

        // ─── 4. Resumen general mes actual ───
        const mesActualData = cashFlow[cashFlow.length - 1] || {};

        // Deuda total acumulada
        const deudaTotal = await prisma.cuota.findMany({
            where: { estado: "pendiente" },
            include: { pagos: { select: { monto_abonado: true } } },
        });

        let totalDeuda = new Decimal(0);
        for (const cuota of deudaTotal) {
            const abonado = cuota.pagos.reduce(
                (sum: any, p: any) => sum.plus(p.monto_abonado),
                new Decimal(0)
            );
            totalDeuda = totalDeuda.plus(cuota.monto_final.minus(abonado));
        }

        // Total becas en $ (descuentos aplicados)
        const totalBecas = await prisma.cuota.aggregate({
            _sum: { descuento_aplicado: true },
        });

        // Proyección mensual total
        const totalProyeccion = rankingTalleres.reduce((s, t) => s + t.proyeccion_mensual, 0);

        // Alumnos activos
        const [alumnosActivos, totalInscripcionesActivas] = await Promise.all([
            prisma.alumno.count({ where: { activo: true } }),
            prisma.inscripcion.count({ where: { activa: true } }),
        ]);

        res.json({
            ok: true,
            data: {
                resumen: {
                    recaudadoMesActual: (mesActualData as any).cobrado || 0,
                    facturadoMesActual: (mesActualData as any).facturado || 0,
                    cobrabilidadMesActual: (mesActualData as any).cobrabilidad || 0,
                    proyeccionMensual: totalProyeccion,
                    deudaTotal: Number(totalDeuda),
                    totalBecasDescuento: Number(totalBecas._sum.descuento_aplicado || 0),
                    alumnosActivos,
                    inscripcionesActivas: totalInscripcionesActivas,
                },
                cashFlow,
                rankingTalleres,
            },
        });
    } catch (err) {
        logger.error({ err }, "Error obteniendo métricas");
        res.status(500).json({ ok: false, message: "Error interno del servidor." });
    }
};

