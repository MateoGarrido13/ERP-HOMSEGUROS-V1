# Spec: Ver y editar mi perfil (ERP-7)

| | |
|---|---|
| **US** | ERP-7 · https://garridomateosys.atlassian.net/browse/ERP-7 |
| **Épica** | Acceso · [`../EPICA-acceso/spec.md`](../EPICA-acceso/spec.md) |
| **CU origen** | CU-03 `docs/casos-de-uso/login-logout/CU-03-Acceso_Ver_y_Editar_Perfil.md` |
| **Tipo** | Pantalla/UI · Datos/backend |
| **Estado** | Aprobada |
| **Autor** | Yaco10 con IA |
| **Revisor** | — |
| **Fecha** | 2026-10-31 (aprobada 2026-11-15) |

## 1. Contexto y objetivo

Cada usuario consulta su ficha y actualiza su nombre y teléfono. `/perfil` también es el punto de entrada a "Cambiar contraseña" (ERP-6) y "Cerrar sesión" (ERP-8). Sesión y auditoría: ver la [épica](../EPICA-acceso/spec.md).

**Objetivo:** el usuario ve su perfil y puede cambiar solo `NOMBRE` y `TELÉFONO`, con validación y auditoría; nunca ve ni modifica el perfil de otro.

## 2. Alcance

**Dentro:**
- `/perfil` en modo lectura y modo edición.
- Server Action `guardarPerfil`.
- Auditoría `perfil`.
- Contenedor de acciones del perfil con los enlaces a "Cambiar contraseña" y el botón "Cerrar sesión" (su lógica es de ERP-8).

**Fuera de alcance:**
- Cambiar rol, matrícula, organización o email (los asigna la organización: CU-46/48).
- Actualizar el nombre en propuestas y documentos ya generados (PA-2: el cambio solo rige para los futuros).
- Cambio de contraseña (ERP-6) y cierre de sesión (ERP-8).

## 3. Componentes afectados

| Qué | Dónde | Cambio |
|---|---|---|
| Pantalla | `front/src/app/(app)/perfil/page.tsx` | nueva (Server Component) |
| Pantalla de perfil | `front/src/components/auth/profile-screen.tsx` | nuevo (cliente, alterna lectura/edición) |
| Acción | `front/src/app/(app)/perfil/actions.ts` | nuevo |
| Validación | `front/src/lib/auth/validation.ts` | amplía (`phoneFieldError`, nombre) |
| Repositorio | `UsuarioRepo.porId`, `UsuarioRepo.actualizarPerfil` (hoy sin implementar en `UsuarioRepoSupabase`) | ver épica 4.4 |
| Selector de prefijo | `front/src/components/auth/phone-field.tsx` | nuevo (prefijo con bandera + código de área + número) |

## 4. Diseño

### 4.1 Flujo

1. `GET /perfil`: `verifySession()` → `UsuarioRepo.porId(usuarioId)` → se muestra `NOMBRE`, `ROL`, `MATRÍCULA`, `ORGANIZACIÓN` y `TELÉFONO` en solo lectura.
2. "Editar" habilita únicamente `NOMBRE` y `TELÉFONO` (estado local del cliente, sin ir al servidor).
3. "Guardar" → `guardarPerfil(prev, FormData{ nombre, telefono })`. El `usuarioId` sale de la sesión.
4. La acción valida; si hay errores los devuelve por campo y no guarda.
5. Si es válido: `actualizarPerfil` + `auditoria.registrar('perfil')` → se revalida `/perfil` y vuelve a lectura con datos nuevos.
6. "Cancelar" descarta lo escrito y vuelve a lectura. No hay llamada al servidor.

Como el nombre se lee del usuario en cada pedido, "las propuestas y mensajes posteriores usan el nombre actualizado" se cumple si esos flujos leen el nombre del usuario de sesión y no de una copia local (se anota en la épica de cotización cuando exista).

### 4.2 Pantallas y estados

| Pantalla / componente | Estados | Comportamiento |
|---|---|---|
| Perfil | cargando · lectura · edición · guardando · error de campo · error general · éxito | Con menú. En edición, rol/matrícula/organización quedan en solo lectura (`readOnly`). |
| Matrícula | visible / oculta | Se muestra solo la matrícula propia; si el usuario no tiene (directivo, administrativo: SUP-1) se omite la fila. Un PAS nunca ve la matrícula de otro PAS. |

- Validaciones (campo → regla → mensaje):
  - `NOMBRE` vacío o solo espacios → "Completá el nombre."
  - `TELÉFONO`: código de área + número sin 10 dígitos (se ignoran espacios y guiones) → "El teléfono tiene que tener 10 dígitos."
- Se edita solo la columna `nombre`; el `apellido` queda fijo y se muestra junto al nombre en lectura (decidido el 2026-11-25). Se guarda el nombre sin espacios sobrantes. El teléfono se arma con tres partes: prefijo internacional (selector con bandera, por defecto Argentina), código de área y número, sin `+`, espacios ni guiones en los campos; se concatenan en solo dígitos y se guarda un único valor (SUP-2).
- Referencia de diseño: `prototype/src/components/auth/profile-screen.tsx` y Figma.

### 4.4 Contratos

```
Server Action guardarPerfil(prev, FormData{ nombre, telefono }) → { nameError?, phoneError?, formError?, ok? }
```
- Cualquier rol con sesión; solo opera sobre su propio `usuarioId` (CU-03 RN_1). No acepta `usuarioId`, `rol`, `matricula` ni `organizacion` del formulario: aunque los envíe, se ignoran.

## 5. Reglas de negocio

| # | Regla | Origen |
|---|---|---|
| RN-1 | Cada usuario ve y edita su propio perfil. | CU-03 RN_1 |
| RN-2 | Rol, matrícula y organización no se editan acá. | CU-03 RN_2 |
| RN-3 | Nombre y teléfono los actualiza el propio usuario. | CU-03 RN_3 |
| RN-4 | Cancelar no persiste cambios. | CU-03 RN_4 |
| RN-5 | El cambio queda en auditoría. | CU-03 postcondición 3 |

## 6. Casos borde y manejo de errores

| Situación | Comportamiento esperado |
|---|---|
| Nombre vacío | Marca el campo; no guarda ni audita. |
| Teléfono con área + número de otra cantidad de dígitos | Marca el campo; no guarda ni audita. |
| Sin cambios al guardar | Guarda igual y audita (SUP-3). |
| Intento de enviar `rol`/`usuarioId` en el formulario | Se ignoran. |
| Sesión vencida al guardar | Redirige a `/`; no se guarda. |
| Falla de escritura | "No pudimos guardar los cambios. Probá de nuevo." y se conserva lo escrito. |
| Doble clic en Guardar | Botón deshabilitado mientras guarda. |

## 7. Criterios de aceptación verificables

- [ ] CA-1: `/perfil` muestra `NOMBRE`, `ROL`, `MATRÍCULA`, `ORGANIZACIÓN` y teléfono del usuario de la sesión.
- [ ] CA-2: Al seleccionar "Editar" solo `NOMBRE` y `TELÉFONO` son editables.
- [ ] CA-3: Con nombre vacío, o teléfono sin 10 dígitos, se marca el campo y no se guarda.
- [ ] CA-4: Al guardar un perfil válido se vuelve a lectura mostrando los datos nuevos, también tras recargar la página.
- [ ] CA-5: "Cancelar" restaura los valores previos y no hace ningún cambio persistido.
- [ ] CA-6: Un envío manipulado con `rol` o `usuarioId` ajeno no modifica esos datos ni el perfil de otro usuario.
- [ ] CA-7: Cada guardado exitoso crea una fila de auditoría `perfil` con usuario, rol y fecha/hora.
- [ ] CA-8: Desde `/perfil` hay acceso a "Cambiar contraseña".
- [ ] CA-9: El directivo y el administrativo ven su perfil sin una fila de matrícula vacía (según SUP-1).

## 8. Decisiones descartadas

| Alternativa | Por qué no |
|---|---|
| Editar rol/matrícula/organización acá | Los asigna la organización (CU-03 RN_2). |
| Pasar el `usuarioId` por la URL (`/perfil/[id]`) | Habilita ver perfiles ajenos (RN-1). |
| Editar en una pantalla aparte | El CU lo plantea como alternar lectura/edición en la misma sección. |

## 9. Supuestos

- [x] SUP-1: Directivo y administrativo no tienen matrícula propia y esa fila no se muestra (CU-03 SUP_3). Cada usuario ve solo su propia matrícula; un PAS nunca ve la de otro PAS. → *confirmado por: revisión conjunta 2026-11-15; reconfirmado 2026-11-25*
- [x] SUP-2: Teléfono: selector de prefijo internacional con bandera (por defecto +54), campo de código de área y campo de número, sin `+`, espacios ni guiones. Se concatenan y se guardan como un único valor de solo dígitos. La regla de longitud (10 dígitos entre código de área y número) se mantiene para todos los prefijos. → *confirmado por: revisión conjunta 2026-11-15; regla de longitud de 10 dígitos para todos los prefijos reconfirmada el 2026-11-25*
- [x] SUP-3: Guardar sin cambios se audita igual. → *confirmado por: revisión conjunta 2026-11-15*

## 10. Preguntas abiertas

- [x] PA-1: El email de ingreso no se edita desde el perfil; queda fijo por usuario. → *decidió: revisión conjunta 2026-11-15*
- [x] PA-2: El nombre editado solo afecta propuestas y documentos futuros (PDF y documentos con logo de compañía y nombre del PAS a cargo). → *decidió: revisión conjunta 2026-11-15*

## 11. Historial de cambios

| Fecha | Cambio | Motivo | PR |
|---|---|---|---|
| 2026-10-31 | Versión inicial | | |
| 2026-11-15 | Aprobada en revisión conjunta | PA-1 email no editable (queda fijo por usuario); PA-2 modificación del nombre solo afecta propuestas futuras (PDF y documentos generados por el sistema con logo de compañía y nombre del PAS a cargo); SUP-1 matrícula vista por PAS y por directivo/administrativo, pero un PAS nunca ve la matrícula de otro PAS; SUP-2 teléfono: prefijo internacional con bandera en UI, campo sin '+' ni código área ni número, se concatenan y guardan en DB; SUP-3 guardar sin cambios se audita igual | |
| 2026-11-25 | Se reconcilian las secciones 2 a 6 y 9-10 con lo decidido el 15/11 (teléfono en tres partes, matrícula por rol, alcance de PA-2) | Dejar la spec consistente antes de implementar | |
