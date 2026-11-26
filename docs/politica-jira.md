# Política de uso de Jira

| | |
|---|---|
| **Estado** | Provisoria: vigente hasta hablarla con el resto del equipo |
| **Acordada** | 2026-11-26 (Yaco10) |
| **Autor** | Yaco10 con IA |
| **Complementa** | [`guia-jira.md`](guia-jira.md) (cómo se estructura) y [`guia-spec-driven.md`](guia-spec-driven.md) (cómo se diseña) |

## Por qué existe

El trabajo del proyecto se reparte entre Jira, las specs del repo y los PR. Si cada uno anota por su lado, el estado real se pierde. Esta política fija una regla simple: **Jira es la fuente de verdad del trabajo**. Todo trabajo entra por Jira y deja su resultado en Jira. Vale para las personas y para el agente (Claude).

## Regla de entrada: el trabajo sale de Jira

1. **Todo trabajo parte de un issue.** Antes de implementar, diseñar o corregir algo tiene que existir el issue (historia, subtarea o tarea) que lo pide. La clave `ERP-n` identifica el trabajo en la rama, la spec, los commits y el PR.
2. **Se lee el issue antes de empezar.** Descripción, criterios de aceptación, decisiones, enlaces y comentarios son el punto de partida. No se inventan reglas de negocio: lo que falta se pregunta o se anota como supuesto en el issue.
3. **Sin issue, se propone crearlo.** Si llega un pedido que no tiene issue, se propone el issue (tipo, resumen, etiquetas y descripción) y se espera la confirmación antes de crearlo y de arrancar.
4. **El alcance lo fija el issue.** Si hay dudas de alcance se comenta en el issue; no se cambian los criterios en silencio (ver [`guia-jira.md`](guia-jira.md)).

## Regla de salida: el resultado vuelve a Jira

Al terminar un trabajo, Jira refleja lo que pasó:

| Qué ocurrió | Qué se actualiza en Jira |
|---|---|
| Se verificaron criterios de aceptación | La descripción de la historia dice qué quedó verificado y cómo; la subtarea `[QA]` pasa a Finalizado. |
| Cambió el CU o la spec | Se actualizan los criterios de la historia en el mismo momento. |
| Se abrió un PR | El PR nombra la clave `ERP-n`; el issue pasa a **En revisión**. |
| Se mergeó | El issue pasa a **Finalizado** si se cumple su criterio de cierre. |
| Apareció un defecto o una mejora que no entra en el trabajo actual | Se anota como **Tarea** enlazada (ver abajo); no se arregla "de paso" ni se deja solo en el chat o en un comentario del PR. |
| Se tomó una decisión | Queda en el issue (sección «Decisiones tomadas») y, si es de arquitectura, en un ADR. |

## Estructura

```
Épica
 └── Historia (US)       una por caso de uso, con criterios de aceptación
      └── Subtarea       un paso concreto: [Diseño], [Dev], [QA]
Tarea                    trabajo técnico suelto, sin criterios de negocio
```

- **Historia:** una por caso de uso. Lleva criterios de aceptación. Pasa a **Finalizado** cuando sus subtareas están finalizadas y los criterios están verificados.
- **Subtarea:** un paso de la historia, con prefijo `[Diseño]`, `[Dev]` o `[QA]`. No lleva etiquetas.
- **Tarea:** trabajo técnico que no es un paso de una historia: spikes, hallazgos de una revisión, deuda técnica. No lleva criterios de aceptación de negocio sino un **criterio de cierre**.
- **Una historia terminada no se reabre** por trabajo técnico posterior: ese trabajo va en una Tarea enlazada con `relacionado con` a la historia de origen.

## Cómo se escribe una Tarea

```
**Origen:** de dónde salió (revisión del PR #N, issue ERP-n, incidente).

**Problema:** qué pasa hoy, con archivo o pantalla.

**Qué hacer:** el cambio esperado, sin imponer más de lo necesario.

**Criterio de cierre:** cómo se sabe que está hecha (idealmente un test).

**Decisión pendiente:** solo si hay algo que decidir antes de implementar.
```

- **Etiquetas:** módulo (`acceso`, `pendientes`, …) y, si corresponde, el `CU-XX` de origen. Mismas reglas que en la guía.
- **Enlace:** `relacionado con` a la historia de donde salió. Si bloquea a otra cosa, `bloquea a`.
- **Estado:** nace en **Por hacer**. Si se implementa, sigue el flujo normal; si se descarta, se cierra con un comentario que lo explique, no se borra.

## Qué hace el agente y qué no

**El agente puede, sin pedir confirmación aparte:**

- Leer issues y buscar con JQL.
- Comentar en un issue y actualizar el estado de verificación en la descripción de la historia sobre la que se le pidió trabajar.
- Pasar a Finalizado una subtarea cuando el trabajo que describe está hecho y verificado.

**El agente propone y espera confirmación antes de:**

- Crear issues (muestra la lista con resumen, tipo, etiquetas y enlaces). Esto incluye los hallazgos de revisiones automáticas: se anotan solo los que son defectos reales o deuda que el equipo quiere registrar, no cada observación menor.
- Cambiar el alcance o los criterios de aceptación de una historia.
- Pasar una historia a Finalizado o reabrirla.
- Borrar o archivar un issue.

**El agente no hace nunca:** cerrar un criterio sin haberlo verificado, marcar como hecho algo que no corrió, ni dejar un trabajo importante solo en el chat o en el PR sin reflejarlo en Jira. Si una acción en Jira queda bloqueada por permisos, lo informa y lo deja para una persona; no la rodea por otro camino.

## Dónde vive cada cosa

| Qué | Dónde |
|---|---|
| Qué hay que hacer, para quién, criterios de aceptación, estado | Jira |
| Cómo se va a construir (diseño, reglas, casos borde) | `docs/specs/ERP-<n>-<slug>/` (spec y plan) |
| Decisiones de arquitectura | `docs/ADRs/` |
| El cambio | Rama `erp-<n>-<slug>` y PR que nombra la clave |

Si Jira y la spec divergen, se corrige una de las dos en el mismo momento; no se deja la diferencia.

## Qué queda por decidir

- Si el proyecto incorpora un tipo de issue específico para defectos (hoy se usa Tarea).
- Si el uso de sprints se vuelve obligatorio.
- Si el estado «En revisión» se mueve solo al abrir el PR (automatización) o a mano.
