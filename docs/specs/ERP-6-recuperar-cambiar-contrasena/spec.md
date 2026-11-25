# Spec: Recuperar o cambiar la contraseña (ERP-6)

| | |
|---|---|
| **US** | ERP-6 · https://garridomateosys.atlassian.net/browse/ERP-6 |
| **Épica** | Acceso · [`../EPICA-acceso/spec.md`](../EPICA-acceso/spec.md) |
| **CU origen** | CU-02 `docs/casos-de-uso/login-logout/CU-02-Acceso_Recuperar_o_Cambiar_Contrasena.md` |
| **Tipo** | Pantalla/UI · Integración (correo) · Datos/backend |
| **Estado** | Aprobada |
| **Autor** | Yaco10 con IA |
| **Revisor** | — |
| **Fecha** | 2026-10-31 (aprobada 2026-11-15) |

## 1. Contexto y objetivo

Dos caminos: **recuperar** (sin sesión, por enlace al correo) y **cambiar** (con sesión, desde Perfil). Comparten la política de contraseña y la pantalla de contraseña nueva. Sesión, auditoría y proveedor: ver la [épica](../EPICA-acceso/spec.md).

**Objetivo:** que un usuario pueda reemplazar su contraseña por uno de los dos caminos, sin que el sistema revele si un email existe y sin guardar ni mostrar contraseñas en auditoría ni en el correo.

## 2. Alcance

**Dentro:**
- `/recuperar`: pide `EMAIL`, muestra siempre el mismo aviso.
- Correo con enlace de un solo uso y con vencimiento hacia `/recuperar/nueva?token=…`.
- `/recuperar/nueva`: `CONTRASEÑA NUEVA` y `CONFIRMACIÓN`.
- `/perfil/contrasena`: `CONTRASEÑA ACTUAL`, `CONTRASEÑA NUEVA`, `CONFIRMACIÓN`.
- Auditoría `cambio-contrasena`.

**Fuera de alcance:**
- Plantilla visual definitiva del correo (se usa la plantilla de Supabase Auth; su personalización y el servicio SMTP productivo son una tarea aparte).
- Recuperación por WhatsApp (CU-02 SUP_1).
- Cierre de otras sesiones al cambiar la contraseña (PA-4: no se cierran).
- Límite propio de pedidos de enlace (PA-3: se usa el límite nativo de Supabase Auth).

## 3. Componentes afectados

| Qué | Dónde | Cambio |
|---|---|---|
| Pedir enlace | `front/src/app/(publico)/recuperar/page.tsx` | nueva |
| Contraseña nueva por enlace | `front/src/app/(publico)/recuperar/nueva/page.tsx` | nueva |
| Cambiar con sesión | `front/src/app/(app)/perfil/contrasena/page.tsx` | nueva |
| Formularios | `front/src/components/auth/recover-form.tsx`, `reset-password-form.tsx`, `change-password-form.tsx` | nuevos |
| Acciones | `front/src/app/(publico)/recuperar/actions.ts`, `front/src/app/(app)/perfil/contrasena/actions.ts` | nuevas |
| Validación | `front/src/lib/auth/validation.ts` | amplía (política, coincidencia) |
| Proveedor | `AuthProvider.requestPasswordReset / checkResetToken / resetPassword / changePassword` en `front/src/lib/auth/provider.supabase.ts` | ver épica 4.4 |
| Configuración Supabase | `supabase/config.toml` (vigencia del enlace, política de contraseña, URL de redirección) | modifica |

## 4. Diseño

### 4.1 Flujo

**Recuperar**
1. En `/` el usuario elige "Olvidé mi contraseña" → `/recuperar`.
2. Envía `EMAIL`. La acción valida formato; si es inválido marca el campo y no busca la cuenta.
3. Llama `requestPasswordReset(email)`. El proveedor, solo si la cuenta existe y está activa, genera un enlace de un solo uso con vencimiento y lo envía por correo.
4. La pantalla muestra **siempre** el aviso: "Si el email está registrado, va a llegar un mensaje para elegir una contraseña nueva." (también para email inexistente o cuenta inactiva, sin enviar nada).
5. Falla del servicio de correo → "No pudimos enviar el mensaje. Probá de nuevo." y no queda emitido ningún enlace (el proveedor debe revertirlo).
6. El enlace abre `/recuperar/nueva?token=…`. `checkResetToken` valida: si está vencido, usado o es inválido → "Este enlace ya no sirve. Pedí uno nuevo." con enlace a `/recuperar`.
7. Con enlace vigente, el usuario carga `CONTRASEÑA NUEVA` y `CONFIRMACIÓN`. La acción valida coincidencia y política; luego `resetPassword(token, nueva)`.
8. En éxito: se invalida el enlace, queda sin efecto la contraseña anterior, se audita `cambio-contrasena` y se redirige a `/` con aviso de éxito.

**Cambiar (con sesión)**
1. Desde `/perfil` → "Cambiar contraseña" → `/perfil/contrasena`.
2. La acción exige sesión (`verifySession`), valida los tres campos y llama `changePassword(usuarioId, actual, nueva)`.
3. `actual-incorrecta` → error en `CONTRASEÑA ACTUAL`, no guarda. Éxito → auditoría y vuelta a `/perfil` con aviso.

El token se toma de la URL solo para el formulario y se reenvía en el cuerpo de la acción; no se loguea.

### 4.2 Pantallas y estados

| Pantalla | Estados | Comportamiento |
|---|---|---|
| `/recuperar` | inicial · enviando · aviso enviado · error de campo · error de servicio | Tras el aviso, el formulario se oculta o se deshabilita. |
| `/recuperar/nueva` | validando enlace · enlace inválido · formulario · enviando · error de campo | Sin menú. |
| `/perfil/contrasena` | formulario · enviando · error de campo · éxito | Con menú. |

- Validaciones (campo → regla → mensaje):
  - `EMAIL` vacío/inválido → mensajes de ERP-5.
  - Contraseña nueva vacía → "Completá la contraseña nueva."
  - Política: menos de 8 caracteres, o sin un dígito, una mayúscula y una minúscula → "La contraseña tiene que tener al menos 8 caracteres, con un número, una mayúscula y una minúscula." (SUP-1)
  - Igual a la anterior → "La contraseña nueva tiene que ser distinta de la anterior."
  - `CONFIRMACIÓN` vacía → "Completá la confirmación."; distinta → "Las contraseñas no coinciden."
  - `CONTRASEÑA ACTUAL` vacía → "Completá la contraseña actual."; incorrecta → "La contraseña actual no coincide."
- Se muestra la política como ayuda junto al campo nuevo (`passwordPolicyHint` del prototipo).
- Referencia de diseño: `prototype/src/components/auth/{recover-form,reset-password-form,change-password-form}.tsx` y Figma.

### 4.4 Contratos

```
Server Action pedirRecuperacion(prev, FormData{ email })      → { emailError?, aviso?, formError? }
Server Action restablecer(prev, FormData{ token, password, confirm }) → { passwordError?, confirmError?, formError? } | redirect('/')
Server Action cambiarContrasena(prev, FormData{ actual, password, confirm }) → { currentError?, passwordError?, confirmError?, formError? } | redirect('/perfil')
```
- Pedir y restablecer: públicas. Cambiar: cualquier rol, solo sobre su propia cuenta (el `usuarioId` sale de la sesión, nunca del formulario).
- Enlace: de un solo uso; vigencia 24 h (PA-2; `otp_expiry = 86400` en la configuración de Supabase). El correo no incluye la contraseña. El token lo gestiona Supabase Auth; la app no lo guarda.
- Proveedor: Supabase Auth nativo (PA-1, ADR-004): `resetPasswordForEmail` y `verifyOtp` para el enlace, `updateUser({ password })` para guardar. En desarrollo local el correo se lee en Inbucket/Mailpit del stack local de Supabase. No hay `provider.dev.ts`.
- Límite de pedidos: el nativo de Supabase Auth (PA-3); la app no agrega lógica propia.
- Otras sesiones: no se cierran al cambiar la contraseña (PA-4).

## 5. Reglas de negocio

| # | Regla | Origen |
|---|---|---|
| RN-1 | Recuperar no exige sesión; cambiar exige sesión y contraseña actual. | CU-02 RN_1 |
| RN-2 | Mismo aviso para email inexistente y cuenta inactiva. | CU-02 RN_2 |
| RN-3 | Enlace de un solo uso y con vencimiento; el correo no muestra la contraseña. | CU-02 RN_3 |
| RN-4 | La nueva cumple la política y es distinta de la anterior. | CU-02 RN_4 |
| RN-5 | Cuenta suspendida o dada de baja no recibe enlace. | CU-02 RN_5 |
| RN-6 | La auditoría anota el cambio sin la contraseña. | CU-02 RN_6 |

## 6. Casos borde y manejo de errores

| Situación | Comportamiento esperado |
|---|---|
| Email vacío o inválido | Marca el campo; no busca la cuenta. |
| Email inexistente / cuenta inactiva | Mismo aviso; no se envía nada. |
| Pedidos repetidos del enlace | Un enlace nuevo invalida el anterior (SUP-3). Abuso: límite nativo de Supabase (PA-3); si Supabase lo rechaza, se muestra el mismo aviso genérico sin revelar nada. |
| Enlace vencido, usado o inválido | "Este enlace ya no sirve. Pedí uno nuevo." |
| Enlace usado dos veces (doble clic en Guardar) | La segunda llamada recibe "enlace inválido"; la contraseña no cambia dos veces. |
| Contraseñas que no coinciden / no cumplen / igual a la anterior | Marca el campo, no reemplaza. |
| Falla del servicio de correo | Mensaje de error; no queda enlace emitido. |
| Cambiar sin sesión (sesión vencida) | Redirige a `/` (RN-5 de la épica). |

## 7. Criterios de aceptación verificables

**Recuperar**
- [ ] CA-1: En `/` hay una opción "Olvidé mi contraseña" que lleva a un formulario que pide `EMAIL`.
- [ ] CA-2: Con email vacío o inválido se marca el campo y el proveedor no busca la cuenta.
- [ ] CA-3: Con email no registrado y con cuenta suspendida se ve el mismo aviso que con una cuenta válida y no se envía correo.
- [ ] CA-4: Con cuenta válida se envía un correo con un enlace de un solo uso y con vencimiento; el correo no contiene la contraseña.
- [ ] CA-5: Si el servicio de correo falla se informa que no se pudo enviar y el enlace no queda vigente.
- [ ] CA-6: Un enlace vencido o ya usado muestra "Este enlace ya no sirve. Pedí uno nuevo." y no permite cambiar la contraseña.
- [ ] CA-7: La pantalla de contraseña nueva pide `CONTRASEÑA NUEVA` y `CONFIRMACIÓN`; no guarda si no coinciden, si no cumplen la política o si es igual a la anterior.
- [ ] CA-8: Al guardar, la contraseña anterior deja de servir para ingresar, el enlace queda invalidado y se vuelve a `/`.

**Cambiar**
- [ ] CA-9: Desde Perfil > "Cambiar contraseña" se piden `CONTRASEÑA ACTUAL`, `CONTRASEÑA NUEVA` y `CONFIRMACIÓN`.
- [ ] CA-10: Con la contraseña actual incorrecta se informa el error y no se guarda.
- [ ] CA-11: Un usuario solo puede cambiar su propia contraseña (el identificador no viaja en el formulario).

**Transversal**
- [ ] CA-12: Cada cambio exitoso crea una fila de auditoría `cambio-contrasena` sin contraseña ni token.

## 8. Decisiones descartadas

| Alternativa | Por qué no |
|---|---|
| Mostrar "email no registrado" | Enumeración de cuentas; el CU lo prohíbe. |
| Enviar la contraseña temporal por correo | CU-02 RN_3. |
| Token en la sesión del navegador en lugar de URL | El enlace del correo necesita llevarlo; se limita con un solo uso y vencimiento. |

## 9. Supuestos

- [x] SUP-1: Política = mínimo 8 caracteres con al menos un dígito, una mayúscula y una minúscula, y distinta de la anterior. Se valida en la app y se configura igual en Supabase Auth (`password_requirements`). → *confirmado por: revisión conjunta 2026-11-15; reconfirmado 2026-11-25*
- [x] SUP-2: El canal es el correo asociado a la cuenta (CU-02 SUP_1). → *confirmado por: revisión conjunta 2026-11-15*
- [x] SUP-3: Un enlace nuevo deja sin efecto el anterior del mismo usuario. → *confirmado por: revisión conjunta 2026-11-15*

## 10. Preguntas abiertas

- [x] PA-1: Proveedor de autenticación y correo → Supabase Auth nativo (ADR-004). → *decidió: revisión conjunta 2026-11-15*
- [x] PA-2: Vigencia del enlace → 24 h. → *decidió: revisión conjunta 2026-11-15*
- [x] PA-3: Límite de pedidos → el nativo de Supabase Auth, sin lógica propia. → *decidió: 2026-11-25 (el acta del 15/11 lo dejaba sin definir)*
- [x] PA-4: Otras sesiones al guardar → no se cierran. → *decidió: revisión conjunta 2026-11-15*

## 11. Historial de cambios

| Fecha | Cambio | Motivo | PR |
|---|---|---|---|
| 2026-10-31 | Versión inicial | | |
| 2026-11-15 | Aprobada en revisión conjunta | PA-1 Supabase Auth nativo (ya en ADR-004); PA-2 vigencia 24h con f_inicio; PA-3 límite x (sin definir); PA-4 no se cierran otras sesiones al cambiar contraseña; SUP-1 política alfanumérica (al menos un dígito, una mayúscula y una minúscula); SUP-2 canal de recuperación: correo asociado a la cuenta; SUP-3 enlace nuevo invalida el anterior del mismo usuario | |
| 2026-11-25 | Se reconcilian las secciones 2 a 6 y 9-10 con lo decidido el 15/11; PA-3 = límite nativo de Supabase; SUP-1 confirmada como 8 + dígito + mayúscula + minúscula; se elimina `provider.dev.ts` | Dejar la spec consistente antes de implementar | |
