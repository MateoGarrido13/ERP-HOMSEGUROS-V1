# Plan: Cerrar sesión (ERP-8)

| | |
|---|---|
| **Spec** | [`spec.md`](spec.md) (aprobada 2026-11-15; reconciliada 2026-11-25) |
| **US** | ERP-8 |
| **Estado** | Aprobado |
| **Autor** | Yaco10 con IA |
| **Revisor** | — |

## 1. Resumen del enfoque

Cambio chico (2 a 3 tareas): la acción en el servidor y el botón con confirmación sobre la pantalla de perfil de ERP-7. Se verifica con un recorrido completo ingreso → cierre → reutilizar cookie.

## 2. Antes de empezar

- [x] Spec de ERP-8 en estado `Aprobada`, sin supuestos ni preguntas abiertas (reconciliada el 2026-11-25).
- [ ] Rama creada: `erp-8-cerrar-sesion`
- [x] **ERP-5 completado**.
- [ ] Pantalla `/perfil` de **ERP-7** disponible (T-4 de ERP-7 como mínimo). Hoy `/perfil` es un placeholder con solo el botón.
- **Nota:** `logout-action.ts`, `logout-button.tsx` y el `Cache-Control: no-store` en `proxy.ts` ya existen (adelantados en ERP-5). Las tareas de este plan son **verificarlos contra la spec y completar lo que falte**; no se marcan hechas hasta observar cada criterio.

## 3. Tareas

### Fase 1 – Lógica

- [ ] **T-1 – Acción de cerrar sesión**
  - **Qué:** `cerrarSesion`: lee la cookie; si la sesión es válida, `destroySession` y auditoría `cierre`; siempre borra la cookie y redirige a `/`. Idempotente; ante falla del proveedor, borra igual y deja el error en el log.
  - **Archivos:** `front/src/app/(app)/perfil/logout-action.ts` (nuevo), `front/src/lib/auth/session.ts` (modificar: `clearSession`)
  - **Depende de:** ERP-5 T-6, T-7
  - **Cubre:** CA-4, CA-5, CA-6, CA-7
  - **Estado de código:** existe; falta test y confirmar que `destroySession` invalida la sesión en el servidor (CA-5).
  - **Verificación:** test/script: con sesión → fila `cierre` y `validateSession` nulo; con sesión vencida o sin cookie → sin fila y sin error; segunda ejecución → igual resultado.

### Fase 2 – Interfaz

- [ ] **T-2 – Botón y diálogo de confirmación**
  - **Qué:** `LogoutButton` (cliente) con diálogo modal (foco atrapado, `Esc` cancela); "Cancelar" cierra sin llamar al servidor; "Cerrar sesión" invoca la acción con botón deshabilitado mientras corre. Se ubica en `/perfil`.
  - **Archivos:** `front/src/components/auth/logout-button.tsx` (nuevo), `front/src/components/auth/profile-screen.tsx` (modificar: ubicar el botón)
  - **Depende de:** T-1, ERP-7 T-4
  - **Cubre:** CA-1, CA-2, CA-3, CA-4
  - **Estado de código:** existe (diálogo con foco atrapado y `Esc`); falta ubicarlo en el perfil de ERP-7.
  - **Verificación:** manual: cancelar mantiene la sesión y la pantalla; confirmar lleva a `/` sin menú.

### Fase 3 – Casos borde y pulido

- [ ] **T-3 – Rutas protegidas sin caché y recorrido de seguridad**
  - **Qué:** encabezado `Cache-Control: no-store` en las respuestas del grupo `(app)`; verificar que tras cerrar, reutilizar la cookie y usar "Atrás" no muestran datos nuevos.
  - **Archivos:** `front/src/proxy.ts` (ya fija `Cache-Control: no-store`; verificar que cubre el grupo `(app)` y no las estáticas)
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
