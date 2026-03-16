import { z } from "zod";

const tallerDiaSchema = z.object({
    dia_id: z.number().int().positive(),
    hora_inicio: z.string().regex(/^\d{2}:\d{2}$/, "Formato HH:MM"),
    hora_fin: z.string().regex(/^\d{2}:\d{2}$/, "Formato HH:MM"),
});

export const createTallerSchema = z.object({
    nombre: z.string().min(2).max(100),
    categoria: z.string().min(2).max(50),
    precio_mensual: z.number().positive("El precio debe ser positivo"),
    cupo_maximo: z.number().int().positive().default(30),
    profesor_id: z.number().int().positive(),
    fecha_inicio: z.string().refine((d) => !isNaN(Date.parse(d)), "Fecha inválida"),
    fecha_fin: z.string().refine((d) => !isNaN(Date.parse(d)), "Fecha inválida"),
    dias: z.array(tallerDiaSchema).min(1, "Debe tener al menos un día"),
});

export const updateTallerSchema = z.object({
    nombre: z.string().min(2).max(100).optional(),
    categoria: z.string().min(2).max(50).optional(),
    precio_mensual: z.number().positive().optional(),
    cupo_maximo: z.number().int().positive().optional(),
    profesor_id: z.number().int().positive().optional(),
    fecha_inicio: z.string().refine((d) => !isNaN(Date.parse(d)), "Fecha inválida").optional(),
    fecha_fin: z.string().refine((d) => !isNaN(Date.parse(d)), "Fecha inválida").optional(),
    activo: z.boolean().optional(),
    dias: z.array(tallerDiaSchema).optional(),
});

export const inscribirAlumnoSchema = z.object({
    alumno_id: z.number().int().positive(),
});
