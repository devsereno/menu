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
AS '
DECLARE
  v_uid uuid := auth.uid();
  v_tel text := public.normalizar_tel_auto(p_telefone);
  v_cli public.clientes%ROWTYPE;
  v_id uuid;
BEGIN
  IF v_uid IS NULL THEN
    RETURN json_build_object(''ok'', false, ''erro'', ''Entre de novo no tablet'');
  END IF;
  IF length(v_tel) < 10 THEN
    RETURN json_build_object(''ok'', false, ''erro'', ''WhatsApp incompleto'');
  END IF;
  IF coalesce(p_total, 0) <= 0 THEN
    RETURN json_build_object(''ok'', false, ''erro'', ''Carrinho vazio'');
  END IF;

  SELECT * INTO v_cli
  FROM public.clientes
  WHERE user_id = v_uid
    AND public.normalizar_tel_auto(telefone) = v_tel
  LIMIT 1;

  IF FOUND AND v_cli.senha_definida AND length(trim(coalesce(p_senha, ''''))) > 0 AND v_cli.senha_hash IS DISTINCT FROM md5(p_senha) THEN
    RETURN json_build_object(''ok'', true, ''status'', ''senha_errada'', ''erro'', ''Senha errada'');
  END IF;

  IF FOUND AND v_cli.senha_definida AND v_cli.senha_hash = md5(p_senha) THEN
    INSERT INTO public.movimentacoes (user_id, cliente_id, tipo, valor, observacao)
    VALUES (v_uid, v_cli.id, ''fiado'', p_total, ''Auto caixa'');
    INSERT INTO public.auto_pedidos (user_id, cliente_id, nome, telefone, itens, total, status)
    VALUES (v_uid, v_cli.id, v_cli.nome, v_tel, coalesce(p_itens, ''[]''::jsonb), p_total, ''fechado'')
    RETURNING id INTO v_id;
    RETURN json_build_object(''ok'', true, ''status'', ''fechado'', ''id'', v_id, ''nome'', v_cli.nome);
  END IF;

  IF length(trim(coalesce(p_senha, ''''))) = 0 THEN
    RETURN json_build_object(''ok'', true, ''status'', ''esperando_auth'', ''aviso'', ''Este WhatsApp ainda não finalizou o cadastro'');
  END IF;

  INSERT INTO public.auto_pedidos (user_id, cliente_id, nome, telefone, senha_plana, itens, total, status)
  VALUES (
    v_uid,
    CASE WHEN FOUND THEN v_cli.id ELSE NULL END,
    coalesce(nullif(trim(p_nome), ''''), CASE WHEN FOUND THEN v_cli.nome ELSE NULL END),
    v_tel,
    p_senha,
    coalesce(p_itens, ''[]''::jsonb),
    p_total,
    ''esperando_auth''
  )
  RETURNING id INTO v_id;

  RETURN json_build_object(''ok'', true, ''status'', ''esperando_auth'', ''id'', v_id, ''aviso'', ''Este WhatsApp ainda não finalizou o cadastro'');
END;
';

NOTIFY pgrst, 'reload schema';
