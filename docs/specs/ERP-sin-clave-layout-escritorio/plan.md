# Plan: Layout de escritorio para las pantallas del PAS (sin clave Jira)

| | |
|---|---|
| **Spec** | [`spec.md`](spec.md) (versión aprobada: 2026-11-26) |
| **US** | Sin clave Jira todavía |
| **Estado** | Aprobado |
| **Autor** | Yaco10 con IA |
| **Revisor** | Yaco10 (autoaprobado, proyecto individual) |

## 1. Resumen del enfoque

Se construye de lo común a lo particular: primero el contenedor de la app (menú lateral y punto de corte), que usan todas las pantallas autenticadas; después acceso (pantallas sin sesión), perfil y pendientes, de a una. Cada tarea cambia solo clases y estructura de presentación, así que la lógica y los tests existentes no se tocan. Se valida en el navegador a 390, 768, 1024 y 1440 px.

## 2. Antes de empezar

- [x] Spec en estado `Aprobada`, sin supuestos ni preguntas abiertas.
- [ ] Rama creada: `feat/layout-escritorio`, a partir de `main` con la integración de Acceso y Pendientes ya mergeada (la rama `integracion/acceso-pendientes` trae el código sobre el que se trabaja; en `main` todavía no está).
- [ ] Dependencia: el PR de integración de ERP-6, 7, 8 y 17 está mergeado a `main`.
- [x] CA-12 (template de spec con el frame de escritorio) resuelto en el mismo PR de la spec, no en este plan.
- [ ] Leer la guía de Tailwind v4 y de Next en `front/node_modules/next/dist/docs/` antes de tocar layouts y componentes de cliente.

## 3. Tareas

> Orden = orden de ejecución. Marcar `[x]` al terminar cada una. Tamaños de viewport de verificación: 390, 768, 1024 y 1440 px.

### Fase 1 – Base común

- [ ] **T-1 – Alinear el tamaño de página de Pendientes con el punto de corte de 1024 px**
  - **Qué:** hoy `CONSULTA_DESKTOP` es `(min-width: 768px)`; pasa a `(min-width: 1024px)` para que 5/10 por página cambien en el mismo ancho que el layout (SUP-1, RN-2).
  - **Archivos:** `front/src/components/pendientes/pager.tsx`
  - **Depende de:** —
  - **Cubre:** RN-2, CA-8
  - **Verificación:** a 1023 px se ven 5 por página y a 1024 px, 10; `npm run test`, `tsc` y `npm run lint` pasan.

- [ ] **T-2 – Menú lateral en escritorio y barra inferior en mobile**
  - **Qué:** `AppShell` muestra, desde 1024 px, un menú lateral de 240 px con el logo arriba y los ítems del rol; por debajo, la barra inferior actual. El ítem de la pantalla actual va resaltado y con `aria-current="page"`; como eso requiere conocer la ruta, la lista de ítems pasa a un componente de cliente nuevo. Ítems según rol: PAS = Pendientes y Perfil; directivo y administrativo = Red y Perfil.
  - **Archivos:** `front/src/components/layout/app-shell.tsx` (modificar), `front/src/components/layout/app-nav.tsx` (nuevo, cliente)
  - **Depende de:** —
  - **Cubre:** CA-1, CA-2, RN-3
  - **Verificación:** con Martín, Laura y Pablo: a 1024 px y más se ve el menú lateral y no la barra inferior; a menos, al revés; el ítem activo está resaltado (inspeccionar `aria-current`); `tsc` y `lint` pasan.

### Fase 2 – Acceso

- [ ] **T-3 – Contenedor de acceso de dos paneles y login**
  - **Qué:** componente compartido con panel izquierdo de marca (color de fondo suave y mensaje "Bienvenido al Portal PAS", sin imagen, PA-1) y panel derecho con el formulario centrado de 360 px y el pie. Desde 1024 px reemplaza la tarjeta centrada actual (`sm:`); por debajo, el login queda igual que hoy. Se aplica al login, con y sin error.
  - **Archivos:** `front/src/components/layout/auth-shell.tsx` (nuevo), `front/src/app/(publico)/page.tsx` (modificar)
  - **Depende de:** —
  - **Cubre:** CA-3
  - **Verificación:** a 1440 px, dos paneles con el formulario centrado; a 390 px, idéntico a antes; el error de credenciales se ve bien en ambos; los tests existentes pasan.

- [ ] **T-4 – Recuperar contraseña en dos paneles, "Volver" y textos**
  - **Qué:** se aplica el contenedor de T-3 a recuperar 1, 2 y 3; en escritorio llevan el enlace "Volver" arriba a la izquierda del panel derecho. La pantalla "Revisá tu correo" dice que el enlace vence en 24 horas, y la ayuda de nueva contraseña usa `PASSWORD_POLICY_HINT` (la política completa).
  - **Archivos:** `front/src/app/(publico)/recuperar/page.tsx`, `front/src/app/(publico)/recuperar/nueva/page.tsx`, `front/src/components/auth/recover-form.tsx`, `front/src/components/auth/reset-password-form.tsx`
  - **Depende de:** T-3
  - **Cubre:** CA-3, CA-4
  - **Verificación:** recorrer los tres pasos a 1440 y 390 px; el texto de vigencia dice "24 horas"; la ayuda de contraseña muestra la política completa; el flujo de recuperar sigue funcionando de punta a punta con Mailpit.

### Fase 3 – Perfil

- [ ] **T-5 – Perfil (ver) con avatar y botones en una fila**
  - **Qué:** en escritorio, avatar circular con las iniciales de nombre y apellido (SUP-3), tarjeta de datos de 560 px y los botones Editar, Cambiar contraseña y Cerrar sesión en una fila. La función que calcula las iniciales lleva su test.
  - **Archivos:** `front/src/components/auth/profile-screen.tsx`, `front/src/lib/auth/validation.ts` (función de iniciales), `front/src/lib/auth/validation.test.ts`
  - **Depende de:** T-2
  - **Cubre:** CA-5
  - **Verificación:** test de iniciales (nombre compuesto, un solo nombre, tildes); a 1440 px se ve como el frame "PAS PC · Perfil · Ver"; a 390 px sin cambios.

- [ ] **T-6 – Editar perfil en dos columnas y cambiar contraseña con el mismo tratamiento**
  - **Qué:** en escritorio, el formulario de edición va en dos columnas (Nombre y Teléfono; Rol y Matrícula; Organización) con el teléfono en tres partes; el enlace de vuelta a Perfil queda arriba. La pantalla de cambiar contraseña usa el mismo estilo: formulario de 360 px alineado a la izquierda con los botones debajo (SUP-2). Guardar, cancelar y errores no cambian.
  - **Archivos:** `front/src/components/auth/profile-screen.tsx`, `front/src/components/auth/phone-field.tsx`, `front/src/components/auth/change-password-form.tsx`, `front/src/app/(app)/perfil/contrasena/page.tsx`
  - **Depende de:** T-5
  - **Cubre:** CA-6
  - **Verificación:** editar y guardar un perfil válido; provocar el error de nombre vacío y de teléfono corto a 1440 y 390 px; cambiar la contraseña de Juan; los tests existentes pasan sin modificarse.

- [ ] **T-7 – Diálogo de cerrar sesión centrado**
  - **Qué:** en escritorio el diálogo es un modal centrado de 420 px con fondo atenuado; Cancelar y Escape lo cierran sin cerrar sesión; conserva el foco atrapado.
  - **Archivos:** `front/src/components/auth/logout-button.tsx`
  - **Depende de:** T-5
  - **Cubre:** CA-7
  - **Verificación:** abrir el diálogo a 1440 y 390 px; Escape y Cancelar lo cierran; Cerrar sesión lleva a `/` y cierra solo esa sesión.

### Fase 4 – Pendientes

- [ ] **T-8 – Avisos y Leads lado a lado**
  - **Qué:** en escritorio, dos columnas con contador ("3 avisos", "2 leads") y 10 por página; sin registros, un mensaje de vacío por columna. En mobile, apilados y 5 por página, como hoy.
  - **Archivos:** `front/src/components/pendientes/pending-board.tsx`, `front/src/components/pendientes/notice-card.tsx`, `front/src/components/pendientes/lead-card.tsx`, `front/src/components/pendientes/section-skeleton.tsx`
  - **Depende de:** T-1, T-2
  - **Cubre:** CA-8, CA-9
  - **Verificación:** con Martín (más de 10 registros) a 1440 px hay dos columnas con paginación de 10; con un PAS sin datos se ven los dos mensajes de vacío; a 390 px, igual que antes; cruzar los 1024 px con la página 2 elegida no repite ni pierde registros (caso borde de la spec).

### Fase 5 – Cierre

- [ ] **T-9 – Verificación responsive y de regresión**
  - **Qué:** recorrer todas las pantallas a 390, 768, 1024 y 1440 px buscando scroll horizontal, y confirmar que mobile no cambió.
  - **Archivos:** — (solo ajustes menores si aparece algún defecto, anotados en la bitácora)
  - **Depende de:** T-1 a T-8
  - **Cubre:** CA-10, CA-11
  - **Verificación:** ninguna pantalla scrollea en horizontal; `tsc`, `npm run test` (82 tests) y `npm run lint` sin errores; a 390 px las pantallas se ven como antes.

## 4. Trazabilidad con la spec

| Criterio de la spec | Tareas |
|---|---|
| CA-1 | T-2 |
| CA-2 | T-2 |
| CA-3 | T-3, T-4 |
| CA-4 | T-4 |
| CA-5 | T-5 |
| CA-6 | T-6 |
| CA-7 | T-7 |
| CA-8 | T-1, T-8 |
| CA-9 | T-8 |
| CA-10 | T-9 |
| CA-11 | T-9 |
| CA-12 | Resuelto en el PR de la spec (template actualizado) |

## 5. Riesgos y puntos de atención

| Riesgo | Mitigación / cómo detectarlo |
|---|---|
| Hoy el tamaño de página de Pendientes cambia a 768 px y el layout cambia a 1024 px: entre ambos anchos quedaría inconsistente | T-1 lo alinea primero y se prueba a 1023 y 1024 px |
| `AppShell` envuelve todas las pantallas autenticadas: un error ahí afecta Perfil, Pendientes y Red | T-2 se prueba con los tres roles antes de seguir |
| El login hoy centra una tarjeta desde `sm:` (feedback del 2026-11-13); al pasar a dos paneles ese comportamiento cambia | T-3 conserva el aspecto mobile y se revisa a 640 y 768 px |
| Los cambios en `profile-screen.tsx` los tocan T-5 y T-6 | Se ejecutan en ese orden y cada uno corre los tests de perfil |
| El pager usa `matchMedia` en el cliente: puede haber parpadeo de tamaño al hidratar | Verificar a 1440 px que no cambie de 5 a 10 visiblemente al cargar; si ocurre, anotarlo en la bitácora |
| El menú lateral muestra solo ítems implementados, y el diseño muestra más | Es deliberado (decisión 2026-11-26): no es un defecto |

## 6. Validación final

- [ ] `npm run lint` sin errores
- [ ] `npm run build` pasa
- [ ] Todos los criterios de aceptación de la spec recorridos y marcados
- [ ] Spec actualizada si el diseño cambió durante la implementación
- [ ] PR abierto, revisado por <persona>

## 7. Bitácora de ejecución

| Fecha | Tarea | Nota |
|---|---|---|
| 2026-11-26 | — | Plan aprobado por Yaco10. Plan en borrador. Hallazgo al planificar: `pager.tsx` ya usa 768 px para el tamaño de página, y la spec fija 1024 px (T-1) |
