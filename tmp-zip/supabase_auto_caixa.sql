-- Auto caixa: pedidos travados, código e notas a enviar.
-- Cole no SQL do Fiscal.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE public.clientes
  ADD COLUMN IF NOT EXISTS senha_hash text,
  ADD COLUMN IF NOT EXISTS senha_definida boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS public.auto_pedidos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cliente_id uuid REFERENCES public.clientes(id) ON DELETE SET NULL,
  nome text,
  telefone text NOT NULL,
  senha_plana text,
  itens jsonb NOT NULL DEFAULT '[]'::jsonb,
  total numeric(12,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'esperando_auth',
  codigo text,
  nota_enviada boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.auto_pedidos ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON public.auto_pedidos TO authenticated;

DROP POLICY IF EXISTS auto_pedidos_own ON public.auto_pedidos;
CREATE POLICY auto_pedidos_own ON public.auto_pedidos
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.normalizar_tel_auto(p text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS 'SELECT right(regexp_replace(coalesce(p, ''''), ''[^0-9]'', '''', ''g''), 11)';

CREATE OR REPLACE FUNCTION public.iniciar_auto_compra(
  p_telefone text,
  p_senha text,
  p_nome text,
  p_itens jsonb,
  p_total numeric
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $body$
DECLARE
  v_uid uuid := auth.uid();
  v_tel text := public.normalizar_tel_auto(p_telefone);
  v_cli public.clientes%ROWTYPE;
  v_id uuid;
BEGIN
  IF v_uid IS NULL THEN
    RETURN json_build_object('ok', false, 'erro', 'Entre de novo no tablet');
  END IF;
  IF length(v_tel) < 10 THEN
    RETURN json_build_object('ok', false, 'erro', 'WhatsApp incompleto');
  END IF;
  IF coalesce(p_total, 0) <= 0 THEN
    RETURN json_build_object('ok', false, 'erro', 'Carrinho vazio');
  END IF;

  SELECT * INTO v_cli
  FROM public.clientes
  WHERE user_id = v_uid
    AND public.normalizar_tel_auto(telefone) = v_tel
  LIMIT 1;

  IF FOUND AND v_cli.senha_definida AND v_cli.senha_hash = crypt(p_senha, v_cli.senha_hash) THEN
    INSERT INTO public.movimentacoes (user_id, cliente_id, tipo, valor, observacao)
    VALUES (v_uid, v_cli.id, 'fiado', p_total, 'Auto caixa');
    INSERT INTO public.auto_pedidos (user_id, cliente_id, nome, telefone, itens, total, status)
    VALUES (v_uid, v_cli.id, v_cli.nome, v_tel, coalesce(p_itens, '[]'::jsonb), p_total, 'fechado')
    RETURNING id INTO v_id;
    RETURN json_build_object('ok', true, 'status', 'fechado', 'id', v_id, 'nome', v_cli.nome);
  END IF;

  INSERT INTO public.auto_pedidos (user_id, cliente_id, nome, telefone, senha_plana, itens, total, status)
  VALUES (
    v_uid,
    CASE WHEN FOUND THEN v_cli.id ELSE NULL END,
    coalesce(nullif(trim(p_nome), ''), CASE WHEN FOUND THEN v_cli.nome ELSE NULL END),
    v_tel,
    p_senha,
    coalesce(p_itens, '[]'::jsonb),
    p_total,
    'esperando_auth'
  )
  RETURNING id INTO v_id;

  RETURN json_build_object(
    'ok', true,
    'status', 'esperando_auth',
    'id', v_id,
    'aviso', 'Este WhatsApp ainda não finalizou o cadastro'
  );
END;
$body$;

CREATE OR REPLACE FUNCTION public.autorizar_auto_pedido(p_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $body$
DECLARE
  v_uid uuid := auth.uid();
  v public.auto_pedidos%ROWTYPE;
  v_cod text;
BEGIN
  IF v_uid IS NULL THEN
    RETURN json_build_object('ok', false, 'erro', 'Não autenticado');
  END IF;
  SELECT * INTO v FROM public.auto_pedidos WHERE id = p_id AND user_id = v_uid;
  IF NOT FOUND THEN
    RETURN json_build_object('ok', false, 'erro', 'Compra não encontrada');
  END IF;
  v_cod := lpad((floor(random() * 10000))::int::text, 4, '0');
  UPDATE public.auto_pedidos
  SET codigo = v_cod, status = 'esperando_codigo'
  WHERE id = p_id;
  RETURN json_build_object('ok', true, 'codigo', v_cod, 'telefone', v.telefone, 'nome', v.nome, 'total', v.total);
END;
$body$;

CREATE OR REPLACE FUNCTION public.confirmar_codigo_auto(p_id uuid, p_codigo text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $body$
DECLARE
  v_uid uuid := auth.uid();
  v public.auto_pedidos%ROWTYPE;
  v_cli uuid;
BEGIN
  IF v_uid IS NULL THEN
    RETURN json_build_object('ok', false, 'erro', 'Entre de novo no tablet');
  END IF;
  SELECT * INTO v FROM public.auto_pedidos WHERE id = p_id AND user_id = v_uid;
  IF NOT FOUND THEN
    RETURN json_build_object('ok', false, 'erro', 'Compra não encontrada');
  END IF;
  IF v.status <> 'esperando_codigo' OR v.codigo IS DISTINCT FROM trim(p_codigo) THEN
    RETURN json_build_object('ok', false, 'erro', 'Código incorreto');
  END IF;

  v_cli := v.cliente_id;
  IF v_cli IS NULL THEN
    INSERT INTO public.clientes (user_id, nome, telefone, senha_hash, senha_definida)
    VALUES (v_uid, coalesce(v.nome, 'Cliente'), v.telefone, crypt(coalesce(v.senha_plana, ''), gen_salt('bf')), true)
    RETURNING id INTO v_cli;
  ELSE
    UPDATE public.clientes
    SET nome = coalesce(nullif(v.nome, ''), nome),
        senha_hash = crypt(coalesce(v.senha_plana, ''), gen_salt('bf')),
        senha_definida = true
    WHERE id = v_cli AND user_id = v_uid;
  END IF;

  INSERT INTO public.movimentacoes (user_id, cliente_id, tipo, valor, observacao)
  VALUES (v_uid, v_cli, 'fiado', v.total, 'Auto caixa');

  UPDATE public.auto_pedidos
  SET status = 'fechado', cliente_id = v_cli, senha_plana = NULL, codigo = NULL
  WHERE id = p_id;

  RETURN json_build_object('ok', true, 'status', 'fechado', 'nome', v.nome);
END;
$body$;

CREATE OR REPLACE FUNCTION public.listar_auto_vendedor()
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS 'SELECT json_build_object(''ok'', true, ''autorizar'', COALESCE((SELECT json_agg(row_to_json(a)) FROM (SELECT id, nome, telefone, total, status, created_at FROM public.auto_pedidos WHERE user_id = auth.uid() AND status IN (''esperando_auth'', ''esperando_codigo'') ORDER BY created_at DESC) a), ''[]''::json), ''notas'', COALESCE((SELECT json_agg(row_to_json(n)) FROM (SELECT id, nome, telefone, total, created_at FROM public.auto_pedidos WHERE user_id = auth.uid() AND status = ''fechado'' AND nota_enviada = false ORDER BY created_at DESC) n), ''[]''::json))';

CREATE OR REPLACE FUNCTION public.marcar_nota_auto(p_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $body$
BEGIN
  UPDATE public.auto_pedidos
  SET nota_enviada = true
  WHERE id = p_id AND user_id = auth.uid() AND status = 'fechado';
  RETURN json_build_object('ok', true);
END;
$body$;

REVOKE ALL ON FUNCTION public.iniciar_auto_compra(text, text, text, jsonb, numeric) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.autorizar_auto_pedido(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.confirmar_codigo_auto(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.listar_auto_vendedor() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.marcar_nota_auto(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.iniciar_auto_compra(text, text, text, jsonb, numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION public.autorizar_auto_pedido(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.confirmar_codigo_auto(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.listar_auto_vendedor() TO authenticated;
GRANT EXECUTE ON FUNCTION public.marcar_nota_auto(uuid) TO authenticated;

NOTIFY pgrst, 'reload schema';
