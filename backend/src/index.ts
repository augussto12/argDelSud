import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

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
const PORT = process.env.PORT || 3000;

// 1. Trust proxy
app.set("trust proxy", 1);

// 2. CORS
app.use(cors({
    origin: [
        "http://localhost:5173",
        "http://localhost:5174",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}));

// 3. Seguridad
configureSecurity(app);

// 4. Body parser
app.use(express.json());

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

// 8. Servidor listo
app.listen(Number(PORT), "0.0.0.0", () => {
    logger.info({ port: PORT, env: process.env.NODE_ENV || "development" }, "🚀 argDelSud API lista");
});
