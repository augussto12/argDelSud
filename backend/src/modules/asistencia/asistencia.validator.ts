import { z } from "zod";

const asistenciaEntrySchema = z.object({
    alumno_id: z.number().int().positive(),
    presente: z.boolean(),
});

export const registrarAsistenciaSchema = z.object({
    taller_id: z.number().int().positive(),
    fecha: z.string().refine((d) => !isNaN(Date.parse(d)), "Fecha inválida"),
    asistencias: z.array(asistenciaEntrySchema).min(1, "Debe tener al menos un registro"),
});
