# 🔍 Auditoría Técnica Completa — argDelSud Backend

**Proyecto:** argDelSud API  
**Stack:** Node.js + TypeScript + Express 5 + Prisma + JWT + bcrypt + Zod + Helmet + Pino  
**Archivos analizados:** 39 archivos fuente, 11 módulos, 10 modelos Prisma  
**Fecha:** 2026-03-27

---

## 1. 🏗️ ARQUITECTURA Y DISEÑO

### Tipo de Arquitectura

**Monolito modular por feature** con separación en 3 capas:

```
index.ts (entry point)
├── modules/           ← Feature modules (vertical slices)
│   ├── auth/          ← controller + routes + validator
│   ├── alumnos/
│   ├── cuotas/        ← el más complejo (678 líneas)
│   └── ...
├── shared/
│   ├── config/        ← security setup
│   ├── middlewares/   ← auth, validation, error handler
│   └── utils/         ← logger, auditLog, parseId
└── prismaClient.ts
```

### Separación de Responsabilidades

⚠️ **Problema: No hay Service Layer.** Los controllers contienen directamente:
- Lógica de negocio (cálculos de becas, generación de cuotas)
- Acceso a datos (queries Prisma)
- Transformación de respuestas

Esto viola el **Single Responsibility Principle** y genera:
- Controllers de 600+ líneas ([cuotas.controller.ts](file:///d:/users/augustoalvarez/Escritorio/Servicios/argDelSud/backend/src/modules/cuotas/cuotas.controller.ts))
- Lógica de negocio duplicada (cálculo de becas en `cuotas` y `becas`)
- Imposibilidad de testear lógica sin HTTP

### Patrones Identificados

| Patrón | Estado |
|--------|--------|
| Controller | ✅ Implementado |
| Service Layer | ❌ Ausente |
| Repository | ❌ Prisma usado directamente en controllers |
| DTO | ❌ Se pasa `req.body` directamente a Prisma |
| Middleware | ✅ Auth, validation, error handler |
| Audit Log | ✅ Bien implementado como utility |

### Acoplamiento y Cohesión

- **Alto acoplamiento** con Prisma: cada controller importa directamente `prismaClient`
- **Buena cohesión** dentro de cada módulo: cada feature tiene sus propios archivos
- **Lógica de negocio duplicada** entre `generarCuotas` y `generarCuotasMasivo` (cálculo de beca+descuento copy-pasted)

### Escalabilidad

- **Horizontal:** Viable — sin estado en memoria, Prisma conecta a PostgreSQL externo
- **Vertical:** Limitada por queries N+1 en dashboard/métricas que bloquean el event loop

### Recomendaciones de Arquitectura

> [!IMPORTANT]
> 1. **Extraer Service Layer** — Los controllers deberían solo parsear request/response. La lógica va en services inyectables.
> 2. **Consolidar lógica de cálculo de becas** en un servicio compartido para evitar duplicación.
> 3. Considerar **DTOs explícitos** en lugar de pasar `req.body` directo a Prisma.

---

## 2. 📂 ESTRUCTURA DEL PROYECTO

### Organización

```
backend/
├── prisma/
│   ├── schema.prisma     ✅ Bien ubicado
│   └── seed.ts           ⚠️ Usa contraseña hardcodeada
├── src/
│   ├── index.ts          ✅ Entry point limpio y claro
│   ├── prismaClient.ts   ✅ Singleton compartido
│   ├── modules/          ✅ Buena separación por feature
│   │   └── [feature]/
│   │       ├── *.controller.ts  ✅ Convención consistente
│   │       ├── *.routes.ts      ✅
│   │       └── *.validator.ts   ✅
│   └── shared/
│       ├── config/        ✅
│       ├── middlewares/   ✅
│       └── utils/         ✅
├── .env.example          ✅ Documenta variables necesarias
├── Dockerfile            ⚠️ Usa ts-node en producción
└── tsconfig.json         ✅ Strict mode habilitado
```

### Lo Bueno

- Convenciones de nombres **consistentes** (`feature.controller.ts`, `feature.routes.ts`, `feature.validator.ts`)
- Shared utilities bien separados
- Cada módulo es auto-contenido

### Problemas

| Problema | Severidad |
|----------|-----------|
| No hay carpeta `services/` ni `repositories/` | Media |
| No hay carpeta `tests/` | Alta |
| No hay carpeta `types/` para DTOs o interfaces compartidas | Baja |
| `UserPayload` interface definida en el middleware en lugar de un archivo de tipos global | Baja |
| No hay `migrations/` folder (Prisma) — probablemente usan `prisma db push` en lugar de migraciones controladas | Media |

---

## 3. 🔐 SEGURIDAD

### 3.1 Autenticación (JWT)

#### Token Configuration

```typescript
// auth.controller.ts:32-36
const token = jwt.sign(
    { id: usuario.id, email: usuario.email, rol: usuario.rol.nombre },
    secret,
    { expiresIn: "4h" }
);
```

| Aspecto | Estado | Detalle |
|---------|--------|---------|
| Expiración | ⚠️ | 4 horas — razonable para una app interna, pero largo para apps públicas |
| Refresh Tokens | ⚠️ **AUSENTE** | No hay mecanismo de refresh. El usuario pierde la sesión cada 4h |
| Algoritmo | ⚠️ | No se especifica algoritmo explícitamente → usa `HS256` por defecto (aceptable pero debería ser explícito) |
| Payload | ⚠️ | Incluye `email` en el payload JWT — innecesario y expone datos |
| Revocación | ⚠️ **AUSENTE** | No hay blacklist de tokens. Si un usuario es desactivado, su token vigente sigue funcionando hasta expirar |

> [!CAUTION]
> **Impacto de No-Revocación:** Si un admin desactiva un usuario malicioso, este puede seguir operando hasta 4 horas con su token vigente.

#### JWT Secret

```
# .env.example
JWT_SECRET=GENERA_UN_SECRET_DE_64_CARACTERES_AQUI
```

- ✅ Se usa variable de entorno
- ⚠️ No hay validación de longitud mínima del secret al arrancar
- ⚠️ No hay rotación de secretos

### 3.2 Autorización (Roles)

```typescript
// authMiddleware.ts:34-41
export const authorizeRole = (roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user || !roles.includes(req.user.rol)) { ... }
    };
};
```

- ✅ Sistema de roles funcional (`superadmin`, `admin`, `profesor`)
- ✅ Rutas de escritura protegidas por rol
- ⚠️ **El audit log (`/api/auditoria`) no tiene restricción de rol** — cualquier usuario autenticado puede ver los audit logs

```typescript
// auditoria.routes.ts:7-9
router.use(authenticateToken);
router.get("/", getAuditLogs);  // ⚠️ Sin authorizeRole
```

- ⚠️ **Dashboard y métricas tampoco tienen restricción de rol** — un profesor puede ver toda la información financiera

```typescript
// dashboard.routes.ts:7-11, metricas.routes.ts:7-9
router.use(authenticateToken);  // Solo autenticación, no autorización
```

> [!WARNING]
> **Exploit:** Un usuario con rol `profesor` puede acceder a información financiera detallada (recaudación, deudores, métricas de cash flow) y a los audit logs completos del sistema.

### 3.3 Hash de Contraseñas

```typescript
// usuarios.controller.ts:9
const SALT_ROUNDS = 12;
// ...
const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
```

- ✅ bcrypt con salt rounds = 12 (bueno)

```typescript
// prisma/seed.ts:30
const hashedPassword = await bcrypt.hash("admin123", 10);
```

- ⚠️ **Salt rounds inconsistente:** El seed usa `10`, el módulo de usuarios usa `12`
- ⚠️ **Contraseña hardcoded `admin123`** en el seed — debería forzar cambio en primer login

### 3.4 Validación de Datos (Zod)

- ✅ Todas las rutas de escritura tienen schemas Zod
- ✅ El middleware replace `req.body` con el resultado parseado (limpio)
- ⚠️ **Validación de password es débil:** `min(6)` sin requerir mayúsculas, números o caracteres especiales
- ⚠️ **Query params NO se validan con Zod.** Se usa `parseInt` directamente:

```typescript
// asistencia.controller.ts:46
const taller_id = parseInt(req.params.taller_id as string);  // ⚠️ NaN si es inválido
// asistencia.controller.ts:82
const alumno_id = parseInt(req.params.alumno_id as string);  // ⚠️ NaN si es inválido
```

> [!WARNING]
> Si alguien pasa `taller_id=abc`, `parseInt` retorna `NaN`. Prisma rechazará la query, pero el error no será controlado — caerá al error handler genérico.

### 3.5 Inyección SQL

- ✅ **Prisma ORM protege contra SQL injection** cuando se usan los métodos estándar
- ✅ El único uso de `$queryRaw` es `SELECT 1` en el health check (seguro)
- ✅ No se detectan queries raw con interpolación de strings

### 3.6 XSS / CSRF

- ✅ Helmet aplicado globalmente (headers `X-Content-Type-Options`, `X-XSS-Protection`, etc.)
- ✅ CORS configurado con origins whitelist
- ✅ Sanitizer regex custom fue correctamente removido (comentario en código: Zod valida inputs, React escapa outputs)
- ⚠️ **No hay protección CSRF** — innecesaria si el frontend es SPA con JWT en headers (no cookies)

### 3.7 CORS

```typescript
// index.ts:31-40
app.use(cors({
    origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        process.env.FRONTEND_URL || "",
    ].filter(Boolean),
    // ...
}));
```

- ✅ Whitelist de origins con variable de entorno
- ✅ `credentials: true` para enviar cookies/auth headers
- ⚠️ `FRONTEND_URL` vacío produce string vacío que `.filter(Boolean)` elimina — pero si `FRONTEND_URL` no se configura en producción, solo funcionará desde localhost

### 3.8 Rate Limiting

```typescript
// security.ts:10-27
// Global: 200 req / 15 min
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
// Auth: 20 req / 15 min
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
```

- ✅ Rate limiting global + rate limiting estricto para auth
- ⚠️ 200 req/15min global puede ser insuficiente para la SPA (muchas requests al abrir el dashboard)
- ⚠️ No hay rate limiting específico para endpoints críticos (pago, generación masiva de cuotas)

### 3.9 Manejo de Errores y Filtrado de Info Sensible

```typescript
// errorHandler.ts:8-10
const message = process.env.NODE_ENV === "production"
    ? "Error interno del servidor"
    : err.message;
```

- ✅ En producción se oculta el mensaje de error real
- ✅ Se loguea el stack trace con Pino (solo internamente)
- ⚠️ El cast `(err as any).statusCode` en el error handler puede fallar silenciosamente — si no hay `statusCode`, usa 500, lo cual es correcto

### 3.10 Variable de Entorno

- ✅ `.env.example` documenta las variables requeridas
- ✅ `dotenv.config()` al inicio de `index.ts`
- ⚠️ **No hay validación al arrancar** de que las variables requeridas existen (`JWT_SECRET`, `DATABASE_URL`)
- El secret se valida en runtime cuando se necesita (lazy) — si falta, la app arranca pero falla al primer login

---

## 4. ⚙️ LÓGICA DE NEGOCIO

### 4.1 Generación de Cuotas

La lógica en [cuotas.controller.ts](file:///d:/users/augustoalvarez/Escritorio/Servicios/argDelSud/backend/src/modules/cuotas/cuotas.controller.ts) es el módulo más complejo y mejor implementado:

- ✅ **Transacciones** correctas para `generarCuotas`, `registrarPago`, `deletePago`
- ✅ **Skip de cuotas existentes** (idempotencia parcial)
- ✅ **Mejor beca** seleccionada automáticamente
- ✅ **Estado automático** de cuota (pendiente → pagada cuando total abonado ≥ monto final)

### 4.2 Edge Cases No Contemplados

⚠️ **Race condition en inscripción:** `inscribirAlumno` verifica cupo y luego crea la inscripción sin transacción. Dos requests concurrentes podrían superar el cupo.

```typescript
// talleres.controller.ts:160-178
const taller = await prisma.taller.findUnique({ ... });
// ← Otro request puede inscribir aquí
if (taller._count.inscripciones >= taller.cupo_maximo) { ... }
const inscripcion = await prisma.inscripcion.upsert({ ... });
```

⚠️ **Asistencia masiva sin transacción:**

```typescript
// asistencia.controller.ts:14-34
const results = await Promise.all(
    asistencias.map((a) => prisma.asistencia.upsert({ ... }))
);
```
Si uno falla, los demás ya fueron guardados → datos inconsistentes.

⚠️ **Beca helper `aplicarBecaACuotaActual` sin transacción:**

```typescript
// becas.controller.ts:11-52
async function aplicarBecaACuotaActual(inscripcion_id, porcentaje_descuento) {
    const cuota = await prisma.cuota.findUnique({ ... });
    // ← Un pago puede ocurrir aquí
    const updated = await prisma.cuota.update({ ... });
}
```

⚠️ **No se valida `fecha_fin > fecha_inicio`** en talleres ni becas — se puede crear un taller que termina antes de empezar.

⚠️ **Soft delete incompleto:** Los `getAlumnos`/`getProfesores`/`getTalleres` no filtran por `activo` por defecto — solo si se envía `activo=true` como query param. Esto significa que los endpoints de listado devuelven registros "eliminados" por defecto.

⚠️ **`getDeudores` recarga TODO** en memoria para transformar. Con muchos alumnos y cuotas pendientes, esto es un peligro de memoria.

### 4.3 Bugs Potenciales

⚠️ **`generarCuotasMasivo` usa `fecha_fin: { gte: new Date(anio, mes - 1, 1) }` pero fecha_inicio usa `lte: new Date(anio, mes - 1, 28)`** — el día 28 no cubre todos los meses (los que tienen 29, 30 o 31 días).

```typescript
// cuotas.controller.ts:392
fecha_inicio: { lte: new Date(anio, mes - 1, 28) },  // ⚠️ Bug para meses con 29-31 días
```

⚠️ **`createAlumno` pasa `req.body` con mutación directa al objeto:**

```typescript
// alumnos.controller.ts:69-70
const data = req.body;
data.fecha_nacimiento = new Date(data.fecha_nacimiento);  // ⚠️ Muta el body original
```

---

## 5. 🗄️ BASE DE DATOS (PRISMA)

### 5.1 Diseño del Schema

- ✅ **10 modelos** bien relacionados
- ✅ Uso de **composite unique constraints** (`alumno_id_taller_id` en inscripciones, `inscripcion_id_mes_anio` en cuotas)
- ✅ **Índices** definidos en campos de filtro frecuente
- ✅ Uso de `Decimal(10,2)` para montos monetarios (evita errores de floating point)
- ✅ Schema PostgreSQL aislado: `argentinos_del_sud`

### 5.2 Problemas

| Problema | Severidad |
|----------|-----------|
| ⚠️ `onDelete: Cascade` en Inscripcion→Alumno/Taller — borrar un alumno borraría todas sus inscripciones, cuotas y pagos | Alta |
| ⚠️ `onDelete: Cascade` en Pago→Cuota — borrar una cuota borra todos los pagos asociados | Alta |
| No hay campo `updated_at` en ningún modelo — impide saber cuándo se modificó un registro | Media |
| No hay índice compuesto para `(alumno_id, taller_id)` en `asistencias` (solo hay separados) | Baja |
| No hay enums para `estado` de cuota — es un `VarChar(20)` libre | Media |
| `Cuota.estado` acepta cualquier string — no hay constraint que limite a `pendiente/pagada/anulada` | Media |

> [!CAUTION]
> **CASCADE DELETE peligroso:** Aunque en la práctica se usa soft delete (`activo = false`), si alguien ejecuta `DELETE FROM alumnos WHERE id = X` directamente en la DB, se borrarían en cascada: inscripciones → cuotas → pagos. Esto destruiría datos financieros irrecuperables.

### 5.3 Migraciones

- ⚠️ **No hay carpeta `migrations/`** — probablemente se usa `prisma db push` que aplica cambios destructivos sin control de versiones
- Recomendación: usar `prisma migrate dev` para generar migraciones versionadas

### 5.4 Prisma Client

```typescript
// prismaClient.ts
const prisma = new PrismaClient();
```

- ⚠️ No hay configuración de logging de Prisma
- ⚠️ No hay `$on('beforeExit')` para graceful shutdown
- ⚠️ No hay connection pool configurado explícitamente

---

## 6. 🚀 PERFORMANCE

### 6.1 N+1 Queries (CRÍTICO)

⚠️ **`getRecaudacion`** ejecuta `talleres × meses` queries individuales:

```typescript
// dashboard.controller.ts:76-91
for (const taller of talleres) {        // 5 talleres
    for (let i = meses - 1; i >= 0; i--) { // 6 meses
        const pagos = await prisma.pago.aggregate({ ... });
    }
}
// → 30+ queries individuales por request
```

⚠️ **`getMetricas`** es peor — ejecuta `4 queries × N meses + 3 queries × M talleres`:

```typescript
// metricas.controller.ts:31-101
for (let i = meses - 1; i >= 0; i--) {   // 12 meses × 4 queries = 48 queries
    ...
}
for (const taller of talleres) {           // M talleres × 3 queries = 3M queries
    ...
}
// → 60+ queries por request con 12 meses y 5 talleres
```

> [!WARNING]
> **Impacto:** Cada vez que un usuario abre métricas o dashboard de recaudación, se ejecutan 30-60+ queries serializadas. Esto bloquea el event loop y degrada la experiencia para todos los usuarios.

### 6.2 Carga Excesiva en Memoria

⚠️ **`getDeudores`** carga TODAS las cuotas pendientes con todos sus pagos e inscripciones en memoria para luego agrupar en JavaScript:

```typescript
// cuotas.controller.ts:483-497
const cuotasPendientes = await prisma.cuota.findMany({
    where: { estado: "pendiente" },
    include: { inscripcion: { include: { alumno: ..., taller: ... } }, pagos: ... },
});
```

### 6.3 Promise.all sin Límite

```typescript
// asistencia.controller.ts:14-34
await Promise.all(asistencias.map((a) => prisma.asistencia.upsert({ ... })));
```

Si vienen 100 asistencias, se abren 100 queries paralelas. Esto satura el connection pool de Prisma.

### 6.4 Falta de Paginación

- ⚠️ `getAlumnos`, `getProfesores`, `getTalleres`, `getCuotas`, `getBecas` **no tienen paginación** — devuelven TODOS los registros
- Solo `getAuditLogs` implementa paginación correcta con `skip/take`

### 6.5 Falta de Caché

- No hay caching en ningún nivel
- Endpoints como `getDias`, `getRoles`, `getStats` devuelven datos que cambian raramente — candidatos perfectos para caché

---

## 7. 🧪 TESTING

### Estado Actual

> [!CAUTION]
> ⚠️ **NO HAY TESTS DE NINGÚN TIPO.** No existe carpeta `tests/`, `__tests__`, archivos `.spec.ts` ni `.test.ts`. No hay configuración de Jest, Mocha, Vitest, ni ningún framework de testing.

### ¿Qué Falta?

| Tipo | Prioridad | Ejemplos |
|------|-----------|----------|
| **Unit tests** | Alta | Lógica de cálculo de becas, validación de cupos, cálculo de deuda |
| **Integration tests** | Alta | Flujos de pago (crear cuota → pagar → verificar estado), inscripción con cupo |
| **E2E tests** | Media | Login → crear alumno → inscribir → generar cuota → pagar |
| **Security tests** | Alta | Acceso sin token, acceso con rol incorrecto, token expirado |

### Testabilidad

**Baja.** La ausencia de service layer hace que para testear lógica de negocio se necesite mockear Express `Request`/`Response` + Prisma Client. Si la lógica estuviera en services, se podrían testear directamente.

---

## 8. 📊 LOGGING Y MONITOREO

### Pino Logger

```typescript
// logger.ts
const logger = pino({
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
    transport: process.env.NODE_ENV !== "production"
        ? { target: "pino/file", options: { destination: 1 } }
        : undefined,
});
```

### Lo Bueno

- ✅ Logs estructurados (JSON) con Pino
- ✅ Nivel diferenciado por entorno
- ✅ Todos los errores se loguean con contexto

### Problemas

| Problema | Severidad |
|----------|-----------|
| ⚠️ No se loguean requests entrantes (no hay request logging middleware) | Media |
| ⚠️ No se loguea duración de requests | Media |
| ⚠️ No hay correlation ID / request ID para trazar un request a través del sistema | Media |
| ⚠️ No se loguean queries Prisma lentas | Baja |
| ⚠️ No hay integración con servicios de monitoreo (Datadog, New Relic, etc.) | Baja |
| ⚠️ En producción, el transport es `undefined` → Pino escribe a stdout sin formato humano legible | Baja |
| ⚠️ El audit log es buena práctica pero no tiene retención/rotación configurada | Baja |

### Datos Sensibles en Logs

- ✅ No se loguean passwords ni tokens
- ✅ El error handler solo loguea `err.message` y `stack` (no el request body)
- ✅ Los audit logs registran `email` pero no `password`

---

## 9. 🌍 CONFIGURACIÓN Y ENTORNO

### Variables de Entorno

```
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/mydb?schema=argentinos_del_sud
JWT_SECRET=GENERA_UN_SECRET_DE_64_CARACTERES_AQUI
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### Problemas

| Problema | Severidad |
|----------|-----------|
| ⚠️ No hay validación de variables al startup (si falta `DATABASE_URL`, crashea al primer query, no al arrancar) | Alta |
| ⚠️ No hay configuración separada por entorno (`.env.production`, `.env.staging`) | Media |
| `PORT`, `FRONTEND_URL` son los únicos valores configurables — todo lo demás (salt rounds, JWT expiry, rate limits) está hardcoded | Media |
| ⚠️ `trust proxy` hardcoded a `1` — debería ser configurable | Baja |

### Hardcoded Values

```typescript
// Ejemplos encontrados:
{ expiresIn: "4h" }           // auth.controller.ts:35
const SALT_ROUNDS = 12;       // usuarios.controller.ts:9
max: 200                      // security.ts:12 (rate limit global)
max: 20                       // security.ts:22 (rate limit auth)
limit: "1mb"                  // index.ts:46 (body parser)
```

> [!TIP]
> Todos estos valores deberían estar en un archivo de configuración centralizado (`src/shared/config/app.config.ts`) y tomarse de variables de entorno con defaults.

---

## 10. 📦 DEPENDENCIAS

### Análisis de `package.json`

| Dependencia | Versión | Estado |
|-------------|---------|--------|
| `express` | `^5.2.1` | ⚠️ Express 5 es la última major — verificar compatibilidad de middlewares |
| `@prisma/client` | `^6.19.2` | ✅ Reciente |
| `bcrypt` | `^6.0.0` | ✅ |
| `cors` | `^2.8.6` | ✅ |
| `helmet` | `^8.1.0` | ✅ |
| `jsonwebtoken` | `^9.0.3` | ✅ |
| `pino` | `^10.3.1` | ✅ |
| `zod` | `^4.3.6` | ✅ Reciente |
| `dotenv` | `^17.3.1` | ✅ |
| `express-rate-limit` | `^8.3.1` | ✅ |

### Dependencias que Faltan

| Librería | Propósito |
|----------|-----------|
| `pino-http` | Request logging automático con Pino |
| `@prisma/instrumentation` | Tracing de queries |
| `helmet-csp` | Content Security Policy configurable |
| `compression` | Gzip de responses (importante para listas grandes) |
| Test framework (Jest/Vitest) | Testing |

### DevDependencies

- ✅ Tipos correctos para todas las dependencias
- ✅ `nodemon` para desarrollo
- ⚠️ `ts-node` se usa también en producción (Dockerfile)

---

## 11. ⚠️ RIESGOS Y VULNERABILIDADES

### 🔴 Severidad ALTA

| # | Riesgo | Impacto | Exploit | Mitigación |
|---|--------|---------|---------|------------|
| 1 | **No hay tests** | Cualquier cambio puede romper funcionalidad sin detectarse | Deploy de código roto | Implementar test suite con cobertura mínima del 70% |
| 2 | **N+1 queries en métricas/dashboard** | DoS involuntario — cada request de dashboard ejecuta 60+ queries | Abrir la página de métricas con muchos talleres | Refactorizar a queries agregadas o raw SQL |
| 3 | **Cascade DELETE en schema** | Borrado accidental de registros financieros | `DELETE FROM alumnos` borra cuotas y pagos | Cambiar a `onDelete: Restrict` |
| 4 | **Audit logs sin restricción de rol** | Fuga de información sensible | Un profesor accede a `/api/auditoria` | Agregar `authorizeRole(["superadmin"])` |
| 5 | **Dashboard/métricas sin restricción de rol** | Profesor ve información financiera | Un profesor accede a `/api/metricas` | Agregar `authorizeRole(["superadmin", "admin"])` |
| 6 | **No hay validación de env vars al startup** | La app arranca pero falla en runtime | Deploy sin `JWT_SECRET` configurado | Validar vars con Zod al arrancar |

### 🟡 Severidad MEDIA

| # | Riesgo | Impacto | Mitigación |
|---|--------|---------|------------|
| 7 | **No hay refresh tokens** | UX degradada — sesión expira cada 4h sin aviso | Implementar refresh token rotation |
| 8 | **Token no-revocable** | Usuario desactivado sigue operando hasta 4h | Implementar token blacklist o verificar `activo` en cada request |
| 9 | **Sin paginación en listados** | Consumo excesivo de memoria y bandwidth con muchos registros | Agregar paginación obligatoria |
| 10 | **Asistencia masiva sin transacción** | Datos inconsistentes si falla un upsert | Envolver en `prisma.$transaction` |
| 11 | **Race condition en inscripción** | Superación del cupo máximo | Usar transacción con lock optimista |
| 12 | **`ts-node` en producción** | Performance 2-3x peor que JS compilado | Usar `tsc && node dist/index.js` |
| 13 | **No hay migraciones versionadas** | Cambios de schema destructivos sin rollback | Usar `prisma migrate` |
| 14 | **Bug fecha_inicio `lte: day 28`** | Becas no aplicadas en días 29-31 del mes | Usar último día real del mes |

### 🟢 Severidad BAJA

| # | Riesgo | Mitigación |
|---|--------|------------|
| 15 | Salt rounds inconsistente (10 vs 12) | Unificar a 12 en el seed |
| 16 | Contraseña seed `admin123` | Forzar cambio de password en primer login |
| 17 | `parseInt` sin validación en query params de asistencia | Usar `parseId` consistentemente |
| 18 | Lógica de beca+descuento duplicada | Extraer a servicio compartido |
| 19 | Sin compression middleware | Agregar `compression()` |
| 20 | Sin request logging | Agregar `pino-http` |

---

## 12. ✅ RECOMENDACIONES

### 🔥 Prioridad 1 — Inmediato (Seguridad y Estabilidad)

1. **Agregar `authorizeRole` a audit logs, dashboard y métricas** — fix de 3 líneas, impacto de seguridad enorme
2. **Validar variables de entorno al startup** con Zod:
   ```typescript
   const envSchema = z.object({
       DATABASE_URL: z.string().url(),
       JWT_SECRET: z.string().min(32),
       PORT: z.coerce.number().default(3000),
       NODE_ENV: z.enum(["development", "production"]).default("development"),
       FRONTEND_URL: z.string().url(),
   });
   ```
3. **Cambiar `onDelete: Cascade` a `Restrict`** en relaciones financieras (Cuota, Pago)
4. **Verificar `usuario.activo` en el auth middleware** (no solo al login)

### 🔧 Prioridad 2 — Corto Plazo (Performance y Correctitud)

5. **Refactorizar queries N+1** en dashboard/métricas — usar `groupBy` o raw SQL
6. **Agregar paginación** a todos los endpoints de listado
7. **Envolver asistencia en transacción**
8. **Compilar TypeScript** para producción (Dockerfile: `RUN npm run build` + `CMD ["node", "dist/index.js"]`)
9. **Implementar refresh tokens**
10. **Usar `prisma migrate`** en lugar de `db push`

### 🏗️ Prioridad 3 — Mediano Plazo (Arquitectura)

11. **Extraer Service Layer** — cada módulo debería tener `feature.service.ts`
12. **Implementar test suite** — al menos tests de integración para flujos críticos (pago, generación de cuotas)
13. **Agregar `pino-http`** para request logging con correlation IDs
14. **Centralizar configuración** en `app.config.ts` con validación Zod
15. **Agregar `compression`** middleware

### 🌟 Prioridad 4 — Largo Plazo (Escalabilidad)

16. **Implementar caché** para endpoints de lectura frecuente (stats, roles, días)
17. **Agregar DTOs** para controlar la forma de las respuestas
18. **Implementar health check profundo** (check DB + métricas de Node.js)
19. **Agregar graceful shutdown** (`SIGTERM` → drain connections → `prisma.$disconnect()`)
20. **CI/CD** con pipeline de tests, lint y build

---

## Resumen Ejecutivo

| Dimensión | Calificación | Notas |
|-----------|:---:|-------|
| Arquitectura | 6/10 | Buena organización modular, falta service layer |
| Estructura | 7/10 | Consistente y clara, falta tests y types |
| Seguridad | 5/10 | Endpoints financieros sin restricción de rol, sin token revocation |
| Lógica de Negocio | 7/10 | Cuotas bien implementadas, algunos race conditions |
| Base de Datos | 7/10 | Buen schema con índices, cascade delete peligroso |
| Performance | 4/10 | Queries N+1 severos en dashboard/métricas |
| Testing | 1/10 | Inexistente |
| Logging | 6/10 | Pino correcto, falta request logging |
| Configuración | 5/10 | Sin validación de env vars, muchos hardcoded values |
| Dependencias | 8/10 | Actualizadas y apropiadas |

**Conclusión:** El backend tiene una base sólida con buenas decisiones fundamentales (TypeScript strict, Prisma, Zod, Helmet, audit logs, soft delete). Los problemas principales son la **falta de tests**, las **queries N+1 en métricas**, la **falta de autorización en endpoints sensibles**, y la ausencia de un **service layer** que facilite la mantenibilidad a largo plazo.
