-- Prueba reproducible de supabase/migrations/20261125000000_perfil_rls.sql.
-- Uso (no destructiva: todo corre en una transaccion que termina en ROLLBACK):
--   docker exec -i supabase_db_ERP-HOMSEGUROS-V1 psql -U postgres -v ON_ERROR_STOP=0 < supabase/tests/perfil_rls.sql
-- Simula la sesion del PAS de ejemplo (martin.gomez@hom.com.ar).
BEGIN;
CREATE TEMP TABLE ctx AS SELECT id AS yo FROM public.usuario WHERE email = 'martin.gomez@hom.com.ar';
-- Otro PAS con matricula propia, creado solo dentro de esta transaccion.
INSERT INTO auth.users (instance_id,id,aud,role,email,is_sso_user,is_anonymous)
VALUES ('00000000-0000-0000-0000-000000000000','e5555555-5555-4555-8555-555555555555','authenticated','authenticated','otro.pas@test.local',false,false);
INSERT INTO public.usuario (id,email,nombre,apellido,dni,telefono,rol,organizacion,estado)
VALUES ('e5555555-5555-4555-8555-555555555555','otro.pas@test.local','Otro','Pas',1,'111','pas','X','activo');
INSERT INTO public.productor (id,matricula_ssn) VALUES ('e5555555-5555-4555-8555-555555555555','99999');
GRANT SELECT ON ctx TO authenticated;

SELECT set_config('request.jwt.claims', json_build_object('sub',(SELECT yo FROM ctx),'role','authenticated')::text, true);
SET LOCAL ROLE authenticated;

\echo '--- (a) actualizar nombre y telefono propios: esperado UPDATE 1'
UPDATE public.usuario SET nombre='Martín Prueba', telefono='5491143219088' WHERE id=(SELECT yo FROM ctx);
SELECT nombre, telefono FROM public.usuario WHERE id=(SELECT yo FROM ctx);

\echo '--- (b) rol / estado / email / apellido / organizacion: esperado ERROR permission denied'
SAVEPOINT s1; UPDATE public.usuario SET rol='directivo' WHERE id=(SELECT yo FROM ctx); ROLLBACK TO s1;
SAVEPOINT s2; UPDATE public.usuario SET estado='suspendido' WHERE id=(SELECT yo FROM ctx); ROLLBACK TO s2;
SAVEPOINT s3; UPDATE public.usuario SET email='x@y.com' WHERE id=(SELECT yo FROM ctx); ROLLBACK TO s3;
SAVEPOINT s4; UPDATE public.usuario SET apellido='Z' WHERE id=(SELECT yo FROM ctx); ROLLBACK TO s4;
SAVEPOINT s5; UPDATE public.usuario SET organizacion='Z' WHERE id=(SELECT yo FROM ctx); ROLLBACK TO s5;

\echo '--- (c) fila ajena: UPDATE esperado 0 filas; SELECT esperado solo 1 fila (la propia)'
UPDATE public.usuario SET nombre='Hackeado' WHERE id='e5555555-5555-4555-8555-555555555555';
SELECT count(*) AS usuarios_visibles FROM public.usuario;

\echo '--- (d) matricula: esperado solo la propia (42108), no 99999'
SELECT matricula_ssn FROM public.productor;
RESET ROLE;
ROLLBACK;
