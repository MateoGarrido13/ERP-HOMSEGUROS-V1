## PR: feat — cierre de ERP-5 (inicio de sesión en el ERP)

Cierra la US ERP-5: puerta de entrada al ERP para PAS, directivo y administrativo. Construye los cimientos compartidos de la épica Acceso (tipos, proveedor Supabase Auth, sesión, DAL, proxy, layouts y componentes base) que reutilizan ERP-6, 7, 8 y 17.

### Tareas de ERP-5 (12/12 hechas)

| Tarea | Descripción | Estado |
|-------|-------------|--------|
| T-1 | Configurar tests de lógica pura (Vitest + script test) | ✅ Hecho |
| T-2 | Definir tipos de dominio (`types.ts`) | ✅ Hecho |
| T-3 | Portar validaciones (`validation.ts` + `validation.test.ts`, 12 tests) | ✅ Hecho |
| T-4 | Levantar Supabase local y migrar el esquema (`usuario.id` → uuid = `auth.users.id`, sin `password`, tabla `auditoria`, RLS con `auth.uid()`, seed con 3 cuentas) | ✅ Hecho |
| T-5 | Implementar el proveedor contra Supabase (`provider.ts`, `provider.supabase.ts`, clientes `@supabase/ssr`) | ✅ Hecho |
| T-6 | DAL de sesión (`session.ts`, `dal.ts` con `verifySession` y `getSessionOptional`) | ✅ Hecho |
| T-7 | Auditoría de ingreso (`audit/index.ts` con `registrarAuditoria`) | ✅ Hecho |
| T-8 | Proxy (`proxy.ts` con chequeo optimista de cookie de sesión) | ✅ Hecho |
| T-9 | Componentes base de UI (`TextField`, `BrandButton`, `SurfaceCard`, `ScreenTitle`, `cn.ts`, `hom-logo.png`) | ✅ Hecho |
| T-10 | Layouts (público / app) y destinos por rol (`AppShell`, menú por rol, `/pendientes`, `/red`) | ✅ Hecho |
| T-11 | Pantalla y acción de ingreso (login con Figma, `useActionState`, checkbox Recordarme, redirección por rol) | ✅ Hecho |
| T-12 | Accesibilidad y estados (`aria-invalid`, `aria-describedby`, foco al primer error, botón deshabilitado al enviar) | ✅ Hecho |

### Verificación aplicada

- `npm run build` (Next.js 16.3.8, Turbopack): ✅ Compilado exitosamente. Rutas generadas: `/`, `/pendientes`, `/perfil`, `/red`, Proxy (Middleware).
- `validation.test.ts`: 12 tests pasando.
- `npx tsc --noEmit`: sin errores en los archivos de ERP-5.
- Lint: solo warnings esperados en métodos no implementados de ERP-6/7 (pendientes de esas US); los 436 errores del lint son preexistentes en `next.config.ts` y archivos de configuración no relacionados con ERP-5.

### Criterios de aceptación cubiertos

CA-1 a CA-10 de ERP-5, y CA-1 a CA-6 de la épica Acceso (ver `docs/specs/ERP-5-iniciar-sesion/spec.md` §7 y `docs/specs/EPICA-acceso/spec.md` §7).

### Notas

- Los métodos de recuperación/cambio de contraseña (`requestPasswordReset`, `checkResetToken`, `resetPassword`, `changePassword`) y `UsuarioRepo.actualizarPerfil` quedan lanzando "No implementado"; se activan en ERP-6 y ERP-7.
- El proyecto Supabase alojado ("el Supabase original") aún no existe; todo corre contra la instancia local vía Docker.
