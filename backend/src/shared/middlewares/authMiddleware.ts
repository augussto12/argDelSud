import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface UserPayload {
    id: number;
    email: string;
    rol: string;
}

export interface AuthRequest extends Request {
    user?: UserPayload;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        res.status(401).json({ ok: false, message: "Acceso denegado. Token requerido." });
        return;
    }

    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) throw new Error("JWT_SECRET no configurado");
        const decoded = jwt.verify(token, secret) as UserPayload;
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
