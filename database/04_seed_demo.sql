-- =====================================================
-- 04_seed_demo.sql — Datos de prueba para desarrollo
-- =====================================================
-- ⚠️ Solo para entornos de desarrollo/testing
-- Ejecutar después de 03_seed.sql

SET search_path TO argentinos_del_sud;

-- ─── Profesores ──────────────────────────────────────

INSERT INTO profesores (nombre, apellido, dni, especialidad, telefono, email) VALUES
    ('Carlos',   'Gómez',    '30111222', 'Fútbol',        '1155551111', 'carlos.gomez@email.com'),
    ('María',    'López',    '28333444', 'Voley',         '1155552222', 'maria.lopez@email.com'),
    ('Roberto',  'Fernández','32555666', 'Básquet',       '1155553333', 'roberto.f@email.com'),
    ('Luciana',  'Martínez', '31777888', 'Hockey',        '1155554444', 'luciana.m@email.com'),
    ('Pablo',    'Díaz',     '29999000', 'Natación',      '1155555555', 'pablo.diaz@email.com')
ON CONFLICT (dni) DO NOTHING;

-- ─── Talleres ────────────────────────────────────────

INSERT INTO talleres (nombre, categoria, precio_mensual, cupo_maximo, profesor_id, fecha_inicio, fecha_fin) VALUES
    ('Fútbol Infantil',   'Deportes', 8000.00,  25,
     (SELECT id FROM profesores WHERE dni = '30111222'), '2026-03-01', '2026-12-15'),
    ('Fútbol Juvenil',    'Deportes', 10000.00, 20,
     (SELECT id FROM profesores WHERE dni = '30111222'), '2026-03-01', '2026-12-15'),
    ('Voley Mixto',       'Deportes', 7500.00,  30,
     (SELECT id FROM profesores WHERE dni = '28333444'), '2026-03-01', '2026-12-15'),
    ('Básquet Sub-16',    'Deportes', 9000.00,  15,
     (SELECT id FROM profesores WHERE dni = '32555666'), '2026-03-01', '2026-12-15'),
    ('Hockey Femenino',   'Deportes', 8500.00,  22,
     (SELECT id FROM profesores WHERE dni = '31777888'), '2026-03-01', '2026-12-15'),
    ('Natación Adultos',  'Deportes', 12000.00, 20,
     (SELECT id FROM profesores WHERE dni = '29999000'), '2026-03-01', '2026-12-15')
ON CONFLICT DO NOTHING;

-- ─── Horarios de talleres ────────────────────────────

INSERT INTO taller_dias (taller_id, dia_id, hora_inicio, hora_fin) VALUES
    -- Fútbol Infantil: Lunes y Miércoles 16:00-17:30
    ((SELECT id FROM talleres WHERE nombre = 'Fútbol Infantil'),
     (SELECT id FROM dias WHERE nombre = 'Lunes'),    '16:00', '17:30'),
    ((SELECT id FROM talleres WHERE nombre = 'Fútbol Infantil'),
     (SELECT id FROM dias WHERE nombre = 'Miércoles'),'16:00', '17:30'),

    -- Fútbol Juvenil: Martes y Jueves 17:00-18:30
    ((SELECT id FROM talleres WHERE nombre = 'Fútbol Juvenil'),
     (SELECT id FROM dias WHERE nombre = 'Martes'),   '17:00', '18:30'),
    ((SELECT id FROM talleres WHERE nombre = 'Fútbol Juvenil'),
     (SELECT id FROM dias WHERE nombre = 'Jueves'),   '17:00', '18:30'),

    -- Voley: Martes y Viernes 18:00-19:30
    ((SELECT id FROM talleres WHERE nombre = 'Voley Mixto'),
     (SELECT id FROM dias WHERE nombre = 'Martes'),   '18:00', '19:30'),
    ((SELECT id FROM talleres WHERE nombre = 'Voley Mixto'),
     (SELECT id FROM dias WHERE nombre = 'Viernes'),  '18:00', '19:30'),

    -- Básquet: Lunes y Jueves 18:00-19:30
    ((SELECT id FROM talleres WHERE nombre = 'Básquet Sub-16'),
     (SELECT id FROM dias WHERE nombre = 'Lunes'),    '18:00', '19:30'),
    ((SELECT id FROM talleres WHERE nombre = 'Básquet Sub-16'),
     (SELECT id FROM dias WHERE nombre = 'Jueves'),   '18:00', '19:30'),

    -- Hockey: Miércoles y Viernes 16:00-17:30
    ((SELECT id FROM talleres WHERE nombre = 'Hockey Femenino'),
     (SELECT id FROM dias WHERE nombre = 'Miércoles'),'16:00', '17:30'),
    ((SELECT id FROM talleres WHERE nombre = 'Hockey Femenino'),
     (SELECT id FROM dias WHERE nombre = 'Viernes'),  '16:00', '17:30')
ON CONFLICT DO NOTHING;

-- ─── Alumnos ─────────────────────────────────────────

INSERT INTO alumnos (nombre, apellido, dni, fecha_nacimiento, telefono, telefono_tutor, nombre_tutor, direccion) VALUES
    ('Mateo',    'Rodríguez', '55100100', '2012-03-15', NULL,          '1144441111', 'Laura Rodríguez',   'Av. San Martín 1200'),
    ('Valentina','Pérez',     '55200200', '2013-07-22', NULL,          '1144442222', 'Marcos Pérez',      'Calle Belgrano 450'),
    ('Bautista', 'García',    '55300300', '2011-01-10', '1133331111',  '1144443333', 'Silvia García',     'Rivadavia 890'),
    ('Catalina', 'Sánchez',   '55400400', '2014-11-05', NULL,          '1144444444', 'Diego Sánchez',     'Mitre 320'),
    ('Tomás',    'González',  '55500500', '2010-06-18', '1133332222',  NULL,          NULL,                'Sarmiento 1500'),
    ('Sofía',    'Ramírez',   '55600600', '2012-09-30', NULL,          '1144446666', 'Paula Ramírez',     'Castelli 780'),
    ('Joaquín',  'Torres',    '55700700', '2013-02-14', NULL,          '1144447777', 'Andrés Torres',     'Moreno 1100'),
    ('Martina',  'Álvarez',   '55800800', '2011-12-01', '1133333333',  '1144448888', 'Cecilia Álvarez',   'Las Heras 600'),
    ('Felipe',   'Herrera',   '55900900', '2014-04-25', NULL,          '1144449999', 'Ricardo Herrera',   'Italia 250'),
    ('Delfina',  'Castro',    '55101010', '2012-08-08', NULL,          '1144440000', 'Marcela Castro',    'Brown 1800')
ON CONFLICT (dni) DO NOTHING;

-- ─── Inscripciones ───────────────────────────────────

INSERT INTO inscripciones (alumno_id, taller_id) VALUES
    -- Fútbol Infantil: Mateo, Bautista, Tomás, Joaquín, Felipe
    ((SELECT id FROM alumnos WHERE dni = '55100100'), (SELECT id FROM talleres WHERE nombre = 'Fútbol Infantil')),
    ((SELECT id FROM alumnos WHERE dni = '55300300'), (SELECT id FROM talleres WHERE nombre = 'Fútbol Infantil')),
    ((SELECT id FROM alumnos WHERE dni = '55500500'), (SELECT id FROM talleres WHERE nombre = 'Fútbol Infantil')),
    ((SELECT id FROM alumnos WHERE dni = '55700700'), (SELECT id FROM talleres WHERE nombre = 'Fútbol Infantil')),
    ((SELECT id FROM alumnos WHERE dni = '55900900'), (SELECT id FROM talleres WHERE nombre = 'Fútbol Infantil')),

    -- Voley: Valentina, Catalina, Sofía, Martina, Delfina
    ((SELECT id FROM alumnos WHERE dni = '55200200'), (SELECT id FROM talleres WHERE nombre = 'Voley Mixto')),
    ((SELECT id FROM alumnos WHERE dni = '55400400'), (SELECT id FROM talleres WHERE nombre = 'Voley Mixto')),
    ((SELECT id FROM alumnos WHERE dni = '55600600'), (SELECT id FROM talleres WHERE nombre = 'Voley Mixto')),
    ((SELECT id FROM alumnos WHERE dni = '55800800'), (SELECT id FROM talleres WHERE nombre = 'Voley Mixto')),
    ((SELECT id FROM alumnos WHERE dni = '55101010'), (SELECT id FROM talleres WHERE nombre = 'Voley Mixto')),

    -- Hockey: Catalina está también en hockey
    ((SELECT id FROM alumnos WHERE dni = '55400400'), (SELECT id FROM talleres WHERE nombre = 'Hockey Femenino')),
    ((SELECT id FROM alumnos WHERE dni = '55600600'), (SELECT id FROM talleres WHERE nombre = 'Hockey Femenino')),

    -- Básquet: Bautista y Tomás también en básquet
    ((SELECT id FROM alumnos WHERE dni = '55300300'), (SELECT id FROM talleres WHERE nombre = 'Básquet Sub-16')),
    ((SELECT id FROM alumnos WHERE dni = '55500500'), (SELECT id FROM talleres WHERE nombre = 'Básquet Sub-16'))
ON CONFLICT (alumno_id, taller_id) DO NOTHING;

-- ─── Beca de ejemplo ─────────────────────────────────
-- Sofía tiene 50% de descuento en Voley por 3 meses

INSERT INTO becas (inscripcion_id, porcentaje_descuento, motivo, fecha_inicio, fecha_fin) VALUES
    ((SELECT i.id FROM inscripciones i
      JOIN alumnos a ON a.id = i.alumno_id
      JOIN talleres t ON t.id = i.taller_id
      WHERE a.dni = '55600600' AND t.nombre = 'Voley Mixto'),
     50.00, 'Situación económica familiar', '2026-03-01', '2026-05-31')
ON CONFLICT DO NOTHING;

-- ─── Cuotas de Marzo 2026 ────────────────────────────
-- Generamos cuotas para todos los inscritos en Fútbol Infantil

INSERT INTO cuotas (inscripcion_id, mes, anio, monto_original, descuento_aplicado, monto_final)
SELECT
    i.id,
    3,       -- Marzo
    2026,
    t.precio_mensual,
    0,
    t.precio_mensual
FROM inscripciones i
JOIN talleres t ON t.id = i.taller_id
WHERE t.nombre = 'Fútbol Infantil'
ON CONFLICT (inscripcion_id, mes, anio) DO NOTHING;

-- Cuota de Sofía en Voley con beca aplicada
INSERT INTO cuotas (inscripcion_id, mes, anio, monto_original, descuento_aplicado, monto_final)
SELECT
    i.id,
    3,
    2026,
    t.precio_mensual,
    t.precio_mensual * 0.50,
    t.precio_mensual * 0.50
FROM inscripciones i
JOIN talleres t ON t.id = i.taller_id
JOIN alumnos a ON a.id = i.alumno_id
WHERE a.dni = '55600600' AND t.nombre = 'Voley Mixto'
ON CONFLICT (inscripcion_id, mes, anio) DO NOTHING;

-- ─── Pago de ejemplo ─────────────────────────────────
-- Mateo pagó su cuota de Marzo en efectivo

INSERT INTO pagos (cuota_id, monto_abonado, metodo_pago, registrado_por_id)
SELECT
    c.id,
    c.monto_final,
    'efectivo',
    (SELECT id FROM usuarios WHERE email = 'admin@argdelsud.com')
FROM cuotas c
JOIN inscripciones i ON i.id = c.inscripcion_id
JOIN alumnos a ON a.id = i.alumno_id
WHERE a.dni = '55100100' AND c.mes = 3 AND c.anio = 2026
ON CONFLICT DO NOTHING;

-- Marcar la cuota como pagada
UPDATE cuotas SET estado = 'pagada'
WHERE id IN (
    SELECT c.id FROM cuotas c
    JOIN inscripciones i ON i.id = c.inscripcion_id
    JOIN alumnos a ON a.id = i.alumno_id
    WHERE a.dni = '55100100' AND c.mes = 3 AND c.anio = 2026
);

-- ─── Asistencias de ejemplo ─────────────────────────
-- Asistencia del lunes 3 de Marzo 2026 — Fútbol Infantil

INSERT INTO asistencias (alumno_id, taller_id, fecha, presente, marcada_por_id)
SELECT
    a.id,
    t.id,
    '2026-03-02',
    TRUE,
    (SELECT id FROM usuarios WHERE email = 'admin@argdelsud.com')
FROM alumnos a
CROSS JOIN talleres t
JOIN inscripciones i ON i.alumno_id = a.id AND i.taller_id = t.id
WHERE t.nombre = 'Fútbol Infantil'
  AND a.dni IN ('55100100', '55300300', '55500500', '55700700')
ON CONFLICT (alumno_id, taller_id, fecha) DO NOTHING;

-- Felipe faltó ese día
INSERT INTO asistencias (alumno_id, taller_id, fecha, presente, marcada_por_id)
SELECT
    a.id,
    t.id,
    '2026-03-02',
    FALSE,
    (SELECT id FROM usuarios WHERE email = 'admin@argdelsud.com')
FROM alumnos a
CROSS JOIN talleres t
WHERE a.dni = '55900900' AND t.nombre = 'Fútbol Infantil'
ON CONFLICT (alumno_id, taller_id, fecha) DO NOTHING;
