# PROMPT 03 — Handler HTTP con validación

## Skill de lanzamiento
- **Skill:** `edge-http-handler` (propia) — `skills/edge-http-handler/SKILL.md`
- **Estado:** existente
- **Granularidad:** 1 agente, 1 skill. No apilar otras.
- **Engram al abrir:** `mem_current_project` → `mem_context` → `mem_search` (`topic_key`: `architecture/supabase-edge-hub`)
- **Engram al cerrar:** `mem_save` de `handler.ts` (validación y códigos HTTP)
- **Precondición:** `00_contexto_base.md` + código de 01–02. Existe `supabase/functions/cotizar/handler.ts`.

## Tarea
Completá **solo** `supabase/functions/cotizar/handler.ts`. `index.ts` no se toca salvo que el import a `handleCotizar` siga comentado: en ese caso, descomentarlo y nada más.

`handleCotizar(req: Request): Promise<Response>` debe:

1. Rechazar métodos distintos de `POST` con `405`
2. Parsear el body como JSON; si falla, `400` con `AppError` `code: "BODY_INVALIDO"`
3. Validar forma de `SolicitudCotizacion` (campos presentes y tipos; `coberturaDeseada` ∈ `terceros` | `terceros_completo` | `todo_riesgo`). Si falla, `400` con `code: "SOLICITUD_INVALIDA"`
4. Si es válida: **no** llamar al servicio todavía. Responder `501` JSON `{ "error": "not implemented" }`

No instancies Supabase, orquestador ni ACL.

## Output esperado
`handler.ts` con validación síncrona del DTO y respuestas `405` / `400` / `501`.

## Criterio de aceptación
```bash
deno check supabase/functions/cotizar/handler.ts
```
Body inválido → 400. Body válido → 501. Sin llamadas de red ni a BD.
