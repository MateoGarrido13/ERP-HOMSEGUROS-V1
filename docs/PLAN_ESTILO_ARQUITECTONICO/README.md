# Cadena de prompts — Esqueleto del multicotizador

Cada paso corre en una **sesión nueva**: se pega `00_contexto_base.md`, se carga **una sola skill**, se ejecuta el prompt y se guarda el artefacto en Engram. Esta carpeta no genera TypeScript hasta que se ejecuten los prompts, en orden 01→10.

## Stack decidido
- **Supabase Edge Functions** (TypeScript / Deno) — ACL + fan-out + circuit breaker + cliente HTTP
- **Supabase** — base de datos relacional única (PostgreSQL), Auth, Storage
- **Go** — reservado para cuando el Aggregator sea cuello de botella medido
- **Patrón dominante** — Router → Handler → Servicio → Orquestador (fan-out paralelo con `Promise.allSettled` + `AbortController` + circuit breaker por proveedor)
- **Circuit breaker (v1):** esqueleto sin trip. ADR-003 lo deja diferido; el grafo CB → HttpClient se mantiene.

## Mapa de prompts

| # | Archivo | Produce | Skill de lanzamiento |
|---|---------|---------|----------------------|
| 00 | `00_contexto_base.md` | Contexto compartido que se pega al inicio de cada sesión | ninguna (contexto) |
| 01 | `01_estructura_proyecto.md` | Árbol de directorios + convenciones de nombres | ninguna (andamiaje one-off) |
| 02 | `02_tipos_contratos.md` | Tipos TypeScript centrales + contratos entre capas | `canonical-types` (propia) |
| 03 | `03_router_handler.md` | Handler HTTP con validación del DTO | `edge-http-handler` (propia) |
| 04 | `04_servicio_dominio.md` | Servicio de dominio + cliente Supabase | `domain-service-supabase` (propia) |
| 05 | `05_orquestador_fanout.md` | Orquestador con `Promise.allSettled` + `AbortController` | `fanout-orchestrator` (propia) |
| 06 | `06_acl_proveedor.md` | ACL Sancor (traducción canónico ↔ proveedor) | `provider-acl` (propia) |
| 07 | `07_circuit_breaker.md` | Esqueleto CB por proveedor (sin lógica de trip) | `resilience-http` (propia) |
| 08 | `08_cliente_http.md` | Cliente HTTP controlado por CB + `AbortSignal` | `resilience-http` (propia, **repite** 07) |
| 09 | `09_integracion_e2e.md` | POST `/cotizar` contra aseguradora stub | `walking-skeleton-e2e` (propia) |
| 10 | `10_tests_contrato.md` | Tests de contrato ACL ↔ proveedor (`Deno.test`) | `deno-contract-tests` (propia) |

Skills propias: `skills/<nombre>/SKILL.md`. Borradores de autoría: `skills-draft/`. No usar `go-testing`, Postman ni Figma en esta cadena.

## Cómo usar

1. Abrí una sesión nueva.
2. Pegá `00_contexto_base.md` **primero** (sin instrucción adicional).
3. Cargá **solo** la skill de la columna anterior (`skills/<nombre>/SKILL.md`). El paso 01 no carga skill.
4. Engram al abrir: `mem_current_project` → `mem_context` → `mem_search` (`topic_key`: `architecture/supabase-edge-hub`).
5. Pegá el prompt del paso. Desde el 02, incluí el código ya generado de los pasos anteriores.
6. Guardá el código en la ruta que indica el prompt.
7. Engram al cerrar: `mem_save` del artefacto (ruta, contrato, criterio que pasó).

## Convención de granularidad
Cada prompt pide **un único módulo / archivo** a la vez. **1 agente, 1 skill.**  
Si el LLM empieza a generar más de lo pedido, recórtalo con:  
> "Solo el archivo indicado. El resto lo pediremos en el paso siguiente."
