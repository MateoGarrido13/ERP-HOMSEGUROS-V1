---
name: fanout-orchestrator
description: "Trigger: orquestador, fan-out, Promise.allSettled, AbortController, timeout 4s. Implement parallel insurer calls with partial results."
license: Apache-2.0
metadata:
  author: hom-erp
  version: "1.0"
---

## Activation Contract

Use when implementing `supabase/functions/cotizar/orquestador.ts` or when a prompt names this skill. One agent, this skill only.

## Hard Rules

- Edit only `orquestador.ts`.
- Depend only on `IProveedorACL`. No mapper, HTTP, or circuit-breaker imports.
- Fan-out with `Promise.allSettled`. Never `Promise.all`.
- Global timeout **4000 ms** via `AbortController` (ADR-004).
- A rejected provider becomes a `CotizacionCanonica` with `error` set; it does not fail the batch.
- `clearTimeout` in `finally`.

## Decision Gates

| Event | Action |
| --- | --- |
| Provider throws or aborts | Canonical row with `error`, `prima: 0` |
| Need provider JSON | Refuse; ACL owns translation |
| Timeout value | 4000 ms, not per-file constants elsewhere |

## Execution Steps

1. Read prompt `05_orquestador_fanout.md`.
2. Implement `cotizarEnParalelo`.
3. `deno check` the file. Confirm no `Promise.all(`.
4. `mem_save` timeout and allSettled usage.

## Output Contract

Return: path edited, timeout ms, check result.

## References

- `docs/PLAN_ESTILO_ARQUITECTONICO/05_orquestador_fanout.md`
- `docs/ADRs/ADR-002.md`
- `docs/ADRs/ADR-004.md`
