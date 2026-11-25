-- ERP-17: tablas `aviso` y `lead` de la bandeja de pendientes (solo lectura
-- desde el front). Un PAS lee unicamente filas con su `id_productor`
-- (productor.id = usuario.id = auth.uid()). No hay politicas de escritura:
-- los procesos que generan avisos/leads (CU-05b a 05e, CU-08) usan la
-- service_role, que no pasa por RLS.

CREATE TYPE tipo_aviso AS ENUM ('pago-rechazado', 'cumpleanos', 'cotizacion-enviada', 'enviar-poliza');
CREATE TYPE cobertura_aviso AS ENUM ('Hogar', 'Automotor', 'Integrales');

CREATE TABLE aviso (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    id_productor UUID NOT NULL,
    id_asegurado INTEGER NOT NULL,
    id_poliza INTEGER NOT NULL,
    cobertura cobertura_aviso NOT NULL,
    tipo tipo_aviso NOT NULL,
    fecha_importancia DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id),
    CONSTRAINT fk_aviso_productor
        FOREIGN KEY (id_productor) REFERENCES productor (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_aviso_asegurado
        FOREIGN KEY (id_asegurado) REFERENCES asegurado (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_aviso_poliza
        FOREIGN KEY (id_poliza) REFERENCES poliza (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- Listado del PAS: filtra por id_productor y ordena por fecha DESC.
CREATE INDEX idx_aviso_productor_fecha ON aviso (id_productor, fecha_importancia DESC);
CREATE INDEX idx_aviso_asegurado ON aviso (id_asegurado);
CREATE INDEX idx_aviso_poliza ON aviso (id_poliza);

CREATE TABLE lead (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    id_productor UUID NOT NULL,
    cliente_nombre VARCHAR(255) NOT NULL,
    ramo VARCHAR(255) NOT NULL,
    origen VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL DEFAULT '',
    actualizado_en DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id),
    CONSTRAINT fk_lead_productor
        FOREIGN KEY (id_productor) REFERENCES productor (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE INDEX idx_lead_productor_actualizado ON lead (id_productor, actualizado_en DESC);

ALTER TABLE aviso ENABLE ROW LEVEL SECURITY;
ALTER TABLE aviso FORCE ROW LEVEL SECURITY;
ALTER TABLE lead ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead FORCE ROW LEVEL SECURITY;

-- Solo lectura, solo las filas propias. Sin politicas de INSERT/UPDATE/DELETE
-- RLS las deniega; ademas se quitan los privilegios de escritura y todo
-- acceso a anon (Supabase concede ALL por defecto a anon/authenticated).
CREATE POLICY aviso_select_propio ON aviso
FOR SELECT TO authenticated
USING ((SELECT auth.uid()) = id_productor);

CREATE POLICY lead_select_propio ON lead
FOR SELECT TO authenticated
USING ((SELECT auth.uid()) = id_productor);

REVOKE ALL ON aviso FROM anon, authenticated;
REVOKE ALL ON lead FROM anon, authenticated;
GRANT SELECT ON aviso TO authenticated;
GRANT SELECT ON lead TO authenticated;

-- El nombre del cliente y el numero de poliza salen de `asegurado` y
-- `poliza`, cuyas politicas RLS (migracion base) siguen atadas a
-- `SET LOCAL app.*` y por eso no son legibles con la sesion de Supabase Auth.
-- En vez de ampliar el acceso a esas tablas (fuera del alcance de ERP-17),
-- esta funcion hace el JOIN con los privilegios del owner y filtra siempre
-- por auth.uid(): un PAS solo obtiene sus propios avisos.
CREATE FUNCTION avisos_del_productor()
RETURNS TABLE (
    id UUID,
    tipo tipo_aviso,
    cobertura cobertura_aviso,
    fecha_importancia DATE,
    cliente_apellido VARCHAR,
    cliente_nombre VARCHAR,
    numero_poliza VARCHAR
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT av.id, av.tipo, av.cobertura, av.fecha_importancia,
           a.apellido, a.nombre, p.numero_poliza
    FROM public.aviso av
    JOIN public.asegurado a ON a.id = av.id_asegurado
    JOIN public.poliza p ON p.id = av.id_poliza
    WHERE av.id_productor = (SELECT auth.uid())
    ORDER BY av.fecha_importancia DESC, av.id
$$;

REVOKE ALL ON FUNCTION avisos_del_productor() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION avisos_del_productor() TO authenticated;
