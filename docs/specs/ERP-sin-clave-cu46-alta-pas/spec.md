# Spec: Dar de alta un PAS (CU-46)

| | |
|---|---|
| **US** | ERP-255 · https://garridomateosys.atlassian.net/browse/ERP-255 |
| **Épica** | Acceso · [`../EPICA-acceso/spec.md`](../EPICA-acceso/spec.md) |
| **CU origen** | CU-46 `docs/casos-de-uso/ADMINISTRATIVO-OWNER/productores/CU-46-Productores_Dar_de_Alta_PAS.md`. Intercepto de primer ingreso: CU-01 `10a`, CU-02 flujo C. |
| **Tipo** | Pantalla/UI · Datos/backend |
| **Estado** | Borrador |
| **Autor** | con IA |
| **Revisor** | — |
| **Fecha** | 2026-11-16 |

## 1. Contexto y objetivo

CU-01 exige que la organización cree la cuenta antes del ingreso. No hay autogestión. CU-46 es el alta de un PAS por un `directivo` o `administrativo`: datos de identidad, matrícula SSN y contraseña inicial. El PAS, al recibir la cuenta, debe cambiar esa contraseña en el primer ingreso antes de Pendientes.

**Objetivo:** un directivo o administrativo autenticado crea un PAS `activo` con credencial en Supabase Auth y fila `productor`; ese PAS entra con la contraseña inicial y no opera el ERP hasta cambiarla.

## 2. Alcance

**Dentro:**
- Formulario de alta (CU-46 pasos 3–4) y Server Action que crea `auth.users` + `usuario` + `productor`.
- Marca de «debe cambiar contraseña» y bloqueo de Pendientes / resto de la app hasta el cambio (CU-01 `10a`, CU-46 RN_8).
- Reutilizar el cambio con sesión abierta de CU-02 flujo C / ERP-6 (`/perfil/contrasena`).
- Auditoría del alta (CU-46 paso 6, REF CU 51).

**Fuera de alcance:**
- Alta de `directivo` o `administrativo` (CU-46 RN_2, SUP_6; seed).
- Autogestión / alta desde `/` (CU-01 RN_1, RN_2).
- CU-47 (editar, suspender, baja) y CU-48 (asignar roles).
- Dashboard de red CU-40: esta spec solo cuelga el alta de `/red` (PA-1).
- Enviar la contraseña inicial por correo o WhatsApp.
- Política de contraseña distinta de la vigente en `passwordPolicyError` / CU-02 RN_4.

## 3. Componentes afectados

| Qué | Dónde | Cambio |
|---|---|---|
| Pantalla de alta | `front/src/app/(app)/red/productores/alta/page.tsx` | nueva |
| Formulario | `front/src/components/red/alta-pas-form.tsx` | nuevo (cliente) |
| Acción | `front/src/app/(app)/red/productores/actions.ts` | nueva `darAltaPas` |
| Entrada desde Red | `front/src/app/(app)/red/page.tsx` | enlace al alta (hasta CU-40) |
| Repo / admin Auth | `front/src/lib/auth/provider.ts`, `provider.supabase.ts` | alta de PAS |
| Cliente service role | `front/src/lib/supabase/admin.ts` | nuevo, solo servidor |
| Intercepto primer ingreso | `front/src/lib/auth/dal.ts`, páginas `(app)` | si `debe_cambiar_password`, redirige a `/perfil/contrasena` |
| Cambio de contraseña | `front/src/app/(app)/perfil/contrasena/` | ERP-6; al éxito limpia la marca |
| Esquema | `supabase/migrations/` | `usuario.debe_cambiar_password`; acción de auditoría del alta |
| Validación | `front/src/lib/auth/validation.ts` | reusa email, teléfono, política de contraseña; suma matrícula |

## 4. Diseño

La credencial vive en Supabase Auth, no en `usuario.password` (épica Acceso). El alta usa `auth.admin.createUser` **solo en servidor** (service role). El navegador no recibe esa clave.

Quien da el alta indica la contraseña inicial. El sistema no la envía por correo. Cómo se la comunica al PAS queda fuera de la app.

Tras el alta, `usuario.debe_cambiar_password = true`. El primer `signIn` válido abre sesión y auditoría de ingreso (CU-01), pero `verifySession` / el layout de `(app)` redirige a `/perfil/contrasena` si la marca sigue en true. No se abre `/pendientes`. El cambio es CU-02 flujo C: contraseña actual (la inicial), nueva y confirmación, distinta de la anterior. Al guardar, la marca pasa a `false` y se sigue a Pendientes.

Si `createUser` ok y falla el insert de `usuario` o `productor`, se borra el usuario de Auth. No queda cuenta a medias (CU-46 postcondición 5).

### 4.1 Flujo

1. Directivo o administrativo en `/red` abre «Dar de alta un PAS» → `/red/productores/alta`. Un PAS no ve el enlace; si entra por URL, `verifySession` redirige a `/pendientes` (CU-46 `1a`).
2. Completa nombre, apellido, DNI, email, teléfono, matrícula SSN, contraseña inicial y confirmación. Confirma.
3. `darAltaPas`: valida en servidor (sin Auth si falla formato). Email recortado y minúscula.
4. Si el email ya está en `usuario` o en Auth, o la matrícula ya está en `productor`: error de campo, no crea.
5. `createUser({ email, password, email_confirm: true })` → insert `usuario` (`rol=pas`, `estado=activo`, `organizacion` = la de quien da el alta, `debe_cambiar_password=true`) → insert `productor` (`matricula_ssn`).
6. Auditoría del alta. Aviso de éxito (PA-2). El PAS no queda logueado en ese dispositivo.
7. El PAS entra en `/` con email y contraseña inicial (CU-01). Tras sesión + auditoría `ingreso`, si `debe_cambiar_password`, va a `/perfil/contrasena` (CU-01 `10a`).
8. Completa el cambio (CU-02 C). Marca en `false`. Abre `/pendientes`.

Cancelar (CU-46 `4d`): no llama a la acción.

### 4.2 Pantallas y estados

| Pantalla / componente | Estados | Comportamiento |
|---|---|---|
| `/red/productores/alta` | inicial · enviando · error de campo · error general · éxito | Sin menú extra. Botón deshabilitado al enviar. |
| Campos | normal · error | Email `type="email"`. Contraseña y confirmación `type="password"`. Matrícula solo dígitos, sin máscara. |
| `/perfil/contrasena` (primer ingreso) | igual ERP-6 | Si `debe_cambiar_password`, no hay escape a Pendientes ni a Red hasta el cambio. |

- Navegación de entrada: `/red` (directivo/administrativo). Salida tras alta: PA-2. Salida tras cambio inicial: `/pendientes`.
- Validaciones (campo → regla → mensaje):
  - Nombre / apellido vacíos → marcar obligatorio.
  - DNI no numérico → marcar.
  - Email vacío o no `algo@dominio.tld` → mismos mensajes que ERP-5.
  - Teléfono ≠ 10 dígitos → `phoneFieldError`.
  - Matrícula no `^[0-9]{3,8}$` → inválida.
  - Contraseña inicial: `passwordPolicyError` (política vigente). Confirmación distinta → no crea.
- Referencia de diseño: no hay frame de alta de PAS en el prototipo. Figma: PA-3.

### 4.3 Modelo de datos

| Entidad | Campos | Relaciones | Notas |
|---|---|---|---|
| `auth.users` | id, email, encrypted_password | 1:1 `usuario.id` | Admin API. |
| `usuario` | existentes + `debe_cambiar_password boolean not null default false` | FK `auth.users` | Alta: `pas` / `activo` / org del actor. |
| `productor` | `id`, `matricula_ssn` | `id` = `usuario.id` | Solo PAS. Unique matrícula. |
| `auditoria` | usuario_id, rol, accion, ocurrido_en | CU 51 | Acción del alta: PA-4. |

- Migración: columna `debe_cambiar_password`; valor `true` solo al insert de CU-46. Cuentas seed existentes: `false`.
- RLS actual de `usuario` niega escrituras al rol autenticado. El insert lo hace el servidor con service role (mismo criterio que el seed), nunca el cliente.
- Datos mock: no. Instancia local + seed para el actor que da el alta.

### 4.4 Contratos

```
Server Action darAltaPas(prev, FormData{
  nombre, apellido, dni, email, telefono, matricula, password, confirm
})
Éxito:   { ok: true } o redirect (PA-2)
Errores: { fieldErrors?, formError? }

AuthProvider.signIn / verifySession:
  si usuario.debe_cambiar_password → destino /perfil/contrasena, no inicioDelRol
```

- Permiso: solo `directivo` o `administrativo` autenticado y `activo`. PAS: no opera.
- `createUser` y writes de `usuario`/`productor` solo con cliente admin de servidor.
- No hay endpoint REST público de alta.

## 5. Reglas de negocio

| # | Regla | Origen |
|---|---|---|
| RN-1 | Altas no autogestionadas. Las absorben `directivo` y `administrativo`. | CU-46 RN_1, CU-01 RN_2 |
| RN-2 | Este caso da de alta solo un PAS. | CU-46 RN_2 |
| RN-3 | Email único, normalizado, mismo formato que el ingreso. | CU-46 RN_3 |
| RN-4 | Matrícula SSN obligatoria, única, 3–8 dígitos, sin máscara. | CU-46 RN_4 |
| RN-5 | Nombre, apellido, DNI y teléfono (10 dígitos) obligatorios. Org = quien da el alta. | CU-46 RN_5, RN_7 |
| RN-6 | Nace `activo`. | CU-46 RN_6 |
| RN-7 | Quien da el alta indica la contraseña inicial. El PAS la cambia en el primer ingreso antes de Pendientes. | CU-46 RN_8, CU-01 RN_7 |
| RN-8 | Un PAS no da de alta a otro PAS. | CU-46 RN_9 |

## 6. Casos borde y manejo de errores

| Situación | Comportamiento esperado |
|---|---|
| Datos vacíos / inválidos | Marca campos; no llama a Auth (CU-46 `4a`). |
| Email ya registrado | Mensaje de email en uso; no crea (CU-46 `4b`). |
| Matrícula en uso | Mensaje de matrícula en uso; no crea (CU-46 `4c`). |
| PAS o sin sesión | No muestra el alta; redirige (CU-46 `1a`). |
| `createUser` ok, insert falla | Se borra el user de Auth. Error general. Sin cuenta a medias. |
| Doble envío | Botón deshabilitado; segunda llamada no duplica (email unique). |
| Sesión vigente con marca de cambio | No abre Pendientes; va a `/perfil/contrasena` (CU-01 `1.2` / `10a`). |
| Contraseña nueva igual a la inicial | No guarda (CU-02 RN_4). |

## 7. Criterios de aceptación verificables

- [ ] CA-1: Un `directivo` o `administrativo` autenticado abre el formulario de alta; un PAS no.
- [ ] CA-2: Con datos válidos se crea `auth.users`, `usuario` (`pas`/`activo`/`debe_cambiar_password=true`) y `productor` con esa matrícula.
- [ ] CA-3: Email duplicado o matrícula duplicada no crea cuenta y muestra el error en el campo.
- [ ] CA-4: Contraseña inicial inválida o distinta de la confirmación no crea cuenta.
- [ ] CA-5: Tras el alta, el PAS entra con esa contraseña y no llega a `/pendientes` hasta cambiarla por otra distinta (CU-02 C).
- [ ] CA-6: Cancelar o validación fallida no deja filas en Auth, `usuario` ni `productor`.
- [ ] CA-7: El alta queda auditada (quién, PAS, fecha/hora), sin la contraseña.
- [ ] CA-8: No hay control de alta en `/`.

## 8. Decisiones descartadas

| Alternativa | Por qué no |
|---|---|
| Auto-registro en el login | CU-01 RN_1, RN_2; decisión explícita: no autogestionadas |
| Enlace CU-02 para elegir la primera contraseña | Quien da el alta indica la inicial |
| Mandar la contraseña inicial por correo | Fuera de alcance; CU-02 no muestra contraseñas en correo |
| Alta de directivo/administrativo en esta pantalla | CU-46 RN_2 |

## 9. Supuestos

- [x] SUP-1 (CU-46): contraseña inicial la indica quien da el alta; el PAS la cambia al recibir la cuenta. → *confirmado por: usuario, 2026-11-16*
- [x] SUP-4 (CU-46): directivo y administrativo tienen el mismo permiso de alta. → *confirmado por: usuario, 2026-11-16*
- [ ] SUP-2 (CU-46): unicidad del DNI del usuario ERP. El esquema hoy no la exige. Esta spec no agrega unique de DNI. → *confirmado por: ___*
- [ ] SUP-3 (CU-46): la pantalla cuelga de `/red/productores/alta` hasta CU-40. → *confirmado por: ___*

## 10. Preguntas abiertas

- [ ] PA-1: Confirmación de la ruta `/red/productores/alta` (SUP-3). → *quién decide: humano*
- [ ] PA-2: Tras el alta, ¿aviso en el mismo formulario o listado? (CU-46 SUP_5). → *quién decide: humano*
- [ ] PA-3: Frame de Figma para esta pantalla. → *quién decide: humano*
- [ ] PA-4: Valor nuevo en `accion_auditoria` para el alta (`alta-pas`) vs reutilizar otra. CU-51 no lista el enum. → *quién decide: humano*
- [ ] PA-5: ERP-6 (cambio con sesión) sigue en borrador. Esta spec depende de esa pantalla para CU-01 `10a`. → *quién decide: humano*

## 11. Historial de cambios

| Fecha | Cambio | Motivo | PR |
|---|---|---|---|
| 2026-11-16 | Versión inicial (borrador) | CU-46 escrito; contraseña inicial y cambio obligatorio confirmados | |
| 2026-11-16 | Clave Jira | Historia ERP-255, hija de la épica Acceso (ERP-236) | |
