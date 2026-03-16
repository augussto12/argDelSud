-- =====================================================
-- 03_seed.sql — Datos iniciales obligatorios
-- =====================================================
-- Catálogos y usuario admin por defecto
-- Ejecutar en una base limpia después de 01_tables.sql

SET search_path TO argentinos_del_sud;

-- ─── Días de la semana ───────────────────────────────

INSERT INTO dias (nombre) VALUES
    ('Lunes'), ('Martes'), ('Miércoles'), ('Jueves'),
    ('Viernes'), ('Sábado'), ('Domingo')
ON CONFLICT (nombre) DO NOTHING;

-- ─── Roles del sistema ──────────────────────────────

INSERT INTO roles (nombre) VALUES
    ('superadmin'), ('admin'), ('profesor')
ON CONFLICT (nombre) DO NOTHING;

-- ─── Usuario admin por defecto ───────────────────────
-- Password: admin123 (hasheada con bcrypt, 10 rounds)
-- ⚠️ CAMBIAR EN PRODUCCIÓN

INSERT INTO usuarios (nombre, email, password, rol_id) VALUES
    ('Administrador', 'admin@argdelsud.com',
     '$2b$10$8K1p/a0dN1LXsIJRQhIsj.DxO5Qk1Rh/1RZ3dOhEkSIXoOKt7DJK6',
     (SELECT id FROM roles WHERE nombre = 'superadmin'))
ON CONFLICT (email) DO NOTHING;
