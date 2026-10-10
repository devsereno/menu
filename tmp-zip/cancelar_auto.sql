CREATE OR REPLACE FUNCTION public.cancelar_auto_pedido(p_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS '
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN json_build_object(''ok'', false, ''erro'', ''Não autenticado'');
  END IF;
  DELETE FROM public.auto_pedidos
  WHERE id = p_id
    AND user_id = auth.uid()
    AND status IN (''esperando_auth'', ''esperando_codigo'');
  RETURN json_build_object(''ok'', true);
END;
';

REVOKE ALL ON FUNCTION public.cancelar_auto_pedido(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cancelar_auto_pedido(uuid) TO authenticated;
NOTIFY pgrst, 'reload schema';
