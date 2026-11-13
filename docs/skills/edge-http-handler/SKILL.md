---
name: edge-http-handler
description: "Trigger: Edge Function handler, Deno serve, validar DTO, handleCotizar, POST /cotizar. Implement HTTP validation for the cotizar handler only."
license: Apache-2.0
metadata:
  author: hom-erp
  version: "1.0"
---

## Activation Contract

Use when implementing `supabase/functions/cotizar/handler.ts` or when a prompt names this skill. One agent, this skill only.

## Hard Rules

- Edit `handler.ts`. Touch `index.ts` only to uncomment `handleCotizar`.
- Validate `SolicitudCotizacion` before any domain call.
- Invalid JSON or shape → `400` + `AppError`. Wrong method → `405`.
- Until the e2e prompt, a valid body returns `501`. Do not construct Supabase, orchestrator, or ACLs here unless a later prompt explicitly wires them.

## Decision Gates

| Request | Response |
| --- | --- |
| Not POST | 405 |
| Body not JSON | 400 `BODY_INVALIDO` |
| Shape invalid | 400 `SOLICITUD_INVALIDA` |
| Shape valid, no e2e yet | 501 |

## Execution Steps

1. Read prompt `03_router_handler.md` and `types.ts`.
2. Implement `handleCotizar` against the table above.
3. `deno check` the handler.
4. `mem_save` status codes.

## Output Contract

Return: path(s) edited, status-code map, check result.

## References

- `docs/PLAN_ESTILO_ARQUITECTONICO/03_router_handler.md`
- `docs/PLAN_ESTILO_ARQUITECTONICO/00_contexto_base.md`
