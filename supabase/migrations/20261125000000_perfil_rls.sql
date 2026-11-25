-- ERP-7 (ver/editar perfil): minimo privilegio para que cada usuario edite
-- solo `nombre` y `telefono` de su propia fila y lea su propia matricula.
--
-- Hasta ahora `usuario_escritura` (FOR ALL USING false) bloqueaba toda
-- escritura y `productor_select` solo entendia las variables app.* (no
-- auth.uid()). No se toca ninguna de las dos: las politicas permisivas se
-- combinan con OR, asi que las nuevas solo agregan lo que se pide aca.
-- Reaplicable: DROP POLICY IF EXISTS + CREATE, y REVOKE/GRANT idempotentes.

-- 1. UPDATE solo de columnas nombre/telefono. RLS no limita columnas, por
--    eso se saca el UPDATE de tabla completa y se concede por columna.
REVOKE UPDATE ON public.usuario FROM anon, authenticated;
GRANT UPDATE (nombre, telefono) ON public.usuario TO authenticated;

-- 2. Solo la fila propia, en USING y en WITH CHECK (no se puede "mover" la
--    fila a otro id).
DROP POLICY IF EXISTS usuario_update_propio ON public.usuario;
CREATE POLICY usuario_update_propio ON public.usuario
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 3. Lectura de la propia matricula (el PAS solo ve su fila de productor).
DROP POLICY IF EXISTS productor_select_propio ON public.productor;
CREATE POLICY productor_select_propio ON public.productor
FOR SELECT
TO authenticated
USING (auth.uid() = id);
