# PROMPT 06 — ACL Prov_Mercantil_Andina y Prov_Sancor_Seguros

## Skill de lanzamiento
- **Skill:** `provider-acl` (propia) — `skills/provider-acl/SKILL.md`
- **Estado:** existente
- **Granularidad:** 1 agente, 1 skill. No apilar otras.
- **Engram al abrir:** `mem_current_project` → `mem_context` → `mem_search` (`topic_key`: `architecture/supabase-edge-hub`)
- **Engram al cerrar:** `mem_save` de `prov_mercantil_andina.ts`, `prov_sancor_seguros.ts`, `prov_zurich.ts` y `prov_allianz.ts` (mapeo canónico ↔ wire)
- **Precondición:** `00_contexto_base.md` + código de 01–05. Existen `supabase/functions/cotizar/acl/mappers/prov_mercantil_andina.ts`, `prov_sancor_seguros.ts`, `prov_zurich.ts` y `prov_allianz.ts`.

## Tarea
Completá los cuatro mappers de proveedor, uno por archivo. Cada `cotizar` devuelve `Promise<CotizacionCanonica[]>` (uno o más planes). No extraigas helpers compartidos entre ACLs.

### 6a. `supabase/functions/cotizar/acl/mappers/prov_mercantil_andina.ts`

`ProvMercantilAndinaACL` implementa `IProveedorACL`:

- Constructor: `httpClient: HttpClient`
- `cotizar(solicitud, signal)`: implementa el flujo real de Mercantil Andina:
  1. Obtén JWT via POST `/credenciales/v2/` (con `Ocp-Apim-Subscription-Key`, `client_id`, `username`, `password`, `grant_type`). Cacheá el token (~1 hora).
  2. (Opcional) Busca localidad via GET `/generales/v1/localidades?q=` para obtener `id` (`inder`).
  3. (Opcional) Busca vehículo via GET `/vehiculos/v1/?q=&anio=&tipo=AUTO` para obtener `infoauto`.
  4. POST `/cotizaciones/v2/auto` con el body de cotización (localidad, vehiculo.infoauto, anio, uso, gnc, rastreo, comision, bonificacion, productor.id, etc.).
  5. Mapea cada elemento del array `resultado[]` de la respuesta a un `CotizacionCanonica` separado:
     - `proveedorId`: `"prov_mercantil_andina"`
     - `prima`: `resultado[].desglose.total.prema` (prima neta del plan)
     - `moneda`: `"ARS"`
     - `cobertura`: `resultado[].texto` o `resultado[].producto`
     - `vigenciaDesde`: `fecha_cotizacion` de la respuesta
     - `vigenciaHasta`: calcular según `periodo` y `cuotas`
     - `error`: `undefined` si éxito; `resultado[].error` si existe
     - `estimado: false` (es aseguradora real, ADR-012)
  6. Si cualquier paso falla, devuelve un solo `CotizacionCanonica` con `proveedorId: "prov_mercantil_andina"`, `prima: 0`, `error` = mensaje, `estimado: true` (degradación graceful, no relances al orquestador)
- `toProveedorRequest` y `toCanonical` **privados**

**Contrato wire real (documentación oficial `APIS/MercantilAndina/REQUEST-COTIZAR-AUTO.md`):**

```typescript
// request POST /cotizaciones/v2/auto
{
  localidad: { codigo_postal: number; id: number },
  vehiculo: { infoauto: number; anio: number; uso: number; gnc: boolean; rastreo: number },
  comision: number;
  bonificacion: number;
  periodo: number;
  cuotas: number;
  pago: { tipo_pago: string };
  ajuste_suma: number;
  iva: number;
  desglose: boolean;
  productor: { id: number };
}

// response POST /cotizaciones/v2/auto (201)
{
  id: number;
  resultado: Array<{
    texto: string;
    producto: string;
    desglose: { total: { prema: number; iva: number; premio: number } };
    error: string;
    franquicia: number;
    codigo_producto: number;
  }>;
  fecha_cotizacion: string;
}
```

`uso` mapea: `particular` → `1`, `comercial` → `2`. `gnc`: `true` → `1`, `false` → `0`.

### 6b. `supabase/functions/cotizar/acl/mappers/prov_sancor_seguros.ts`

`ProvSancorSegurosACL` implementa `IProveedorACL` (mockeado, no hay API real integrada todavía):

- Constructor: `httpClient: HttpClient` (no se usa en v1 mockeado)
- `cotizar(solicitud, signal)`: devuelve un solo `CotizacionCanonica` en un array:
  ```typescript
  [{
    proveedorId: "prov_sancor_seguros",
    prima: 0,
    moneda: "ARS",
    cobertura: "No disponible",
    vigenciaDesde: "",
    vigenciaHasta: "",
    error: "No disponible",
    estimado: true
  }]
  ```
- Si `signal.aborted`, devuelve el mismo array con `error: "aborted"`
- `toProveedorRequest` y `toCanonical` **privados** (no se usan en v1 mockeado)

### 6c. `supabase/functions/cotizar/acl/mappers/prov_zurich.ts`

`ProvZurichACL` implementa `IProveedorACL` (mockeado, no hay API real integrada todavía):

- Constructor: `httpClient: HttpClient` (no se usa en v1 mockeado)
- `cotizar(solicitud, signal)`: devuelve un solo `CotizacionCanonica` en un array:
  ```typescript
  [{
    proveedorId: "prov_zurich",
    prima: 0,
    moneda: "ARS",
    cobertura: "No disponible",
    vigenciaDesde: "",
    vigenciaHasta: "",
    error: "No disponible",
    estimado: true
  }]
  ```
- Si `signal.aborted`, devuelve el mismo array con `error: "aborted"`
- `toProveedorRequest` y `toCanonical` **privados** (no se usan en v1 mockeado)

### 6d. `supabase/functions/cotizar/acl/mappers/prov_allianz.ts`

`ProvAllianzACL` implementa `IProveedorACL` (mockeado, no hay API real integrada todavía):

- Constructor: `httpClient: HttpClient` (no se usa en v1 mockeado)
- `cotizar(solicitud, signal)`: devuelve un solo `CotizacionCanonica` en un array:
  ```typescript
  [{
    proveedorId: "prov_allianz",
    prima: 0,
    moneda: "ARS",
    cobertura: "No disponible",
    vigenciaDesde: "",
    vigenciaHasta: "",
    error: "No disponible",
    estimado: true
  }]
  ```
- Si `signal.aborted`, devuelve el mismo array con `error: "aborted"`
- `toProveedorRequest` y `toCanonical` **privados** (no se usan en v1 mockeado)

## Output esperado
Cuatro mappers aislados, uno por proveedor. Cero imports entre ellos.

## Criterio de aceptación
```bash
deno check supabase/functions/cotizar/acl/mappers/prov_mercantil_andina.ts supabase/functions/cotizar/acl/mappers/prov_sancor_seguros.ts supabase/functions/cotizar/acl/mappers/prov_zurich.ts supabase/functions/cotizar/acl/mappers/prov_allianz.ts
```
- `prov_mercantil_andina.ts`: `cotizar` devuelve `Promise<CotizacionCanonica[]>`; implementa flujo de 4 pasos (token → localidad → vehículo → cotizar); `estimado: false` para planes reales.
- `prov_sancor_seguros.ts`, `prov_zurich.ts`, `prov_allianz.ts`: `cotizar` devuelve `Promise<CotizacionCanonica[]>` con un solo elemento mockeado (`estimado: true`, `error: "No disponible"`, `prima: 0`).
- No hay imports relativos entre archivos bajo `acl/mappers/`. `toProveedorRequest` y `toCanonical` no son exportados.
