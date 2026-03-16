-- =====================================================
-- 99_drop_all.sql — Elimina todo el esquema
-- =====================================================
-- ⚠️  SOLO PARA DESARROLLO / TESTING
-- ⚠️  ESTO BORRA TODOS LOS DATOS SIN POSIBILIDAD DE RECUPERACIÓN

-- Doble confirmación: descomentar la línea para ejecutar
-- SET statement_timeout = '5s'; -- Safety timeout

SET search_path TO argentinos_del_sud;

-- Borrar tablas en orden inverso de dependencias
DROP TABLE IF EXISTS asistencias   CASCADE;
DROP TABLE IF EXISTS pagos         CASCADE;
DROP TABLE IF EXISTS cuotas        CASCADE;
DROP TABLE IF EXISTS becas         CASCADE;
DROP TABLE IF EXISTS inscripciones CASCADE;
DROP TABLE IF EXISTS taller_dias   CASCADE;
DROP TABLE IF EXISTS talleres      CASCADE;
DROP TABLE IF EXISTS profesores    CASCADE;
DROP TABLE IF EXISTS alumnos       CASCADE;
DROP TABLE IF EXISTS usuarios      CASCADE;
DROP TABLE IF EXISTS roles         CASCADE;
DROP TABLE IF EXISTS dias          CASCADE;

-- Opcional: borrar el esquema completo
-- DROP SCHEMA IF EXISTS argentinos_del_sud CASCADE;
