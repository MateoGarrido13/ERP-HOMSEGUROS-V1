---
status: draft
phase: 0
---

# As-built del prototipo Next — pendientes, cotizar, cartera

Nota de lo que **está construido** en `front/` (App Router) para validar UX con el cliente. No es el stack de implementación (`AGENTS.md`: PostgreSQL, Go, Next.js/Templ). No fusiona los dos esquemas SQL. Las decisiones canónicas siguen en los CU y en «Resuelto (iteración 1)» de `cuestiones-a-resolver.md`; acá se anotan desvíos como hechos.

Inventario de CU: [`INDEX.md`](INDEX.md).

## Quick path

1. Entrar por `/` (login) y usar las pestañas PAS: Cotizar, Cartera, Pendientes (`front/src/lib/navigation.ts`).
2. Automotor real contra Mercantil: `/cotizar` → `/cotizar/automotor` → `/cotizar/comparar` → `/cotizar/propuesta` → `/cotizar/pdf` → `/cotizar/enviado`.
3. Pendientes: `/pendientes` (avisos mock + leads de `cotizaciones`).
4. Cartera: `/cartera` (una sola pantalla: gráfico + lista).

## Rutas de los tres slices

Otras rutas del prototipo (`/siniestros`, `/perfil`, `/red`, `/recuperar/*`) existen y **no** forman parte de esta nota.

### Pendientes — `F-pendientes`

| Ruta | Pantalla | Datos |
| --- | --- | --- |
| `/pendientes` | Bandeja avisos + sección Leads | Avisos: arreglo `pendingNotices` en `front/src/lib/pendientes.ts`. Leads automotor: `listAutomotorLeads()` sobre `cotizaciones`. Descarte: `PATCH /api/cotizaciones/automotor/[id]` |

Pantallas clave (componentes, no rutas extra): `PendientesBoard`, `PendingBoard`, `LeadBoard`.

### Cotizar / multicotizador — `F-multicotizador-auto`

| Ruta | Pantalla | Notas de construcción |
| --- | --- | --- |
| `/cotizar` | Selector «Elegí la cobertura» | Tiles con link: Automotor, Hogar, Accidentes Personales, ART. Comercio / RC / Vida: botón inerte |
| `/cotizar/automotor` | Formulario de riesgo + POST a Mercantil | Camino feliz actual: salta a comparar **sin** pasar por cliente |
| `/cotizar/riesgo` | `RiskForm` (datos del vehículo) | Existe; el flujo automotor vigente **no** enlaza acá. Continúa a `/cotizar/asegurado` |
| `/cotizar/asegurado` | Datos del asegurado | Continúa a `/cotizar/comparar` |
| `/cotizar/comparar` | Comparar primas | Mercantil en vivo (`loadMercantilForConsulta`); Sancor y Allianz mock (`front/src/lib/mock-pas.ts`) |
| `/cotizar/propuesta` | Armar propuesta | |
| `/cotizar/pdf` | Propuesta PDF | |
| `/cotizar/enviado` | Confirmación de envío | CTA «Ver cartera» → `/cartera` |
| `/cotizar/hogar` | Formulario de vivienda | Camino: riesgo → asegurado → enviado (solicitud, **sin** comparar) |
| `/cotizar/hogar/asegurado` | Datos del asegurado (hogar) | |
| `/cotizar/hogar/enviado` | Solicitud enviada | |
| `/cotizar/accidentes` | Formulario AP | Ramo no habilitado en iteración 1; el prototipo sí abre flujo |
| `/cotizar/accidentes/asegurado` | Asegurado AP | |
| `/cotizar/accidentes/enviado` | Solicitud enviada | |
| `/cotizar/art` | Formulario ART | Igual: flujo abierto en prototipo, fuera del alcance canónico |
| `/cotizar/art/asegurado` | Asegurado ART | |
| `/cotizar/art/enviado` | Solicitud enviada | |

API de cotización (solo automotor):

| Ruta | Uso |
| --- | --- |
| `POST /api/cotizaciones/automotor` | Alta de cotización Mercantil |
| `/api/cotizaciones/automotor/[id]` | Lectura / `PATCH` (p. ej. descartar lead) |

No hay rutas `/cotizar/consorcio` ni `/cotizar/comercio`.

### Cartera — `F-cartera`

| Ruta | Pantalla | Datos |
| --- | --- | --- |
| `/cartera` | Título, gráfico por ramo, filtros y lista expandible | `portfolioPolicies` en `front/src/lib/portfolio.ts` (mock). Sin rutas de ficha, edición ni alta |

Filtros en query: compañía, localidad, ramo. No hay campo de búsqueda por nombre. El detalle del cliente y de la póliza se abre **inline** al tocar la tarjeta. Ramos del mock: automotor, hogar, ART, consorcio.

## Frontera de datos (dos esquemas, sin merge)

| Archivo | Qué modela en este prototipo / repo | Tablas vistas |
| --- | --- | --- |
| `front/src/db/schema.sql` | Cotización automotor del prototipo | `cotizaciones`, `cotizacion_planes`; default `company = mercantil`. También `"USER"` (login demo) |
| `sql/schema/schema.sql` | Modelo de red / cartera (no lo consume el prototipo Next) | `usuario`, `productor`, `asegurado`, `inmueble`, `poliza`, `poliza_hogar`, `bien_hogar`, `poliza_automotor`, `vehiculo` + RLS (`app.acceso`) |

Deuda conocida, no higiene de esta nota: en `sql/schema/schema.sql` la línea de `inmueble` empieza con `';;CREATE TABLE` (corrupción sintáctica). Los mocks de pendientes y cartera **no** leen ese esquema.

Estado de cotización «en curso»: query string (`nuqs` / `quote-search.ts`). Alineado con CU-12 solo-sesión de la iteración 1; no hay listado persistido de «En curso».

## Dónde el prototipo diverge de los CU canónicos

Hechos de código vs «Resuelto (iteración 1)» y los CU in-scope. No son decisiones nuevas.

- **Orden del flujo.** Canónico: ramo → cliente (CU-10) → riesgo (CU-17 / CU-17b) → comparar (CU-18). Automotor vigente: ramo → `/cotizar/automotor` (riesgo + API) → comparar; el cliente no entra en ese camino. Queda el par `/cotizar/riesgo` → `/cotizar/asegurado` (riesgo antes que cliente), sin enlace desde el formulario automotor actual.
- **Hogar no es masivo.** Canónico CU-17b → CU-18. Prototipo: formulario → asegurado → «solicitud enviada», sin comparar ni hub.
- **Ramos del selector.** Canónico: habilitados Automotor, Hogar, Consorcio, Comercio (solo compañías con API); AP/ART/RC/Vida se ven y no abren flujo. Prototipo: AP y ART sí abren; Comercio no navega; Consorcio no tiene tile ni ruta de cotizar (sí aparece en mocks de cartera/pendientes).
- **No hay pantalla CU-16.** En Pendientes, «Resolver → Dar de alta» quita el aviso y muestra el flash «El cliente pasó a Cartera». No pide número de póliza, vigencia ni compañía.
- **Propuesta enviada vs Cartera.** Canónico CU-14: persistir cliente `activa=false`, aviso en Pendientes, **no** mostrar en Cartera hasta CU-16. Prototipo: `/cotizar/enviado` ofrece «Ver cartera».
- **CU-23 «+».** No hay control «+» en `/cartera` ni redirección a cotizar desde la lista.
- **CU-22 / CU-24 / CU-29.** Lista mock con filtros compañía/localidad/ramo; sin búsqueda por nombre, sin editar cliente, sin carga inicial de pólizas.
- **Comparar (CU-18).** El CU ya tiene cuerpo. UI del prototipo: Mercantil (API), Sancor y Allianz (mock). No aparecen Zurich ni La Segunda. Estimado diferido.
- **Unicidad del documento.** Canónico: un asegurado ↔ un PAS; el otro PAS ve aviso sin datos y no cotiza. El prototipo no implementa esa guarda.
- **CU-05c.** El aviso «Pago rechazado» está en el mock de Pendientes; no hay ticket de cobranza (CU-31), coherente con el alcance.
- **Leads.** Automotor sale de `cotizaciones` (Mercantil). «Resolver → Lead» en cotización enviada **no** crea el lead en ese arreglo: solo saca el aviso y un flash. CU-08b Reactivar sí arma un aviso `cotizacion-enviada` en memoria.

## Checklist

- [x] Rutas App Router de los tres slices listadas desde `front/src/app`.
- [x] Mocks y tablas nombrados sin unificar esquemas.
- [x] Desvíos vs CU canónicos como hechos.
- [x] AP/ART y CU-21 no propuestos como alcance.

## Next step

Phase 1 (constitución / NFR). El walking skeleton se especifica contra los CU (incluido CU-18), no contra estas rutas.
