# PROMPT 04 — Servicio de dominio

## Skill de lanzamiento
- **Skill:** `domain-service-supabase` (propia) — `skills/domain-service-supabase/SKILL.md`
- **Estado:** existente
- **Granularidad:** 1 agente, 1 skill. No apilar otras.
- **Engram al abrir:** `mem_current_project` → `mem_context` → `mem_search` (`topic_key`: `architecture/supabase-edge-hub`)
- **Engram al cerrar:** `mem_save` de `servicio.ts` (delegación y stub de persistencia)
- **Precondición:** `00_contexto_base.md` + código de 01–03. Existe `supabase/functions/cotizar/servicio.ts`.

## Tarea
Completá **solo** `supabase/functions/cotizar/servicio.ts`.

`ServicioCotizacion`:

- Constructor: `supabase: SupabaseClient` y `orquestador: Orquestador`
- `cotizar(solicitud: SolicitudCotizacion): Promise<CotizacionCanonica[]>` delega en `orquestador.cotizarEnParalelo(solicitud)` y devuelve el array
- **No** insertes en BD. Dejá un método privado `registrarCotizaciones(...): Promise<void>` con `// TODO persistencia diferida` (el esqueleto lo pide listo, no ejecutado)

El servicio no importa mappers ni conoce proveedores. El cliente Supabase se guarda para el TODO; no se usa en `cotizar`.

## Output esperado
Un servicio que orquesta y no traduce modelos de aseguradora.

## Criterio de aceptación
```bash
deno check supabase/functions/cotizar/servicio.ts
```
Ningún import desde `acl/mappers/`. `cotizar` no llama a `this.supabase`.
