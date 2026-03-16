import { Express } from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

export function configureSecurity(app: Express) {
    // Helmet: headers de seguridad
    app.use(helmet());

    // Rate Limiting global
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutos
        max: 200,
        standardHeaders: true,
        legacyHeaders: false,
        message: { ok: false, message: "Demasiadas peticiones. Intentá más tarde." },
    });
    app.use(limiter);

    // Rate Limiting estricto para auth
    const authLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 20,
        standardHeaders: true,
        legacyHeaders: false,
        message: { ok: false, message: "Demasiados intentos de login." },
    });
    app.use("/api/auth", authLimiter);
}
