# Supabase local

Stack local (Docker) para desarrollo. Decisión y contexto completo en
[`../docs/specs/EPICA-acceso/spec.md`](../docs/specs/EPICA-acceso/spec.md) (sección 4, PA-7, PA-8).

## Qué hay acá

- `migrations/`: el esquema, versionado. `20261113023206_schema_actual.sql` es
  una copia literal de [`../sql/schema/schema.sql`](../sql/schema/schema.sql) al momento de levantar
  el entorno. **No reconcilia todavía `usuario` con Supabase Auth** (ver PA-8
  de la épica): `usuario.id` sigue `INTEGER` y `usuario.password` sigue
  existiendo. Esa reconciliación es una migración aparte, pendiente.
- `config.toml`: configuración del proyecto local (puertos, etc.), generado por `supabase init`.
- No hay `seed.sql` todavía: las cuentas de ejemplo (`prototype/src/lib/access.ts`)
  se cargan como parte de ERP-5 (T-4/T-5 de su plan), cuando se decida cómo
  crearlas como usuarios reales de Supabase Auth.

El CLI (`supabase`) está instalado como dependencia de desarrollo de `front/`
(`front/node_modules/.bin/supabase`), pero el proyecto (`supabase/`) vive en
la raíz del repo porque no es exclusivo de `front/`.

## Comandos (correr desde la raíz del repo)

```bash
# Levantar el stack (Postgres, Auth, Storage, Studio, ...)
./front/node_modules/.bin/supabase start

# Ver URLs, puertos y claves (API, DB, Studio, anon/service_role keys)
./front/node_modules/.bin/supabase status

# Parar los contenedores (no borra los datos)
./front/node_modules/.bin/supabase stop

# Reaplicar migrations + seed desde cero (borra los datos locales)
./front/node_modules/.bin/supabase db reset

# Después de editar sql/schema/schema.sql: generar una migración nueva con el diff
./front/node_modules/.bin/supabase db diff -f <nombre_descriptivo>
```

Opcional: agregar un alias o un script en `front/package.json`
(`"supabase": "supabase"`) para no escribir la ruta completa.

## URLs locales (puertos por defecto, ver `config.toml` si cambian)

| Qué | URL |
|---|---|
| API (REST/GraphQL/Auth) | http://127.0.0.1:54321 |
| Base de datos (Postgres) | postgresql://postgres:postgres@127.0.0.1:54322/postgres |
| Studio (panel web) | http://127.0.0.1:54323 |
| Mailpit (emails de prueba: recuperación de contraseña, etc.) | http://127.0.0.1:54324 |

Las claves (`anon`, `service_role`) y el `JWT_SECRET` son las de demo fijas
del CLI de Supabase (iguales en cualquier proyecto local, no son secretas);
están en [`../front/.env.local.example`](../front/.env.local.example). `front/.env.local` ya se creó
en este entorno a partir de ese ejemplo (está en `.gitignore`, no se versiona).

## Servicios detenidos

`imgproxy` y `pooler` (pgbouncer) quedaron detenidos al levantar el stack: no
hacen falta para desarrollo de Acceso (transformación de imágenes de Storage
y pooling de conexiones). Si algo los necesita más adelante, `supabase start`
los reintenta solo.
