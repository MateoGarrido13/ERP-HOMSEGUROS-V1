-- La migración anterior dejó `auditoria` sin ningún acceso (FOR ALL USING
-- false), pensando en que el registro se haría con la service_role. Para
-- T-5 del plan de ERP-5, AuditoriaRepo.registrar corre en la misma Server
-- Action que abre la sesión, con el cliente del usuario ya autenticado — no
-- hace falta una service_role aparte para esto. Se permite insertar la
-- propia fila (usuario_id = auth.uid()); seguir sin política de SELECT,
-- UPDATE ni DELETE deniega esas operaciones por default (RLS sin policy que
-- matchee = denegado). Append-only, como pide la épica 4.3.
DROP POLICY IF EXISTS auditoria_sin_acceso ON auditoria;

CREATE POLICY auditoria_insertar_propio ON auditoria
FOR INSERT
WITH CHECK (auth.uid() = usuario_id);
