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

        // ─── 1. Talleres activos ───
        const talleres = await prisma.taller.findMany({
            where: { activo: true },
            select: { id: true, nombre: true, precio_mensual: true },
            orderBy: { nombre: "asc" },
        });

        // ─── 2. Cash flow mensual (últimos N meses) ───
        const cashFlow: any[] = [];

        for (let i = meses - 1; i >= 0; i--) {
            const fecha = new Date(anioActual, mesActual - 1 - i, 1);
            const mes = fecha.getMonth() + 1;
            const anio = fecha.getFullYear();

            // Total facturado (sum monto_final de cuotas no anuladas)
            const facturado = await prisma.cuota.aggregate({
                _sum: { monto_final: true },
                where: { mes, anio, estado: { not: "anulada" } },
            });

            // Total cobrado (sum monto_abonado de pagos de cuotas de ese mes)
            const cobrado = await prisma.pago.aggregate({
                _sum: { monto_abonado: true },
                where: { cuota: { mes, anio } },
            });

            // Total cuotas y pagadas
            const cuotasTotal = await prisma.cuota.count({
                where: { mes, anio, estado: { not: "anulada" } },
            });
            const cuotasPagadas = await prisma.cuota.count({
                where: { mes, anio, estado: "pagada" },
            });

            cashFlow.push({
                periodo: `${MESES_NOMBRE[mes]} ${anio}`,
                mes,
                anio,
                facturado: Number(facturado._sum.monto_final || 0),
                cobrado: Number(cobrado._sum.monto_abonado || 0),
                pendiente: Number(facturado._sum.monto_final || 0) - Number(cobrado._sum.monto_abonado || 0),
                cobrabilidad: cuotasTotal > 0 ? Math.round((cuotasPagadas / cuotasTotal) * 100) : 0,
                cuotasTotal,
                cuotasPagadas,
            });
        }

        // ─── 3. Ranking de talleres por recaudación ───
        const rankingTalleres: any[] = [];
        for (const taller of talleres) {
            const recaudado = await prisma.pago.aggregate({
                _sum: { monto_abonado: true },
                where: {
                    cuota: {
                        inscripcion: { taller_id: taller.id },
                    },
                },
            });

            const inscriptosActivos = await prisma.inscripcion.count({
                where: { taller_id: taller.id, activa: true },
            });

            const cuotasPendientes = await prisma.cuota.count({
                where: {
                    inscripcion: { taller_id: taller.id },
                    estado: "pendiente",
                },
            });

            rankingTalleres.push({
                id: taller.id,
                nombre: taller.nombre,
                precio_mensual: Number(taller.precio_mensual),
                recaudado: Number(recaudado._sum.monto_abonado || 0),
                inscriptos: inscriptosActivos,
                cuotasPendientes,
                proyeccion_mensual: inscriptosActivos * Number(taller.precio_mensual),
            });
        }

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

        // Proyección mensual total (todos los inscrptos × precio)
        const totalProyeccion = rankingTalleres.reduce((s, t) => s + t.proyeccion_mensual, 0);

        // Alumnos activos
        const alumnosActivos = await prisma.alumno.count({ where: { activo: true } });
        const totalInscripcionesActivas = await prisma.inscripcion.count({ where: { activa: true } });

        res.json({
            ok: true,
            data: {
                resumen: {
                    recaudadoMesActual: mesActualData.cobrado || 0,
                    facturadoMesActual: mesActualData.facturado || 0,
                    cobrabilidadMesActual: mesActualData.cobrabilidad || 0,
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
