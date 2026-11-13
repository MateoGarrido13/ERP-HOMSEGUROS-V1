# Integración Mercantil Andina — `src/lib/mercantil`

Migración de la lógica de cotización de autos de la API de Mercantil Andina
(`apidev.mercantilandina.com.ar`) al front Next.js en
`ERP ASEGURADORA/implementacion/front`.

## Archivos

- `types.ts` — Tipos TypeScript de request/response (token, localidades, vehículos, cotización auto).
- `client.ts` — Cliente HTTP de servidor (`server-only`) con caché de JWT y renovación automática ante 401.
- `actions.ts` — Server Actions expuestas a componentes:
  - `mercantilObtenerToken()`
  - `mercantilBuscarLocalidades(q)`
  - `mercantilBuscarVehiculos(q, anio, tipo?)`
  - `mercantilCotizarAuto(request)`
- `README.md` — este archivo.

## Variables de entorno

Crear `.env.local` (no se sube al repo, ver `.gitignore`) con:

```
MERCANTIL_API_BASE=https://apidev.mercantilandina.com.ar
MERCANTIL_API_KEY=720b0258903f4cef8dabee0567415769
MERCANTIL_CLIENT_ID=api-clientes-login
MERCANTIL_USERNAME=HOMSETST
MERCANTIL_PASSWORD=home2026
MERCANTIL_GRANT_TYPE=password
```

- `MERCANTIL_API_KEY` es la PK de `api-cotiza-auto-v2` (véase `SUBSCRIPCIONES.md`).
- Nunca hardcodear credenciales en el código fuente.

## Flujo de cotización (según REQUEST-COTIZAR-AUTO.md)

1. `POST /credenciales/v2/` — obtiene el JWT (cacheado 1 hora con margen de 60 s).
2. (Opcional) `GET /generales/v1/localidades?q=TANDIL` → `localidad.id` (inder), ej. `20512`, CP `7000`.
3. (Opcional) `GET /vehiculos/v1/?q=PALIO 1.4 FIRE ELX&anio=2007&tipo=AUTO` → `infoauto`, ej. `170499`.
4. `POST /cotizaciones/v2/auto` con el body de `MercantilCotizarAutoRequest` → `201` con `id`, `mercantilId`, `sumaAsegurada`, `planes`.

## Ejemplo de uso en un Server Component

```tsx
import { mercantilBuscarLocalidades, mercantilCotizarAuto } from "@/lib/mercantil/actions";

export default async function Page() {
  const { localidades } = await mercantilBuscarLocalidades("TANDIL");

  const cotizacion = await mercantilCotizarAuto({
    localidad: { codigo_postal: 7000, id: 20512 },
    vehiculo: { infoauto: 170499, anio: 2007, uso: 1, gnc: false, rastreo: 0 },
    comision: 10,
    bonificacion: 10,
    periodo: 1,
    cuotas: 1,
    pago: { tipo_pago: "C" },
    ajuste_suma: 0,
    iva: 5,
    desglose: true,
    productor: { id: 83645 },
  });

  return <div>Cotización {cotizacion.cotizacion.mercantilId}</div>;
}
```

## Datos de prueba validados (CONSULTAS.log)

- Usuario: `HOMSETST`, contraseña: `home2026`
- Productor: `83645` (Otaño Moreno)
- TANDIL: localidad id `20512`, CP `7000`
- Palio 1.4 FIRE ELX 2007: infoauto `170499`, respuesta guardada como `cotizar-palio.json` (Mercantil id `598004327`)

## Seguridad

- Todo el acceso es de servidor (`server-only`). El token nunca viaja al navegador.
- Las llamadas usan `cache: "no-store"` para evitar respuestas en caché del servidor Next.
- El JWT se renueva automáticamente si la API devuelve `401 TokenInvalido`.
