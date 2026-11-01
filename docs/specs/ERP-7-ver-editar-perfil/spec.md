# Spec: Ver y editar mi perfil (ERP-7)

| | |
|---|---|
| **US** | ERP-7 · https://garridomateosys.atlassian.net/browse/ERP-7 |
| **Épica** | Acceso · [`../EPICA-acceso/spec.md`](../EPICA-acceso/spec.md) |
| **CU origen** | CU-03 `docs/casos-de-uso/login-logout/CU-03-Acceso_Ver_y_Editar_Perfil.md` |
| **Tipo** | Pantalla/UI · Datos/backend |
| **Estado** | Borrador |
| **Autor** | Yaco10 con IA |
| **Revisor** | — |
| **Fecha** | 2026-10-31 |

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
- Actualizar el nombre en propuestas ya generadas (PA-2).
- Cambio de contraseña (ERP-6) y cierre de sesión (ERP-8).

## 3. Componentes afectados

| Qué | Dónde | Cambio |
|---|---|---|
| Pantalla | `front/src/app/(app)/perfil/page.tsx` | nueva (Server Component) |
| Pantalla de perfil | `front/src/components/auth/profile-screen.tsx` | nuevo (cliente, alterna lectura/edición) |
| Acción | `front/src/app/(app)/perfil/actions.ts` | nuevo |
| Validación | `front/src/lib/auth/validation.ts` | amplía (`phoneFieldError`, nombre) |
| Repositorio | `UsuarioRepo.porId`, `UsuarioRepo.actualizarPerfil` | ver épica 4.4 |

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
| Matrícula | visible / oculta | Si el usuario no tiene matrícula (directivo, administrativo: SUP-1) se omite la fila. |

- Validaciones (campo → regla → mensaje):
  - `NOMBRE` vacío o solo espacios → "Completá el nombre."
  - `TELÉFONO` sin 10 dígitos (se ignoran espacios y guiones) → "El teléfono tiene que tener 10 dígitos."
- Se guarda el nombre sin espacios sobrantes y el teléfono tal como se escribió (SUP-2).
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
| Teléfono con otra cantidad de dígitos | Marca el campo; no guarda ni audita. |
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

- [ ] SUP-1: Directivo y administrativo no tienen matrícula y esa fila no se muestra (CU-03 SUP_3). → *confirmado por: ___*
- [ ] SUP-2: Formato del teléfono: texto libre con exactamente 10 dígitos (prototipo, p. ej. `11 4321-9088`). Prefijos internacionales no se contemplan. → *confirmado por: ___*
- [ ] SUP-3: Guardar sin cambios se audita igual. → *confirmado por: ___*

## 10. Preguntas abiertas

- [ ] PA-1: ¿El email de ingreso se puede cambiar desde el perfil o solo lo cambia la organización? (CU-03 SUP_2). Esta spec asume que **no**. → *quién decide: ___*
- [ ] PA-2: ¿El nombre editado reemplaza al de propuestas ya generadas o solo a las próximas? (CU-03 SUP_4). → *quién decide: ___*

## 11. Historial de cambios

| Fecha | Cambio | Motivo | PR |
|---|---|---|---|
| 2026-10-31 | Versión inicial | | |
