import { z } from "zod";

export const createAlumnoSchema = z.object({
    nombre: z.string().min(2, "El nombre es requerido").max(100),
    apellido: z.string().min(2, "El apellido es requerido").max(100),
    dni: z.string().min(7, "DNI inválido").max(20),
    fecha_nacimiento: z.string().refine((d) => !isNaN(Date.parse(d)), "Fecha inválida"),
    telefono: z.string().max(20).optional().nullable(),
    telefono_tutor: z.string().max(20).optional().nullable(),
    nombre_tutor: z.string().max(200).optional().nullable(),
    direccion: z.string().optional().nullable(),
    notas: z.string().optional().nullable(),
});

export const updateAlumnoSchema = createAlumnoSchema.partial().extend({
    activo: z.boolean().optional(),
});
