-- =====================================================
-- 02_indexes.sql — Índices de performance
-- =====================================================

SET search_path TO argentinos_del_sud;

-- Búsquedas frecuentes por nombre/apellido
CREATE INDEX IF NOT EXISTS idx_alumnos_apellido    ON alumnos(apellido);
CREATE INDEX IF NOT EXISTS idx_alumnos_nombre      ON alumnos(nombre);
CREATE INDEX IF NOT EXISTS idx_alumnos_activo      ON alumnos(activo);
CREATE INDEX IF NOT EXISTS idx_profesores_apellido ON profesores(apellido);

-- Talleres por profesor y estado
CREATE INDEX IF NOT EXISTS idx_talleres_profesor ON talleres(profesor_id);
CREATE INDEX IF NOT EXISTS idx_talleres_activo   ON talleres(activo);

-- Inscripciones por alumno y taller
CREATE INDEX IF NOT EXISTS idx_inscripciones_alumno  ON inscripciones(alumno_id);
CREATE INDEX IF NOT EXISTS idx_inscripciones_taller  ON inscripciones(taller_id);
CREATE INDEX IF NOT EXISTS idx_inscripciones_activa  ON inscripciones(activa);

-- Becas por inscripción
CREATE INDEX IF NOT EXISTS idx_becas_inscripcion ON becas(inscripcion_id);
CREATE INDEX IF NOT EXISTS idx_becas_activa      ON becas(activa);

-- Cuotas: consulta de deuda por inscripción y período
CREATE INDEX IF NOT EXISTS idx_cuotas_inscripcion  ON cuotas(inscripcion_id);
CREATE INDEX IF NOT EXISTS idx_cuotas_periodo      ON cuotas(anio, mes);
CREATE INDEX IF NOT EXISTS idx_cuotas_estado       ON cuotas(estado);

-- Pagos por cuota
CREATE INDEX IF NOT EXISTS idx_pagos_cuota ON pagos(cuota_id);

-- Asistencia: consulta por taller+fecha (la más frecuente)
CREATE INDEX IF NOT EXISTS idx_asistencias_taller_fecha ON asistencias(taller_id, fecha);
CREATE INDEX IF NOT EXISTS idx_asistencias_alumno       ON asistencias(alumno_id);
