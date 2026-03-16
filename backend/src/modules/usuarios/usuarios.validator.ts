import { z } from "zod";

export const createUsuarioSchema = z.object({
    nombre: z.string().min(2, "El nombre es requerido").max(100),
    email: z.string().email("Email inválido").max(100),
    password: z.string().min(6, "Mínimo 6 caracteres").max(100),
    rol_id: z.number().int().positive("Rol requerido"),
});

export const updateUsuarioSchema = z.object({
    nombre: z.string().min(2).max(100).optional(),
    email: z.string().email().max(100).optional(),
    password: z.string().min(6).max(100).optional(),
    rol_id: z.number().int().positive().optional(),
    activo: z.boolean().optional(),
});
