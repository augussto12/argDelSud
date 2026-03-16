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

    // Sanitización XSS: limpia strings en req.body
    const stripXSS = (value: any): any => {
        if (typeof value === "string") {
            return value
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/javascript:/gi, "")
                .replace(/on\w+\s*=/gi, "");
        }
        if (Array.isArray(value)) return value.map(stripXSS);
        if (value && typeof value === "object") {
            return Object.fromEntries(
                Object.entries(value).map(([k, v]) => [k, stripXSS(v)])
            );
        }
        return value;
    };

    app.use((req, _res, next) => {
        if (req.body) req.body = stripXSS(req.body);
        next();
    });
}
