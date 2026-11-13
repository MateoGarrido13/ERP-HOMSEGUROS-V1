---
name: resilience-http
description: "Trigger: circuit breaker, HttpClient, CIRCUITO_ABIERTO, AbortSignal, fetch proveedor. Implement CB skeleton or the HTTP client it controls."
license: Apache-2.0
metadata:
  author: hom-erp
  version: "1.0"
---

## Activation Contract

Use for `circuitBreaker.ts` or `httpClient.ts` when a prompt names this skill (steps 07 and 08). One agent, this skill only. One of those two files per session.

## Hard Rules

- Step 07: `isOpen()` always `false`; `recordSuccess` / `recordFailure` are no-ops. No trip, no half-open, no `Deno.openKv`. ADR-003 is deferred.
- Step 08: `fetch` with injected `AbortSignal`. No extra `AbortController` or `setTimeout`. Check `isOpen()` before `fetch`. Record success/failure on the injected CB.
- The client does not create the registry. The CB does not call HTTP.

## Decision Gates

| File | Implement | Forbid |
| --- | --- | --- |
| `circuitBreaker.ts` | Registry + always-closed CB | Thresholds, state machine |
| `httpClient.ts` | POST JSON + fail-fast if open | Timers, canonical mapping |

## Execution Steps

1. Read `07_circuit_breaker.md` or `08_cliente_http.md`, not both as tasks.
2. Edit only the file that prompt names.
3. `deno check` that file.
4. `mem_save` whether trip remains deferred.

## Output Contract

Return: path edited, whether `isOpen` can be true, whether `fetch` is used.

## References

- `docs/PLAN_ESTILO_ARQUITECTONICO/07_circuit_breaker.md`
- `docs/PLAN_ESTILO_ARQUITECTONICO/08_cliente_http.md`
- `docs/ADRs/ADR-003.md`
- `docs/ADRs/ADR-004.md`
