# HOM ERP — estado para revisión

Sistema de registro operativo de una red de intermediación de seguros. No es la aseguradora: no underwritea ni paga siniestros. La póliza legal vive en la compañía.

Los casos de uso y la documentación vigente están en `docs/`, relativa a la raíz de este repositorio (`design/`). Índice: `docs/casos-de-uso/lista-casos-de-uso-HOM-ERP.md`. Cualquier agente que abra `design/` resuelve esa ruta desde aquí.

Arquitectura adoptada: [ADR-002](docs/ADRs/ADR-002.md) (Aggregator + ACL), [ADR-003](docs/ADRs/ADR-003.md) (Circuit Breaker, **diferido**) y [ADR-004](docs/ADRs/ADR-004.md) (Supabase + Edge Functions). No usar como vigente los borradores `borrador_arquitectura_diseno_software.md`, `asesoramiento_diseno.md` ni la sección «Arquitectura (v1)» de `PRESENTACION-briefing-tecnico.md`.

## Stack

`prototype/` es un prototipo en Next.js. Sirve solo para validar requerimientos con el cliente. No es el stack de implementación. Plataforma: Supabase (cierra ERP-9; [ADR-004](docs/ADRs/ADR-004.md)).

| Capa | Tecnología |
| --- | --- |
| Base de datos | PostgreSQL vía Supabase |
| Autenticación | Supabase Auth (detrás de las interfaces de `front/src/lib/`) |
| Hub de aseguradoras | Supabase Edge Functions (TypeScript/Deno): ACL + Aggregator, timeout 4 s |
| Presentación | Next.js en `front/` |
| Aggregator en Go | Solo si el fan-out concurrente a N compañías con circuit breaker es un cuello **medido**, no anticipado |

## Funcionalidades

El prototipo nombra cinco, en `prototype/README.md`: cotizar, comparar, propuesta, cartera y cobranzas.

El índice de casos de uso describe una operación más amplia (pendientes, siniestros, comisiones, directivo, back-office, rúbrica). Esa documentación no está completa.

## Actores

| Actor | Relación con el sistema |
| --- | --- |
| PAS | Usuario final. Opera su cartera. |
| organizador/ directivo de HOM | Habilita la red y ve la producción agregada. |
| Administrativo | Opera con el directivo sobre la red. |
| Back-office | Rol previsto. Sus casos no están escritos. |
| Asegurado / tomador | No opera el ERP. |
| Aseguradora | Origen de cotización, emisión y cobranza. No es usuario. |
| SSN | Restricción legal. No es actor de la interfaz. |

## Esquema de base de datos

Hay dos esquemas y no están reconciliados.

| Archivo | Qué es |
| --- | --- |
| `sql/schema/schema.sql` | Modelo de red: usuario, productor, asegurado, póliza de hogar y de automotor. |
| `prototype/src/db/schema.sql` | Prototipo de cotización automotor. Una tabla `cotizaciones`, compañía por defecto Mercantil. |

## Documentación

Canónica y accesible desde la raíz del proyecto: `docs/`.

No está completa.

- `PRESENTACION-briefing-tecnico.md` cita `MODELO DE NEGOCIO.md` y `middleware.md`. Esos archivos no están en el repositorio.
- El índice `docs/casos-de-uso/lista-casos-de-uso-HOM-ERP.md` anuncia carpetas sin archivos: cobranza (30–33), comisiones (39), cross-selling (57), `ADMINISTRATIVO-OWNER` (40–51 y 58–59) y back-office (52–54).
- Siguen abiertas `docs/cuestiones-a-resolver.md` y la sección «Decisiones abiertas» del índice.
- `prototype/AGENTS.md` es el stub que regenera Next. Este archivo, en la raíz, es el que lee `gga`.

## Ruta de implementación autorizada

**Todos los cambios y la implementación de la cadena de prompts `docs/PLAN_ESTILO_ARQUITECTONICO/` (pasos 01→10) se efectúan sobre la raíz de este repositorio:**

```
/home/mateo/Documentos/MIGRACION_ERP/ERP ASEGURADORA/implementacion
```

**Bajo ninguna circunstancia sobre `prototype/`.**

- `prototype/` es un prototipo en Next.js que sirve solo para validar requerimientos con el cliente. **No es el stack de implementación.**
- Los artefactos de los prompts 01→10 se escriben bajo `supabase/functions/` de este repositorio: `supabase/functions/_shared/`, `supabase/functions/cotizar/`, `supabase/functions/cotizar/acl/mappers/`, etc.
- `prototype/src/db/schema.sql` es un esquema de prototipo, no el esquema vigente. El esquema de base de datos relacional es `sql/schema/schema.sql` (PostgreSQL vía Supabase).

## Skills de proyecto (hub Edge)

Cadena de implementación: `docs/PLAN_ESTILO_ARQUITECTONICO/`. Una skill por sesión. El paso 01 no carga skill.

| Skill | Cuándo |
| --- | --- |
| `canonical-types` | Contratos en `_shared/types.ts` |
| `edge-http-handler` | Validación HTTP de `cotizar/handler.ts` |
| `domain-service-supabase` | `ServicioCotizacion` |
| `fanout-orchestrator` | Fan-out 4 s + `Promise.allSettled` |
| `provider-acl` | Un mapper ACL por sesión |
| `resilience-http` | Esqueleto CB (sin trip) o `HttpClient` |
| `walking-skeleton-e2e` | Stub in-memory + POST `/cotizar` 200 |
| `deno-contract-tests` | `Deno.test` de contrato ACL |

Ruta: `skills/<nombre>/SKILL.md`. Borradores: `docs/PLAN_ESTILO_ARQUITECTONICO/skills-draft/`.

## Revisión

Un cambio no cumple si trata un borrador como arquitectura vigente, si ignora ADR-002/003/004, si presenta los dos esquemas como un solo modelo, si afirma que la documentación está completa, si toma `prototype/` como el stack de implementación, o si trata Go como el runtime actual del hub.
