import { z } from "zod";
import logger from "../utils/logger";

const envSchema = z.object({
    DATABASE_URL: z.string().min(1, "DATABASE_URL es requerido"),
    JWT_SECRET: z.string().min(32, "JWT_SECRET debe tener al menos 32 caracteres"),
    PORT: z.coerce.number().default(3000),
    NODE_ENV: z.enum(["development", "production"]).default("development"),
    FRONTEND_URL: z.string().default(""),
});

function validateEnv() {
    const result = envSchema.safeParse(process.env);

    if (!result.success) {
        logger.fatal({ errors: result.error.format() }, "❌ Variables de entorno inválidas");
        console.error("❌ Variables de entorno inválidas:");
        for (const issue of result.error.issues) {
            console.error(`   - ${issue.path.join(".")}: ${issue.message}`);
        }
        process.exit(1);
    }

    return result.data;
}

export const env = validateEnv();
