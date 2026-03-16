import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export const validate = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            const errors = result.error.issues.map((e: any) => ({
                campo: e.path.join("."),
                mensaje: e.message,
            }));
            res.status(400).json({ ok: false, message: "Datos inválidos", errors });
            return;
        }
        req.body = result.data;
        next();
    };
};
