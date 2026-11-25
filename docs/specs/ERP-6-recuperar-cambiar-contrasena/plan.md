# Plan: Recuperar o cambiar la contraseña (ERP-6)

| | |
|---|---|
| **Spec** | [`spec.md`](spec.md) (aprobada 2026-11-15; reconciliada 2026-11-25) |
| **US** | ERP-6 |
| **Estado** | Aprobado |
| **Autor** | Yaco10 con IA |
| **Revisor** | — |

## 1. Resumen del enfoque

Se completa el proveedor Supabase (`provider.supabase.ts`) con recuperación y cambio, luego las acciones, luego las tres pantallas. Recuperar y cambiar comparten validación y formulario de contraseña nueva, así que primero se hace la lógica común.

## 2. Antes de empezar

- [x] Spec de ERP-6 en estado `Aprobada`, sin supuestos ni preguntas abiertas (reconciliada el 2026-11-25).
- [ ] Rama creada desde `main`: `erp-6-recuperar-cambiar-contrasena`. La rama remota actual tiene un proveedor `provider.dev.ts` descartado por la spec: se rebasa/recrea desde `main` y solo se rescata `validation.ts` y su test si sirven.
- [x] **ERP-5 completado** (proveedor Supabase, sesión, DAL, layouts, componentes base).
- [x] PA-1 resuelta: Supabase Auth nativo; no hay proveedor de desarrollo.

## 3. Tareas

### Fase 1 – Lógica

- [ ] **T-1 – Validación de contraseña nueva**
  - **Qué:** función que valida contraseña nueva + confirmación + anterior (política 8 + dígito + mayúscula + minúscula, coincidencia, distinta de la anterior) con los mensajes de la spec 4.2.
  - **Archivos:** `front/src/lib/auth/validation.ts` (modificar), `front/src/lib/auth/validation.test.ts` (modificar)
  - **Depende de:** ERP-5 T-3
  - **Cubre:** CA-7, CA-9, RN-4
  - **Verificación:** casos: vacía, 7 caracteres, sin número, sin mayúscula, sin minúscula, igual a la anterior, no coincide, válida.

- [ ] **T-2 – Configuración de Supabase Auth**
  - **Qué:** `otp_expiry = 86400` (24 h), `password_requirements` y longitud mínima 8 alineadas con T-1, URL de redirección `/recuperar/nueva`, plantilla de recuperación con el enlace hacia esa ruta (Mailpit local para ver el correo).
  - **Archivos:** `supabase/config.toml` (modificar), plantilla de correo si hace falta
  - **Depende de:** —
  - **Cubre:** CA-4, CA-6, PA-2
  - **Verificación:** pedir un enlace en local y leerlo en Mailpit; el enlace abre `/recuperar/nueva`.

- [ ] **T-3 – Recuperación y cambio en `provider.supabase.ts`**
  - **Qué:** `requestPasswordReset` (`resetPasswordForEmail`, siempre `enviado: true` para no enumerar), `checkResetToken` (`verifyOtp` mapeado a vigente/vencido/usado/invalido), `resetPassword` (`updateUser`, un solo uso), `changePassword` (reautentica con la actual y `updateUser`). Sin cerrar otras sesiones. Si el usuario está inactivo no se emite enlace (RN-5).
  - **Archivos:** `front/src/lib/auth/provider.supabase.ts` (modificar), `front/src/lib/auth/provider.supabase.test.ts` (nuevo, con cliente simulado)
  - **Depende de:** T-1, T-2
  - **Cubre:** CA-3, CA-4, CA-6, CA-8, CA-10, CA-11, RN-2, RN-3, RN-5
  - **Verificación:** tests con cliente simulado: token usado dos veces → segunda `enlace-invalido`; vencido → `vencido`; cuenta suspendida → no se emite; actual incorrecta → `actual-incorrecta`; igual a la anterior → `igual-a-la-anterior`; manual contra Supabase local.

### Fase 2 – Acciones

- [ ] **T-4 – Acciones de recuperar y restablecer**
  - **Qué:** `pedirRecuperacion` (aviso siempre igual) y `restablecer` (valida, llama al proveedor, audita `cambio-contrasena`, redirige a `/` con aviso).
  - **Archivos:** `front/src/app/(publico)/recuperar/actions.ts` (nuevo)
  - **Depende de:** T-3, ERP-5 T-7
  - **Cubre:** CA-2, CA-3, CA-5, CA-6, CA-8, CA-12
  - **Verificación:** probar con `curl`/formulario: email desconocido y válido devuelven el mismo aviso; auditoría con una fila tras restablecer.

- [ ] **T-5 – Acción de cambiar contraseña**
  - **Qué:** `cambiarContrasena` con `verifySession()`; `usuarioId` desde la sesión; audita; redirige a `/perfil`.
  - **Archivos:** `front/src/app/(app)/perfil/contrasena/actions.ts` (nuevo)
  - **Depende de:** T-3, ERP-5 T-6, T-7
  - **Cubre:** CA-9, CA-10, CA-11, CA-12
  - **Verificación:** sin sesión redirige a `/`; con campo `usuarioId` manipulado cambia solo la contraseña propia.

### Fase 3 – Interfaz

- [ ] **T-6 – Pantalla "Olvidé mi contraseña"**
  - **Qué:** `/recuperar` con formulario de email y aviso; enlace desde `/`.
  - **Archivos:** `front/src/app/(publico)/recuperar/page.tsx`, `front/src/components/auth/recover-form.tsx` (nuevos); `front/src/components/auth/login-form.tsx` (modificar: enlace)
  - **Depende de:** T-4
  - **Cubre:** CA-1, CA-2, CA-3, CA-5
  - **Verificación:** recorrido manual de esos CA.

- [ ] **T-7 – Pantalla de contraseña nueva por enlace**
  - **Qué:** `/recuperar/nueva?token=…`; valida el token en el servidor al cargar (vigente → formulario; si no → "Este enlace ya no sirve. Pedí uno nuevo." con enlace a `/recuperar`).
  - **Archivos:** `front/src/app/(publico)/recuperar/nueva/page.tsx`, `front/src/components/auth/reset-password-form.tsx` (nuevos)
  - **Depende de:** T-4
  - **Cubre:** CA-6, CA-7, CA-8
  - **Verificación:** enlace de la consola: primera vez funciona; segunda muestra el mensaje; ingreso con la contraseña nueva OK, con la vieja falla.

- [ ] **T-8 – Pantalla de cambiar contraseña**
  - **Qué:** `/perfil/contrasena` con tres campos y ayuda de política; botón de acceso desde Perfil (coordinar con ERP-7).
  - **Archivos:** `front/src/app/(app)/perfil/contrasena/page.tsx`, `front/src/components/auth/change-password-form.tsx` (nuevos)
  - **Depende de:** T-5
  - **Cubre:** CA-9, CA-10
  - **Verificación:** recorrido manual; un PAS, un directivo y un administrativo pueden cambiar la propia.

### Fase 4 – Pulido

- [ ] **T-9 – Estados, accesibilidad y copy**
  - **Qué:** botón deshabilitado al enviar, foco en errores, textos finales; confirmar que el token no aparece en logs.
  - **Archivos:** componentes de T-6 a T-8
  - **Depende de:** T-6, T-7, T-8
  - **Cubre:** CA-4 (no mostrar contraseña), 4.2
  - **Verificación:** revisión de logs y HTML; teclado.

## 4. Trazabilidad con la spec

| Criterio de la spec | Tareas |
|---|---|
| CA-1 | T-6 |
| CA-2 | T-4, T-6 |
| CA-3 | T-3, T-4, T-6 |
| CA-4 | T-2, T-3, T-9 |
| CA-5 | T-4, T-6 |
| CA-6 | T-2, T-3, T-4, T-7 |
| CA-7 | T-1, T-7 |
| CA-8 | T-3, T-4, T-7 |
| CA-9 | T-1, T-5, T-8 |
| CA-10 | T-3, T-5, T-8 |
| CA-11 | T-3, T-5 |
| CA-12 | T-4, T-5 |

## 5. Riesgos y puntos de atención

| Riesgo | Mitigación / cómo detectarlo |
|---|---|
| Enumeración de cuentas por diferencia de tiempo o texto | Mismo aviso y camino de código similar; revisar en T-4. |
| Token filtrado en logs o en el encabezado `Referer` | No loguear la URL completa; `Referrer-Policy: no-referrer` en la pantalla de T-7. |
| El flujo de recuperación de Supabase usa token en el enlace (formato propio) | La interfaz `AuthProvider` lo absorbe; T-3 y T-7 lo prueban contra Supabase local. |
| SMTP productivo y plantilla definitiva del correo | Fuera de alcance; local usa Mailpit. Es una tarea aparte antes de producción. |

## 6. Validación final

- [ ] `npm run lint` sin errores
- [ ] `npm run build` pasa
- [ ] Todos los criterios de aceptación de la spec recorridos y marcados
- [ ] Spec actualizada si el diseño cambió durante la implementación
- [ ] PR abierto, revisado por el otro integrante

## 7. Bitácora de ejecución

| Fecha | Tarea | Nota |
|---|---|---|
