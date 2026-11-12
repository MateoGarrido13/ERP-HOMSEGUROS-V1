# HOM ERP — estado para revisión

Sistema de registro operativo de una red de intermediación de seguros. No es la aseguradora: no underwritea ni paga siniestros. La póliza legal vive en la compañía.

Los casos de uso y la documentación vigente están en `docs/`, relativa a la raíz de este repositorio (`design/`). Índice: `docs/casos-de-uso/lista-casos-de-uso-HOM-ERP.md`. Cualquier agente que abra `design/` resuelve esa ruta desde aquí.

No hay un registro de arquitectura adoptado. Existen borradores sin cerrar y sin reflejo único en el código: `borrador_arquitectura_diseno_software.md`, `asesoramiento_diseno.md` y la sección «Arquitectura (v1)» de `PRESENTACION-briefing-tecnico.md`. No usarlos como decisión vigente.

## Stack

`prototype/` es un prototipo en Next.js. Sirve solo para validar requerimientos con el cliente. No es el stack de implementación.

| Capa | Tecnología |
| --- | --- |
| Base de datos | Relacional, PostgreSQL |
| Lógica de negocio | Go |
| Presentación | Next.js, Templ |
| Scripts | JavaScript |

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

## Revisión

Un cambio no cumple si trata un borrador como arquitectura vigente, si presenta los dos esquemas como un solo modelo, si afirma que la documentación está completa, o si toma el prototipo de `front/` como el stack de implementación.
