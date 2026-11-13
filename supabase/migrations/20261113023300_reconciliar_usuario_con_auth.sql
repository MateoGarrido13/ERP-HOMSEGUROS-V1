-- PA-8 de docs/specs/EPICA-acceso/spec.md: reconciliar `usuario` (cartera) con
-- Supabase Auth, y PA-9: fusionar los campos de Acceso (telefono, rol,
-- organizacion, estado) sin duplicar la matricula (sigue viviendo en
-- productor.matricula_ssn) y manteniendo apellido/dni obligatorios para
-- todos los roles (decision 2026-11-13, ver historial de la spec de la epica).
--
-- `usuario`, `productor` y `asegurado.id_productor` no tienen filas todavia
-- en esta base (nunca se cargaron datos reales ni de ejemplo): por eso los
-- cambios de tipo de columna usan `USING NULL::uuid` en vez de un cast de
-- integer a uuid (ese cast no existe y, si hubiera filas, fallaria a proposito
-- en lugar de inventar un mapeo de ids).

-- 1. Soltar primero las políticas RLS que usan las columnas que van a
--    cambiar de tipo (Postgres no permite ALTER COLUMN TYPE si una policy
--    depende de esa columna), y las FK que dependen de esos tipos. Se
--    recrean todas en el paso 6, con el mismo cuerpo que tenían.
DROP POLICY IF EXISTS productor_select ON productor;
DROP POLICY IF EXISTS asegurado_select ON asegurado;
DROP POLICY IF EXISTS poliza_select ON poliza;
DROP POLICY IF EXISTS endoso_select ON endoso;
DROP POLICY IF EXISTS poliza_hogar_select ON poliza_hogar;
DROP POLICY IF EXISTS bien_hogar_select ON bien_hogar;
DROP POLICY IF EXISTS poliza_automotor_select ON poliza_automotor;
DROP POLICY IF EXISTS vehiculo_select ON vehiculo;
DROP POLICY IF EXISTS poliza_consorcio_select ON poliza_consorcio;
DROP POLICY IF EXISTS poliza_comercio_select ON poliza_comercio;
DROP POLICY IF EXISTS inmueble_select ON inmueble;
DROP POLICY IF EXISTS usuario_select ON usuario;
DROP POLICY IF EXISTS usuario_escritura ON usuario;

ALTER TABLE asegurado DROP CONSTRAINT fk_asegurado_productor;
ALTER TABLE productor DROP CONSTRAINT fk_productor_usuario;

-- La vista cliente lee asegurado.id_productor; también hay que soltarla
-- antes del ALTER COLUMN TYPE y recrearla después (mismo cuerpo).
DROP VIEW IF EXISTS cliente;

-- 2. productor.id y asegurado.id_productor pasan a uuid (van a compartir
--    el uuid de auth.users via usuario.id).
ALTER TABLE productor ALTER COLUMN id TYPE uuid USING NULL::uuid;
ALTER TABLE asegurado ALTER COLUMN id_productor TYPE uuid USING NULL::uuid;

-- 3. usuario.id pasa a uuid (= auth.users.id); se borra password (vive en
--    auth.users, no en nuestro esquema de aplicacion).
ALTER TABLE usuario ALTER COLUMN id DROP IDENTITY IF EXISTS;
ALTER TABLE usuario ALTER COLUMN id TYPE uuid USING NULL::uuid;
ALTER TABLE usuario DROP COLUMN password;

-- 4. Campos de Acceso que faltaban en el esquema de cartera (épica 4.3).
--    apellido y dni ya existían y se mantienen obligatorios para todos los
--    roles (PA-9): son datos de identidad de la persona, no del rol.
--    matricula NO se agrega aquí: para el PAS vive en productor.matricula_ssn
--    (PA-9); se lee con JOIN, no se duplica.
CREATE TYPE rol_usuario AS ENUM ('pas', 'directivo', 'administrativo');
CREATE TYPE estado_usuario AS ENUM ('activo', 'suspendido');

ALTER TABLE usuario ADD COLUMN telefono VARCHAR(255) NOT NULL DEFAULT '';
ALTER TABLE usuario ALTER COLUMN telefono DROP DEFAULT;
ALTER TABLE usuario ADD COLUMN rol rol_usuario;
ALTER TABLE usuario ADD COLUMN organizacion VARCHAR(255) NOT NULL DEFAULT '';
ALTER TABLE usuario ALTER COLUMN organizacion DROP DEFAULT;
ALTER TABLE usuario ADD COLUMN estado estado_usuario NOT NULL DEFAULT 'activo';

-- rol no tiene default: no hay un rol "correcto" por defecto. Se exige NOT
-- NULL recien ahora que la tabla sigue vacia (si tuviera filas sin rol,
-- este ALTER fallaria a proposito en vez de adivinar un rol).
ALTER TABLE usuario ALTER COLUMN rol SET NOT NULL;

-- 5. Volver a crear las FK ya con los tipos nuevos.
ALTER TABLE usuario
    ADD CONSTRAINT fk_usuario_auth_users
    FOREIGN KEY (id) REFERENCES auth.users (id)
    ON DELETE CASCADE;

ALTER TABLE productor
    ADD CONSTRAINT fk_productor_usuario
    FOREIGN KEY (id) REFERENCES usuario (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE;

ALTER TABLE asegurado
    ADD CONSTRAINT fk_asegurado_productor
    FOREIGN KEY (id_productor) REFERENCES productor (id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE;

CREATE OR REPLACE VIEW cliente AS
SELECT
    id,
    nombre,
    apellido,
    email,
    tipo_documento_sigla,
    numero_documento,
    id_productor
FROM asegurado;

-- 6. current_productor_id() pasa a devolver uuid (antes integer). No se
--    puede cambiar el tipo de retorno con CREATE OR REPLACE: hay que
--    soltarla. Depende de ella un conjunto de políticas RLS de lectura
--    (ninguna de escritura) que se recrean abajo, con el mismo cuerpo que
--    tenían en la migración base: esta migración no cambia el alcance de
--    datos por rol, solo el tipo del id de productor.
DROP FUNCTION current_productor_id() CASCADE;

CREATE FUNCTION current_productor_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    raw text;
BEGIN
    raw := current_setting('app.productor_id', true);
    IF raw IS NULL OR btrim(raw) = '' THEN
        RETURN NULL;
    END IF;
    RETURN btrim(raw)::uuid;
EXCEPTION
    WHEN invalid_text_representation THEN
        RETURN NULL;
END;
$$;

CREATE POLICY productor_select ON productor
FOR SELECT
USING (
    sesion_es_admin()
    OR (sesion_es_productor() AND id = current_productor_id())
);

CREATE POLICY asegurado_select ON asegurado
FOR SELECT
USING (
    sesion_es_admin()
    OR (sesion_es_productor() AND id_productor = current_productor_id())
);

CREATE POLICY poliza_select ON poliza
FOR SELECT
USING (
    sesion_es_admin()
    OR (
        sesion_es_productor()
        AND EXISTS (
            SELECT 1
            FROM asegurado a
            WHERE a.id = poliza.id_asegurado
              AND a.id_productor = current_productor_id()
        )
    )
);

CREATE POLICY endoso_select ON endoso
FOR SELECT
USING (
    sesion_es_admin()
    OR (
        sesion_es_productor()
        AND EXISTS (
            SELECT 1
            FROM poliza p
            JOIN asegurado a ON a.id = p.id_asegurado
            WHERE p.id = endoso.id_poliza
              AND a.id_productor = current_productor_id()
        )
    )
);

CREATE POLICY poliza_hogar_select ON poliza_hogar
FOR SELECT
USING (
    sesion_es_admin()
    OR (
        sesion_es_productor()
        AND EXISTS (
            SELECT 1
            FROM poliza p
            JOIN asegurado a ON a.id = p.id_asegurado
            WHERE p.id = poliza_hogar.id
              AND a.id_productor = current_productor_id()
        )
    )
);

CREATE POLICY bien_hogar_select ON bien_hogar
FOR SELECT
USING (
    sesion_es_admin()
    OR (
        sesion_es_productor()
        AND EXISTS (
            SELECT 1
            FROM poliza_hogar ph
            JOIN poliza p ON p.id = ph.id
            JOIN asegurado a ON a.id = p.id_asegurado
            WHERE ph.id = bien_hogar.id_poliza_hogar
              AND a.id_productor = current_productor_id()
        )
    )
);

CREATE POLICY poliza_automotor_select ON poliza_automotor
FOR SELECT
USING (
    sesion_es_admin()
    OR (
        sesion_es_productor()
        AND EXISTS (
            SELECT 1
            FROM poliza p
            JOIN asegurado a ON a.id = p.id_asegurado
            WHERE p.id = poliza_automotor.id
              AND a.id_productor = current_productor_id()
        )
    )
);

CREATE POLICY vehiculo_select ON vehiculo
FOR SELECT
USING (
    sesion_es_admin()
    OR (
        sesion_es_productor()
        AND EXISTS (
            SELECT 1
            FROM poliza_automotor pa
            JOIN poliza p ON p.id = pa.id
            JOIN asegurado a ON a.id = p.id_asegurado
            WHERE pa.id = vehiculo.id
              AND a.id_productor = current_productor_id()
        )
    )
);

CREATE POLICY poliza_consorcio_select ON poliza_consorcio
FOR SELECT
USING (
    sesion_es_admin()
    OR (
        sesion_es_productor()
        AND EXISTS (
            SELECT 1
            FROM poliza p
            JOIN asegurado a ON a.id = p.id_asegurado
            WHERE p.id = poliza_consorcio.id
              AND a.id_productor = current_productor_id()
        )
    )
);

CREATE POLICY poliza_comercio_select ON poliza_comercio
FOR SELECT
USING (
    sesion_es_admin()
    OR (
        sesion_es_productor()
        AND EXISTS (
            SELECT 1
            FROM poliza p
            JOIN asegurado a ON a.id = p.id_asegurado
            WHERE p.id = poliza_comercio.id
              AND a.id_productor = current_productor_id()
        )
    )
);

CREATE POLICY inmueble_select ON inmueble
FOR SELECT
USING (
    sesion_es_admin()
    OR (
        sesion_es_productor()
        AND (
            EXISTS (
                SELECT 1
                FROM poliza_hogar ph
                JOIN poliza p ON p.id = ph.id
                JOIN asegurado a ON a.id = p.id_asegurado
                WHERE ph.id_inmueble = inmueble.id
                  AND a.id_productor = current_productor_id()
            )
            OR EXISTS (
                SELECT 1
                FROM poliza_consorcio pc
                JOIN poliza p ON p.id = pc.id
                JOIN asegurado a ON a.id = p.id_asegurado
                WHERE pc.id_inmueble = inmueble.id
                  AND a.id_productor = current_productor_id()
            )
            OR EXISTS (
                SELECT 1
                FROM poliza_comercio pcc
                JOIN poliza p ON p.id = pcc.id
                JOIN asegurado a ON a.id = p.id_asegurado
                WHERE pcc.id_inmueble = inmueble.id
                  AND a.id_productor = current_productor_id()
            )
        )
    )
);

-- 7. Políticas de usuario (PA-8): ya no usan SET LOCAL app.*, usan
--    auth.uid() directamente. Alta/edición de usuarios (CU-46/47/48) está
--    fuera de esta épica: por ahora ninguna escritura pasa por un usuario
--    autenticado (las hace el seed con la service_role, que no pasa por RLS).
DROP POLICY IF EXISTS usuario_select ON usuario;
CREATE POLICY usuario_select ON usuario
FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS usuario_escritura ON usuario;
CREATE POLICY usuario_escritura ON usuario
FOR ALL
USING (false)
WITH CHECK (false);

-- productor_escritura no dependía de current_productor_id(): no la tocó el
-- CASCADE del paso 6, sigue como estaba.

-- 8. Tabla de auditoría (épica 4.3): solo se agrega desde el servidor:
--    ninguna escritura pasa por un usuario autenticado (AuditoriaRepo usa
--    la service_role desde la Server Action, igual que el seed).
CREATE TYPE accion_auditoria AS ENUM ('ingreso', 'cierre', 'cambio-contrasena', 'perfil');

CREATE TABLE IF NOT EXISTS auditoria (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL,
    rol rol_usuario NOT NULL,
    accion accion_auditoria NOT NULL,
    ocurrido_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id),
    CONSTRAINT fk_auditoria_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuario (id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_auditoria_usuario ON auditoria (usuario_id);

ALTER TABLE auditoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE auditoria FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS auditoria_sin_acceso ON auditoria;
CREATE POLICY auditoria_sin_acceso ON auditoria
FOR ALL
USING (false)
WITH CHECK (false);
