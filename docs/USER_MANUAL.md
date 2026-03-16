# 📘 Manual de Usuario — argDelSud

> Guía completa para el uso del sistema de gestión de talleres y cursos deportivos.

---

## Tabla de Contenidos

1. [Inicio de Sesión](#1-inicio-de-sesión)
2. [Panel Principal (Dashboard)](#2-panel-principal-dashboard)
3. [Alumnos](#3-alumnos)
4. [Profesores](#4-profesores)
5. [Talleres](#5-talleres)
6. [Asistencia](#6-asistencia)
7. [Tesorería](#7-tesorería)
8. [Becas](#8-becas)
9. [Usuarios](#9-usuarios)
10. [Auditoría](#10-auditoría)
11. [Métricas](#11-métricas)
12. [Errores y Validaciones](#12-errores-y-validaciones)
13. [Preguntas Frecuentes (FAQ)](#13-preguntas-frecuentes-faq)

---

## 1. Inicio de Sesión

### ¿Para qué sirve?
Es la puerta de entrada al sistema. Necesitás un email y contraseña proporcionados por el administrador.

### Cómo ingresar

1. Abrí el navegador y accedé a la URL del sistema.
2. Ingresá tu **email** y **contraseña**.
3. Hacé clic en **"Iniciar sesión"**.
4. Serás redirigido al Panel Principal.

### Cosas a tener en cuenta
- Si ingresás credenciales incorrectas, verás un mensaje: *"Credenciales inválidas"*.
- Después de muchos intentos fallidos, el sistema te bloqueará temporalmente por seguridad (15 minutos).
- Tu sesión dura **4 horas**. Después de ese tiempo, el sistema te pedirá volver a ingresar.

---

## 2. Panel Principal (Dashboard)

### ¿Para qué sirve?
Te da una visión general del estado del club de un vistazo: cuántos alumnos hay, cuántos talleres están activos, la recaudación del mes y un calendario con los horarios.

### Qué vas a encontrar

| Sección | Qué muestra |
|---------|-------------|
| **Tarjetas superiores** | Total de alumnos activos, talleres activos, profesores e inscripciones |
| **Recaudación** | Cuánto se cobró este mes vs. cuánto se esperaba cobrar |
| **Calendario** | Los talleres del mes con sus días y horarios |

> 💡 El Dashboard es de solo lectura — no se edita nada desde acá. Para hacer cambios, usá los módulos correspondientes.

---

## 3. Alumnos

### ¿Para qué sirve?
Gestionar la información de todos los alumnos inscriptos en el club: datos personales, contacto, tutor y estado.

### Cómo crear un alumno nuevo

1. Hacé clic en el botón **"+ Nuevo Alumno"**.
2. Completá el formulario:
   - **Nombre** *(obligatorio)* — Mínimo 2 caracteres
   - **Apellido** *(obligatorio)* — Mínimo 2 caracteres
   - **DNI** *(obligatorio)* — Solo números, entre 7 y 9 dígitos
   - **Fecha de Nacimiento** *(obligatorio)*
   - **Teléfono** — Solo números, máximo 15 dígitos
   - **Teléfono del Tutor** — Solo números, máximo 15 dígitos
   - **Nombre del Tutor**, **Dirección**, **Notas** — opcionales
3. Hacé clic en **"Crear"**.
4. Verás una notificación verde: *"Alumno creado exitosamente"*.

### Cómo editar un alumno

1. Buscá al alumno en la lista usando el **buscador** (podés buscar por nombre, apellido o DNI).
2. Hacé clic en el ícono de **lápiz** (✏️) en la fila del alumno.
3. Modificá los campos que necesites.
4. Hacé clic en **"Actualizar"**.

### Cómo desactivar un alumno

1. Hacé clic en el ícono de **papelera** (🗑️) en la fila del alumno.
2. Confirmá en el diálogo que aparece.
3. El alumno no se borra — se marca como **inactivo** y deja de aparecer en las listas.

### Funcionalidades clave
- **Buscador**: Filtrá por nombre, apellido o DNI escribiendo en el campo de búsqueda.
- **Filtro de estado**: Podés filtrar para ver solo activos, solo inactivos, o todos.

---

## 4. Profesores

### ¿Para qué sirve?
Administrar la información de los profesores que dictan talleres en el club.

### Cómo crear un profesor

1. Hacé clic en **"+ Nuevo Profesor"**.
2. Completá el formulario:
   - **Nombre** *(obligatorio)* — Mínimo 2 caracteres
   - **Apellido** *(obligatorio)* — Mínimo 2 caracteres
   - **DNI** *(obligatorio)* — Solo números, 7 a 9 dígitos
   - **Teléfono** — Solo números
   - **Email** — Debe ser un email válido (ej: profesor@mail.com)
   - **Especialidad** — Opcional (ej: "Fútbol", "Natación")
3. Hacé clic en **"Crear"**.

### Cómo editar o desactivar
Funciona exactamente igual que en Alumnos: ícono de lápiz para editar, papelera para desactivar.

> ⚠️ **Importante**: Un profesor no puede ser eliminado si tiene talleres activos asignados. Primero debés reasignar o desactivar esos talleres.

---

## 5. Talleres

### ¿Para qué sirve?
Crear y gestionar los talleres/cursos del club, asignar profesores, definir horarios y gestionar las inscripciones de alumnos.

### Cómo crear un taller

1. Hacé clic en **"+ Nuevo Taller"**.
2. Completá el formulario:
   - **Nombre** *(obligatorio)* — Ej: "Fútbol Sub-12"
   - **Categoría** *(obligatorio)* — Seleccioná del desplegable
   - **Precio Mensual** *(obligatorio)* — Valor mayor a $0
   - **Cupo Máximo** *(obligatorio)* — Número de vacantes
   - **Profesor** *(obligatorio)* — Seleccioná del desplegable
   - **Fecha de Inicio / Fin** *(obligatorio)* — Período del taller
3. **Días y Horarios**:
   - Hacé clic en **"+ Agregar día"**.
   - Seleccioná el día de la semana, hora de inicio y hora de fin.
   - Podés agregar múltiples días (ej: Lunes y Miércoles).
   - Usá la **X** para eliminar un día que no querés.
4. Hacé clic en **"Crear"**.

### Cómo inscribir un alumno al taller

1. En la tarjeta del taller, hacé clic en el ícono de **persona con +** (👤+).
2. Se abre un buscador — escribí el nombre o DNI del alumno.
3. Seleccionalo de la lista.
4. Confirmá la inscripción.

### Cómo desinscribir un alumno

1. Hacé clic en el ícono de **ojo** (👁️) para ver el detalle del taller.
2. En la lista de inscriptos, hacé clic en el ícono para desinscribir al alumno.

### Cómo ver el detalle del taller

Hacé clic en el ícono de **ojo** (👁️) — verás: datos del taller, lista de inscriptos, barra de cupo (con color rojo si está lleno).

### Funcionalidades clave
- **Barra de cupo**: Muestra visualmente cuántos inscriptos hay vs. el máximo. Se pone roja cuando el taller está lleno.
- **Filtro por categoría**: Filtrá talleres por su categoría deportiva.
- **Buscador**: Buscá talleres por nombre.

---

## 6. Asistencia

### ¿Para qué sirve?
Registrar la asistencia diaria de los alumnos a cada taller. Es el módulo que usan los profesores o administradores al inicio de cada clase.

### Cómo tomar asistencia

1. **Seleccioná el taller** del desplegable.
2. **Seleccioná la fecha** (por defecto es hoy).
3. Aparecerá la lista de alumnos inscriptos en ese taller.
4. Marcá como **"Presente"** o **"Ausente"** a cada alumno.
5. Hacé clic en **"Guardar Asistencia"**.
6. Verás una notificación verde: *"Asistencia registrada correctamente"*.

### Cómo ver el historial de asistencia de un alumno

1. Seleccioná el taller y buscá la vista de historial.
2. Podrás ver las fechas en que asistió y las que faltó.

### Funcionalidades clave
- **Acceso para profesores**: Los profesores con cuenta de usuario pueden tomar asistencia de sus propios talleres.
- **Asistencia retroactiva**: Podés cambiar la fecha para cargar asistencia de días anteriores.
- **Una sola vez por día**: No se puede cargar asistencia dos veces para el mismo taller en el mismo día — se sobrescribe.

---

## 7. Tesorería

### ¿Para qué sirve?
Es el módulo financiero del club. Gestiona las cuotas mensuales, registra pagos, identifica deudores y lleva la cuenta corriente de cada alumno.

### Secciones dentro de Tesorería

El módulo tiene pestañas internas para organizar el trabajo:

| Pestaña | Función |
|---------|---------|
| **Cuotas** | Ver y filtrar todas las cuotas generadas |
| **Deudores** | Lista de alumnos con cuotas pendientes |
| **Cuenta Alumno** | Estado de cuenta detallado de un alumno |

### Cómo generar cuotas

**Cuota individual:**
1. Hacé clic en **"Generar Cuota"**.
2. Seleccioná la inscripción (alumno + taller).
3. Elegí el mes y año.
4. El sistema calcula el monto automáticamente (aplica becas si las hay).
5. Confirmá.

**Cuotas masivas:**
1. Hacé clic en **"Generar Masivo"**.
2. Elegí mes y año.
3. Se generan cuotas para **todas** las inscripciones activas.

### Cómo registrar un pago

1. Buscá la cuota en la lista (podés filtrar por estado, mes, año).
2. Hacé clic en el botón de **"Pagar"** de la cuota.
3. Completá:
   - **Monto** *(obligatorio)* — Debe ser mayor a $0
   - **Método de pago** — Efectivo, transferencia, etc.
   - **Observaciones** — Opcional
4. Hacé clic en **"Registrar Pago"**.
5. Si el pago cubre el total, la cuota pasa automáticamente a estado **"Pagada"**.

### Cómo anular una cuota

1. Encontrá la cuota en la lista.
2. Hacé clic en el botón **"Anular"**.
3. Confirmá.
4. La cuota pasa a estado *"Anulada"* y ya no se cuenta como deuda.

### Estados de una cuota

| Estado | Color | Significado |
|--------|-------|-------------|
| **Pendiente** | 🟡 Amarillo | No fue pagada todavía |
| **Pagada** | 🟢 Verde | Fue pagada en su totalidad |
| **Anulada** | ⚫ Gris | Fue cancelada, no genera deuda |

---

## 8. Becas

### ¿Para qué sirve?
Aplicar descuentos porcentuales a las cuotas de alumnos que tienen algún beneficio (mérito deportivo, situación económica, etc.).

### Cómo crear una beca

1. Hacé clic en **"+ Nueva Beca"**.
2. **Seleccioná la inscripción**: Buscá al alumno por nombre, apellido o DNI en el buscador. Seleccionalo de la lista.
3. Completá:
   - **% Descuento** *(obligatorio)* — Número entre 1 y 100
   - **Motivo** — Opcional, pero útil para recordar por qué se dio
   - **Fecha Desde** *(obligatorio)*
   - **Fecha Hasta** *(obligatorio)*
4. **Aplicar a cuota actual** (checkbox): Si está activo, el descuento se aplica automáticamente a la cuota pendiente del mes actual.
5. Hacé clic en **"Crear Beca"**.

### Cómo editar una beca

1. Hacé clic en el ícono de **lápiz** (✏️) en la fila de la beca.
2. Modificá los campos (porcentaje, fechas, motivo).
3. Hacé clic en **"Actualizar"**.

### Cómo desactivar una beca

1. Hacé clic en el ícono de **X** roja en la fila de la beca.
2. Confirmá.
3. La beca deja de aplicarse a las cuotas futuras.

### Funcionalidades clave
- **Filtro de estado**: Filtrá entre becas activas, inactivas, o todas.
- **Aplicación automática**: Al crear o editar una beca con el checkbox activo, el sistema recalcula la cuota del mes actual automáticamente.

---

## 9. Usuarios

### ¿Para qué sirve?
Administrar las cuentas de acceso al sistema. Solo el **Superadmin** puede acceder a este módulo.

### Roles disponibles

| Rol | Qué puede hacer |
|-----|-----------------|
| **Superadmin** | Todo: crear usuarios, gestionar talleres, ver auditoría, etc. |
| **Admin** | Gestionar alumnos, profesores, talleres, cuotas, becas. No puede crear usuarios. |
| **Profesor** | Solo puede tomar asistencia de sus talleres asignados. |

### Cómo crear un usuario

1. Hacé clic en **"+ Nuevo Usuario"**.
2. Completá:
   - **Nombre** *(obligatorio)* — Mínimo 2 caracteres
   - **Email** *(obligatorio)* — Debe ser un email válido y no repetido
   - **Contraseña** *(obligatorio)* — Mínimo 6 caracteres
   - **Rol** *(obligatorio)* — Seleccioná del desplegable
3. Hacé clic en **"Crear"**.

### Cómo editar un usuario

1. Hacé clic en el ícono de **lápiz** (✏️).
2. Podés cambiar nombre, email, rol.
3. Si dejás la contraseña vacía, **no se cambia** — solo se actualiza si escribís una nueva.
4. Hacé clic en **"Actualizar"**.

### Cómo desactivar un usuario

1. Hacé clic en el ícono de **papelera** (🗑️).
2. Confirmá.
3. El usuario ya no puede ingresar al sistema, pero su historial se mantiene.

---

## 10. Auditoría

### ¿Para qué sirve?
Ver un registro detallado de todas las acciones realizadas en el sistema: quién hizo qué, cuándo, y desde dónde.

### Qué muestra

Cada registro incluye:
- **Fecha y hora** de la acción
- **Usuario** que la realizó
- **Acción** (login, crear, editar, eliminar)
- **Entidad** afectada (alumno, taller, cuota, etc.)
- **Detalle** con información específica del cambio

### Cómo filtrar los registros

Usá los filtros disponibles:
- **Por usuario** — Ver solo acciones de un usuario específico
- **Por acción** — Filtrar por tipo (login, crear, editar, eliminar)
- **Por entidad** — Filtrar por módulo (alumno, taller, etc.)
- **Por fecha** — Rango de fechas (desde/hasta)

> 💡 Este módulo es de solo lectura. Los registros no se pueden editar ni eliminar — esto garantiza la integridad de la auditoría.

---

## 11. Métricas

### ¿Para qué sirve?
Visualizar estadísticas avanzadas y tendencias del club: crecimiento, comparativas entre períodos, y rendimiento general.

### Qué vas a encontrar
- Gráficos de tendencia de inscripciones
- Comparativas de recaudación entre meses
- Indicadores de rendimiento por taller

> 💡 Las métricas se actualizan automáticamente con los datos del sistema.

---

## 12. Errores y Validaciones

### Los asteriscos rojos (*)

Cuando ves un campo con un **asterisco rojo** al lado del nombre, significa que es **obligatorio**. No podés guardar el formulario si ese campo está vacío.

### Mensajes de error debajo de los campos

Si completás algo mal, el error aparece **debajo del campo específico** en color rojo:

| Mensaje | Qué significa | Cómo solucionarlo |
|---------|---------------|-------------------|
| *"El nombre es obligatorio"* | Dejaste el campo vacío | Escribí el nombre |
| *"Mínimo 2 caracteres"* | Escribiste muy poco | Agregá más caracteres |
| *"El DNI es obligatorio"* | Falta el DNI | Ingresá el número |
| *"El DNI debe tener al menos 7 dígitos"* | DNI muy corto | Verificá que sea correcto |
| *"Formato de email inválido"* | El email no tiene el formato correcto | Asegurate que tenga @ y un dominio (ej: user@mail.com) |
| *"Mínimo 6 caracteres"* | Contraseña muy corta | Usá una contraseña más larga |
| *"Ingresá un precio válido mayor a 0"* | El precio está vacío o es $0 | Poné un valor positivo |
| *"Debe ser entre 1 y 100"* | El porcentaje de beca está fuera de rango | Poné un valor entre 1 y 100 |
| *"Seleccioná un profesor"* | No elegiste profesor del desplegable | Seleccioná uno |
| *"La fecha de inicio es obligatoria"* | Falta una fecha | Elegí una fecha del calendario |

### Borde rojo en los campos

Cuando un campo tiene un **borde rojo**, significa que tiene un error. Al empezar a corregirlo (escribir o seleccionar algo), el borde rojo y el mensaje desaparecen automáticamente.

### Notificaciones Toast (esquina derecha)

Después de cada acción, aparece una notificación deslizante en la esquina:

| Color | Tipo | Ejemplo |
|-------|------|---------|
| 🟢 **Verde** | Éxito | *"Alumno creado exitosamente"* |
| 🔴 **Rojo** | Error | *"Error al guardar"*, *"Ya existe un alumno con ese DNI"* |

Estas notificaciones desaparecen solas después de unos segundos.

---

## 13. Preguntas Frecuentes (FAQ)

### Generales

**❓ La pantalla está en blanco al entrar a un módulo**
> Es normal por unos segundos — el sistema está cargando los datos. Verás un indicador de carga (spinner girando). Si tarda más de 30 segundos, refrescá la página.

**❓ Mi sesión se cerró sola**
> Las sesiones duran 4 horas por seguridad. Volvé a iniciar sesión normalmente.

**❓ No tengo acceso a un módulo**
> Depende de tu rol. Los profesores solo pueden ver Asistencia. Si necesitás más acceso, pedile al administrador que te suba el rol.

### Alumnos / Profesores

**❓ Quiero dar de baja a un alumno pero aparece un error**
> Verificá que el alumno no tenga cuotas pendientes o inscripciones activas. Primero resolvé esas situaciones y después desactivalo.

**❓ Intenté crear un alumno y dice "Ya existe un alumno con ese DNI"**
> El DNI es único en el sistema. Buscá al alumno existente — puede que esté inactivo. Si es el caso, podés reactivarlo editándolo.

**❓ El campo de DNI no me deja escribir letras**
> Es correcto: el DNI solo acepta números (dígitos). Esto previene errores de carga.

### Talleres

**❓ No puedo inscribir más alumnos a un taller**
> El taller alcanzó su cupo máximo. Podés aumentar el cupo editando el taller, o desinscribir algún alumno para liberar lugar.

**❓ ¿Puedo tener un taller con más de un profesor?**
> Actualmente, cada taller tiene un solo profesor asignado. Para actividades con múltiples profesores, creá talleres separados.

### Tesorería

**❓ ¿Cómo genero las cuotas del mes?**
> Usá el botón "Generar Masivo" — genera cuotas para todas las inscripciones activas de un mes y año específico. Si una cuota ya existe, no la duplica.

**❓ Un alumno me pagó de más, ¿qué hago?**
> Registrá el pago con el monto real que pagó. El sistema mantiene el registro del monto abonado vs. el monto final de la cuota.

**❓ ¿Puedo anular un pago ya registrado?**
> Sí, buscá el pago en la sección de pagos y hacé clic en eliminar. La cuota volverá al estado que corresponda.

**❓ ¿Las becas se aplican automáticamente a las cuotas?**
> Al crear una beca con el checkbox "Aplicar a la cuota actual" activo, sí. Para meses futuros, las cuotas nuevas toman el descuento automáticamente si la beca está activa en ese período.

### Usuarios

**❓ Olvidé mi contraseña, ¿cómo la recupero?**
> Actualmente no hay recuperación automática. Pedile al superadmin que te edite la contraseña desde el módulo de Usuarios.

**❓ ¿Puedo borrar un usuario?**
> No se borran — se desactivan. El historial de acciones queda asociado al usuario para la auditoría.

---

> 📌 **¿Tenés dudas que no están en este manual?** Contactá al administrador del sistema.
