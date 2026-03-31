import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

// Validar env vars ANTES de importar módulos que las usen
import "./shared/config/env";
import { config } from "./shared/config/app.config";
import { configureSecurity } from "./shared/config/security";
import { globalErrorHandler } from "./shared/middlewares/errorHandler";
import logger from "./shared/utils/logger";

// Imports de rutas por módulo
import authRoutes from "./modules/auth/auth.routes";
import alumnoRoutes from "./modules/alumnos/alumnos.routes";
import profesorRoutes from "./modules/profesores/profesores.routes";
import tallerRoutes from "./modules/talleres/talleres.routes";
import asistenciaRoutes from "./modules/asistencia/asistencia.routes";
import cuotaRoutes from "./modules/cuotas/cuotas.routes";
import becaRoutes from "./modules/becas/becas.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";
import usuarioRoutes from "./modules/usuarios/usuarios.routes";
import auditoriaRoutes from "./modules/auditoria/auditoria.routes";
import metricasRoutes from "./modules/metricas/metricas.routes";

const app = express();

// 1. Trust proxy
app.set("trust proxy", 1);

// 2. CORS
app.use(cors({
    origin: config.cors.origins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}));

// 3. Seguridad
configureSecurity(app);

// 4. Body parser (con límite para prevenir DoS)
app.use(express.json({ limit: config.bodyParser.limit }));

// 5. Health Check
app.get("/api/health", async (_req, res) => {
    try {
        const prisma = (await import("./prismaClient")).default;
        await prisma.$queryRaw`SELECT 1`;
        res.json({ ok: true, status: "healthy", timestamp: new Date().toISOString() });
    } catch {
        res.status(503).json({ ok: false, status: "unhealthy", timestamp: new Date().toISOString() });
    }
});

// 6. Rutas
app.use("/api/auth", authRoutes);
app.use("/api/alumnos", alumnoRoutes);
app.use("/api/profesores", profesorRoutes);
app.use("/api/talleres", tallerRoutes);
app.use("/api/asistencias", asistenciaRoutes);
app.use("/api/cuotas", cuotaRoutes);
app.use("/api/becas", becaRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/auditoria", auditoriaRoutes);
app.use("/api/metricas", metricasRoutes);

// 7. Manejo global de errores
app.use(globalErrorHandler);

// 8. Graceful shutdown
process.on("SIGTERM", async () => {
    logger.info("SIGTERM recibido. Cerrando servidor...");
    const prisma = (await import("./prismaClient")).default;
    await prisma.$disconnect();
    process.exit(0);
});

process.on("SIGINT", async () => {
    logger.info("SIGINT recibido. Cerrando servidor...");
    const prisma = (await import("./prismaClient")).default;
    await prisma.$disconnect();
    process.exit(0);
});

// 9. Servidor listo
app.listen(config.port, "0.0.0.0", () => {
    logger.info({ port: config.port, env: config.nodeEnv }, "🚀 argDelSud API lista");
});

