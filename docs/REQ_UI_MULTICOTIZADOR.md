# Requisitos de UI — Multicotizador (Front Next.js)

## Objetivo

Pantalla de cotización donde el PAS (Productor de Asesoramiento de Seguros) recibe múltiples planes de cotización de varias compañías, selecciona uno o más planes y envía la cotización seleccionada.

## Diseño de pantalla

### Cards por compañía

Se renderiza **una card por compañía**, con las siguientes compañías iniciales:

| Compañía | proveedorId | Estado v1 |
|----------|-------------|-----------|
| Mercantil Andina | `prov_mercantil_andina` | API real |
| Sancor Seguros | `prov_sancor_seguros` | Mock ("No disponible") |
| Zurich | `prov_zurich` | Mock ("No disponible") |
| Allianz | `prov_allianz` | Mock ("No disponible") |

Cada card contiene:
- Nombre de la compañía (título de la card)
- Lista de planes de cotización disponibles para esa compañía (uno o más, según lo que devuelva el backend)
- Cada plan se presenta como una **opción seleccionable con checkbox**

### Checkboxes por cobertura/plan

Dentro de cada card de compañía, aparecen los planes como checkboxes:
- **Mínimo de selección:** 1 checkbox en total (de cualquiera de las compañías)
- **Máximo de selección:** todos los checkboxes de todas las compañías
- **Estado por defecto:** ninguno seleccionado (todos los checkboxes desmarcados) hasta que el PAS haga click

### Botón "Enviar cotización"

Ubicado al final de la pantalla, fuera de las cards.

#### Validación al enviar

Si el PAS hace click en "Enviar cotización" sin haber seleccionado al menos un checkbox:
- **No se redirige** a otra página (se mantiene en la misma página)
- Se muestra una notificación de error con el texto exacto:
  > "Es necesario seleccionar al menos una cotización"

Si se selecciona al menos un checkbox:
- Se procede con el envío de la cotización seleccionada (lógica de backend por definir)

## Entrada de datos (backend)

El front recibe del backend un array plano de `CotizacionCanonica[]` (orquestador de fan-out, prompt 05). Cada elemento tiene:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `proveedorId` | string | `"prov_mercantil_andina"`, `"prov_sancor_seguros"`, `"prov_zurich"`, `"prov_allianz"` |
| `prima` | number | Prima en ARS; `0` si es "No disponible" (mockeado) |
| `moneda` | `"ARS" \| "USD"` | Siempre `"ARS"` en v1 |
| `cobertura` | string | Descripción normalizada del plan (ej. "A - RESPONSABILIDAD CIVIL LIMITADA") |
| `vigenciaDesde` | string | ISO 8601 |
| `vigenciaHasta` | string | ISO 8601 |
| `error` | string\|undefined | `"No disponible"` para mocks; mensaje de error si falló la API |
| `estimado` | boolean | `true` si es mock/stub; `false` si es aseguradora real |

## Reglas de negocio UI

1. **Agrupar por compañía:** El front debe agrupar los `CotizacionCanonica` por `proveedorId` para renderizar una card por compañía.
2. **Mocks sin selección útil:** Los planes de compañías mockeadas (`estimado: true`, `prima: 0`, `error: "No disponible"`) se muestran como checkboxes deshabilitados o con leyenda "No disponible", pero cuentan como opciones válidas para el conteo de selección si el usuario logra seleccionarlas (según requisito de máximo "todas las opciones de todas las compañías").
3. **Selección mínima uno:** El botón "Enviar cotización" debe estar deshabilitado o, si se clickea sin selección, mostrar el error y permanecer en la misma página.
4. **Sin redirección forzada:** Al fallar la validación, el usuario permanece en la misma pantalla de cotización.

## Archivos relacionados

- `docs/PLAN_ESTILO_ARQUITECTONICO/00_contexto_base.md` — modelo canónico `CotizacionCanonica`
- `docs/PLAN_ESTILO_ARQUITECTONICO/05_orquestador_fanout.md` — orquestador que devuelve `CotizacionCanonica[]`
- `docs/PLAN_ESTILO_ARQUITECTONICO/06_acl_proveedor.md` — ACLs de cada compañía
- `docs/ADRs/ADR-015.md` — decisión de múltiples planes y múltiples compañías

## Estado

Requisito documentado. Pendiente de implementación en `front/` (Next.js).