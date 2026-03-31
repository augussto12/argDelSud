import { PrismaClient } from "@prisma/client";
import logger from "./shared/utils/logger";

const prisma = new PrismaClient({
    log: process.env.NODE_ENV !== "production"
        ? [
            { emit: "event", level: "query" },
            { emit: "stdout", level: "warn" },
            { emit: "stdout", level: "error" },
        ]
        : [
            { emit: "stdout", level: "warn" },
            { emit: "stdout", level: "error" },
        ],
});

// Log de queries lentas en desarrollo (>200ms)
if (process.env.NODE_ENV !== "production") {
    prisma.$on("query" as never, (e: any) => {
        if (e.duration > 200) {
            logger.warn({ duration: e.duration, query: e.query }, "⚠️ Query lenta detectada");
        }
    });
}

export default prisma;
