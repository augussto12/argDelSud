import { z } from "zod";

export const createProfesorSchema = z.object({
    nombre: z.string().min(2).max(100),
    apellido: z.string().min(2).max(100),
    dni: z.string().min(7).max(20),
    especialidad: z.string().max(100).optional().nullable(),
    telefono: z.string().max(20).optional().nullable(),
    email: z.string().email().optional().nullable(),
});

export const updateProfesorSchema = createProfesorSchema.partial().extend({
    activo: z.boolean().optional(),
});
