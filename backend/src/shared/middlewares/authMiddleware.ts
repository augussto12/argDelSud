import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../../prismaClient";
import { config } from "../config/app.config";

export interface UserPayload {
    id: number;
    email: string;
    rol: string;
}

export interface AuthRequest extends Request {
    user?: UserPayload;
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        res.status(401).json({ ok: false, message: "Acceso denegado. Token requerido." });
        return;
    }

    try {
        const decoded = jwt.verify(token, config.jwt.secret) as UserPayload;

        // Verificar que el usuario sigue activo en la DB
        const usuario = await prisma.usuario.findUnique({
            where: { id: decoded.id },
            select: { activo: true },
        });

        if (!usuario || !usuario.activo) {
            res.status(403).json({ ok: false, message: "Usuario desactivado." });
            return;
        }

        req.user = decoded;
        next();
    } catch {
        res.status(403).json({ ok: false, message: "Token inválido o expirado." });
    }
};

export const authorizeRole = (roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user || !roles.includes(req.user.rol)) {
            res.status(403).json({ ok: false, message: "No tenés permisos para realizar esta acción." });
            return;
        }
        next();
    };
};
