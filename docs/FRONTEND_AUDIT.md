# 🔍 Auditoría Técnica Completa — argDelSud Frontend

**Proyecto:** argDelSud SPA  
**Stack:** React 19 + Vite 8 + TypeScript 5.9 + Zustand 5 + React Router 7 + Axios + TailwindCSS 4 + Lucide React  
**Archivos analizados:** 55 archivos fuente, 11 módulos, 16 shared files  
**Fecha:** 2026-03-27

---

## 1. 🏗️ ARQUITECTURA Y DISEÑO

### Tipo de Arquitectura

**Feature-based modular** con shared infrastructure:

```
src/
├── App.tsx                  ← Router + lazy loading
├── main.tsx                 ← Entry point (StrictMode)
├── index.css                ← Design system (524 líneas)
├── modules/                 ← Feature modules (vertical slices)
│   ├── auth/                ← LoginPage + authStore re-export
│   ├── alumnos/             ← Page + components/
│   ├── talleres/            ← Page + components/ + hooks/ + types
│   ├── tesoreria/           ← Page + components/ + hooks/ + types (más complejo)
│   ├── becas/               ← Page + components/ + hooks/
│   ├── usuarios/            ← Page + components/ + hooks/
│   ├── dashboard/           ← Page (standalone)
│   ├── profesores/          ← Page + components/
│   ├── asistencia/          ← Page (standalone)
│   ├── auditoria/           ← Page (standalone)
│   └── metricas/            ← Page (standalone)
└── shared/
    ├── api/client.ts         ← Axios instance centralizada
    ├── components/           ← Modal, Toast, Confirm, Loaders, Layout
    ├── hooks/                ← 4 Zustand stores (auth, UI, toast, confirm)
    └── types/index.ts        ← Tipos compartidos
```

### Separación de Responsabilidades

| Capa | Estado | Detalle |
|------|--------|---------|
| **UI Components** | ✅ | Bien separados en `shared/components/` y `modules/*/components/` |
| **Custom Hooks** | ✅ | `useTalleres`, `useBecas`, `useUsuarios`, `useTesoreriaCuotas` encapsulan lógica |
| **State Management** | ✅ | Zustand stores para estado global (auth, UI, toast, confirm) |
| **API Client** | ✅ | Axios centralizado con interceptors |
| **Services Layer** | ❌ Ausente | Las llamadas API están directamente en hooks y pages |
| **Types** | ⚠️ Parcial | Tipos centralizados existen pero hay **duplicación** en módulos |

### Patrones Identificados

- ✅ **Custom Hooks Pattern** — lógica de negocio extraída en hooks por feature (`useTalleres`, `useBecas`, etc.)
- ✅ **Compound Component** — `Modal` + children, `MainLayout` + `Outlet`
- ✅ **Render Props** — No usado (innecesario con hooks)
- ⚠️ **Container/Presentational** — Parcial. Las Pages actúan como containers, pero algunas mezclan fetch + render (Dashboard, Asistencia, Auditoria)
- ⚠️ **No hay Error Boundaries** — un error en un componente crashea toda la app

### Acoplamiento y Cohesión

- **Buena cohesión:** Cada módulo es auto-contenido con su Page, components, hooks y types
- **Acoplamiento aceptable:** Los hooks dependen directamente de `api/client.ts` y Zustand stores
- ⚠️ **Acoplamiento al backend:** Los hooks construyen manualmente los payloads del API. No hay un service layer ni contratos de API tipados

### Escalabilidad

- ✅ Code splitting por ruta con `React.lazy` — cada módulo se carga bajo demanda
- ⚠️ Sin server-side rendering (no necesario para app interna)
- ⚠️ Todos los datos se cargan en memoria del frontend (paginación client-side) — no escala con miles de registros

### Recomendaciones

> [!IMPORTANT]
> 1. **Crear Service Layer** (`shared/services/`) para aislar llamadas API de los hooks
> 2. **Agregar Error Boundary** global y por módulo
> 3. **Migrar a paginación server-side** para listados que puedan crecer (alumnos, cuotas)
> 4. **Unificar tipos** — eliminar duplicación entre `shared/types` y tipos locales de módulos

---

## 2. 📂 ESTRUCTURA DEL PROYECTO

### Organización

✅ **Consistente y clara.** Convención predecible:
- `ModulePage.tsx` — componente principal del módulo
- `components/` — sub-componentes del módulo
- `hooks/` — custom hooks con lógica de negocio
- `types.ts` / `types.tsx` — tipos locales del módulo

### Problemas

| Problema | Severidad |
|----------|-----------|
| ⚠️ **Tipos duplicados:** `Beca` definida en `shared/types/index.ts` Y en `becas/hooks/useBecas.ts` con diferente forma | Media |
| ⚠️ **authStore re-export innecesario:** `modules/auth/authStore.ts` solo hace `export { useAuthStore } from '../../shared/hooks/useAuthStore'` — agrega un archivo sin valor, crea confusión sobre cuál importar | Baja |
| ⚠️ **Inconsistencia en ubicación de tipos:** `tesoreria/types.tsx` usa extensión `.tsx` sin JSX. `talleres/types.ts` usa `.ts` correctamente | Baja |
| No hay carpeta `services/` para aislar llamadas API | Media |
| No hay carpeta `constants/` para valores mágicos | Baja |
| No hay `tests/` ni archivos `.test.tsx` | Alta |

### Código Duplicado

⚠️ **Spinner SVG duplicado** en 3 componentes:
- `PageLoader.tsx` — SVG spinner inline
- `Spinner.tsx` — SVG spinner identical
- `TableLoader.tsx` — SVG spinner identical

Estos 3 componentes comparten el mismo SVG. Debería extraerse a un componente `SpinnerIcon` y reutilizarse.

⚠️ **Patrón de paginación client-side duplicado** en todos los módulos:
```typescript
// Repetido en AlumnosPage, useBecas, useTalleres, useUsuarios, useTesoreriaCuotas
const [page, setPage] = useState(1);
const [pageSize, setPageSize] = useState(25);
const paginatedItems = items.slice((page - 1) * pageSize, page * pageSize);
```
Debería abstraerse en un hook `usePagination(items)`.

---

## 3. 🧠 MANEJO DE ESTADO (ZUSTAND)

### Stores Identificados

| Store | Propósito | Ubicación | Estado |
|-------|-----------|-----------|--------|
| `useAuthStore` | Auth (user, token, login, logout, checkAuth) | `shared/hooks/` | ✅ Correcto |
| `useUIStore` | Sidebar, theme (light/dark) | `shared/hooks/` | ✅ Correcto |
| `useToastStore` | Notificaciones toast | `shared/hooks/` | ✅ Correcto |
| `useConfirmStore` | Modal de confirmación global | `shared/hooks/` | ✅ Bien diseñado con Promise pattern |

### Lo Bueno

- ✅ **Estado global minimal** — solo auth, UI y notificaciones son globales
- ✅ **Estado local en hooks** — datos de cada módulo (alumnos, talleres, etc.) son estado local del hook/componente
- ✅ **Promise pattern en ConfirmStore** — elegante: `const confirmed = await showConfirm({...})`. Reemplaza `window.confirm()` limpiamente
- ✅ **`getState()` para acceso fuera de componentes** — usado correctamente en hooks para llamar toast sin re-render

### Problemas

| Problema | Severidad |
|----------|-----------|
| ⚠️ **Token en localStorage + Zustand sincronizado manualmente** — el token se guarda en `localStorage` Y en el store. Si se desincroniza, la app se comporta de forma impredecible | Media |
| ⚠️ **`useAuthStore` inicializa `token` desde localStorage en module scope** — esto se ejecuta una sola vez al cargar el módulo. Si otro tab modifica localStorage, este tab no se entera | Baja |
| ⚠️ **Side effects en stores:** `useUIStore` ejecuta `document.documentElement.setAttribute('data-theme', ...)` dentro de `set()` — esto mezcla DOM manipulation con state management | Baja |

### Uso de `getState()` fuera de React

```typescript
// Patrón repetido en hooks:
useToastStore.getState().success('Alumno creado');
useToastStore.getState().error('Error al desactivar');
```

✅ **Correcto.** `getState()` evita subscribir el componente al toast store y previene re-renders innecesarios. Es un patrón válido de Zustand.

---

## 4. 🌐 COMUNICACIÓN CON EL BACKEND (AXIOS)

### Instancia Centralizada

```typescript
// shared/api/client.ts
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});
```

- ✅ Instancia centralizada con `baseURL` configurable
- ✅ Timeout de 15s (evita requests colgados)
- ✅ `Content-Type` configurado globalmente

### Interceptors

**Request interceptor:**
```typescript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```
- ✅ Agrega token automáticamente a cada request

**Response interceptor:**
```typescript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      if (!isLoginRequest) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```
- ✅ Detecta 401 y redirige al login
- ✅ No redirige si el 401 es del propio login (credenciales incorrectas)
- ⚠️ **Usa `window.location.href` en vez del router** — esto causa un full page reload y pierde el estado de la SPA

### Problemas

| Problema | Severidad |
|----------|-----------|
| ⚠️ **No hay retry logic** — si una request falla por timeout o error de red, no se reintenta | Baja |
| ⚠️ **No hay refresh token** — si el JWT expira (4h), el usuario es automaticamente deslogueado al próximo request sin previo aviso | Media |
| ⚠️ **`window.location.href` para redirect** en interceptor — pierde el estado de la SPA, causa flash de pantalla blanca | Baja |
| ⚠️ **No hay cancel de requests** — si el usuario navega rápido entre páginas, las requests previas pueden completar y actualizar estado de un componente desmontado | Media |
| ⚠️ **No hay debounce en búsquedas** — cada keystroke en los campos de búsqueda dispara un request al backend inmediatamente | Media |

### Manejo de Errores

```typescript
// Patrón repetido en todos los hooks:
} catch (err: any) {
  const data = err.response?.data;
  if (data?.errors?.length) {
    const srvErrs: Record<string, string> = {};
    data.errors.forEach((e: any) => { srvErrs[e.campo] = e.mensaje; });
    setFieldErrors(srvErrs);
  } else {
    useToastStore.getState().error(data?.message || 'Error al guardar');
  }
}
```

- ✅ Maneja errores de validación del backend (field-level errors)
- ✅ Fallback a toast genérico
- ⚠️ **Patrón duplicado en TODOS los hooks** — debería centralizarse en un utility `handleApiError(err, setFieldErrors)`
- ⚠️ **Usa `any` para errores** — sin tipado de error responses

---

## 5. 🔐 SEGURIDAD FRONTEND

### 5.1 JWT — Almacenamiento

```typescript
// useAuthStore.ts:27
localStorage.setItem('token', token);
// client.ts:11
const token = localStorage.getItem('token');
```

> [!CAUTION]
> ⚠️ **JWT almacenado en localStorage** — vulnerable a XSS. Si un atacante logra inyectar JavaScript (via XSS), puede robar el token con `localStorage.getItem('token')` y enviarlo a un servidor externo.

**Impacto:** Acceso completo a la API con la identidad del usuario robado hasta que el token expire (4 horas).

**Mitigación ideal:** Usar `httpOnly` cookies para el token. Sin embargo, para una app interna con bajo riesgo de XSS (no acepta contenido de usuarios), el riesgo es aceptable si no existen vectores de XSS (ver 5.2).

### 5.2 XSS (Cross-Site Scripting)

**Búsqueda de vectores XSS:**

- ✅ **No se usa `dangerouslySetInnerHTML`** en ningún componente
- ✅ **React escapa automáticamente** todo lo que se renderiza en JSX
- ✅ **No hay `eval()`, `new Function()` ni `document.write()`**
- ✅ **Zod valida en backend** — datos inválidos se rechazan antes de guardarse
- ⚠️ **Riesgo residual:** Los datos del backend se renderizan directamente sin sanitización adicional. Si el backend tiene una vulnerabilidad que permite guardar HTML malicioso, React lo escaparía, pero cualquier uso futuro de `dangerouslySetInnerHTML` lo expondría.

**Conclusión:** Riesgo XSS **bajo** para esta aplicación.

### 5.3 CSRF

- ✅ **No aplica.** La autenticación usa `Authorization: Bearer` header, no cookies. CSRF solo afecta a autenticación basada en cookies.

### 5.4 Protección de Rutas

```typescript
// App.tsx:20-24
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
```

- ✅ Rutas protegidas con `ProtectedRoute` wrapper
- ⚠️ **Solo verifica existencia del token, no su validez.** Un token expirado pasa la verificación del frontend — el 401 del backend es lo que realmente protege, pero el usuario ve un flash de contenido antes del redirect
- ⚠️ **No hay protección por rol en el frontend.** TODAS las rutas son accesibles para cualquier usuario autenticado — un profesor ve los links de Usuarios, Auditoría y Métricas en el sidebar

```typescript
// Sidebar.tsx:21-32 — navItems es un array estático, sin filtrado por rol
const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  // ... todos los items visibles para todos los roles
  { to: '/usuarios', label: 'Usuarios', icon: Shield },
];
```

> [!WARNING]
> **Exploit:** Un profesor puede ver los items de Usuarios/Auditoría/Métricas en el sidebar. Si intenta acceder, el backend (que **tampoco** tiene restricción de rol en auditoría y métricas) le devolverá datos. Solo `/usuarios` está protegido por `authorizeRole(["superadmin"])` en el backend.

### 5.5 Variables de Entorno

```
# .env
VITE_API_URL=/api
```

- ✅ Solo `VITE_API_URL` está expuesta — no hay secrets
- ✅ El `.env` no contiene tokens ni passwords
- ✅ Vite solo expone variables con prefijo `VITE_`

### 5.6 Filtrado de Información Sensible

- ✅ Los errores del backend se filtran antes de mostrarse al usuario
- ✅ No se exponen stack traces ni información de infraestructura
- ⚠️ El token JWT está visible en DevTools → Application → Local Storage (inherente a localStorage)

---

## 6. 🧩 COMPONENTES Y UI

### Componentes Compartidos

| Componente | Calidad | Notas |
|-----------|---------|-------|
| `Modal` | ✅ | Genérico, acepta `children`, `maxWidth` configurable, cierre con click en overlay |
| `ConfirmModal` | ✅ | 3 variantes (danger/warning/default), iconos apropiados |
| `ToastContainer` | ✅ | Soporte para 4 tipos, auto-dismiss configurable, animación de entrada |
| `TablePagination` | ✅ | Paginación completa con ellipsis, responsive, page size configurable |
| `PageLoader` | ✅ | Simple y reutilizable |
| `Spinner` | ⚠️ | Casi idéntico a `PageLoader` — deberían compartir el SVG |
| `TableLoader` | ✅ | Especifico para tablas (`<tr>` wrapper) |
| `MainLayout` | ✅ | Sidebar + Header + Outlet, responsive |
| `Sidebar` | ✅ | Desktop collapse + mobile drawer, bien implementado |
| `Header` | ✅ | Breadcrumb, theme toggle, user info |

### Tamaño y Responsabilidad

| Componente | Líneas | Evaluación |
|-----------|--------|------------|
| `Sidebar.tsx` | 159 | ✅ Aceptable — tiene mobile drawer + desktop sidebar + NavList + UserSection |
| `useTalleres.ts` | 223 | ⚠️ Grande — maneja CRUD + detalle + inscripción + desinscripción. Candidato a split |
| `useBecas.ts` | 161 | ✅ Aceptable |
| `useTesoreriaCuotas.ts` | 106 | ✅ Bien |
| `AlumnosPage.tsx` | 184 | ⚠️ Mezcla responsive mobile cards + desktop table + pagination — candidato a split |
| `DashboardPage.tsx` | 209 | ⚠️ Fetch directo + render complejo. Debería extraer hooks |

### Props Drilling

- ✅ **Mínimo.** Zustand stores reemplazan la necesidad de pasar props por múltiples niveles
- ✅ Los hooks retornan todo lo que la Page necesita — la Page pasa solo lo necesario a sub-components

### Accesibilidad (a11y)

| Aspecto | Estado |
|---------|--------|
| Labels en inputs de formulario | ✅ `<label>` con `htmlFor` |
| `role="alert"` en toasts | ✅ Presente |
| Focus management en modales | ⚠️ **No hay focus trap.** Al abrir un modal, el foco no se mueve al modal ni se impide navegar fuera con Tab |
| Keyboard navigation | ⚠️ **El modal no se cierra con Escape** |
| `aria-label` en botones de icono | ⚠️ **Ausente.** Los botones de editar/desactivar solo tienen `title` pero no `aria-label` |
| Color contrast | ✅ Paleta bien definida con suficiente contraste |
| Touch targets | ✅ Clase `.tap-target` con `min-width: 44px` (cumple WCAG) |

### Formularios

- ✅ **Validación client-side** en todos los formularios (antes de enviar al backend)
- ✅ **Field-level errors** renderizados debajo de cada input
- ✅ **Server-side errors** mapeados a campos correspondientes
- ✅ **Submit deshabilitado durante loading** (`disabled={saving}`)
- ⚠️ **No hay form library** (ni React Hook Form ni Formik) — la validación es manual y repetitiva
- ⚠️ **El formulario no resetea errores al cerrar el modal** — si abrís, fallás, cerrás y abrís de nuevo, pueden quedar errores del submit anterior

---

## 7. ⚡ PERFORMANCE

### Re-renders

⚠️ **`MainLayout` se re-renderiza en cada resize:**
```typescript
// MainLayout.tsx:11-17
const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
useEffect(() => {
  const handler = () => setIsDesktop(window.innerWidth >= 1024);
  window.addEventListener('resize', handler);
  return () => window.removeEventListener('resize', handler);
}, []);
```
Sin debounce/throttle — cada pixel de resize recalcula y potencialmente re-renderiza todo el layout.

⚠️ **DashboardPage no usa `useCallback`/`useMemo`:**
```typescript
// DashboardPage.tsx:66-68
const maxTotal = recaudacion?.recaudacion
  ? Math.max(...recaudacion.recaudacion.map(r => r.total), 1) : 1;
```
Se recalcula en cada render. Debería usar `useMemo`.

⚠️ **Búsquedas sin debounce:**
```typescript
// AlumnosPage.tsx:32
useEffect(() => { setPage(1); fetchAlumnos(); }, [search]);
```
Cada keystroke dispara una request al backend inmediatamente. Con un debounce de 300ms se reduciría drásticamente el tráfico.

### Lazy Loading y Code Splitting

✅ **Excelente implementación:**
```typescript
// App.tsx:8-18
const LoginPage = lazy(() => import('./modules/auth/LoginPage'));
const DashboardPage = lazy(() => import('./modules/dashboard/DashboardPage'));
const AlumnosPage = lazy(() => import('./modules/alumnos/AlumnosPage'));
// ... todos los módulos lazy-loaded
```
- Cada ruta es un chunk separado
- `<Suspense fallback={<PageLoader />}>` muestra loader mientras carga

### Paginación Client-Side

> [!WARNING]
> ⚠️ **Todos los listados cargan TODOS los datos y paginan en memoria.**
> ```typescript
> const paginatedAlumnos = alumnos.slice((page - 1) * pageSize, page * pageSize);
> ```
> Si hay 10,000 alumnos, se descargan TODOS y se guardan en el state. La tabla solo muestra 25, pero la memoria contiene 10,000 objetos completos.

### Uso de memo/useCallback/useMemo

| Hook/Component | `useCallback` | `useMemo` | Evaluación |
|----------------|:---:|:---:|---|
| `useBecas` | ✅ `fetchBecas`, `fetchInscripciones` | ❌ | Bien |
| `useTalleres` | ✅ `fetchTalleres` | ❌ | Bien |
| `useTesoreriaCuotas` | ✅ `fetchCuotas` | ❌ | Bien |
| `DashboardPage` | ❌ | ❌ | ⚠️ `maxTotal` debería memorizarse |
| `Sidebar` | ❌ | ❌ | ⚠️ `NavList` debería memorizarse (recibe `location`) |

### Listas Grandes

- ⚠️ No hay virtualización de listas (react-virtual/react-window). Si un listado muestra 100+ filas, el DOM contiene todos los rows
- ⚠️ Sin virtualización, las tablas grandes causan jank al scrollear

---

## 8. 🧪 TESTING

> [!CAUTION]
> ⚠️ **NO HAY TESTS DE NINGÚN TIPO.** No existen archivos `.test.tsx`, `.spec.ts`, ni configuración de Vitest, Jest, React Testing Library, Playwright o Cypress.

### Testabilidad

| Elemento | Testabilidad | Razón |
|----------|:---:|---|
| Custom hooks (`useBecas`, etc.) | ✅ Alta | Hooks puros que retornan estado — testeables con `@testing-library/react-hooks` |
| Shared components (`Modal`, `Toast`) | ✅ Alta | Props claras, sin side effects |
| Pages | ⚠️ Media | Mezclan data fetching + render — requieren mocking de axios |
| Auth flow | ⚠️ Media | Depende de localStorage + interceptores |
| Zustand stores | ✅ Alta | Testeables fuera de React con `getState()`/`setState()` |

### Tests Recomendados

| Tipo | Prioridad | Qué testear |
|------|-----------|-------------|
| **Unit** | Alta | Custom hooks (useBecas, useTalleres), validaciones de formularios, formateo de datos |
| **Integration** | Alta | Flujos CRUD completos (crear alumno → ver en lista → editar → desactivar) |
| **E2E** | Media | Login → Dashboard → Tesorería → registrar pago |
| **Visual** | Baja | Snapshot tests de componentes compartidos (Modal, Toast, Sidebar) |

---

## 9. 🎨 ESTILOS (TAILWIND)

### Design System

✅ **Excelente implementación** en `index.css`:

```css
@theme {
  --color-primary-50: #E6F0F8;    /* Azul institucional del club */
  --color-accent-400: #4FAAD5;     /* Celeste accent */
  --color-success-500: #10B981;    /* Verde */
  --color-warning-400: #D4A843;    /* Dorado */
  --color-danger-500: #EF4444;     /* Rojo */
}
```

- ✅ **Paleta semántica completa** con 6 escalas (primary, secondary, accent, success, warning, danger)
- ✅ **Dark mode via `data-theme`** — implementación correcta con CSS component classes
- ✅ **Semantic classes** (`bg-page`, `bg-card`, `text-heading`, `text-body`, `text-muted`) — abstraen los colores del tema
- ✅ **Google Fonts (Inter)** — tipografía moderna y profesional
- ✅ **Custom animations** (`fadeIn`, `slideUp`, `slideInRight`) — consistentes y performantes
- ✅ **Touch targets** (`.tap-target` con min 44×44px) — buena práctica de accesibilidad

### Problemas

| Problema | Severidad |
|----------|-----------|
| ⚠️ **Login page usa CSS vanilla** (300+ líneas en `index.css`) mientras el resto usa Tailwind — inconsistencia en approach | Media |
| ⚠️ **Clases Tailwind muy largas** en algunos componentes (100+ caracteres por `className`) — difícil de leer y mantener | Baja |
| ⚠️ **Color hardcoded** en `@layer base body` — `background: #F8FAFC` en lugar de usar la variable del tema | Baja |
| ⚠️ **No hay `@apply` para patrones repetidos** — `px-4 py-2.5 rounded-xl border bg-input border-input text-sm...` se repite en cada input de cada modal | Media |

### Consistencia

- ✅ Colores y espaciado consistentes en toda la app
- ✅ Bordes redondeados consistentes (`rounded-xl`)
- ✅ Shadows consistentes
- ⚠️ Los botones no tienen una clase unificada — cada botón repite el mismo bloque de clases Tailwind

---

## 10. 🧭 ROUTING (REACT ROUTER)

### Estructura

```typescript
<BrowserRouter>
  <Suspense fallback={<PageLoader />}>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/alumnos" element={<AlumnosPage />} />
        // ... 8 más
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Suspense>
</BrowserRouter>
```

### Lo Bueno

- ✅ **Layout route** con `<Outlet />` — todas las páginas protegidas comparten Sidebar + Header
- ✅ **Catch-all route** redirige a home
- ✅ **Login redirect** si ya autenticado: `if (user) return <Navigate to="/" replace />`
- ✅ **Lazy loading** en todas las rutas

### Problemas

| Problema | Severidad |
|----------|-----------|
| ⚠️ **No hay protección por rol** — no existe un `<AdminRoute>` o `<RoleRoute>` que filtre por rol del usuario | Alta |
| ⚠️ **No hay 404 page** — `path="*"` redirige silenciosamente al home. Debería mostrar una página de error | Baja |
| ⚠️ **`BrowserRouter` en vez de `createBrowserRouter`** — React Router 7 recomienda el data router API para mejores features (loaders, actions, error boundaries) | Baja |
| ⚠️ **El `checkAuth` de `useEffect` en `App.tsx` no tiene `[]` dependencia correcta (ESLint warning)** — pero funciona por diseño porque solo se ejecuta al montar App | Baja |

---

## 11. ⚙️ CONFIGURACIÓN

### Vite

```typescript
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: { '/api': 'http://localhost:3000' },
  },
});
```

- ✅ Proxy para desarrollo — evita CORS issues
- ✅ TailwindCSS 4 como plugin de Vite (no PostCSS) — más rápido
- ⚠️ **No hay configuración de build** (chunk strategy, source maps, minification)
- ⚠️ **No hay `resolve.alias`** — los imports usan rutas relativas largas (`../../../shared/api/client`)

### Dockerfile

```dockerfile
FROM node:20-alpine AS build
COPY . .
RUN npx vite build
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
```

- ✅ **Multi-stage build** — solo el bundle final va a producción
- ✅ **Nginx** para servir static files con SPA fallback
- ✅ **Cache headers** para assets estáticos (`expires 1y; immutable`)
- ⚠️ `npx vite build` en lugar de `npm run build` — no corre TypeScript check antes del build
- ⚠️ **No hay `.env.production`** — la build de producción usa `VITE_API_URL=/api` que depende del proxy de Nginx

### Variables de Entorno

- Solo `VITE_API_URL` — correcto para este proyecto
- ⚠️ El `.env` está committeado al repo (no en `.gitignore`) — aceptable porque no contiene secrets, pero es mala práctica

---

## 12. 📦 DEPENDENCIAS

### Análisis

| Dependencia | Versión | Estado |
|-------------|---------|--------|
| `react` | 19.2.4 | ✅ Última |
| `react-dom` | 19.2.4 | ✅ |
| `react-router-dom` | 7.13.1 | ✅ Última |
| `zustand` | 5.0.11 | ✅ Última |
| `axios` | 1.13.6 | ✅ |
| `tailwindcss` | 4.2.1 | ✅ Última (v4 con Vite plugin) |
| `@tailwindcss/vite` | 4.2.1 | ✅ |
| `lucide-react` | 0.577.0 | ✅ |
| `vite` | 8.0.0 | ✅ Última |
| `typescript` | 5.9.3 | ✅ |

### Dependencias que Faltan

| Librería | Propósito |
|----------|-----------|
| `@tanstack/react-query` | Cache de server state, retry, refetch automático — reemplazaría los `useEffect` + `useState` manuales |
| `react-hook-form` + `zod` | Validación de formularios tipada — eliminaría la validación manual duplicada |
| Testing: `vitest` + `@testing-library/react` | Testing framework |
| `react-virtual` | Virtualización de listas grandes |

### Dependencias Innecesarias

- Ninguna detectada — el bundle es limpio y minimal

### Tree Shaking

- ✅ `lucide-react` importa icons individuales (bien para tree shaking):
  ```typescript
  import { Users, Pencil, Ban } from 'lucide-react';
  ```

---

## 13. ⚠️ RIESGOS Y PROBLEMAS

### 🔴 Severidad ALTA

| # | Riesgo | Impacto | Mitigación |
|---|--------|---------|------------|
| 1 | **No hay tests** | Cualquier refactor puede romper funcionalidad sin detectarse | Implementar Vitest + Testing Library |
| 2 | **No hay protección de rutas por rol** | Un profesor accede a pages de admin (Usuarios, Auditoría, Métricas) | Agregar `<RoleRoute>` y filtrar `navItems` por rol |
| 3 | **Paginación client-side en todos los módulos** | Con miles de registros, la app se vuelve muy lenta al descargar todo | Migrar a paginación server-side con `skip/take` |
| 4 | **No hay Error Boundary** | Un error en un componente crashea toda la aplicación, mostrando pantalla blanca | Agregar `<ErrorBoundary>` global y por módulo |

### 🟠 Severidad MEDIA

| # | Riesgo | Impacto | Mitigación |
|---|--------|---------|------------|
| 5 | **JWT en localStorage** | Vulnerable a XSS (riesgo bajo dado que no hay vectores de XSS detectados) | Aceptable para app interna; considerar httpOnly cookies para producción pública |
| 6 | **Búsquedas sin debounce** | Request al backend por cada keystroke → sobrecarga de red y del servidor | Agregar debounce de 300ms |
| 7 | **No hay refresh token** | Sesión corta abruptamente después de 4h sin aviso | Implementar refresh token con interceptor |
| 8 | **No hay cancel de requests** | Memory leaks y "state updates on unmounted component" warnings | Usar `AbortController` o migrar a React Query |
| 9 | **No hay focus trap en modales** | Usuarios de teclado/screen reader pueden navegar fuera del modal | Implementar focus trap |
| 10 | **Tipos duplicados** (Beca en shared vs hook) | Posibilidad de que los tipos se desincronicen y causen bugs | Unificar en `shared/types` |

### 🟡 Severidad BAJA

| # | Riesgo | Mitigación |
|---|--------|------------|
| 11 | SVG spinner duplicado en 3 componentes | Extraer a `<SpinnerIcon />` |
| 12 | Clases Tailwind repetidas en botones/inputs | Crear clases con `@apply` o componentes `<Button>`, `<Input>` |
| 13 | Resize listener sin debounce en MainLayout | Agregar debounce al handler |
| 14 | `window.location.href` en interceptor 401 | Usar el router de React |
| 15 | authStore re-export en `modules/auth/authStore.ts` | Eliminar el archivo, importar directamente |
| 16 | `.env` committeado al repo | Agregar a `.gitignore`, usar `.env.example` |
| 17 | Login page no soporta dark mode | Los colores del login card están hardcodeados en CSS |

---

## 14. ✅ RECOMENDACIONES

### 🔥 Prioridad 1 — Inmediato (Seguridad + Estabilidad)

1. **Agregar protección de rutas por rol:**
   ```tsx
   function RoleRoute({ roles, children }: { roles: string[]; children: ReactNode }) {
     const { user } = useAuthStore();
     if (!user || !roles.includes(user.rol)) return <Navigate to="/" />;
     return <>{children}</>;
   }
   // Uso:
   <Route path="/usuarios" element={<RoleRoute roles={["superadmin"]}><UsuariosPage /></RoleRoute>} />
   ```

2. **Filtrar sidebar por rol:**
   ```typescript
   const navItems = [
     { to: '/', label: 'Dashboard', icon: LayoutDashboard },
     // ...
     { to: '/usuarios', label: 'Usuarios', icon: Shield, roles: ['superadmin'] },
     { to: '/auditoria', label: 'Auditoría', icon: ScrollText, roles: ['superadmin'] },
   ].filter(item => !item.roles || item.roles.includes(user?.rol));
   ```

3. **Agregar Error Boundary:**
   ```tsx
   class ErrorBoundary extends React.Component { /* ... */ }
   // En App.tsx, envolver cada route con ErrorBoundary
   ```

### 🔧 Prioridad 2 — Corto Plazo (Performance + DX)

4. **Agregar debounce a búsquedas** — `useDebounce(search, 300)` en todos los módulos
5. **Crear hook `usePagination`** para eliminar duplicación de lógica de paginación
6. **Crear componentes `<Button>` y `<Input>`** con variantes, eliminando clases Tailwind repetidas
7. **Agregar path aliases en Vite** — `@/shared/...` en lugar de `../../../shared/...`
8. **Agregar focus trap y Escape** a `Modal` y `ConfirmModal`
9. **Unificar tipos** — eliminar `Beca` duplicada en `useBecas.ts`, importar de `shared/types`

### 🏗️ Prioridad 3 — Mediano Plazo (Arquitectura)

10. **Migrar a React Query** — reemplazaría `useEffect` + `useState` manuales con caching, retry, refetch automático y paginación server-side
11. **Implementar tests con Vitest** — al menos unit tests de hooks y integration tests de flujos CRUD
12. **Extraer Service Layer** — `shared/services/*.ts` para aislar las llamadas API de los hooks
13. **Implementar refresh token** con interceptor transparente de Axios
14. **Crear `<Button>` component library** con variantes: `primary`, `danger`, `ghost`, `outline`

### 🌟 Prioridad 4 — Largo Plazo (Escalabilidad)

15. **Paginación server-side** para todos los listados
16. **Virtualización de listas** (react-virtual) para tablas con 100+ rows
17. **Migrar a React Router data router API** (`createBrowserRouter` con loaders y error boundaries nativos)
18. **Implementar formularios con React Hook Form + Zod** — validación tipada, mejor performance, menos boilerplate
19. **Storybook** para documentar componentes compartidos

---

## Resumen Ejecutivo

| Dimensión | Calificación | Notas |
|-----------|:---:|-------|
| Arquitectura | 7/10 | Feature-based correcto, falta service layer y Error Boundary |
| Estructura | 7/10 | Consistente, con algo de duplicación |
| Estado (Zustand) | 8/10 | Uso ejemplar — global minimal, local apropiado |
| Comunicación API | 6/10 | Buena base, falta debounce, cancel, refresh token |
| Seguridad | 6/10 | JWT en localStorage aceptable, pero sin protección de rutas por rol |
| Componentes y UI | 7/10 | Buenos reusables, falta a11y en modales |
| Performance | 5/10 | Paginación client-side, búsquedas sin debounce |
| Testing | 1/10 | Inexistente |
| Estilos (Tailwind) | 8/10 | Excelente design system, dark mode, paleta semántica |
| Routing | 6/10 | Funcional pero sin protección por roles |
| Configuración | 7/10 | Dockerfile multi-stage correcto, falta aliases y build config |
| Dependencias | 9/10 | Actualizadas, minimal, sin bloat |

**Conclusión:** El frontend tiene una base sólida con excelentes decisiones de diseño: Zustand bien utilizado, code-splitting por ruta, design system completo con dark mode, y hooks que encapsulan lógica de negocio. Los problemas principales son la **ausencia total de tests**, la **falta de protección de rutas por rol**, la **paginación client-side** que no escala, y la **ausencia de Error Boundaries** que dejan la app vulnerable a crasheos completos.
