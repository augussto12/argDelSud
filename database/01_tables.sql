-- =====================================================
-- 01_tables.sql — Todas las tablas, en orden de deps
-- =====================================================
-- Esquema: argentinos_del_sud
-- Ejecutar después de 00_schema.sql

SET search_path TO argentinos_del_sud;

-- ─── Catálogos ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS dias (
    id     SERIAL      PRIMARY KEY,
    nombre VARCHAR(20) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS roles (
    id     SERIAL      PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

-- ─── Usuarios ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS usuarios (
    id        SERIAL       PRIMARY KEY,
    nombre    VARCHAR(100) NOT NULL,
    email     VARCHAR(100) NOT NULL UNIQUE,
    password  VARCHAR(255) NOT NULL,
    rol_id    INT          NOT NULL REFERENCES roles(id),
    activo    BOOLEAN      NOT NULL DEFAULT TRUE,
    creado_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ─── Alumnos ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS alumnos (
    id               SERIAL       PRIMARY KEY,
    nombre           VARCHAR(100) NOT NULL,
    apellido         VARCHAR(100) NOT NULL,
    dni              VARCHAR(20)  NOT NULL UNIQUE,
    fecha_nacimiento DATE         NOT NULL,
    telefono         VARCHAR(20),
    telefono_tutor   VARCHAR(20),
    nombre_tutor     VARCHAR(200),
    direccion        TEXT,
    notas            TEXT,
    activo           BOOLEAN      NOT NULL DEFAULT TRUE,
    creado_at        TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ─── Profesores ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS profesores (
    id           SERIAL       PRIMARY KEY,
    nombre       VARCHAR(100) NOT NULL,
    apellido     VARCHAR(100) NOT NULL,
    dni          VARCHAR(20)  NOT NULL UNIQUE,
    especialidad VARCHAR(100),
    telefono     VARCHAR(20),
    email        VARCHAR(100),
    activo       BOOLEAN      NOT NULL DEFAULT TRUE,
    creado_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ─── Talleres ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS talleres (
    id             SERIAL        PRIMARY KEY,
    nombre         VARCHAR(100)  NOT NULL,
    categoria      VARCHAR(50)   NOT NULL,
    precio_mensual DECIMAL(10,2) NOT NULL,
    cupo_maximo    INT           NOT NULL DEFAULT 30,
    profesor_id    INT           NOT NULL REFERENCES profesores(id) ON DELETE RESTRICT,
    fecha_inicio   DATE          NOT NULL,
    fecha_fin      DATE          NOT NULL,
    activo         BOOLEAN       NOT NULL DEFAULT TRUE,
    creado_at      TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ─── Taller ↔ Días (horarios) ────────────────────────

CREATE TABLE IF NOT EXISTS taller_dias (
    taller_id   INT  NOT NULL REFERENCES talleres(id) ON DELETE CASCADE,
    dia_id      INT  NOT NULL REFERENCES dias(id)     ON DELETE CASCADE,
    hora_inicio TIME NOT NULL,
    hora_fin    TIME NOT NULL,

    PRIMARY KEY (taller_id, dia_id)
);

-- ─── Inscripciones (contrato alumno ↔ taller) ───────

CREATE TABLE IF NOT EXISTS inscripciones (
    id                SERIAL  PRIMARY KEY,
    alumno_id         INT     NOT NULL REFERENCES alumnos(id)  ON DELETE CASCADE,
    taller_id         INT     NOT NULL REFERENCES talleres(id) ON DELETE CASCADE,
    fecha_inscripcion DATE    NOT NULL DEFAULT CURRENT_DATE,
    activa            BOOLEAN NOT NULL DEFAULT TRUE,

    UNIQUE (alumno_id, taller_id)
);

-- ─── Becas (vinculada a inscripción) ─────────────────

CREATE TABLE IF NOT EXISTS becas (
    id                   SERIAL        PRIMARY KEY,
    inscripcion_id       INT           NOT NULL REFERENCES inscripciones(id) ON DELETE CASCADE,
    porcentaje_descuento DECIMAL(5,2)  NOT NULL, -- 0.00 a 100.00
    motivo               TEXT,
    fecha_inicio         DATE          NOT NULL,
    fecha_fin            DATE          NOT NULL,
    activa               BOOLEAN       NOT NULL DEFAULT TRUE,
    creado_at            TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ─── Cuotas (snapshot de deuda mensual) ──────────────
-- Congela el precio del taller + descuento de beca
-- al momento de generación

CREATE TABLE IF NOT EXISTS cuotas (
    id                 SERIAL        PRIMARY KEY,
    inscripcion_id     INT           NOT NULL REFERENCES inscripciones(id) ON DELETE CASCADE,
    mes                INT           NOT NULL CHECK (mes BETWEEN 1 AND 12),
    anio               INT           NOT NULL,
    monto_original     DECIMAL(10,2) NOT NULL, -- Precio del taller ese mes
    descuento_aplicado DECIMAL(10,2) NOT NULL DEFAULT 0,
    monto_final        DECIMAL(10,2) NOT NULL, -- Lo que debe pagar
    estado             VARCHAR(20)   NOT NULL DEFAULT 'pendiente'
                       CHECK (estado IN ('pendiente', 'pagada', 'anulada')),
    creado_at          TIMESTAMP     NOT NULL DEFAULT NOW(),

    UNIQUE (inscripcion_id, mes, anio)
);

-- ─── Pagos (cancela una cuota) ───────────────────────

CREATE TABLE IF NOT EXISTS pagos (
    id                SERIAL        PRIMARY KEY,
    cuota_id          INT           NOT NULL REFERENCES cuotas(id) ON DELETE CASCADE,
    monto_abonado     DECIMAL(10,2) NOT NULL,
    metodo_pago       VARCHAR(30)   NOT NULL, -- efectivo, transferencia, debito
    observaciones     TEXT,
    registrado_por_id INT           NOT NULL REFERENCES usuarios(id),
    creado_at         TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ─── Asistencias ─────────────────────────────────────

CREATE TABLE IF NOT EXISTS asistencias (
    id             SERIAL  PRIMARY KEY,
    alumno_id      INT     NOT NULL REFERENCES alumnos(id)  ON DELETE CASCADE,
    taller_id      INT     NOT NULL REFERENCES talleres(id) ON DELETE CASCADE,
    fecha          DATE    NOT NULL,
    presente       BOOLEAN NOT NULL DEFAULT FALSE,
    marcada_por_id INT     REFERENCES usuarios(id) ON DELETE SET NULL,

    UNIQUE (alumno_id, taller_id, fecha)
);
