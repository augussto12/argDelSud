import { z } from "zod";

export const generarCuotasSchema = z.object({
    taller_id: z.number().int().positive("Taller requerido"),
    mes: z.number().int().min(1).max(12, "Mes inválido"),
    anio: z.number().int().min(2020).max(2100, "Año inválido"),
});

export const registrarPagoSchema = z.object({
    cuota_id: z.number().int().positive("Cuota requerida"),
    monto_abonado: z.number().positive("El monto debe ser mayor a 0"),
    metodo_pago: z.enum(["efectivo", "transferencia", "debito"], {
        error: "Método de pago inválido",
    }),
    observaciones: z.string().optional().nullable(),
});

export const anularCuotaSchema = z.object({
    motivo: z.string().optional(),
});

export const generarMasivoSchema = z.object({
    mes: z.number().int().min(1).max(12, "Mes inválido"),
    anio: z.number().int().min(2020).max(2100, "Año inválido"),
});
