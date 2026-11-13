# CONTEXTO BASE — pegar al inicio de cada sesión

## Sistema que estamos construyendo
Un **multicotizador de seguros**: el usuario ingresa datos, el sistema consulta N aseguradoras en paralelo y devuelve las cotizaciones disponibles dentro de un timeout de 4 segundos.

## Arquitectura (vista de componentes y conectores)

```
Cliente Web
  → Router / Multiplexor HTTP
    → Handler (valida + extrae DTO)
      → Servicio de dominio (lee/escribe BD)
        → Orquestador / Intermediario (fan-out)
          ┌─ [paralelo] ACL (S × Prov1) → Circuit Breaker Prov1 → Cliente HTTP → API Prov1
          └─ [paralelo] ACL (S × Prov2) → Circuit Breaker Prov2 → Cliente HTTP → API Prov2
```

**Reglas arquitectónicas innegociables:**
1. El Orquestador no sabe nada de proveedores concretos; solo conoce la interfaz `IProveedorACL`.
2. Cada ACL traduce entre el modelo canónico interno y el modelo del proveedor. Nunca comparten código entre ACLs de distintos proveedores.
3. El Circuit Breaker es **por proveedor**, compartido entre todos los servicios que llamen a ese proveedor.
4. El Cliente HTTP es instanciado y controlado por el Circuit Breaker, no al revés.
5. La base de datos es una única BD relacional (Supabase/PostgreSQL). No hay microservicios de datos.
6. El timeout global de fan-out es **4 segundos** (`AbortController` en el Orquestador).
7. `Promise.allSettled` siempre — nunca `Promise.all` en el fan-out (una aseguradora caída no cancela las demás).

## Stack técnico
- **Runtime:** Supabase Edge Functions (Deno / TypeScript)
- **Base de datos:** Supabase PostgreSQL (cliente `@supabase/supabase-js`)
- **Fan-out / timeout:** `Promise.allSettled` + `AbortController` nativo de Deno
- **Circuit breaker:** grafo y tipos sí; **trip diferido** (ADR-003). Estado previsto en memoria del worker (o `Deno.openKv` si persiste entre invocaciones)
- **Tests:** `Deno.test` + `std/testing/asserts`
- **Go:** reservado para cuando el Aggregator sea cuello de botella medido (no anticipado)

## Protocolo de sesión (Engram + skill)

Cada paso (01–10) corre en una **sesión nueva**.

1. Pegá este archivo primero (sin instrucción extra).
2. Cargá **solo** la skill nombrada en el prompt. El paso 01 no carga skill propia.
3. Engram al abrir: `mem_current_project` → `mem_context` → `mem_search` con `topic_key` `architecture/supabase-edge-hub`.
4. Pegá el prompt del paso y, desde el 02, el código ya generado de los pasos anteriores.
5. Engram al cerrar: `mem_save` del artefacto (ruta, contrato, criterio que pasó).

No apiles skills. No implementes el paso siguiente.

## Modelo canónico interno (ramo → CotizacionCanonica)

```typescript
// Entrada canónica
interface SolicitudCotizacion {
  ramo: "automotor" | "hogar";
  conductor: {
    dni: string;
    fechaNacimiento: string; // ISO 8601
  };
  coberturaDeseada: "terceros" | "terceros_completo" | "todo_riesgo";
  vehiculo?: {
    marca: string;
    modelo: string;
    anio: number;
    patente: string;
  };
  inmueble?: {
    direccion: string;
    tipoPropiedad: "casa" | "departamento" | "consorcio" | "comercio";
    anioConstruccion?: number;
  };
}

// Salida canónica (uno o más planes por proveedor)
interface CotizacionCanonica {
  proveedorId: string;
  prima: number;          // en ARS; 0 si "No disponible" (mockeado)
  moneda: "ARS" | "USD";
  cobertura: string;      // descripción normalizada del plan
  vigenciaDesde: string;  // ISO 8601
  vigenciaHasta: string;
  urlDetalle?: string;
  error?: string;         // presente si el proveedor falló o es "No disponible"
  estimado: boolean;      // true si es stub/mock/esqueleto; false si es aseguradora real
}
```

## Estructura de directorios (referencia)
```
supabase/
  functions/
    _shared/
      types.ts            ← tipos canónicos + interfaces de capas
      circuitBreaker.ts   ← CB compartido
      httpClient.ts       ← cliente HTTP base
    cotizar/
      index.ts            ← entry point de la Edge Function (router + handler)
      servicio.ts         ← lógica de dominio
      orquestador.ts      ← fan-out + timeout
      acl/
        mappers/
          sancor.ts       ← ACL Sancor
          zurich.ts       ← ACL Zurich (ejemplo stub)
```

## Convención de nombres
- Interfaces: `I` prefix → `IProveedorACL`, `ICircuitBreaker`
- Implementaciones: nombre concreto → `SancorACL`, `CircuitBreakerImpl`
- Funciones puras de mapeo: `toCanonical(raw)` / `toProveedorRequest(solicitud)`
- Errores tipados: clases que extienden `Error` con `code: string`

## Lo que NO haremos en este esqueleto
- Autenticación/JWT (se agrega después sobre el handler ya construido)
- Persistencia de cotizaciones en BD (el servicio tendrá el stub listo)
- Lógica de negocio real (tarifas, reglas de suscripción)
- Lógica real de circuit breaker (umbrales, half-open, trip); el paso 07 deja esqueleto
- Deploy a Supabase (solo código local corriendo con `supabase functions serve`)
