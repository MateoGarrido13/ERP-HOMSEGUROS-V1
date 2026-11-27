# Política de merges a `main`

| | |
|---|---|
| **Estado** | Provisoria: vigente hasta hablarla con el resto del equipo |
| **Acordada** | 2026-11-26 (Yaco10) |
| **Autor** | Yaco10 con IA |
| **Complementa** | [`guia-spec-driven.md`](guia-spec-driven.md) |

## Por qué existe

Esperar la aprobación de otra persona antes de mergear frena el avance (`main` no se mueve hasta que revisa) y suma trabajo a quien revisa. Esta política fija, por ahora, un camino que permite avanzar sin esperar y que mantiene la visibilidad del equipo.

## Regla vigente: revisión después del merge (salvo cambios críticos)

1. **Cada trabajo va en su rama y entra por Pull Request.** No se hace push directo a `main`.
2. **Quien abre el PR lo mergea** cuando se cumplen los chequeos de la sección siguiente. No se espera la aprobación previa de otra persona, **salvo que el cambio sea crítico** (ver «Cambios críticos: revisión previa obligatoria»).
3. **Se mergea con merge commit**, no con squash, para conservar el historial por historia o por feature.
4. **El PR lleva una descripción corta** que dice qué incluye, cómo se verificó y qué hay que tener en cuenta. Con eso, leerlo lleva minutos.
5. **Después del merge se avisa al resto del equipo** con el enlace al PR. La revisión es posterior y opcional en tiempo: cuando la persona pueda, lo lee. Si encuentra algo, se corrige con un commit nuevo en una rama nueva.

## Chequeos antes de mergear

El repo no tiene integración continua: los chequeos se corren a mano en la rama del PR.

- [ ] `tsc` sin errores, `npm run test` sin fallas, `npm run lint` sin errores y `npm run build` correcto (en `front/`).
- [ ] Si hay migraciones: `supabase db reset` aplica todo en orden y pasan los tests SQL de `supabase/tests/`.
- [ ] Si hay pantallas: prueba manual en el navegador de los criterios de aceptación de la spec.
- [ ] El PR no tiene choques con `main` (GitHub lo muestra como mergeable).
- [ ] Si el cambio es crítico (ver la sección siguiente), además de la revisión independiente (por ejemplo la de Gentle AI) tiene la aprobación de otro integrante, y los hallazgos críticos están corregidos.

## Cambios críticos: revisión previa obligatoria

Un PR es **crítico** si toca alguno de estos ítems (los mismos de alto riesgo de la política de Jira):

1. **Datos o efectos irreversibles:** migraciones, cambio o borrado de datos guardados, cambios de formato persistido.
2. **Seguridad:** autenticación, permisos, credenciales, secretos, guardas.
3. **Contratos que otros consumen:** cambiar o quitar una API pública, flags de CLI, formatos de configuración o exports publicados.
4. **Concurrencia:** locks, condiciones de carrera, orden de operaciones asíncronas.
5. **Entrega o entorno:** instaladores, release, CI, deploy, dependencias.
6. **Sin red de seguridad:** no hay un test que detecte una regresión en lo que cambia.

Para estos PR:

- **No se mergea sin la aprobación de otro integrante del equipo.** Mientras tanto el PR espera; el resto de los PR sigue la regla general.
- Quien abre el PR lo marca con la etiqueta `revisión-previa` y avisa al revisor, para que sepa cuáles mirar primero.
- La descripción del PR indica qué ítem de la lista dispara la revisión previa.
- Si hay duda de si un cambio es crítico, se trata como crítico.
- La aprobación la da una persona; una revisión automática no la reemplaza.
- Mientras espera, se puede seguir trabajando en ramas que no dependan de ese PR (ver «Cuándo usar una rama de integración»).

## Lo que no cambia de la guía spec-driven

- **No se implementa sin spec aprobada** cuando la guía la exige, y sin plan aprobado si el trabajo tiene más de unas tres tareas.
- **Un PR no mezcla una spec nueva con su implementación:** primero se mergea la spec aprobada y después viene el código.
- **La spec manda sobre el código:** si divergen, se actualiza una de las dos en el mismo PR.
- En el encabezado de la spec o el plan se anota quién los aprobó, sin afirmar que lo revisó otra persona si no fue así.

## Cuándo usar una rama de integración

- **Specs implementadas en paralelo:** cada una en su rama, más una rama extra de integración donde se juntan, se resuelven los choques y se prueba. Cuando está bien, un solo PR de la integración a `main`. Esa rama es descartable.
- **Specs implementadas de a una (secuencial):** no hace falta rama extra; cada spec va a `main` y la siguiente parte de ese `main`.
- **Paralelo solo si las specs tocan archivos distintos.** Si comparten archivos o una depende de otra, conviene secuencial.

## Para hablar con el equipo

Esta política se revisa cuando se hable con el resto del equipo. Alternativas que quedaron planteadas:

- **Revisión previa con plazo acordado:** quien revisa tiene, por ejemplo, 24 horas; si no contesta, se mergea.
- **PRs apilados:** se sigue trabajando sin esperar, abriendo el siguiente PR contra la rama anterior en vez de `main`; implica reacomodar si se piden cambios.
- **Revisión previa solo para lo difícil de deshacer:** ya incorporada para los cambios críticos (ver arriba); queda por acordar si las specs también entran.

## Historial de cambios

| Fecha | Cambio | Motivo |
|---|---|---|
| 2026-11-26 | Versión inicial, provisoria | Avanzar sin esperar revisión previa hasta hablarlo con el equipo |
| 2026-11-26 | Revisión previa obligatoria para cambios críticos | La versión inicial permitía mergear sin que nadie viera cambios de datos, permisos o autenticación |
