import { z } from "zod";

export const createBecaSchema = z.object({
    inscripcion_id: z.number().int().positive("Inscripción requerida"),
    porcentaje_descuento: z.number().min(1, "Mínimo 1%").max(100, "Máximo 100%"),
    motivo: z.string().optional().nullable(),
    fecha_inicio: z.string().refine((d) => !isNaN(Date.parse(d)), "Fecha inicio inválida"),
    fecha_fin: z.string().refine((d) => !isNaN(Date.parse(d)), "Fecha fin inválida"),
});

export const updateBecaSchema = z.object({
    porcentaje_descuento: z.number().min(1).max(100).optional(),
    motivo: z.string().optional().nullable(),
    fecha_inicio: z.string().refine((d) => !isNaN(Date.parse(d)), "Fecha inicio inválida").optional(),
    fecha_fin: z.string().refine((d) => !isNaN(Date.parse(d)), "Fecha fin inválida").optional(),
});
