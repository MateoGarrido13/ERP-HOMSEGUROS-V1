-- Data tier: relational schema for quotes issued from the automotor prototype.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS cotizaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ramo TEXT NOT NULL DEFAULT 'automotor',
  company TEXT NOT NULL DEFAULT 'mercantil',
  source TEXT NOT NULL DEFAULT 'prototipo',
  status TEXT NOT NULL DEFAULT 'quoted',
  patente TEXT,
  codigo_postal INTEGER NOT NULL,
  localidad_id INTEGER,
  localidad_nombre TEXT,
  provincia TEXT,
  uso SMALLINT NOT NULL,
  marca TEXT,
  modelo TEXT,
  anio INTEGER NOT NULL,
  gnc BOOLEAN NOT NULL DEFAULT FALSE,
  rastreo SMALLINT NOT NULL DEFAULT 0,
  iva SMALLINT NOT NULL DEFAULT 5,
  comision NUMERIC(6, 2),
  bonificacion NUMERIC(6, 2),
  periodo SMALLINT,
  cuotas SMALLINT,
  tipo_pago TEXT,
  productor_id INTEGER,
  productor_nombre TEXT,
  mercantil_cotizacion_id BIGINT UNIQUE,
  rama INTEGER,
  infoauto INTEGER,
  vehiculo_id INTEGER,
  vehiculo_nombre TEXT,
  suma_asegurada NUMERIC(14, 2),
  request_payload JSONB NOT NULL,
  response_payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cotizacion_planes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cotizacion_id UUID NOT NULL REFERENCES cotizaciones (id) ON DELETE CASCADE,
  numero INTEGER NOT NULL,
  producto TEXT,
  codigo_producto INTEGER,
  titulo TEXT,
  descripcion TEXT,
  texto TEXT,
  costo NUMERIC(14, 2) NOT NULL,
  franquicia NUMERIC(14, 2),
  cantidad_cuotas INTEGER,
  puntaje INTEGER,
  error TEXT,
  desglose JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (cotizacion_id, numero)
);

CREATE INDEX IF NOT EXISTS cotizaciones_created_at_idx
  ON cotizaciones (created_at DESC);

CREATE INDEX IF NOT EXISTS cotizaciones_patente_idx
  ON cotizaciones (patente);

CREATE INDEX IF NOT EXISTS cotizacion_planes_cotizacion_id_idx
  ON cotizacion_planes (cotizacion_id);

CREATE TABLE IF NOT EXISTS "USER" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(30) NOT NULL UNIQUE,
  password VARCHAR(30) NOT NULL
);

INSERT INTO "USER" (email, password)
SELECT 'garridomateo09@gmail.com', '123'
WHERE NOT EXISTS (
  SELECT 1 FROM "USER" WHERE email = 'garridomateo09@gmail.com'
);
