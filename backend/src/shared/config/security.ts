import { Express } from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { config } from "./app.config";

export function configureSecurity(app: Express) {
    // Helmet: headers de seguridad
    app.use(helmet());

    // Rate Limiting global
    const limiter = rateLimit({
        windowMs: config.rateLimit.global.windowMs,
        max: config.rateLimit.global.max,
        standardHeaders: true,
        legacyHeaders: false,
        message: { ok: false, message: "Demasiadas peticiones. Intentá más tarde." },
    });
    app.use(limiter);

    // Rate Limiting estricto para auth
    const authLimiter = rateLimit({
        windowMs: config.rateLimit.auth.windowMs,
        max: config.rateLimit.auth.max,
        standardHeaders: true,
        legacyHeaders: false,
        message: { ok: false, message: "Demasiados intentos de login." },
    });
    app.use("/api/auth", authLimiter);

    // NOTA: XSS sanitizer custom removido.
    // Razón: Zod valida inputs en el backend, React escapa outputs en el frontend.
    // Un sanitizer regex es fácilmente bypasseable y puede corromper datos legítimos.
}

