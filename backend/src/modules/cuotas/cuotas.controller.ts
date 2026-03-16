import { Response } from "express";
import prisma from "../../prismaClient";
import { AuthRequest } from "../../shared/middlewares/authMiddleware";
import logger from "../../shared/utils/logger";
import { Decimal } from "@prisma/client/runtime/library";
import { auditLog } from "../../shared/utils/auditLog";

// ─── Listar cuotas con filtros ─────────────────────────────

export const getCuotas = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { taller_id, mes, anio, estado, alumno_id } = req.query;

        const where: any = {};
        if (taller_id) {
            where.inscripcion = { taller_id: parseInt(taller_id as string) };
        }
        if (alumno_id) {
            where.inscripcion = {
                ...where.inscripcion,
                alumno_id: parseInt(alumno_id as string),
            };
        }
        if (mes) where.mes = parseInt(mes as string);
        if (anio) where.anio = parseInt(anio as string);
        if (estado) where.estado = estado;

        const cuotas = await prisma.cuota.findMany({
            where,
            orderBy: [{ anio: "desc" }, { mes: "desc" }],
            include: {
                inscripcion: {
                    include: {
                        alumno: { select: { id: true, nombre: true, apellido: true, dni: true } },
                        taller: { select: { id: true, nombre: true } },
                    },
                },
                pagos: {
                    select: { id: true, monto_abonado: true, metodo_pago: true, creado_at: true },
                },
            },
        });

        res.json({ ok: true, data: cuotas });
    } catch (err) {
        logger.error({ err }, "Error obteniendo cuotas");
        res.status(500).json({ ok: false, message: "Error interno del servidor." });
    }
};

// ─── Detalle de una cuota ───────────────────────────────────

export const getCuotaById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id as string);
        const cuota = await prisma.cuota.findUnique({
            where: { id },
            include: {
                inscripcion: {
                    include: {
                        alumno: true,
                        taller: true,
                        becas: { where: { activa: true } },
                    },
                },
                pagos: {
                    include: {
                        registrado_por: { select: { id: true, nombre: true } },
                    },
                    orderBy: { creado_at: "desc" },
                },
            },
        });

        if (!cuota) {
            res.status(404).json({ ok: false, message: "Cuota no encontrada." });
            return;
        }

        res.json({ ok: true, data: cuota });
    } catch (err) {
        logger.error({ err }, "Error obteniendo cuota");
        res.status(500).json({ ok: false, message: "Error interno del servidor." });
    }
};

// ─── Generar cuotas masivas para un taller+mes+año ──────────
// Congela precio del taller y aplica beca vigente

export const generarCuotas = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { taller_id, mes, anio } = req.body;

        // 1. Obtener taller con precio
        const taller = await prisma.taller.findUnique({ where: { id: taller_id } });
        if (!taller) {
            res.status(404).json({ ok: false, message: "Taller no encontrado." });
            return;
        }

        // 2. Obtener inscripciones activas
        const inscripciones = await prisma.inscripcion.findMany({
            where: { taller_id, activa: true },
            include: {
                becas: {
                    where: {
                        activa: true,
                        fecha_inicio: { lte: new Date(anio, mes - 1, 1) },
                        fecha_fin: { gte: new Date(anio, mes - 1, 1) },
                    },
                },
            },
        });

        if (inscripciones.length === 0) {
            res.status(400).json({ ok: false, message: "No hay alumnos inscriptos activos en este taller." });
            return;
        }

        // 3. Generar cuotas
        const cuotasCreadas: any[] = [];
        const cuotasExistentes: number[] = [];

        for (const insc of inscripciones) {
            // Verificar si ya existe
            const existing = await prisma.cuota.findUnique({
                where: { inscripcion_id_mes_anio: { inscripcion_id: insc.id, mes, anio } },
            });

            if (existing) {
                cuotasExistentes.push(insc.id);
                continue;
            }

            // Calcular descuento por beca vigente
            const montoOriginal = taller.precio_mensual;
            let descuentoAplicado = new Decimal(0);

            if (insc.becas.length > 0) {
                // Tomar la beca con mayor porcentaje si hay varias
                const mejorBeca = insc.becas.reduce((prev: any, curr: any) =>
                    curr.porcentaje_descuento.greaterThan(prev.porcentaje_descuento) ? curr : prev
                );
                descuentoAplicado = montoOriginal.mul(mejorBeca.porcentaje_descuento).div(100);
            }

            const montoFinal = montoOriginal.minus(descuentoAplicado);

            const cuota = await prisma.cuota.create({
                data: {
                    inscripcion_id: insc.id,
                    mes,
                    anio,
                    monto_original: montoOriginal,
                    descuento_aplicado: descuentoAplicado,
                    monto_final: montoFinal,
                },
            });

            cuotasCreadas.push(cuota);
        }

        res.status(201).json({
            ok: true,
            data: {
                generadas: cuotasCreadas.length,
                ya_existentes: cuotasExistentes.length,
                total_inscriptos: inscripciones.length,
                cuotas: cuotasCreadas,
            },
        });
    } catch (err) {
        logger.error({ err }, "Error generando cuotas");
        res.status(500).json({ ok: false, message: "Error interno del servidor." });
    }
};

// ─── Anular cuota ───────────────────────────────────────────

export const anularCuota = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id as string);

        const cuota = await prisma.cuota.findUnique({ where: { id } });
        if (!cuota) {
            res.status(404).json({ ok: false, message: "Cuota no encontrada." });
            return;
        }

        if (cuota.estado === "pagada") {
            res.status(400).json({ ok: false, message: "No se puede anular una cuota ya pagada." });
            return;
        }

        const updated = await prisma.cuota.update({
            where: { id },
            data: { estado: "anulada" },
        });

        res.json({ ok: true, data: updated });
    } catch (err) {
        logger.error({ err }, "Error anulando cuota");
        res.status(500).json({ ok: false, message: "Error interno del servidor." });
    }
};

// ─── Registrar pago ─────────────────────────────────────────

export const registrarPago = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { cuota_id, monto_abonado, metodo_pago, observaciones } = req.body;

        const cuota = await prisma.cuota.findUnique({
            where: { id: cuota_id },
            include: { pagos: true },
        });

        if (!cuota) {
            res.status(404).json({ ok: false, message: "Cuota no encontrada." });
            return;
        }

        if (cuota.estado === "anulada") {
            res.status(400).json({ ok: false, message: "No se puede pagar una cuota anulada." });
            return;
        }

        if (cuota.estado === "pagada") {
            res.status(400).json({ ok: false, message: "Esta cuota ya está pagada." });
            return;
        }

        // Calcular total ya abonado
        const totalAbonado = cuota.pagos.reduce(
            (sum: any, p: any) => sum.plus(p.monto_abonado),
            new Decimal(0)
        );

        const pago = await prisma.pago.create({
            data: {
                cuota_id,
                monto_abonado,
                metodo_pago,
                observaciones,
                registrado_por_id: req.user!.id,
            },
        });

        // Si el total abonado (incluyendo este pago) >= monto_final → marcar pagada
        const nuevoTotal = totalAbonado.plus(monto_abonado);
        if (nuevoTotal.greaterThanOrEqualTo(cuota.monto_final)) {
            await prisma.cuota.update({
                where: { id: cuota_id },
                data: { estado: "pagada" },
            });
        }

        await auditLog({ req, accion: 'registrar_pago', entidad: 'pago', entidad_id: pago.id, detalle: { cuota_id, monto_abonado, metodo_pago } });

        res.status(201).json({ ok: true, data: pago });
    } catch (err) {
        logger.error({ err }, "Error registrando pago");
        res.status(500).json({ ok: false, message: "Error interno del servidor." });
    }
};

// ─── Listar pagos de una cuota ──────────────────────────────

export const getPagos = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { cuota_id } = req.query;

        const where: any = {};
        if (cuota_id) where.cuota_id = parseInt(cuota_id as string);

        const pagos = await prisma.pago.findMany({
            where,
            orderBy: { creado_at: "desc" },
            include: {
                cuota: {
                    include: {
                        inscripcion: {
                            include: {
                                alumno: { select: { id: true, nombre: true, apellido: true } },
                                taller: { select: { id: true, nombre: true } },
                            },
                        },
                    },
                },
                registrado_por: { select: { id: true, nombre: true } },
            },
        });

        res.json({ ok: true, data: pagos });
    } catch (err) {
        logger.error({ err }, "Error obteniendo pagos");
        res.status(500).json({ ok: false, message: "Error interno del servidor." });
    }
};

// ─── Eliminar pago (y recalcular estado cuota) ──────────────

export const deletePago = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id as string);

        const pago = await prisma.pago.findUnique({ where: { id } });
        if (!pago) {
            res.status(404).json({ ok: false, message: "Pago no encontrado." });
            return;
        }

        // Borrar el pago
        await prisma.pago.delete({ where: { id } });

        // Recalcular estado de la cuota
        const pagosRestantes = await prisma.pago.findMany({
            where: { cuota_id: pago.cuota_id },
        });

        const totalAbonado = pagosRestantes.reduce(
            (sum: any, p: any) => sum.plus(p.monto_abonado),
            new Decimal(0)
        );

        const cuota = await prisma.cuota.findUnique({ where: { id: pago.cuota_id } });
        if (cuota && cuota.estado !== "anulada") {
            const nuevoEstado = totalAbonado.greaterThanOrEqualTo(cuota.monto_final)
                ? "pagada"
                : "pendiente";

            await prisma.cuota.update({
                where: { id: pago.cuota_id },
                data: { estado: nuevoEstado },
            });
        }

        res.json({ ok: true, message: "Pago eliminado." });
    } catch (err: any) {
        if (err.code === "P2025") {
            res.status(404).json({ ok: false, message: "Pago no encontrado." });
            return;
        }
        logger.error({ err }, "Error eliminando pago");
        res.status(500).json({ ok: false, message: "Error interno del servidor." });
    }
};

// ─── Generar cuotas MASIVO (todos los talleres activos) ─────
// Un solo click genera cuotas de todos los inscriptos activos

export const generarCuotasMasivo = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { mes, anio } = req.body;

        // 1. Obtener TODOS los talleres activos
        const talleres = await prisma.taller.findMany({
            where: { activo: true },
            select: { id: true, nombre: true, precio_mensual: true },
        });

        if (talleres.length === 0) {
            res.status(400).json({ ok: false, message: "No hay talleres activos." });
            return;
        }

        let totalGeneradas = 0;
        let totalExistentes = 0;
        const resumenPorTaller: any[] = [];

        for (const taller of talleres) {
            // 2. Inscripciones activas de este taller
            const inscripciones = await prisma.inscripcion.findMany({
                where: { taller_id: taller.id, activa: true },
                include: {
                    becas: {
                        where: {
                            activa: true,
                            fecha_inicio: { lte: new Date(anio, mes - 1, 28) },
                            fecha_fin: { gte: new Date(anio, mes - 1, 1) },
                        },
                    },
                },
            });

            let generadas = 0;
            let existentes = 0;

            for (const insc of inscripciones) {
                // Verificar si ya existe
                const existing = await prisma.cuota.findUnique({
                    where: { inscripcion_id_mes_anio: { inscripcion_id: insc.id, mes, anio } },
                });

                if (existing) {
                    existentes++;
                    continue;
                }

                // Calcular descuento por beca vigente
                const montoOriginal = taller.precio_mensual;
                let descuentoAplicado = new Decimal(0);

                if (insc.becas.length > 0) {
                    const mejorBeca = insc.becas.reduce((prev: any, curr: any) =>
                        curr.porcentaje_descuento.greaterThan(prev.porcentaje_descuento) ? curr : prev
                    );
                    descuentoAplicado = montoOriginal.mul(mejorBeca.porcentaje_descuento).div(100);
                }

                const montoFinal = montoOriginal.minus(descuentoAplicado);

                await prisma.cuota.create({
                    data: {
                        inscripcion_id: insc.id,
                        mes,
                        anio,
                        monto_original: montoOriginal,
                        descuento_aplicado: descuentoAplicado,
                        monto_final: montoFinal,
                    },
                });

                generadas++;
            }

            totalGeneradas += generadas;
            totalExistentes += existentes;

            if (generadas > 0 || existentes > 0) {
                resumenPorTaller.push({
                    taller: taller.nombre,
                    generadas,
                    existentes,
                    inscriptos: inscripciones.length,
                });
            }
        }

        logger.info({ mes, anio, totalGeneradas, totalExistentes }, "Cuotas masivas generadas");
        await auditLog({ req, accion: 'generar_cuotas', entidad: 'cuota', detalle: { mes, anio, totalGeneradas, totalExistentes } });

        res.status(201).json({
            ok: true,
            data: {
                totalGeneradas,
                totalExistentes,
                talleres: resumenPorTaller,
            },
            message: `${totalGeneradas} cuotas generadas. ${totalExistentes} ya existían.`,
        });
    } catch (err) {
        logger.error({ err }, "Error generando cuotas masivas");
        res.status(500).json({ ok: false, message: "Error interno del servidor." });
    }
};

// ─── Deudores: alumnos con cuotas pendientes ────────────────

export const getDeudores = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { taller_id } = req.query;

        // Buscar todas las cuotas pendientes
        const whereClause: any = { estado: "pendiente" };
        if (taller_id) {
            whereClause.inscripcion = { taller_id: parseInt(taller_id as string) };
        }

        const cuotasPendientes = await prisma.cuota.findMany({
            where: whereClause,
            orderBy: [{ anio: "asc" }, { mes: "asc" }],
            include: {
                inscripcion: {
                    include: {
                        alumno: { select: { id: true, nombre: true, apellido: true, dni: true } },
                        taller: { select: { id: true, nombre: true } },
                    },
                },
                pagos: {
                    select: { monto_abonado: true, creado_at: true },
                },
            },
        });

        // Agrupar por alumno
        const deudoresMap = new Map<number, {
            alumno: { id: number; nombre: string; apellido: string; dni: string };
            talleres: Set<string>;
            cuotas: {
                id: number;
                mes: number;
                anio: number;
                monto_final: any;
                abonado: any;
                saldo: any;
                taller: string;
            }[];
            deudaTotal: any;
            ultimoPago: Date | null;
        }>();

        const ahora = new Date();
        const mesActual = ahora.getMonth() + 1;
        const anioActual = ahora.getFullYear();

        for (const cuota of cuotasPendientes) {
            const alumno = cuota.inscripcion.alumno;
            const alumnoId = alumno.id;

            if (!deudoresMap.has(alumnoId)) {
                deudoresMap.set(alumnoId, {
                    alumno,
                    talleres: new Set(),
                    cuotas: [],
                    deudaTotal: new Decimal(0),
                    ultimoPago: null,
                });
            }

            const deudor = deudoresMap.get(alumnoId)!;
            deudor.talleres.add(cuota.inscripcion.taller.nombre);

            // Calcular abonado de esta cuota
            const abonado = cuota.pagos.reduce(
                (sum: any, p: any) => sum.plus(p.monto_abonado),
                new Decimal(0)
            );
            const saldo = cuota.monto_final.minus(abonado);

            deudor.cuotas.push({
                id: cuota.id,
                mes: cuota.mes,
                anio: cuota.anio,
                monto_final: cuota.monto_final,
                abonado,
                saldo,
                taller: cuota.inscripcion.taller.nombre,
            });

            deudor.deudaTotal = deudor.deudaTotal.plus(saldo);

            // Último pago
            for (const pago of cuota.pagos) {
                if (!deudor.ultimoPago || pago.creado_at > deudor.ultimoPago) {
                    deudor.ultimoPago = pago.creado_at;
                }
            }
        }

        // Convertir a array y calcular meses de atraso
        const deudores = Array.from(deudoresMap.values()).map((d) => {
            // Mes más antiguo adeudado
            const cuotaMasVieja = d.cuotas[0];
            let mesesAtraso = 0;
            if (cuotaMasVieja) {
                mesesAtraso = (anioActual - cuotaMasVieja.anio) * 12 + (mesActual - cuotaMasVieja.mes);
            }

            return {
                alumno: d.alumno,
                talleres: Array.from(d.talleres),
                mesesAtraso,
                deudaTotal: d.deudaTotal,
                cuotasPendientes: d.cuotas.length,
                ultimoPago: d.ultimoPago,
                cuotas: d.cuotas,
            };
        });

        // Ordenar por meses de atraso (más moroso primero)
        deudores.sort((a, b) => b.mesesAtraso - a.mesesAtraso);

        res.json({ ok: true, data: deudores });
    } catch (err) {
        logger.error({ err }, "Error obteniendo deudores");
        res.status(500).json({ ok: false, message: "Error interno del servidor." });
    }
};

// ─── Cuenta corriente de un alumno ──────────────────────────

export const getCuentaAlumno = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const alumno_id = parseInt(req.params.alumno_id as string);

        // Datos del alumno
        const alumno = await prisma.alumno.findUnique({
            where: { id: alumno_id },
            select: { id: true, nombre: true, apellido: true, dni: true },
        });

        if (!alumno) {
            res.status(404).json({ ok: false, message: "Alumno no encontrado." });
            return;
        }

        // Todas las cuotas del alumno (a través de inscripciones)
        const cuotas = await prisma.cuota.findMany({
            where: {
                inscripcion: { alumno_id },
            },
            orderBy: [{ anio: "desc" }, { mes: "desc" }],
            include: {
                inscripcion: {
                    include: {
                        taller: { select: { id: true, nombre: true } },
                    },
                },
                pagos: {
                    select: { id: true, monto_abonado: true, metodo_pago: true, creado_at: true },
                    orderBy: { creado_at: "desc" },
                },
            },
        });

        // Calcular resúmenes
        let totalAdeudado = new Decimal(0);
        let totalPagado = new Decimal(0);
        let cuotasPendientes = 0;
        let cuotasPagadas = 0;

        const cuotasConSaldo = cuotas.map((c: any) => {
            const abonado = c.pagos.reduce(
                (sum: any, p: any) => sum.plus(p.monto_abonado),
                new Decimal(0)
            );
            const saldo = c.monto_final.minus(abonado);

            if (c.estado === "pendiente") {
                totalAdeudado = totalAdeudado.plus(saldo);
                cuotasPendientes++;
            }
            if (c.estado === "pagada") {
                cuotasPagadas++;
            }
            totalPagado = totalPagado.plus(abonado);

            return {
                id: c.id,
                mes: c.mes,
                anio: c.anio,
                taller: c.inscripcion.taller,
                monto_original: c.monto_original,
                descuento_aplicado: c.descuento_aplicado,
                monto_final: c.monto_final,
                abonado,
                saldo,
                estado: c.estado,
                pagos: c.pagos,
            };
        });

        res.json({
            ok: true,
            data: {
                alumno,
                resumen: {
                    totalAdeudado,
                    totalPagado,
                    cuotasPendientes,
                    cuotasPagadas,
                    totalCuotas: cuotas.length,
                },
                cuotas: cuotasConSaldo,
            },
        });
    } catch (err) {
        logger.error({ err }, "Error obteniendo cuenta del alumno");
        res.status(500).json({ ok: false, message: "Error interno del servidor." });
    }
};
