import { env } from "./env";

export const config = {
    port: env.PORT,
    nodeEnv: env.NODE_ENV,
    isProduction: env.NODE_ENV === "production",

    jwt: {
        secret: env.JWT_SECRET,
        expiresIn: "4h" as const,
        algorithm: "HS256" as const,
    },

    bcrypt: {
        saltRounds: 12,
    },

    rateLimit: {
        global: {
            windowMs: 15 * 60 * 1000, // 15 minutos
            max: 200,
        },
        auth: {
            windowMs: 15 * 60 * 1000,
            max: 20,
        },
    },

    cors: {
        origins: [
            "http://localhost:5173",
            "http://localhost:5174",
            env.FRONTEND_URL,
        ].filter(Boolean) as string[],
    },

    bodyParser: {
        limit: "1mb",
    },
} as const;
