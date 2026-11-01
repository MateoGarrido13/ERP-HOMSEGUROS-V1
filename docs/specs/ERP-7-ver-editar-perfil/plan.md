# Plan: Ver y editar mi perfil (ERP-7)

| | |
|---|---|
| **Spec** | [`spec.md`](spec.md) (versión aprobada: pendiente) |
| **US** | ERP-7 |
| **Estado** | Borrador |
| **Autor** | Yaco10 con IA |
| **Revisor** | — |

## 1. Resumen del enfoque

Primero repositorio y validación, luego la acción, luego la pantalla (lectura → edición). El botón de "Cerrar sesión" lo agrega ERP-8 sobre esta pantalla.

## 2. Antes de empezar

- [ ] Spec de ERP-7 en estado `Aprobada`, sin supuestos ni preguntas abiertas (hoy: SUP-1 a SUP-3, PA-1 y PA-2).
- [ ] Rama creada: `erp-7-ver-editar-perfil`
- [ ] **ERP-5 completado** (sesión, DAL, layout con menú, componentes base).

## 3. Tareas

### Fase 1 – Datos y lógica

- [ ] **T-1 – Repositorio de usuario**
  - **Qué:** `UsuarioRepo.porId` y `actualizarPerfil(id, { nombre, telefono })` en la implementación de desarrollo; solo actualiza esos dos campos.
  - **Archivos:** `front/src/lib/auth/usuario-repo.ts` (nuevo: interfaz), `front/src/lib/auth/usuario-repo.dev.ts` (nuevo)
  - **Depende de:** ERP-5 T-4, T-5
  - **Cubre:** CA-4, CA-6, RN-2
  - **Verificación:** test/script: tras `actualizarPerfil` cambian nombre y teléfono; rol, matrícula, organización y email no.

- [ ] **T-2 – Validación de perfil**
  - **Qué:** validar nombre (no vacío, recortado) y teléfono (10 dígitos ignorando espacios y guiones).
  - **Archivos:** `front/src/lib/auth/validation.ts` (modificar), `front/src/lib/auth/validation.test.ts` (si hay tests)
  - **Depende de:** ERP-5 T-3
  - **Cubre:** CA-3
  - **Verificación:** casos: nombre vacío, solo espacios, teléfono de 9/10/11 dígitos, `11 4321-9088` válido.

### Fase 2 – Acción

- [ ] **T-3 – Acción de guardar perfil**
  - **Qué:** `guardarPerfil` con `verifySession()`; ignora cualquier campo que no sea `nombre` y `telefono`; actualiza, audita `perfil`, revalida `/perfil`.
  - **Archivos:** `front/src/app/(app)/perfil/actions.ts` (nuevo)
  - **Depende de:** T-1, T-2, ERP-5 T-7
  - **Cubre:** CA-3, CA-4, CA-6, CA-7
  - **Verificación:** enviar un formulario con `rol=directivo` y `usuarioId` ajeno: no cambia nada ajeno; una fila de auditoría `perfil` tras un guardado válido.

### Fase 3 – Interfaz

- [ ] **T-4 – Pantalla de perfil en modo lectura**
  - **Qué:** Server Component que carga el usuario de la sesión y renderiza `NOMBRE`, `ROL`, `MATRÍCULA` (si aplica), `ORGANIZACIÓN`, `TELÉFONO`, y el acceso a "Cambiar contraseña".
  - **Archivos:** `front/src/app/(app)/perfil/page.tsx` (nuevo), `front/src/components/auth/profile-screen.tsx` (nuevo)
  - **Depende de:** T-1, ERP-5 T-10
  - **Cubre:** CA-1, CA-8, CA-9
  - **Verificación:** ingresar con las 3 cuentas de ejemplo: datos correctos; directivo/administrativo sin fila de matrícula.

- [ ] **T-5 – Modo edición**
  - **Qué:** alternar lectura/edición en cliente; solo `NOMBRE` y `TELÉFONO` editables; "Guardar" con `useActionState`; "Cancelar" restaura sin llamar al servidor; errores por campo; vuelve a lectura tras éxito.
  - **Archivos:** `front/src/components/auth/profile-screen.tsx` (modificar)
  - **Depende de:** T-3, T-4
  - **Cubre:** CA-2, CA-3, CA-4, CA-5
  - **Verificación:** recorrido manual; tras guardar y recargar el dato persiste (mientras corra el servidor de desarrollo).

### Fase 4 – Pulido

- [ ] **T-6 – Estados y accesibilidad**
  - **Qué:** botón deshabilitado al guardar, mensajes de error asociados a campos, foco al editar, mensaje general de falla de escritura.
  - **Archivos:** `front/src/components/auth/profile-screen.tsx`
  - **Depende de:** T-5
  - **Cubre:** 4.2 y 6 de la spec
  - **Verificación:** teclado y lector de pantalla; simular falla del repositorio y comprobar el mensaje y que se conserva lo escrito.

## 4. Trazabilidad con la spec

| Criterio de la spec | Tareas |
|---|---|
| CA-1 | T-4 |
| CA-2 | T-5 |
| CA-3 | T-2, T-3, T-5 |
| CA-4 | T-1, T-3, T-5 |
| CA-5 | T-5 |
| CA-6 | T-1, T-3 |
| CA-7 | T-3 |
| CA-8 | T-4 |
| CA-9 | T-4 |

## 5. Riesgos y puntos de atención

| Riesgo | Mitigación / cómo detectarlo |
|---|---|
| `profile-screen` es compartido con ERP-8 (botón de cerrar sesión) | Coordinar el orden; ERP-8 solo agrega el botón sin tocar la edición. |
| Persistencia en memoria se pierde al reiniciar | Aceptado para desarrollo; se resuelve con ERP-9. |
| Nombre usado luego en propuestas | Anotar en la spec del multicotizador que debe leerlo del usuario de sesión (PA-2). |

## 6. Validación final

- [ ] `npm run lint` sin errores
- [ ] `npm run build` pasa
- [ ] Todos los criterios de aceptación de la spec recorridos y marcados
- [ ] Spec actualizada si el diseño cambió durante la implementación
- [ ] PR abierto, revisado por el otro integrante

## 7. Bitácora de ejecución

| Fecha | Tarea | Nota |
|---|---|---|
