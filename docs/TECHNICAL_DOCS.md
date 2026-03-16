# Documentación Técnica — argDelSud

> Sistema de gestión de talleres y cursos deportivos.  
> **Stack**: React 18 · Node.js / Express · Prisma ORM · PostgreSQL  
> **Infraestructura**: Docker Compose · Nginx Proxy Manager

---

## 1. Arquitectura del Sistema

### 1.1 Diagrama de Flujo de Datos

```mermaid
graph LR
    subgraph Cliente
        A["React SPA<br/>(Vite + React Router)"]
    end

    subgraph Servidor
        B["Express API<br/>(Node.js)"]
        C["Middlewares<br/>Auth · Validate · Security"]
        D["Controllers<br/>(lógica de negocio)"]
        E["Prisma ORM<br/>(Query Builder)"]
    end

    subgraph Persistencia
        F["PostgreSQL<br/>Schema: argentinos_del_sud"]
    end

    A -- "HTTP + JWT Bearer" --> B
    B --> C --> D --> E --> F
    F -- "Resultado" --> E --> D --> B --> A
```

### 1.2 Flujo de una Request típica

1. **React** (ej: `AlumnosPage`) llama `api.post('/alumnos', data)` via el cliente Axios.
2. **Axios interceptor** adjunta el header `Authorization: Bearer <token>` desde `localStorage`.
3. **Express** recibe el request en `/api/alumnos`.
4. **Middleware chain** ejecuta en orden:
   - `helmet()` + `rateLimit()` + `stripXSS()` (seguridad global)
   - `authenticateToken` → verifica JWT, inyecta `req.user`
   - `authorizeRole(["superadmin","admin"])` → verifica el rol
   - `validate(schema)` → valida el body con Zod, retorna errores por campo
5. **Controller** ejecuta la lógica de negocio con **Prisma ORM**.
6. **Prisma** genera la query SQL parameterizada y la envía a **PostgreSQL**.
7. La respuesta sube la cadena y llega al frontend como JSON.

### 1.3 Deployment (Docker Compose)

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| `backend` | `3002 → 3000` | API Node.js en producción |
| `frontend` | `8092 → 80` | Build estático Vite + Nginx |

Redes externas: `nginx-proxy-manager_default` (reverse proxy) y `db_network` (PostgreSQL compartido).

---

## 2. Base de Datos (Prisma Schema)

### 2.1 Diagrama Entidad-Relación

```mermaid
erDiagram
    Rol ||--o{ Usuario : "tiene"
    Usuario ||--o{ Pago : "registra"
    Usuario ||--o{ Asistencia : "marca"
    Usuario ||--o{ AuditLog : "genera"

    Alumno ||--o{ Inscripcion : "se inscribe"
    Alumno ||--o{ Asistencia : "tiene"

    Profesor ||--o{ Taller : "dicta"

    Taller ||--o{ Inscripcion : "recibe"
    Taller ||--o{ TallerDia : "tiene"
    Taller ||--o{ Asistencia : "registra"

    Dia ||--o{ TallerDia : "asigna"

    Inscripcion ||--o{ Cuota : "genera"
    Inscripcion ||--o{ Beca : "recibe"

    Cuota ||--o{ Pago : "recibe"
```

### 2.2 Tablas principales

#### `Usuario` → tabla `usuarios`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `INT PK` | Autoincremental |
| `nombre` | `VARCHAR(100)` | Nombre completo |
| `email` | `VARCHAR(100) UNIQUE` | Login único |
| `password` | `VARCHAR(255)` | Hash bcrypt |
| `rol_id` | `INT FK → roles.id` | Rol asignado |
| `activo` | `BOOLEAN` | Soft delete |

#### `Alumno` → tabla `alumnos`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `INT PK` | Autoincremental |
| `nombre`, `apellido` | `VARCHAR(100)` | Identidad |
| `dni` | `VARCHAR(20) UNIQUE` | Documento único |
| `fecha_nacimiento` | `DATE` | Nacimiento |
| `telefono`, `telefono_tutor` | `VARCHAR(20)?` | Contacto |
| `nombre_tutor` | `VARCHAR(200)?` | Tutor |
| `activo` | `BOOLEAN` | Soft delete |

> **Índices**: `idx_alumnos_activo`, `idx_alumnos_apellido`, `idx_alumnos_nombre`

#### `Profesor` → tabla `profesores`
Campos similares a Alumno + `especialidad` (VARCHAR(100)) + `email`.  
Relación: un Profesor **dicta** muchos `Taller`.

#### `Taller` → tabla `talleres`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `nombre` | `VARCHAR(100)` | Nombre del taller |
| `categoria` | `VARCHAR(50)` | Categoría deportiva |
| `precio_mensual` | `DECIMAL(10,2)` | Costo mensual |
| `cupo_maximo` | `INT` default 30 | Límite de inscriptos |
| `profesor_id` | `INT FK → profesores.id` | Profesor asignado |
| `fecha_inicio`, `fecha_fin` | `DATE` | Período activo |

#### `TallerDia` → tabla `taller_dias`
Tabla de unión con **clave compuesta** `(taller_id, dia_id)`.  
Almacena `hora_inicio` y `hora_fin` (`TIME`) para cada día del taller.

#### `Inscripcion` → tabla `inscripciones`
Relación **muchos-a-muchos** entre `Alumno` ↔ `Taller`.  
- Constraint `UNIQUE(alumno_id, taller_id)`: un alumno no puede inscribirse dos veces al mismo taller.
- Campo `activa` para desinscripción lógica.

#### `Cuota` → tabla `cuotas`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `inscripcion_id` | `INT FK` | Inscripción que genera la cuota |
| `mes`, `anio` | `INT` | Período |
| `monto_original` | `DECIMAL(10,2)` | Precio base |
| `descuento_aplicado` | `DECIMAL(10,2)` | Descuento por beca |
| `monto_final` | `DECIMAL(10,2)` | Monto a cobrar |
| `estado` | `VARCHAR(20)` | `pendiente` / `pagada` / `anulada` |

> **Constraint**: `UNIQUE(inscripcion_id, mes, anio)`

#### `Pago` → tabla `pagos`
Registra pagos parciales o totales contra una `Cuota`. Incluye `metodo_pago` (efectivo, transferencia, etc.) y `registrado_por_id` (FK al Usuario que registra).

#### `Beca` → tabla `becas`
Descuento porcentual (`DECIMAL(5,2)`) aplicado a una `Inscripcion` en un rango de fechas. Campo `activa` para desactivación.

#### `Asistencia` → tabla `asistencias`
Registro diario por `(alumno_id, taller_id, fecha)` — constraint `UNIQUE`. Campo `presente` (boolean) y `marcada_por_id` (FK opcional al Usuario).

#### `AuditLog` → tabla `audit_logs`
Registro de auditoría con: `accion` (login, crear, editar, eliminar), `entidad`, `entidad_id`, `detalle` (JSON), `ip` del cliente.

### 2.3 Relaciones clave

| Relación | Tipo | Descripción |
|----------|------|-------------|
| `Rol` → `Usuario` | 1:N | Un rol tiene muchos usuarios |
| `Profesor` → `Taller` | 1:N | Un profesor dicta muchos talleres |
| `Alumno` ↔ `Taller` | M:N vía `Inscripcion` | Alumnos se inscriben a talleres |
| `Inscripcion` → `Cuota` | 1:N | Una inscripción genera cuotas mensuales |
| `Inscripcion` → `Beca` | 1:N | Una inscripción puede tener becas |
| `Cuota` → `Pago` | 1:N | Una cuota recibe pagos parciales/totales |
| `Taller` ↔ `Dia` | M:N vía `TallerDia` | Horarios por día |

---

## 3. Estructura de Carpetas

```
argDelSud/
├── docker-compose.yml          # Orquestación de servicios
├── .env.example                # Variables de entorno template
├── database/                   # Scripts SQL (migraciones, seeds)
│   ├── 00_schema.sql           # Creación del schema
│   ├── 01_tables.sql           # Tablas + constraints
│   ├── 02_indexes.sql          # Índices de rendimiento
│   ├── 03_seed.sql             # Datos base (roles, días)
│   ├── 04_seed_demo.sql        # Datos demo
│   └── 05_audit_logs.sql       # Tabla de auditoría
│
├── backend/                    # API Node.js + Express
│   ├── prisma/
│   │   └── schema.prisma       # Definición de modelos Prisma
│   └── src/
│       ├── index.ts            # Entry point: Express + rutas
│       ├── prismaClient.ts     # Singleton del Prisma Client
│       ├── shared/
│       │   ├── config/
│       │   │   └── security.ts         # Helmet, Rate Limit, XSS
│       │   ├── middlewares/
│       │   │   ├── authMiddleware.ts    # JWT verify + role guard
│       │   │   ├── validate.ts         # Zod schema validation
│       │   │   └── errorHandler.ts     # Global error handler
│       │   ├── types/                  # TypeScript interfaces
│       │   └── utils/
│       │       ├── logger.ts           # Pino logger
│       │       └── auditLog.ts         # Helper de auditoría
│       └── modules/                    # ← Módulos de funcionalidad
│           ├── auth/                   # Login + /me
│           ├── alumnos/                # CRUD alumnos
│           ├── profesores/             # CRUD profesores
│           ├── talleres/               # CRUD talleres + inscripciones
│           ├── cuotas/                 # Cuotas + pagos + deudores
│           ├── becas/                  # CRUD becas
│           ├── asistencia/             # Registro de asistencia
│           ├── usuarios/               # Admin de usuarios
│           ├── dashboard/              # Stats, recaudación, calendario
│           ├── auditoria/              # Logs de auditoría
│           └── metricas/               # Métricas avanzadas
│
└── frontend/                   # SPA React + Vite
    └── src/
        ├── App.tsx             # Routing + ProtectedRoute
        ├── main.tsx            # ReactDOM.createRoot
        ├── index.css           # Design system + animaciones
        ├── shared/
        │   ├── api/
        │   │   └── client.ts           # Axios instance + interceptors
        │   ├── components/
        │   │   ├── layout/
        │   │   │   ├── MainLayout.tsx  # Sidebar + Header + Outlet
        │   │   │   ├── Sidebar.tsx     # Navegación lateral
        │   │   │   └── Header.tsx      # Topbar
        │   │   └── ToastContainer.tsx  # Notificaciones toast
        │   ├── hooks/
        │   │   ├── useUIStore.ts       # Sidebar state + theme
        │   │   └── useToastStore.ts    # Toast notifications
        │   └── types/
        │       └── index.ts            # Interfaces TypeScript
        └── modules/                    # ← Módulos de funcionalidad
            ├── auth/                   # LoginPage + authStore
            ├── alumnos/                # AlumnosPage
            ├── profesores/             # ProfesoresPage
            ├── talleres/               # TalleresPage
            ├── tesoreria/              # TesoreriaPage
            ├── becas/                  # BecasPage
            ├── asistencia/             # AsistenciaPage
            ├── usuarios/               # UsuariosPage
            ├── dashboard/              # DashboardPage
            ├── auditoria/              # AuditoriaPage
            └── metricas/               # MetricasPage
```

### 3.1 Patrón de un módulo backend

Cada módulo sigue el patrón consistente:

```
modules/alumnos/
├── alumnos.routes.ts       # Router con middleware chain
├── alumnos.controller.ts   # Lógica de negocio
└── alumnos.validator.ts    # Esquemas Zod
```

### 3.2 Patrón de un módulo frontend

```
modules/alumnos/
└── AlumnosPage.tsx    # Componente de página completo
                       # (lista, filtros, modal form, validación)
```

---

## 4. API Reference

> Todos los endpoints (excepto Auth) requieren `Authorization: Bearer <token>`.  
> Respuestas siguen el formato `{ ok: boolean, data?: T, message?: string }`.

### 4.1 Auth — `/api/auth`

| Método | Ruta | Middleware | Body | Respuesta |
|--------|------|------------|------|-----------|
| `POST` | `/login` | `validate(loginSchema)` | `{ email, password }` | `{ ok, token, user }` |
| `GET` | `/me` | `authenticateToken` | — | `{ ok, user }` |

### 4.2 Alumnos — `/api/alumnos`

| Método | Ruta | Roles | Body/Params | Descripción |
|--------|------|-------|-------------|-------------|
| `GET` | `/` | Todos | `?search=&activo=` | Listar alumnos con filtros |
| `GET` | `/:id` | Todos | `id` (param) | Detalle de un alumno |
| `POST` | `/` | admin, superadmin | `{ nombre, apellido, dni, fecha_nacimiento, ... }` | Crear alumno |
| `PUT` | `/:id` | admin, superadmin | Campos parciales | Editar alumno |
| `DELETE` | `/:id` | admin, superadmin | `id` (param) | Desactivar (soft delete) |

### 4.3 Profesores — `/api/profesores`

Endpoints idénticos a Alumnos: `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id`.  
Body incluye: `nombre`, `apellido`, `dni`, `especialidad?`, `telefono?`, `email?`.

### 4.4 Talleres — `/api/talleres`

| Método | Ruta | Roles | Body | Descripción |
|--------|------|-------|------|-------------|
| `GET` | `/dias` | Todos | — | Catálogo de días (Lun-Dom) |
| `GET` | `/` | Todos | `?search=&categoria=` | Listar talleres |
| `GET` | `/:id` | Todos | — | Detalle con inscriptos |
| `POST` | `/` | admin, superadmin | `{ nombre, categoria, precio_mensual, cupo_maximo, profesor_id, fecha_inicio, fecha_fin, dias: [{dia_id, hora_inicio, hora_fin}] }` | Crear taller |
| `PUT` | `/:id` | admin, superadmin | Campos parciales | Editar taller |
| `DELETE` | `/:id` | admin, superadmin | — | Desactivar |
| `POST` | `/:id/inscribir` | admin, superadmin | `{ alumno_id }` | Inscribir alumno |
| `DELETE` | `/:id/desinscribir/:alumno_id` | admin, superadmin | — | Desinscribir |

### 4.5 Cuotas y Pagos — `/api/cuotas`

| Método | Ruta | Roles | Body | Descripción |
|--------|------|-------|------|-------------|
| `GET` | `/` | Todos | `?inscripcion_id=&estado=&mes=&anio=` | Listar cuotas |
| `GET` | `/deudores` | Todos | — | Resumen de deudores |
| `GET` | `/cuenta/:alumno_id` | Todos | — | Cuenta corriente alumno |
| `GET` | `/:id` | Todos | — | Detalle cuota |
| `POST` | `/generar` | admin, superadmin | `{ inscripcion_id, mes, anio }` | Generar cuota individual |
| `POST` | `/generar-masivo` | admin, superadmin | `{ mes, anio }` | Generar cuotas masivas |
| `PATCH` | `/:id/anular` | admin, superadmin | — | Anular cuota |
| `GET` | `/pagos` | Todos | — | Historial de pagos |
| `POST` | `/pagos` | admin, superadmin | `{ cuota_id, monto_abonado, metodo_pago, observaciones? }` | Registrar pago |
| `DELETE` | `/pagos/:id` | admin, superadmin | — | Eliminar pago |

### 4.6 Becas — `/api/becas`

| Método | Ruta | Roles | Body | Descripción |
|--------|------|-------|------|-------------|
| `GET` | `/inscripciones` | Todos | `?search=` | Inscripciones activas (helper) |
| `GET` | `/` | Todos | `?activa=` | Listar becas |
| `POST` | `/` | admin, superadmin | `{ inscripcion_id, porcentaje_descuento, motivo?, fecha_inicio, fecha_fin, aplicar_cuota_actual }` | Crear beca |
| `PATCH` | `/:id` | admin, superadmin | Campos parciales | Editar beca |
| `PATCH` | `/:id/desactivar` | admin, superadmin | — | Desactivar |

### 4.7 Asistencia — `/api/asistencias`

| Método | Ruta | Roles | Body | Descripción |
|--------|------|-------|------|-------------|
| `POST` | `/` | admin, superadmin, profesor | `{ taller_id, fecha, registros: [{ alumno_id, presente }] }` | Guardar asistencia del día |
| `GET` | `/taller/:taller_id` | Todos | `?fecha=` | Asistencia por taller/fecha |
| `GET` | `/alumno/:alumno_id` | Todos | — | Historial de un alumno |

### 4.8 Usuarios — `/api/usuarios`

> **Acceso restringido**: solo `superadmin`

| Método | Ruta | Body | Descripción |
|--------|------|------|-------------|
| `GET` | `/roles` | — | Listar roles |
| `GET` | `/` | `?search=` | Listar usuarios |
| `GET` | `/:id` | — | Detalle usuario |
| `POST` | `/` | `{ nombre, email, password, rol_id }` | Crear usuario |
| `PUT` | `/:id` | Campos parciales | Editar usuario |
| `DELETE` | `/:id` | — | Desactivar |

### 4.9 Dashboard — `/api/dashboard`

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/stats` | Totales: alumnos activos, talleres, profesores, inscripciones |
| `GET` | `/recaudacion` | Recaudación mensual vs esperada |
| `GET` | `/calendario` | Eventos/talleres del mes |

### 4.10 Auditoría — `/api/auditoria`

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/` | `?page=&limit=&usuario_id=&accion=&entidad=&desde=&hasta=` — Logs paginados |

### 4.11 Métricas — `/api/metricas`

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/` | Métricas avanzadas (tendencias, comparativas) |

---

## 5. Frontend (React)

### 5.1 Jerarquía de componentes

```mermaid
graph TD
    App["App.tsx<br/>BrowserRouter + Routes"]
    LP["LoginPage<br/>(/login)"]
    PR["ProtectedRoute<br/>(JWT guard)"]
    ML["MainLayout<br/>Sidebar + Header + Outlet"]
    TC["ToastContainer<br/>(notificaciones)"]

    App --> LP
    App --> PR --> ML
    ML --> TC
    ML --> Outlet["<Outlet /><br/>Página activa"]

    Outlet --> DP["DashboardPage"]
    Outlet --> AP["AlumnosPage"]
    Outlet --> PP["ProfesoresPage"]
    Outlet --> TP["TalleresPage"]
    Outlet --> AS["AsistenciaPage"]
    Outlet --> TS["TesoreriaPage"]
    Outlet --> BP["BecasPage"]
    Outlet --> UP["UsuariosPage"]
    Outlet --> AuP["AuditoriaPage"]
    Outlet --> MP["MetricasPage"]
```

### 5.2 Estado Global (Zustand)

| Store | Ubicación | Estado | Propósito |
|-------|-----------|--------|-----------|
| `useAuthStore` | `modules/auth/authStore.ts` | `user`, `token`, `isLoading`, `error` | Autenticación: login, logout, checkAuth |
| `useUIStore` | `shared/hooks/useUIStore.ts` | `sidebarOpen`, `theme` | UI: sidebar colapsable, tema claro/oscuro |
| `useToastStore` | `shared/hooks/useToastStore.ts` | `toasts[]` | Notificaciones: success, error, info, warning |

### 5.3 Consumo de la API

```typescript
// shared/api/client.ts
const api = axios.create({ baseURL: '/api' });

// Request interceptor: agrega JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: maneja 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem('token');
      window.location.href = '/login';  // Redirige al login
    }
    return Promise.reject(error);
  }
);
```

Cada módulo consume `api` directamente:
```typescript
// Ejemplo en AlumnosPage.tsx
const { data } = await api.get('/alumnos', { params: { search, activo: true } });
await api.post('/alumnos', formData);
await api.put(`/alumnos/${id}`, formData);
await api.delete(`/alumnos/${id}`);
```

### 5.4 Protección de Rutas

```tsx
function ProtectedRoute({ children }) {
  const { token } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
```

Al iniciar, `App.tsx` llama `checkAuth()` que valida el token contra `/api/auth/me`.

### 5.5 TypeScript Interfaces

Definidas en [`frontend/src/shared/types/index.ts`](../frontend/src/shared/types/index.ts): `User`, `Alumno`, `Profesor`, `Taller`, `TallerDia`, `Dia`, `Inscripcion`, `Cuota`, `Pago`, `Beca`, `ApiResponse<T>`.

---

## 6. Seguridad

### 6.1 Pipeline de Seguridad

```mermaid
graph LR
    REQ["Request entrante"] --> HP["Helmet<br/>Headers seguros"]
    HP --> RL["Rate Limiter<br/>200 req/15min"]
    RL --> XSS["XSS Sanitizer<br/>Strip tags"]
    XSS --> BP["Body Parser<br/>Límite 1MB"]
    BP --> JWT["JWT Verify<br/>authenticateToken"]
    JWT --> ROLE["Role Guard<br/>authorizeRole"]
    ROLE --> ZOD["Zod Validate<br/>Schema check"]
    ZOD --> CTRL["Controller"]
```

### 6.2 Autenticación JWT

| Aspecto | Implementación |
|---------|---------------|
| **Algoritmo** | HS256 (default jsonwebtoken) |
| **Secreto** | `JWT_SECRET` en `.env` |
| **Expiración** | 4 horas (`expiresIn: "4h"`) |
| **Payload** | `{ id, email, rol }` |
| **Hash de password** | bcrypt (salt auto) |
| **Almacenamiento** | `localStorage` (frontend) |
| **Transmisión** | Header `Authorization: Bearer <token>` |

### 6.3 Middleware de autenticación

```typescript
// authMiddleware.ts
export const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token requerido" });

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = decoded; // { id, email, rol }
  next();
};

export const authorizeRole = (roles: string[]) => (req, res, next) => {
  if (!roles.includes(req.user.rol))
    return res.status(403).json({ message: "Sin permisos" });
  next();
};
```

### 6.4 Rate Limiting

| Scope | Límite | Ventana |
|-------|--------|---------|
| Global (`/api/*`) | 200 requests | 15 minutos |
| Auth (`/api/auth/*`) | 20 requests | 15 minutos |

### 6.5 Protección XSS

Middleware custom que sanitiza recursivamente todo `req.body`:
- Escapa `<` → `&lt;`, `>` → `&gt;`
- Elimina `javascript:` URIs
- Elimina event handlers inline (`onclick=`, `onerror=`, etc.)

### 6.6 Headers (Helmet)

Helmet aplica automáticamente: `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Strict-Transport-Security`, `Content-Security-Policy`, entre otros.

### 6.7 Validación con Zod

Middleware `validate(schema)` parsea `req.body` contra un esquema Zod. Si falla, retorna:

```json
{
  "ok": false,
  "message": "Datos inválidos",
  "errors": [
    { "campo": "dni", "mensaje": "DNI inválido" },
    { "campo": "nombre", "mensaje": "El nombre es requerido" }
  ]
}
```

### 6.8 Manejo de errores

El `globalErrorHandler` captura errores no manejados:
- En **producción**: retorna `"Error interno del servidor"` (sin stack trace)
- En **desarrollo**: retorna el mensaje real del error
- Todos los errores se loggean con **Pino** (structured JSON logging)

### 6.9 Auditoría

Cada acción CRUD registra un `AuditLog` con: usuario, acción, entidad, IP del cliente, y detalle en JSON.

### 6.10 CORS

Orígenes permitidos: `localhost:5173`, `localhost:5174`, y `FRONTEND_URL` (env variable para producción). Métodos: GET, POST, PUT, PATCH, DELETE, OPTIONS.

---

## 7. Variables de Entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `PORT` | Puerto del backend | `3000` |
| `DATABASE_URL` | Connection string PostgreSQL | `postgresql://user:pass@host:5432/db?schema=argentinos_del_sud` |
| `JWT_SECRET` | Secreto para firmar tokens | String aleatorio de 64+ chars |
| `NODE_ENV` | Entorno de ejecución | `development` / `production` |
| `FRONTEND_URL` | URL del frontend en producción | `https://app.ejemplo.com` |
