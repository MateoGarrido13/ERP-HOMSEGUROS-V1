# Historias de usuario — Integración de Mercantil Andina al hub de Edge Functions

**Proyecto:** HOM ERP  
**Repositorio:** `https://github.com/MateoGarrido13/ERP-HOMSEGUROS-V1.git`  
**Ruta de trabajo:** `supabase/functions/cotizar/`  
**Rama sugerida:** `main` → rama de feature por issue  
**Estado:** Borrador para carga en Jira

---

## Contexto

El hub de aseguradoras vive en `supabase/functions/` (Supabase Edge Functions, Deno/TypeScript) y sigue el patrón **Aggregator + ACL** (ADR-002). Cada aseguradora tiene su propio mapper aislado bajo `supabase/functions/cotizar/acl/mappers/` que implementa `IProveedorACL`.

Hoy el endpoint `POST /cotizar` devuelve `501 NOT_IMPLEMENTED`. El walking skeleton (`StubACL`) ya existe, pero no hay conexión real a ninguna aseguradora.

Mercantil Andina es la **única aseguradora con API real** documentada en este proyecto (`apidev.mercantilandina.com.ar`). El prototipo en `prototype/` ya consume su API, pero esa lógica está fuera del hub y debe migrarse como ACL oficial.

Referencias normativas:
- `docs/ADRs/ADR-001.md` — Layered Architecture
- `docs/ADRs/ADR-002.md` — Aggregator + ACL
- `docs/ADRs/ADR-004.md` — Supabase + Edge Functions hub
- `docs/ADRs/ADR-005.md` — Layout y contrato HTTP de `supabase/functions/`
- `docs/ADRs/ADR-006.md` — Auth JWT (diferida, punto de extensión)
- `docs/ADRs/ADR-007.md` — Validación de entrada, límite de body, CORS
- `docs/ADRs/ADR-008.md` — Modelo canónico extensible por ramo
- `docs/ADRs/ADR-009.md` — Circuit Breaker (esqueleto, sin trip)
- `docs/ADRs/ADR-010.md` — Sanitización PII
- `docs/ADRs/ADR-011.md` — Servicio sin SupabaseClient directo
- `docs/ADRs/ADR-012.md` — Marcador `estimado` (mock vs precio real)
- `docs/ADRs/ADR-014.md` — Mercantil Andina como ACL
- `docs/ADRs/ADR-015.md` — Múltiples planes por proveedor
- `docs/casos-de-uso/PAS/multicotizador/masivo/automotor/CU-17-AUT-Multicotizador_Cargar_Riesgo.md`
- `docs/casos-de-uso/PAS/multicotizador/masivo/automotor/CU-18-AUT-Multicotizador_Comparar_Cotizaciones.md`

---

## Historia 1 — Crear ACL de Mercantil Andina

**Issue type:** Story  
**Summary:** Implementar ACL de Mercantil Andina (`prov_mercantil_andina.ts`) en `supabase/functions/cotizar/acl/mappers/`  
**Componente:** Hub de aseguradoras / Edge Functions  
**Prioridad:** Alta

### Descripción

Crear `ProvMercantilAndinaACL` que implemente `IProveedorACL` y traduzca entre el modelo canónico interno (`SolicitudCotizacion` → `CotizacionCanonica[]`) y el wire de la API de Mercantil Andina (`apidev.mercantilandina.com.ar`).

El ACL debe consumir los endpoints reales:
1. `POST /credenciales/v2/` — obtener JWT (form-urlencoded, `Ocp-Apim-Subscription-Key`, `client_id`, `username`, `password`, `grant_type`).
2. `GET /generales/v1/localidades?q=` — buscar localidad (opcional, por definir según DTO).
3. `GET /vehiculos/v1/?q=&anio=&tipo=AUTO` — buscar vehículo/infoauto (opcional, por definir según DTO).
4. `POST /cotizaciones/v2/auto` — cotizar con body JSON y `Authorization: Bearer <token>`.

### Criterios de aceptación

- El archivo `supabase/functions/cotizar/acl/mappers/prov_mercantil_andina.ts` existe y compila con `deno check`.
- Implementa `IProveedorACL.cotizar(solicitud, signal): Promise<CotizacionCanonica[]>`.
- Obtiene el JWT automáticamente y lo cachea en memoria del isolate (~1 hora). El programador no carga el token a mano.
- Renueva el token solo cuando vence o faltan 60 segundos para el vencimiento.
- Lee credenciales por `Deno.env.get` (`MERCANTIL_API_BASE`, `MERCANTIL_SUBSCRIPTION_KEY`, `MERCANTIL_USERNAME`, `MERCANTIL_PASSWORD`, `MERCANTIL_PRODUCTOR_ID`, etc.). Nada hardcodeado.
- Usa `HttpClient` inyectado por constructor (controlado por Circuit Breaker por proveedor).
- Mapea cada elemento del array `resultado[]` de la respuesta a un `CotizacionCanonica` separado, con `estimado: false` (aseguradora real, ADR-012).
- Si cualquier paso falla, devuelve un solo elemento con `error`, `prima: 0`, `estimado: true` y no relanza al orquestador (degradación graceful, ADR-015).
- No importa ni comparte código con otros ACLs bajo `acl/mappers/`.
- `toProveedorRequest` y `toCanonical` son privados, no exportados.

### Subtareas técnicas

1. [ ] Definir variables de entorno requeridas en el despliegue de Edge Functions.
2. [ ] Implementar obtención y cache automático de JWT.
3. [ ] Implementar mapeo de `SolicitudCotizacion` → payload de `POST /cotizaciones/v2/auto`.
4. [ ] Implementar mapeo de `resultado[]` → `CotizacionCanonica[]`.
5. [ ] Implementar manejo de errores y degradación graceful.

### Notas abiertas (huecos de documentación)

- `SolicitudCotizacion` no trae código postal para Automotor, pero el body de Mercantil exige `localidad.codigo_postal` e `id`. Se debe extender el DTO o definir cómo se inyecta el CP antes de usar en producción.
- El campo `uso` del vehículo (particular/comercial) no está en el modelo canónico actual; queda hardcodeado a `1` (particular) hasta que se defina.
- `vigenciaHasta` debe calcularse según `periodo` y `cuotas`; hoy se deja igual a `vigenciaDesde`.

---

## Historia 2 — Conectar el handler al Orquestador y ACLs

**Issue type:** Story  
**Summary:** Quitar `501 NOT_IMPLEMENTED` de `handler.ts` y conectar `ServicioCotizacion` → `Orquestador` → lista de ACLs  
**Componente:** Hub de aseguradoras / Edge Functions  
**Prioridad:** Alta

### Descripción

El handler de `POST /cotizar` hoy devuelve `501 NOT_IMPLEMENTED` y no llama a `ServicioCotizacion` ni al `Orquestador`. Debe instanciar el orquestador con la lista de ACLs (incluyendo `ProvMercantilAndinaACL` real y los mocks de Sancor, Zurich, Allianz) y devolver `200` con `CotizacionCanonica[]`.

### Criterios de aceptación

- `POST /cotizar` con body canónico válido devuelve `200` y un array JSON de `CotizacionCanonica[]`.
- El `Orquestador` recibe al menos un ACL real (Mercantil Andina) y los ACLs mockeados existentes.
- Respuesta parcial si algún proveedor falla (`Promise.allSettled`, nunca `Promise.all`).
- Timeout global de 4 s (`AbortController`) respetado por el orquestador.
- El handler valida la entrada según ADR-007 antes de delegar (400 `SOLICITUD_INVALIDA` si falla).
- No se instancia `SupabaseClient` ni `ServicioCotizacion` con dependencias de BD (ADR-011).
- El `501 NOT_IMPLEMENTED` queda eliminado del flujo normal.

### Subtareas técnicas

1. [ ] Importar e instanciar `ServicioCotizacion` y `Orquestador` en `handler.ts`.
2. [ ] Construir lista de ACLs: `ProvMercantilAndinaACL`, `ProvSancorSegurosACL`, `ProvZurichACL`, `ProvAllianzACL`.
3. [ ] Inyectar `HttpClient` + `CircuitBreaker` por proveedor en cada ACL.
4. [ ] Llamar `cotizarEnParalelo` y devolver `200` con el array aplanado.
5. [ ] Probar `deno check supabase/functions/cotizar/handler.ts`.

---

## Historia 3 — Pruebas de contrato del ACL de Mercantil Andina

**Issue type:** Task  
**Summary:** Escribir `Deno.test` de contrato para `prov_mercantil_andina.ts`  
**Componente:** Hub de aseguradoras / Pruebas  
**Prioridad:** Media

### Descripción

Aplicar la skill `deno-contract-tests` para validar el comportamiento del ACL de Mercantil Andina sin depender de red real.

### Criterios de aceptación

- Existe un archivo de pruebas (ej. `prov_mercantil_andina.test.ts` o similar) bajo `supabase/functions/cotizar/acl/mappers/` o `__tests__/`.
- Test de éxito: dado un mock de `HttpClient` que devuelve `resultado[]`, el ACL mapea correctamente a `CotizacionCanonica[]` con `estimado: false`.
- Test de falla: dado un `HttpClient` que lanza error, el ACL devuelve un solo elemento con `error`, `estimado: true` y no relanza.
- Test de cache de token: no solicita JWT nuevo si el token cacheado aún no venció.
- Pasa `deno test` sin errores.

---

## Historia 4 — Variables de entorno en despliegue de Edge Functions

**Issue type:** Task  
**Summary:** Configurar variables de entorno de Mercantil Andina en el despliegue de Supabase Edge Functions  
**Componente:** Infraestructura / Despliegue  
**Prioridad:** Alta

### Descripción

El ACL lee credenciales por `Deno.env.get`. Estas variables deben estar definidas en el entorno de despliegue de Supabase (Edge Functions) para que el ACL funcione en runtime.

### Criterios de aceptación

- Las siguientes variables están configuradas en el despliegue de Edge Functions de Supabase:
  - `MERCANTIL_API_BASE`
  - `MERCANTIL_SUBSCRIPTION_KEY`
  - `MERCANTIL_USERNAME`
  - `MERCANTIL_PASSWORD`
  - `MERCANTIL_PRODUCTOR_ID`
  - `MERCANTIL_COMISION` (opcional, default 10)
  - `MERCANTIL_BONIFICACION` (opcional, default 10)
- El ACL lee los valores correctamente en runtime (no falla por variable faltante).
- Ninguna credencial está hardcodeada en el repositorio.

---

## Cómo crear estos issues en Jira

1. Entrar al proyecto de Jira (tablero kanban o scrum).
2. Pulsar **Create**.
3. Seleccionar **Issue type** (Story o Task según la historia).
4. Rellenar **Summary** y **Description** copiando el contenido de esta sección.
5. Asignar **Assignee**, **Labels** (ej. `mercantil`, `edge-functions`, `acl`) y **Component** si aplica.
6. Pulsar **Create**. Jira genera una issue key, por ejemplo `ERP-42`.

---

## Cómo asociar un commit al issue de Jira

Una vez creado el issue (ej. `ERP-42`), vincular el trabajo de Git:

### A. Desde el mensaje del commit

Incluir la issue key en el mensaje:

```bash
git commit -m "ERP-42 implementar ACL de Mercantil Andina en Edge Functions

- prov_mercantil_andina.ts implementa IProveedorACL
- obtiene y cachea JWT automáticamente
- mapea resultado[] a CotizacionCanonica[] con estimado: false"
```

Jira detecta el patrón `ERP-42` en el mensaje y, si el repositorio está conectado al proyecto de Jira, asocia el commit automáticamente.

### B. Desde el nombre de la rama

```bash
git checkout -b ERP-42-acl-mercantil-andina
git commit -m "implementar ACL de Mercantil Andina"
```

Algunas configuraciones de Jira detectan la clave desde la rama, pero es más fiable incluirla también en el mensaje del commit.

### C. Smart Commits (si está habilitado en tu Jira)

```bash
git commit -m "ERP-42 #time 4h #comment ACL de Mercantil Andina implementada y lista para revisión"
```

Esto registra tiempo trabajado y agrega un comentario al issue automáticamente.

### Flujo recomendado

```bash
# 1. Crear rama desde main
git checkout -b ERP-42-acl-mercantil-andina

# 2. Escribir/modificar código
# (ej. crear supabase/functions/cotizar/acl/mappers/prov_mercantil_andina.ts)

# 3. Commit con la clave del issue
git add supabase/functions/cotizar/acl/mappers/prov_mercantil_andina.ts
git commit -m "ERP-42 implementar ACL de Mercantil Andina en Edge Functions"

# 4. Push
git push origin ERP-42-acl-mercantil-andina
```

Si el repositorio aún no está conectado a Jira, asociar manualmente el commit en la pantalla del issue (sección **Development**) o agregar el enlace del commit en la descripción del issue.

---

## Regla de implementación (ruta autorizada)

> Todos los cambios y la implementación de la cadena de prompts `docs/PLAN_ESTILO_ARQUITECTONICO/` (pasos 01→10) se efectúan sobre la raíz de este repositorio. Bajo ninguna circunstancia sobre `prototype/`.

Los archivos de lógica de Mercantil Andina en `prototype/src/services/mercantil/` son **referencia solamente**. No se importan ni se copian tal cual al hub de Edge Functions porque el runtime es distinto (Next.js/Node.js vs Deno/Supabase Edge Functions).

---

## Checklist de cierre por historia

| Historia | Criterio de aceptación revisado | `deno check` OK | Commit asociado a issue |
|----------|-------------------------------|-----------------|-------------------------|
| 1 — ACL Mercantil Andina | ☐ | ☐ | ☐ |
| 2 — Conectar handler/orquestador | ☐ | ☐ | ☐ |
| 3 — Pruebas de contrato | ☐ | ☐ | ☐ |
| 4 — Variables de entorno | ☐ | N/A | ☐ |
