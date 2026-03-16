import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";

export const globalErrorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
    logger.error({ err: err.message, stack: err.stack }, "Error no manejado");

    const statusCode = (err as any).statusCode || 500;
    const message = process.env.NODE_ENV === "production"
        ? "Error interno del servidor"
        : err.message;

    res.status(statusCode).json({
        ok: false,
        message,
    });
};
