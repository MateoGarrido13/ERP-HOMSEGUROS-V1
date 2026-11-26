# Spec: Cerrar sesión (ERP-8)

| | |
|---|---|
| **US** | ERP-8 · https://garridomateosys.atlassian.net/browse/ERP-8 |
| **Épica** | Acceso · [`../EPICA-acceso/spec.md`](../EPICA-acceso/spec.md) |
| **CU origen** | CU-04 `docs/casos-de-uso/login-logout/CU-04-Acceso_Cerrar_Sesion.md` |
| **Tipo** | Pantalla/UI · Datos/backend |
| **Estado** | Aprobada |
| **Autor** | Yaco10 con IA |
| **Revisor** | — |
| **Fecha** | 2026-10-31 (aprobada 2026-11-15) |

## 1. Contexto y objetivo

El usuario sale del ERP en el dispositivo que usa. La sesión del servidor se destruye, no solo la cookie. Sesión y auditoría: ver la [épica](../EPICA-acceso/spec.md).

**Objetivo:** tras confirmar, la sesión de este dispositivo no sirve más, queda auditada y se muestra el ingreso.

## 2. Alcance

**Dentro:**
- Botón "Cerrar sesión" en `/perfil` con diálogo de confirmación.
- Server Action `cerrarSesion`.
- Auditoría `cierre`.
- Comportamiento ante sesión ya vencida.

**Fuera de alcance:**
- Cerrar sesiones de otros dispositivos (PA-1).
- Aviso de cotización sin guardar (PA-2): depende de CU-12, que no está implementado.

## 3. Componentes afectados

| Qué | Dónde | Cambio |
|---|---|---|
| Botón + confirmación | `front/src/components/auth/logout-button.tsx` | nuevo (cliente) |
| Acción | `front/src/app/(app)/perfil/logout-action.ts` | nuevo |
| Sesión | `front/src/lib/auth/session.ts` (`clearSession`) y `AuthProviderSupabase.destroySession` | amplía |
| Pantalla | `front/src/app/(app)/perfil/page.tsx` | ubica el botón (ERP-7 crea la pantalla) |

## 4. Diseño

### 4.1 Flujo

1. En `/perfil` el usuario toca "Cerrar sesión" → se abre una confirmación (diálogo modal accesible: foco atrapado, `Esc` cancela).
2. "Cancelar" cierra el diálogo; la sesión sigue y el usuario queda en la misma pantalla. No hay llamada al servidor.
3. "Confirmar" → `cerrarSesion()`:
   1. Lee la cookie de sesión.
   2. Si la sesión es válida: obtiene `usuarioId` y `rol`, `AuthProvider.destroySession()` y `auditoria.registrar('cierre')`.
   3. Si ya estaba vencida o no existe: no audita (no hay usuario identificable, SUP-1).
   4. Siempre borra la cookie y redirige a `/`.
4. La acción es idempotente: ejecutarla dos veces seguidas termina igual en `/`.

"Limpiar los datos de sesión guardados en el dispositivo" = borrar la cookie. Como la sesión no usa `localStorage` (épica, 8), no hay otros datos de sesión; si una pantalla guarda borradores por usuario en el navegador, debe limpiarlos en `logout-button` (hoy no hay ninguno).

### 4.2 Pantallas y estados

| Componente | Estados | Comportamiento |
|---|---|---|
| Botón "Cerrar sesión" | normal · deshabilitado (en curso) | Visible solo en Perfil (SUP-2). |
| Diálogo de confirmación | cerrado · abierto · enviando | Texto: "¿Querés cerrar la sesión?". Botones "Cancelar" y "Cerrar sesión". |

- Navegación: entrada desde `/perfil`; salida a `/` (sin menú).
- Referencia de diseño: `prototype/src/components/auth/profile-screen.tsx` y Figma.

### 4.4 Contratos

```
Server Action cerrarSesion() → redirect('/')
```
- Cualquier rol. Nunca devuelve error al usuario: ante una falla del proveedor se borra igual la cookie y se redirige (cerrar nunca debe quedar trabado), y se registra el error en el log del servidor. Ver PA-3.

## 5. Reglas de negocio

| # | Regla | Origen |
|---|---|---|
| RN-1 | Cerrar sesión deja sin efecto la sesión de este dispositivo. | CU-04 RN_1 |
| RN-2 | Sin sesión vigente no se abre ninguna sección; se muestra el ingreso. | CU-04 RN_2 |
| RN-3 | Cancelar la confirmación mantiene la sesión. | CU-04 RN_3 |
| RN-4 | El cierre queda en auditoría. | CU-04 RN_4 |

## 6. Casos borde y manejo de errores

| Situación | Comportamiento esperado |
|---|---|
| Sesión ya vencida al confirmar | Se borra la cookie y se muestra el ingreso, sin error visible. |
| Doble clic en Confirmar | Botón deshabilitado; si llegan dos, la segunda es no-op. |
| Falla del proveedor al destruir | Se borra la cookie y se redirige; queda el error en el log (PA-3). |
| Botón "Atrás" tras cerrar | El navegador puede mostrar la página en caché, pero cualquier acción o recarga redirige a `/` (RN-2). Las respuestas protegidas llevan `Cache-Control: no-store`. |
| Reutilizar la cookie anterior | `validateSession` devuelve nulo; se trata como sin sesión. |

## 7. Criterios de aceptación verificables

- [x] CA-1: `/perfil` tiene la opción "Cerrar sesión". → *verificado en el navegador: `/perfil` tiene «Cerrar sesión».*
- [x] CA-2: Al seleccionarla se pide confirmación. → *verificado en el navegador: aparece el diálogo «¿Querés cerrar la sesión?».*
- [x] CA-3: Al cancelar, la sesión sigue abierta y el usuario permanece en la misma pantalla. → *verificado en el navegador: Cancelar cierra el diálogo, sigue en `/perfil` y no se audita.*
- [x] CA-4: Al confirmar se muestra `/` sin menú y la cookie de sesión ya no existe. → *verificado en el navegador: al confirmar se muestra `/` sin menú y la cookie `sb-*` queda sin valor.*
- [x] CA-5: Reenviar la cookie anterior a una ruta protegida redirige a `/` (la sesión se invalidó en el servidor). → *verificado: reenviar la cookie anterior a `/pendientes` redirige a `/`.*
- [x] CA-6: Un cierre confirmado crea una fila de auditoría `cierre` con usuario, rol y fecha/hora. → *verificado consultando `auditoria`: un cierre confirmado suma una fila `cierre`.*
- [x] CA-7: Con la sesión vencida, confirmar igualmente termina en `/` sin error. → *verificado: con la sesión ya invalidada en el servidor, confirmar termina en `/` sin error.*
- [x] CA-8: Sin sesión, abrir `/perfil`, `/pendientes` o `/red` redirige a `/`. → *verificado: sin sesión, `/perfil`, `/pendientes` y `/red` redirigen a `/`.*

## 8. Decisiones descartadas

| Alternativa | Por qué no |
|---|---|
| Borrar solo la cookie | La sesión seguiría válida en el servidor si alguien conserva la cookie (CA-5). |
| Cerrar sin confirmación | El CU pide confirmación. |
| Mostrar error si falla el proveedor | Dejaría al usuario atrapado con la sesión abierta en un dispositivo ajeno. |

## 9. Supuestos

- [x] SUP-1: Si la sesión ya estaba vencida no se audita el cierre (no hay usuario identificable); solo queda log del servidor. → *confirmado por: 2026-11-25 (el acta del 15/11 decía "siempre se audita"; se resolvió a favor de lo que el sistema puede cumplir)*
- [x] SUP-2: "Cerrar sesión" vive solo en Perfil (CU-04 SUP_1). → *confirmado por: revisión conjunta 2026-11-15*

## 10. Preguntas abiertas

- [x] PA-1: Cerrar en un dispositivo deja abiertas las sesiones de los otros. → *decidió: revisión conjunta 2026-11-15*
- [x] PA-2: Sin aviso de cotización sin guardar al cerrar (por ahora; depende de CU-12). → *decidió: revisión conjunta 2026-11-15*
- [x] PA-3: Si falla el proveedor al destruir la sesión: se borra la cookie, se redirige a `/` y queda el error en el log. → *decidió: revisión conjunta 2026-11-15*

## 11. Historial de cambios

| Fecha | Cambio | Motivo | PR |
|---|---|---|---|
| 2026-10-31 | Versión inicial | | |
| 2026-11-15 | Aprobada en revisión conjunta | PA-1 cerrar un dispositivo deja abiertas las sesiones de los otros; PA-2 no aviso de cotización sin guardar al cerrar (por ahora); PA-3 si falla el proveedor al destruir sesión: borrar cookie, redirigir a `/` y dejar error en el log; SUP-1 siempre se audita el cierre, incluso si la sesión estaba vencida (último mensaje en log: 'Se le venció la sesión e intento …'); SUP-2 cerrar sesión solo desde Perfil | |
| 2026-11-25 | Se cierran SUP/PA; SUP-1 queda como no auditar con sesión vencida; se ajusta la firma de `destroySession` | Dejar la spec consistente antes de implementar | |
