# Spec: Iniciar sesión en el ERP (ERP-5)

| | |
|---|---|
| **US** | ERP-5 · https://garridomateosys.atlassian.net/browse/ERP-5 |
| **Épica** | Acceso · [`../EPICA-acceso/spec.md`](../EPICA-acceso/spec.md) |
| **CU origen** | CU-01 `docs/casos-de-uso/login-logout/CU-01-Acceso_Iniciar_Sesion.md` |
| **Tipo** | Pantalla/UI · Datos/backend |
| **Estado** | Aprobada |
| **Autor** | Yaco10 con IA |
| **Revisor** | Yaco10 (autoaprobada, proyecto individual) |
| **Fecha** | 2026-10-31 (aprobada 2026-11-13) |

## 1. Contexto y objetivo

Puerta de entrada al ERP para PAS, directivo y administrativo. Las decisiones de sesión, rutas, modelo y auditoría están en la [spec de épica](../EPICA-acceso/spec.md); acá solo se define la pantalla de ingreso y su acción.

La épica ya fijó la base y el proveedor de autenticación (2026-11-12): Supabase, local vía Docker durante el desarrollo, con Supabase Auth. `AuthProvider.signIn` de esta spec es, en concreto, `provider.supabase.ts` llamando a `supabase.auth.signInWithPassword`.

**Objetivo:** con email y contraseña válidos de una cuenta activa se abre una sesión y se aterriza en el inicio del rol; con cualquier otro caso no se abre sesión y se informa el error correcto.

## 2. Alcance

**Dentro:**
- Pantalla `/` con `EMAIL` y `CONTRASEÑA`, sin menú.
- Server Action `iniciarSesion`.
- Redirección por rol (PAS → `/pendientes`; directivo y administrativo → `/red`).
- Si ya hay sesión vigente, `/` redirige al inicio del rol sin pedir contraseña.
- Registro de auditoría `ingreso`.
- Enlace "Olvidé mi contraseña" hacia `/recuperar` (la pantalla es de ERP-6).

**Fuera de alcance:**
- Alta de cuenta desde esta pantalla (no existe, CU-01 RN_1).
- Recuperación de contraseña (ERP-6) y cierre de sesión (ERP-8).
- Bloqueo por intentos fallidos (PA-2 de la épica).

## 3. Componentes afectados

| Qué | Dónde | Cambio |
|---|---|---|
| Pantalla de ingreso | `front/src/app/(publico)/page.tsx` | nueva (reemplaza el `page.tsx` de ejemplo) |
| Formulario | `front/src/components/auth/login-form.tsx` | nuevo (cliente, `useActionState`) |
| Acción | `front/src/app/(publico)/actions.ts` | nuevo |
| Lógica | `front/src/lib/auth/*`, `front/src/lib/audit/*`, `front/src/proxy.ts` | ver épica |

## 4. Diseño

### 4.1 Flujo

1. `GET /`: si existe sesión válida → `redirect(inicioDelRol)`. Si no, se muestra el formulario.
2. El formulario envía `iniciarSesion(estado, formData)`.
3. La acción valida formato (`emailFieldError`, contraseña no vacía). Si falla, devuelve los errores por campo **sin llamar al proveedor** (CU-01 4.2).
4. Llama `AuthProvider.signIn(email, password)`.
   - `credenciales` → error general "Email o contraseña incorrectos." (el mismo para email inexistente y contraseña errónea).
   - `inactiva` → el mismo mensaje. No se revela que la cuenta existe (CU-01 RN_3 y RN_4).
   - `servicio` → "No pudimos completar la operación. Probá de nuevo."
5. En éxito: `signIn` ya dejó la sesión abierta (cookie gestionada por `@supabase/ssr`; no hay `createSession` propio, ver épica 4.4) → `auditoria.registrar(usuarioId, rol, 'ingreso')` → `redirect(inicioDelRol)`.

El email se normaliza (`trim` + minúscula) antes de buscar.

### 4.2 Pantallas y estados

| Pantalla / componente | Estados | Comportamiento |
|---|---|---|
| Ingreso | inicial · enviando · error de campo · error general | Botón "Ingresar" deshabilitado mientras envía. Sin menú. |
| Campo `EMAIL` | normal · error | `type="email"`, `autocomplete="username"` |
| Campo `CONTRASEÑA` | normal · error | `type="password"`, `autocomplete="current-password"`. El valor se conserva entre errores solo del email, nunca de la contraseña. |

- Navegación de entrada: abrir el ERP, o redirección por falta de sesión desde cualquier ruta protegida. Salida: inicio del rol; "Olvidé mi contraseña" → `/recuperar`.
- Validaciones (campo → regla → mensaje):
  - `EMAIL` vacío → "Completá el email."
  - `EMAIL` sin formato `algo@dominio.tld` → "El email no tiene un formato válido."
  - `CONTRASEÑA` vacía → "Completá la contraseña."
- Referencia de diseño: `prototype/src/components/auth/login-form.tsx` y Figma.

### 4.4 Contratos

```
Server Action iniciarSesion(prev, FormData{ email, password })
Éxito:   redirect('/pendientes' | '/red') + cookie de sesión
Errores: { emailError?, passwordError?, formError? }
```
- Sin permisos previos (ruta pública). Rate limiting: PA-2 de la épica.

## 5. Reglas de negocio

| # | Regla | Origen |
|---|---|---|
| RN-1 | Email inexistente y contraseña incorrecta dan el mismo mensaje. | CU-01 RN_3 |
| RN-2 | Cuenta suspendida o dada de baja no obtiene sesión (mismo mensaje). | CU-01 RN_4 |
| RN-3 | La sesión se asocia a usuario, rol y alcance de datos. | CU-01 RN_5 |
| RN-4 | Cada ingreso exitoso queda en auditoría. | CU-01 RN_6 |
| RN-5 | PAS aterriza en Pendientes; directivo y administrativo en el dashboard de la red. | CU-01 paso 10 |

## 6. Casos borde y manejo de errores

| Situación | Comportamiento esperado |
|---|---|
| Campos vacíos | Marca los campos; no se llama al proveedor ni se escribe auditoría. |
| Email con mayúsculas o espacios | Se normaliza y entra. |
| Credenciales inválidas / cuenta inactiva | Mismo mensaje general; no se escribe auditoría de ingreso. |
| Sesión vigente al abrir `/` | Redirige al inicio del rol. |
| Falla del proveedor | Mensaje general de servicio; sin sesión. |
| Falla la auditoría | No se abre la sesión (PA-3 de la épica). |
| Doble envío | Segundo clic ignorado mientras el primero está en curso. |

## 7. Criterios de aceptación verificables

- [ ] CA-1: `/` muestra `EMAIL` y `CONTRASEÑA` y no muestra el menú de la aplicación.
- [ ] CA-2: Con email vacío o sin formato, o contraseña vacía, se marca el campo y el proveedor no recibe la llamada.
- [ ] CA-3: Con email no registrado y con contraseña incorrecta se muestra exactamente "Email o contraseña incorrectos." en ambos casos.
- [ ] CA-4: Una cuenta suspendida con credenciales correctas no obtiene sesión y ve el mismo mensaje del CA-3.
- [ ] CA-5: Con credenciales válidas de un PAS se llega a `/pendientes`; con las de directivo o administrativo, a `/red`.
- [ ] CA-6: Tras un ingreso exitoso existe una fila de auditoría `ingreso` con usuario, rol y fecha/hora.
- [ ] CA-7: Con sesión vigente, abrir `/` redirige al inicio del rol sin pedir contraseña.
- [ ] CA-8: La pantalla no ofrece ninguna opción de crear cuenta.
- [ ] CA-9: La contraseña no aparece en la URL, ni en el HTML devuelto tras un error, ni en la auditoría.

## 8. Decisiones descartadas

| Alternativa | Por qué no |
|---|---|
| Indicar "el email no existe" | Permite enumerar cuentas; el CU lo prohíbe (RN_3). |
| Validar en el cliente solamente | La validación en el servidor es la que cuenta; el cliente solo mejora la experiencia. |

## 9. Supuestos

- [x] SUP-1: Los mensajes de validación de campo salen del prototipo y se aceptan tal cual. → *confirmado por: Yaco10, 2026-11-13.*
- [x] SUP-2: "Olvidé mi contraseña" vive en esta pantalla como enlace (CU-02 paso 1). → *confirmado por: Yaco10, 2026-11-13 — se muestra el enlace aunque `/recuperar` (ERP-6) todavía no exista.*

## 10. Preguntas abiertas

- [x] PA-1: Duración de la sesión, sesiones múltiples e intentos fallidos: **ver PA-1 y PA-2 de la épica**; condicionan CA nuevos si se decide un bloqueo. → *resuelto en la épica (2026-11-13): duración/refresh por defecto de Supabase, múltiples sesiones permitidas; sin tope de intentos fallidos por ahora (PA-2 de la épica queda fuera de alcance de esta US, como ya dice §2).*
- [x] PA-2: Quién da de alta directivo y administrativo (PA-5 de la épica); sin eso no hay con qué probar esos roles fuera de los datos de ejemplo. → *resuelto en la épica (2026-11-13): se crean a mano vía script/seed de Supabase; no hay pantalla de alta todavía.*

## 11. Historial de cambios

| Fecha | Cambio | Motivo | PR |
|---|---|---|---|
| 2026-10-31 | Versión inicial | | |
| 2026-11-12 | Se referencia la decisión de la épica: Supabase (local vía Docker) con Supabase Auth, sin backend propio para el login. | Decisión del equipo sobre la base de datos | |
| 2026-11-13 | Se resuelven SUP-1, SUP-2, PA-1 y PA-2. Estado pasa a `Aprobada`. | Revisión de spec previa a implementar | |
| 2026-11-13 | Corrección en 4.1 paso 5: se quita la referencia a `createSession` (no existe tal método; la sesión la abre `signIn` directamente, según la épica 4.4). | Inconsistencia detectada en revisión del plan | |
