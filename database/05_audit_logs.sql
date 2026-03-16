-- =====================================================
-- 05_audit_logs.sql — Tabla de auditoría
-- =====================================================
SET search_path TO argentinos_del_sud;

CREATE TABLE IF NOT EXISTS audit_logs (
    id         SERIAL       PRIMARY KEY,
    usuario_id INT          REFERENCES usuarios(id) ON DELETE SET NULL,
    accion     VARCHAR(50)  NOT NULL,
    entidad    VARCHAR(50)  NOT NULL,
    entidad_id INT,
    detalle    JSONB,
    ip         VARCHAR(45),
    creado_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_fecha ON audit_logs (creado_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_usuario ON audit_logs (usuario_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entidad ON audit_logs (entidad);
