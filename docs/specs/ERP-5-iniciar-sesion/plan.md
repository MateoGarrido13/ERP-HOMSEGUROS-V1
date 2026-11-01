# Plan: Iniciar sesión en el ERP (ERP-5)

| | |
|---|---|
| **Spec** | [`spec.md`](spec.md) (versión aprobada: pendiente) y [`../EPICA-acceso/spec.md`](../EPICA-acceso/spec.md) |
| **US** | ERP-5 |
| **Estado** | Borrador |
| **Autor** | Yaco10 con IA |
| **Revisor** | — |

## 1. Resumen del enfoque

Este plan construye también los cimientos compartidos de la épica (tipos, proveedor de desarrollo, sesión, DAL, proxy, layouts y componentes base), porque ERP-5 es la primera historia en ejecutarse. ERP-6, 7, 8 y 17 los reutilizan. Orden: lógica pura → proveedor y sesión → protección de rutas → UI → pulido. Todo con el proveedor en memoria; la base real llega con ERP-9.

## 2. Antes de empezar

- [ ] Spec de ERP-5 y spec de épica en estado `Aprobada`, sin supuestos ni preguntas abiertas. **Hoy hay abiertas** PA-1, PA-2, PA-3, PA-4, PA-5, PA-6 y PA-7 de la épica; no deberían bloquear la parte de desarrollo (se pueden aprobar con valores provisorios explícitos), pero PA-7 bloquea producción.
- [ ] Rama creada: `erp-5-iniciar-sesion`
- [ ] Leer `front/node_modules/next/dist/docs/01-app/02-guides/authentication.md` y `.../01-getting-started/16-proxy.md`.
- [ ] PA-6 resuelta (¿Vitest?). Si no, las tareas con "test" se verifican a mano.

## 3. Tareas

### Fase 1 – Datos y lógica

- [ ] **T-1 – Configurar tests de lógica pura** *(solo si PA-6 = sí)*
  - **Qué:** agregar Vitest y script `test`.
  - **Archivos:** `front/package.json`, `front/vitest.config.ts` (nuevo)
  - **Depende de:** —
  - **Cubre:** soporte de verificación de CA-2, CA-3
  - **Verificación:** `npm run test` corre y pasa con un test vacío de ejemplo.

- [ ] **T-2 – Definir tipos de dominio**
  - **Qué:** `Rol`, `Usuario`, `UsuarioPublico`, `AccionAuditoria`, `RegistroAuditoria`, resultado del proveedor.
  - **Archivos:** `front/src/lib/auth/types.ts` (nuevo)
  - **Depende de:** —
  - **Cubre:** CA-4, CA-5 (épica)
  - **Verificación:** `npx tsc --noEmit` sin errores.

- [ ] **T-3 – Portar validaciones**
  - **Qué:** `emailFieldError`, `phoneFieldError`, `passwordPolicyError`, `inicioDelRol(rol)`, normalización de email, con los mensajes de la spec.
  - **Archivos:** `front/src/lib/auth/validation.ts` (nuevo), `front/src/lib/auth/validation.test.ts` (nuevo, si hay T-1)
  - **Depende de:** T-2
  - **Cubre:** CA-2
  - **Verificación:** los tests cubren vacío, formato inválido, válido y mayúsculas; o comparación manual con `prototype/src/lib/access.ts`.

- [ ] **T-4 – Definir interfaces del proveedor y repositorios**
  - **Qué:** `AuthProvider`, `UsuarioRepo`, `AuditoriaRepo` según épica 4.4, y un único punto de selección.
  - **Archivos:** `front/src/lib/auth/provider.ts` (nuevo), `front/src/lib/audit/repo.ts` (nuevo)
  - **Depende de:** T-2
  - **Cubre:** CA-4, CA-5 (épica)
  - **Verificación:** `npx tsc --noEmit`; `provider.ts` no importa nada de bases de datos.

- [ ] **T-5 – Implementar proveedor de desarrollo**
  - **Qué:** usuarios y auditoría en memoria del servidor, con las 3 cuentas de ejemplo; `signIn`, `createSession`, `validateSession`, `destroySession`; sesiones con identificador aleatorio. Los métodos de recuperación/cambio quedan lanzando "no implementado" hasta ERP-6.
  - **Archivos:** `front/src/lib/auth/provider.dev.ts` (nuevo), `front/src/lib/audit/repo.dev.ts` (nuevo)
  - **Depende de:** T-3, T-4
  - **Cubre:** CA-3, CA-4, CA-6, RN-2
  - **Verificación:** test (o script) de `signIn`: ok con cuenta válida; `credenciales` con email desconocido y con contraseña errónea; `inactiva` con cuenta suspendida (agregar una cuenta suspendida de ejemplo).

### Fase 2 – Sesión y protección

- [ ] **T-6 – Cookie de sesión y DAL**
  - **Qué:** `setSession`/`clearSession` (cookie `httpOnly`, `sameSite=lax`, `secure` en producción); `verifySession()` con `cache` de React que valida contra el proveedor y redirige a `/` si no hay sesión; `getSessionOptional()`.
  - **Archivos:** `front/src/lib/auth/session.ts` (nuevo), `front/src/lib/auth/dal.ts` (nuevo)
  - **Depende de:** T-5
  - **Cubre:** CA-1, CA-2 (épica)
  - **Verificación:** con un `curl -I` a una ruta protegida sin cookie se obtiene redirección a `/` (después de T-8); inspección de la cookie en el navegador: `HttpOnly` y valor opaco.

- [ ] **T-7 – Auditoría de ingreso**
  - **Qué:** helper `registrarAuditoria(usuarioId, rol, accion)` usado por las acciones.
  - **Archivos:** `front/src/lib/audit/index.ts` (nuevo)
  - **Depende de:** T-4, T-5
  - **Cubre:** CA-6 (ERP-5), CA-6 (épica)
  - **Verificación:** test/script: tras `registrarAuditoria` hay una fila con usuario, rol, acción y fecha; sin campo de contraseña.

- [ ] **T-8 – Proxy**
  - **Qué:** `proxy.ts` con chequeo optimista: sin cookie → `/`; con cookie en `/` → inicio del rol solo si se puede inferir sin consultar base (si no, la redirección la hace la página). `matcher` que excluye `_next`, estáticos y favicon.
  - **Archivos:** `front/src/proxy.ts` (nuevo)
  - **Depende de:** T-6
  - **Cubre:** CA-1 (épica), RN-5
  - **Verificación:** `npm run dev` + `curl -I localhost:3000/perfil` redirige a `/`; `/` responde 200.

### Fase 3 – Interfaz

- [ ] **T-9 – Componentes base de UI**
  - **Qué:** `TextField`, `BrandButton`, `SurfaceCard`, `ScreenTitle`, portados del prototipo con Tailwind v4 (sin importar desde `prototype/`; copiar y adaptar). Copiar `hom-logo.png` a `front/public/`.
  - **Archivos:** `front/src/components/ui/*` (nuevos), `front/public/hom-logo.png` (nuevo)
  - **Depende de:** —
  - **Cubre:** CA-1
  - **Verificación:** `npm run lint` sin errores; los componentes se ven en la pantalla de T-11.

- [ ] **T-10 – Layouts (público / app) y destinos por rol**
  - **Qué:** `(publico)/layout.tsx` sin menú; `(app)/layout.tsx` con menú por rol y `verifySession()`; páginas mínimas `(app)/pendientes/page.tsx` y `(app)/red/page.tsx` como destino (se reemplazan en ERP-17 y CU-40); guardia de ruta por rol (CA-3 épica).
  - **Archivos:** `front/src/app/(publico)/layout.tsx`, `front/src/app/(app)/layout.tsx`, `front/src/components/layout/app-shell.tsx`, `front/src/app/(app)/pendientes/page.tsx`, `front/src/app/(app)/red/page.tsx` (todos nuevos)
  - **Depende de:** T-6, T-9
  - **Cubre:** CA-3 (épica), CA-5
  - **Verificación:** `npm run build` pasa; el menú de PAS y el de directivo difieren; `/red` con sesión de PAS redirige a `/pendientes`.

- [ ] **T-11 – Pantalla y acción de ingreso**
  - **Qué:** formulario con `useActionState`; acción `iniciarSesion` según spec 4.1; redirección por rol; si hay sesión, `/` redirige.
  - **Archivos:** `front/src/app/(publico)/page.tsx` (reemplaza `front/src/app/page.tsx`), `front/src/app/(publico)/actions.ts`, `front/src/components/auth/login-form.tsx`
  - **Depende de:** T-3, T-5, T-6, T-7, T-10
  - **Cubre:** CA-1 a CA-9
  - **Verificación:** recorrido manual de los 9 CA con las cuentas de ejemplo; contraseña ausente de la URL y del HTML tras error.

### Fase 4 – Pulido

- [ ] **T-12 – Accesibilidad y estados**
  - **Qué:** `aria-invalid`/`aria-describedby` en errores, foco al primer campo con error, botón deshabilitado al enviar, `autocomplete`.
  - **Archivos:** `front/src/components/auth/login-form.tsx`, `front/src/components/ui/text-field.tsx`
  - **Depende de:** T-11
  - **Cubre:** CA-2, estados de 4.2
  - **Verificación:** navegación solo con teclado; lector de pantalla anuncia el error.

## 4. Trazabilidad con la spec

| Criterio de la spec | Tareas |
|---|---|
| CA-1 | T-9, T-10, T-11 |
| CA-2 | T-3, T-11, T-12 |
| CA-3 | T-5, T-11 |
| CA-4 | T-5, T-11 |
| CA-5 | T-10, T-11 |
| CA-6 | T-7, T-11 |
| CA-7 | T-8, T-11 |
| CA-8 | T-11 |
| CA-9 | T-11 |
| CA-1 a CA-6 de la épica | T-2, T-4, T-6, T-7, T-8, T-10 |

## 5. Riesgos y puntos de atención

| Riesgo | Mitigación / cómo detectarlo |
|---|---|
| Next.js de esta versión cambia convenciones (`proxy`, `cookies()` asíncrono) | Leer las guías en `node_modules/next/dist/docs/` antes de T-6 y T-8; `npm run build` en cada fase. |
| El proveedor en memoria pierde estado al reiniciar el servidor o entre instancias | Es solo para desarrollo; documentarlo en `provider.dev.ts`. No usar en producción. |
| ERP-9 elige un proveedor con un modelo de sesión distinto | La interfaz aísla el cambio; revisar SUP-2 de la épica cuando ERP-9 cierre. |
| Copiar cuentas con contraseñas de ejemplo | Solo en `provider.dev.ts`, con aviso; nunca datos reales. |
| Deriva visual respecto de Figma | Contrastar con Figma al terminar T-11. |

## 6. Validación final

- [ ] `npm run lint` sin errores
- [ ] `npm run build` pasa
- [ ] Todos los criterios de aceptación de la spec recorridos y marcados
- [ ] Spec actualizada si el diseño cambió durante la implementación
- [ ] PR abierto, revisado por el otro integrante

## 7. Bitácora de ejecución

| Fecha | Tarea | Nota |
|---|---|---|
