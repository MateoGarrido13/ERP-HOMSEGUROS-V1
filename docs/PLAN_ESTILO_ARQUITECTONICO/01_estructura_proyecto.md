# PROMPT 01 — Estructura del proyecto

## Skill de lanzamiento
- **Skill:** ninguna (andamiaje one-off; no crear skill propia)
- **Estado:** no aplica
- **Granularidad:** 1 agente, 0 skills. No apilar `work-unit-commits` ni otras.
- **Engram al abrir:** `mem_current_project` → `mem_context` → `mem_search` (`topic_key`: `architecture/supabase-edge-hub`)
- **Engram al cerrar:** `mem_save` de las nueve rutas creadas y del resultado de `deno check`
- **Precondición:** pegaste `00_contexto_base.md` antes de este prompt.

## Tarea
Genera los siguientes archivos exactamente como se indica. No agregues lógica todavía — solo esqueletos con exports vacíos y comentarios de responsabilidad.

---

### 1. `supabase/functions/_shared/types.ts`
Debe exportar:
- `SolicitudCotizacion` (interfaz, copiada del contexto base)
- `CotizacionCanonica` (interfaz, copiada del contexto base)
- `IProveedorACL` (interfaz con un único método: `cotizar(solicitud: SolicitudCotizacion, signal: AbortSignal): Promise<CotizacionCanonica>`)
- `ICircuitBreaker` (interfaz con métodos: `isOpen(): boolean`, `recordSuccess(): void`, `recordFailure(): void`)
- `AppError` (clase que extiende `Error` con campo `code: string`)

### 2. `supabase/functions/_shared/circuitBreaker.ts`
Debe exportar:
- `CircuitBreakerImpl` (clase que implementa `ICircuitBreaker`)
  - constructor recibe `proveedorId: string` y opciones: `{ umbralFallas: number; ventanaMs: number; tiempoRecuperacionMs: number }`
  - solo el esqueleto: propiedades declaradas, métodos con `// TODO` y un `throw new Error("not implemented")`
- `circuitBreakerRegistry` (Map<string, CircuitBreakerImpl> singleton para el worker)
- `getOrCreateCB(proveedorId: string): CircuitBreakerImpl` (función que usa el registry)

### 3. `supabase/functions/_shared/httpClient.ts`
Debe exportar:
- `HttpClient` (clase)
  - constructor recibe `baseUrl: string` y `circuitBreaker: ICircuitBreaker`
  - método `post<T>(path: string, body: unknown, signal: AbortSignal): Promise<T>` — esqueleto con `// TODO`

### 4. `supabase/functions/cotizar/index.ts`
Entry point de la Edge Function. Debe:
- Importar `serve` de `https://deno.land/std@0.168.0/http/server.ts`
- Exportar el handler de Deno con `Deno.serve(handler)` (o `serve(handler)` según versión)
- El handler debe: leer el método HTTP, si es `POST /cotizar` delegar a `handleCotizar` (importado de `./handler.ts`), sino responder 404
- `handler.ts` aún no existe; importarlo con `// @ts-ignore` o dejarlo como import comentado con un `TODO`

### 5. `supabase/functions/cotizar/handler.ts`
Debe exportar:
- `handleCotizar(req: Request): Promise<Response>` — esqueleto que solo parsea el body como JSON y retorna `Response` con status 501

### 6. `supabase/functions/cotizar/servicio.ts`
Debe exportar:
- `ServicioCotizacion` (clase)
  - constructor recibe cliente de Supabase (`SupabaseClient`)
  - método `cotizar(solicitud: SolicitudCotizacion): Promise<CotizacionCanonica[]>` — esqueleto con `// TODO`

### 7. `supabase/functions/cotizar/orquestador.ts`
Debe exportar:
- `Orquestador` (clase)
  - constructor recibe `proveedores: IProveedorACL[]`
  - método `cotizarEnParalelo(solicitud: SolicitudCotizacion): Promise<CotizacionCanonica[]>` — esqueleto con `// TODO`

### 8. `supabase/functions/cotizar/acl/mappers/sancor.ts`
Debe exportar:
- `SancorACL` (clase que implementa `IProveedorACL`)
  - constructor recibe `httpClient: HttpClient`
  - `cotizar(...)` — esqueleto con `// TODO`
  - `toProveedorRequest(solicitud: SolicitudCotizacion): unknown` — privado, esqueleto
  - `toCanonical(raw: unknown): CotizacionCanonica` — privado, esqueleto

### 9. `supabase/functions/cotizar/acl/mappers/zurich.ts`
Mismo esqueleto que `sancor.ts` pero con nombre `ZurichACL`. Sin compartir código con Sancor.

---

## Output esperado
Nueve archivos TypeScript, uno por bloque. Cada archivo:
- tiene su import de tipos desde `../_shared/types.ts` (o ruta relativa correcta)
- compila sin errores con `deno check` (podés suponer que los imports de Supabase se resuelven)
- no tiene lógica real, solo estructura

## Criterio de aceptación
Pegar todos los archivos y correr:
```bash
deno check supabase/functions/**/*.ts
```
No debe haber errores de tipos.
