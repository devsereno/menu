CREATE OR REPLACE FUNCTION public.listar_comprovantes_fila()
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS 'SELECT json_build_object(''ok'', true, ''itens'', COALESCE((SELECT json_agg(row_to_json(x)) FROM (SELECT c.id, c.cliente_id, cl.nome, c.valor, c.created_at FROM public.comprovantes_cliente c JOIN public.clientes cl ON cl.id = c.cliente_id WHERE c.user_id = auth.uid() AND c.status = ''aguardando_vendedor'' ORDER BY c.created_at DESC LIMIT 50) x), ''[]''::json));';

REVOKE ALL ON FUNCTION public.listar_comprovantes_fila() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.listar_comprovantes_fila() TO authenticated;
GRANT EXECUTE ON FUNCTION public.listar_comprovantes_fila() TO service_role;

NOTIFY pgrst, 'reload schema';
