# Plan: Cerrar sesión (ERP-8)

| | |
|---|---|
| **Spec** | [`spec.md`](spec.md) (versión aprobada: pendiente) |
| **US** | ERP-8 |
| **Estado** | Borrador |
| **Autor** | Yaco10 con IA |
| **Revisor** | — |

## 1. Resumen del enfoque

Cambio chico (2 a 3 tareas): la acción en el servidor y el botón con confirmación sobre la pantalla de perfil de ERP-7. Se verifica con un recorrido completo ingreso → cierre → reutilizar cookie.

## 2. Antes de empezar

- [ ] Spec de ERP-8 en estado `Aprobada`, sin supuestos ni preguntas abiertas (hoy: SUP-1, SUP-2, PA-1 a PA-3).
- [ ] Rama creada: `erp-8-cerrar-sesion`
- [ ] **ERP-5 completado**, y la pantalla `/perfil` de **ERP-7** disponible (T-4 de ERP-7 como mínimo).

## 3. Tareas

### Fase 1 – Lógica

- [ ] **T-1 – Acción de cerrar sesión**
  - **Qué:** `cerrarSesion`: lee la cookie; si la sesión es válida, `destroySession` y auditoría `cierre`; siempre borra la cookie y redirige a `/`. Idempotente; ante falla del proveedor, borra igual y deja el error en el log.
  - **Archivos:** `front/src/app/(app)/perfil/logout-action.ts` (nuevo), `front/src/lib/auth/session.ts` (modificar: `clearSession`)
  - **Depende de:** ERP-5 T-6, T-7
  - **Cubre:** CA-4, CA-5, CA-6, CA-7
  - **Verificación:** test/script: con sesión → fila `cierre` y `validateSession` nulo; con sesión vencida o sin cookie → sin fila y sin error; segunda ejecución → igual resultado.

### Fase 2 – Interfaz

- [ ] **T-2 – Botón y diálogo de confirmación**
  - **Qué:** `LogoutButton` (cliente) con diálogo modal (foco atrapado, `Esc` cancela); "Cancelar" cierra sin llamar al servidor; "Cerrar sesión" invoca la acción con botón deshabilitado mientras corre. Se ubica en `/perfil`.
  - **Archivos:** `front/src/components/auth/logout-button.tsx` (nuevo), `front/src/components/auth/profile-screen.tsx` (modificar: ubicar el botón)
  - **Depende de:** T-1, ERP-7 T-4
  - **Cubre:** CA-1, CA-2, CA-3, CA-4
  - **Verificación:** manual: cancelar mantiene la sesión y la pantalla; confirmar lleva a `/` sin menú.

### Fase 3 – Casos borde y pulido

- [ ] **T-3 – Rutas protegidas sin caché y recorrido de seguridad**
  - **Qué:** encabezado `Cache-Control: no-store` en las respuestas del grupo `(app)`; verificar que tras cerrar, reutilizar la cookie y usar "Atrás" no muestran datos nuevos.
  - **Archivos:** `front/next.config.ts` (modificar: headers) o `front/src/app/(app)/layout.tsx`
  - **Depende de:** T-2
  - **Cubre:** CA-5, CA-8
  - **Verificación:** copiar la cookie antes de cerrar, cerrar, reenviarla con `curl -I localhost:3000/perfil --cookie …` → redirige a `/`; sin cookie, `/perfil`, `/pendientes` y `/red` redirigen a `/`.

## 4. Trazabilidad con la spec

| Criterio de la spec | Tareas |
|---|---|
| CA-1 | T-2 |
| CA-2 | T-2 |
| CA-3 | T-2 |
| CA-4 | T-1, T-2 |
| CA-5 | T-1, T-3 |
| CA-6 | T-1 |
| CA-7 | T-1 |
| CA-8 | T-3 |

## 5. Riesgos y puntos de atención

| Riesgo | Mitigación / cómo detectarlo |
|---|---|
| Borrar solo la cookie y dejar viva la sesión del servidor | CA-5 lo verifica con la cookie reutilizada. |
| `profile-screen.tsx` lo modifica también ERP-7 | Mergear ERP-7 primero o coordinar el conflicto. |
| `Cache-Control` global afecta rendimiento | Limitar al grupo `(app)`. |

## 6. Validación final

- [ ] `npm run lint` sin errores
- [ ] `npm run build` pasa
- [ ] Todos los criterios de aceptación de la spec recorridos y marcados
- [ ] Spec actualizada si el diseño cambió durante la implementación
- [ ] PR abierto, revisado por el otro integrante

## 7. Bitácora de ejecución

| Fecha | Tarea | Nota |
|---|---|---|
