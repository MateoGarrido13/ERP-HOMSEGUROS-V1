---
name: walking-skeleton-e2e
description: "Trigger: walking skeleton, E2E stub, StubACL, POST /cotizar 200. Wire a valid quote request to an in-memory insurer stub."
license: Apache-2.0
metadata:
  author: hom-erp
  version: "1.0"
---

## Activation Contract

Use when implementing prompt 09 (stub insurer + handler 200). One agent, this skill only.

## Hard Rules

- Create `acl/mappers/stub.ts` with `StubACL`: no `fetch`, no `HttpClient`.
- Change `handler.ts` only to replace 501 with `Orquestador([new StubACL()])` and `200` JSON.
- Do not instantiate `ServicioCotizacion` or Supabase. Persistence stays deferred.
- Do not edit Sancor, Zurich, circuit breaker, or `httpClient`.
- Do not edit `index.ts`.

## Decision Gates

| Situation | Action |
| --- | --- |
| Valid body | 200 + stub quote |
| Invalid body | Keep step 03 codes (400/405) |
| Need real insurer | Refuse; stub only |

## Execution Steps

1. Read `09_integracion_e2e.md`.
2. Add `StubACL`. Wire the handler seam.
3. `deno check` handler + stub.
4. `mem_save` the 501 → 200 change.

## Output Contract

Return: paths edited, confirmation of no network in stub.

## References

- `docs/PLAN_ESTILO_ARQUITECTONICO/09_integracion_e2e.md`
- `docs/ADRs/ADR-004.md`
