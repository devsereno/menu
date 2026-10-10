import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";
import { brl } from "../lib/format";
import MoneyInput from "../components/MoneyInput";
import { mascaraParaNumero } from "../lib/moneyInput";
import type { CarrinhoItem, Cliente, Produto, TipoMov } from "../lib/types";
import {
  abrirWhatsapp,
  linkContaPublica,
  montarCupomVenda,
} from "../lib/whatsapp";

function newKey() {
  return Math.random().toString(36).slice(2, 10);
}

function norm(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

export default function CaixaPage() {
  const [modo, setModo] = useState<"produtos" | "avulso">("produtos");
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [carrinho, setCarrinho] = useState<CarrinhoItem[]>([]);
  const [produtoSel, setProdutoSel] = useState("");
  const [qtdSel, setQtdSel] = useState("1");
  const [tipo, setTipo] = useState<TipoMov>("fiado");
  const [lojaNome, setLojaNome] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [buscaCliente, setBuscaCliente] = useState("");
  const [buscaProduto, setBuscaProduto] = useState("");
  const [showCliLista, setShowCliLista] = useState(false);
  const [showProdLista, setShowProdLista] = useState(false);
  const [valorAvulso, setValorAvulso] = useState("");
  const [obs, setObs] = useState("");
  const [saving, setSaving] = useState(false);
  const [hojeTotal, setHojeTotal] = useState(0);
  const [ultimoCupom, setUltimoCupom] = useState<{
    telefone: string;
    mensagem: string;
    clienteNome: string;
  } | null>(null);
  const [waSegundos, setWaSegundos] = useState(0);

  async function carregarBase() {
    const [{ data: prods }, { data: clis }] = await Promise.all([
      supabase.from("produtos").select("*").eq("ativo", true).order("nome"),
      supabase.from("clientes").select("*").order("nome"),
    ]);
    setProdutos((prods as Produto[]) ?? []);
    setClientes((clis as Cliente[]) ?? []);
    const { data: sess } = await supabase.auth.getSession();
    const uid = sess.session?.user?.id;
    if (uid) {
      const { data: st } = await supabase
        .from("vendedor_status")
        .select("nome_fantasia")
        .eq("user_id", uid)
        .maybeSingle();
      if (st?.nome_fantasia) setLojaNome(String(st.nome_fantasia));
    }

    const inicio = new Date();
    inicio.setHours(0, 0, 0, 0);
    const { data: movs } = await supabase
      .from("movimentacoes")
      .select("valor, tipo")
      .gte("created_at", inicio.toISOString());
    const total = (movs ?? [])
      .filter((m) => m.tipo === "avista" || m.tipo === "pagamento")
      .reduce((s, m) => s + Number(m.valor), 0);
    setHojeTotal(total);
  }

  useEffect(() => {
    carregarBase();
  }, []);

  const totalCarrinho = useMemo(
    () => carrinho.reduce((s, i) => s + i.quantidade * i.preco_unitario, 0),
    [carrinho]
  );

  function addItem() {
    const p = produtos.find((x) => x.id === produtoSel);
    if (!p) {
      toast.error("Selecione um produto");
      return;
    }
    const q = Number(String(qtdSel).replace(",", "."));
    if (!Number.isFinite(q) || q <= 0) {
      toast.error("Quantidade inválida");
      return;
    }
    if (q > Number(p.estoque)) {
      toast.error(`Estoque insuficiente (${p.estoque})`);
      return;
    }
    setCarrinho((prev) => {
      const exists = prev.find((i) => i.produto_id === p.id);
      if (exists) {
        const novaQ = exists.quantidade + q;
        if (novaQ > Number(p.estoque)) {
          toast.error("Estoque insuficiente");
          return prev;
        }
        return prev.map((i) =>
          i.produto_id === p.id ? { ...i, quantidade: novaQ } : i
        );
      }
      return [
        ...prev,
        {
          key: newKey(),
          produto_id: p.id,
          nome: p.nome,
          quantidade: q,
          preco_unitario: Number(p.preco_venda),
          estoque: Number(p.estoque),
        },
      ];
    });
    setProdutoSel("");
    setBuscaProduto("");
    setShowProdLista(false);
    setQtdSel("1");
  }

  async function fecharVenda(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user?.id;
      if (!uid) throw new Error("Sem sessão");

      if (modo === "produtos") {
        if (carrinho.length === 0) throw new Error("Carrinho vazio");
        if ((tipo === "fiado" || tipo === "pagamento") && !clienteId) {
          throw new Error("Selecione o cliente");
        }
        if (tipo === "pagamento") throw new Error("Use o detalhe do cliente para pagamento");

        const total = totalCarrinho;
        const resumo = carrinho
          .map((i) => `${i.nome} x${i.quantidade}`)
          .join(", ");

        const { error: mErr } = await supabase.from("movimentacoes").insert({
          user_id: uid,
          cliente_id: clienteId || null,
          tipo,
          valor: total,
          observacao: obs.trim() ? `${obs.trim()} | ${resumo}` : resumo,
        });
        if (mErr) throw mErr;

        // tenta gravar venda detalhada (se a tabela existir)
        const { data: venda, error: vErr } = await supabase
          .from("vendas")
          .insert({
            user_id: uid,
            cliente_id: clienteId || null,
            tipo,
            valor_total: total,
            observacao: obs.trim() || null,
          })
          .select("id")
          .maybeSingle();

        if (!vErr && venda?.id) {
          await supabase.from("venda_itens").insert(
            carrinho.map((i) => ({
              venda_id: venda.id,
              user_id: uid,
              produto_id: i.produto_id,
              nome_item: i.nome,
              quantidade: i.quantidade,
              preco_unitario: i.preco_unitario,
              valor: i.quantidade * i.preco_unitario,
            }))
          );
        }

        for (const i of carrinho) {
          const prod = produtos.find((p) => p.id === i.produto_id);
          const atual = Number(prod?.estoque ?? i.estoque);
          const novo = atual - i.quantidade;
          if (novo < -0.0001) throw new Error(`Estoque insuficiente: ${i.nome}`);
          const { error: eSt } = await supabase
            .from("produtos")
            .update({ estoque: Math.max(0, novo) })
            .eq("id", i.produto_id)
            .eq("user_id", uid);
          if (eSt) throw eSt;
        }

        const cli = clientes.find((c) => c.id === clienteId);
        if (cli?.telefone) {
          const forma =
            tipo === "fiado" ? "Fiado" : tipo === "avista" ? "À vista" : "Pagamento";
          const mensagem = montarCupomVenda({
            lojaNome,
            clienteNome: cli.nome,
            itens: carrinho.map((i) => ({
              nome: i.nome,
              quantidade: i.quantidade,
              valorLinha: i.quantidade * i.preco_unitario,
            })),
            total,
            forma,
            linkConta: linkContaPublica(cli.token_publico),
          });
          setUltimoCupom({
            telefone: cli.telefone,
            mensagem,
            clienteNome: cli.nome,
          });
          // Abre o WhatsApp na hora (usuário só confirma o envio)
          abrirWhatsapp(cli.telefone, mensagem);
        } else {
          setUltimoCupom(null);
          if (clienteId) {
            toast.message("Venda ok. Cadastre o WhatsApp do cliente para enviar o comprovante.");
          }
        }

        toast.success(tipo === "fiado" ? "Fiado registrado" : "Venda à vista registrada");
        setCarrinho([]);
        setObs("");
        if (tipo === "avista") setHojeTotal((t) => t + total);
        await carregarBase();
      } else {
        // modo avulso (valor sem produto)
        const v = mascaraParaNumero(valorAvulso);
        if (!Number.isFinite(v) || v <= 0) throw new Error("Valor inválido");
        if ((tipo === "fiado" || tipo === "pagamento") && !clienteId) {
          throw new Error("Selecione o cliente");
        }
        const { error } = await supabase.from("movimentacoes").insert({
          user_id: uid,
          cliente_id: clienteId || null,
          tipo,
          valor: v,
          observacao: obs.trim() || null,
        });
        if (error) throw error;
        const cli = clientes.find((c) => c.id === clienteId);
        if (cli?.telefone) {
          const forma =
            tipo === "fiado" ? "Fiado" : tipo === "avista" ? "À vista" : "Pagamento";
          const mensagem = montarCupomVenda({
            lojaNome,
            clienteNome: cli.nome,
            itens: [],
            total: v,
            forma,
            linkConta: linkContaPublica(cli.token_publico),
          });
          setUltimoCupom({
            telefone: cli.telefone,
            mensagem,
            clienteNome: cli.nome,
          });
          abrirWhatsapp(cli.telefone, mensagem);
        } else {
          setUltimoCupom(null);
          if (clienteId) {
            toast.message("Registrado. Cadastre o WhatsApp do cliente para o comprovante.");
          }
        }

        toast.success("Registrado");
        setValorAvulso("");
        setObs("");
        if (tipo === "avista" || tipo === "pagamento") setHojeTotal((t) => t + v);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro");
    } finally {
      setSaving(false);
    }
  }

  const clientesFiltrados = useMemo(() => {
    const q = norm(buscaCliente.trim());
    if (!q) return clientes.slice(0, 30);
    return clientes
      .filter(
        (c) =>
          norm(c.nome).includes(q) ||
          (c.telefone && c.telefone.replace(/\D/g, "").includes(q.replace(/\D/g, "")))
      )
      .slice(0, 30);
  }, [clientes, buscaCliente]);

  const produtosFiltrados = useMemo(() => {
    const q = norm(buscaProduto.trim());
    if (!q) return produtos.slice(0, 40);
    return produtos.filter((p) => norm(p.nome).includes(q)).slice(0, 40);
  }, [produtos, buscaProduto]);

  const clienteNomeSel = clientes.find((c) => c.id === clienteId)?.nome ?? "";


  // Card WhatsApp some sozinho após alguns segundos
  useEffect(() => {
    if (!ultimoCupom) {
      setWaSegundos(0);
      return;
    }
    setWaSegundos(5);
    const id = window.setInterval(() => {
      setWaSegundos((s) => {
        if (s <= 1) {
          window.clearInterval(id);
          setUltimoCupom(null);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [ultimoCupom]);

  const tiposDisponiveis = (
    modo === "produtos"
      ? ([["avista", "À vista"], ["fiado", "Fiado"]] as const)
      : ([["fiado", "Fiado"], ["pagamento", "Pagamento"]] as const)
  );

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Caixa</h1>

      {ultimoCupom && (
        <section className="sticky top-0 z-10 space-y-3 rounded-2xl border-2 border-[#25D366]/50 bg-emerald-950/40 p-4 shadow-lg shadow-emerald-900/30">
          <p className="text-sm font-semibold text-emerald-100">
            Venda fechada — enviar comprovante no WhatsApp?
          </p>
          <p className="text-xs text-violet-200/80">
            Cliente: {ultimoCupom.clienteNome}
          </p>
          <button
            type="button"
            className="w-full rounded-xl bg-[#25D366] py-3.5 text-sm font-bold text-white shadow-lg"
            onClick={() => {
              abrirWhatsapp(ultimoCupom.telefone, ultimoCupom.mensagem);
              setUltimoCupom(null);
            }}
          >
            Enviar no WhatsApp
          </button>
          <button
            type="button"
            className="w-full py-1 text-xs text-violet-300"
            onClick={() => setUltimoCupom(null)}
          >
            Agora não
            {waSegundos > 0 ? ` · fecha em ${waSegundos}s` : ""}
          </button>
        </section>
      )}

      <section className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-900/40 to-fuchsia-900/20 p-4">
        <p className="text-sm text-violet-200/80">Entradas de hoje</p>
        <p className="mt-1 text-2xl font-bold">{brl(hojeTotal)}</p>
      </section>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          className={`rounded-xl py-3 text-sm font-semibold ${
            modo === "produtos" ? "bg-fuchsia-600" : "border border-violet-500/30"
          }`}
          onClick={() => {
            setModo("produtos");
            if (tipo === "pagamento") setTipo("avista");
          }}
        >
          Com produtos
        </button>
        <button
          type="button"
          className={`rounded-xl py-3 text-sm font-semibold ${
            modo === "avulso" ? "bg-fuchsia-600" : "border border-violet-500/30"
          }`}
          onClick={() => {
            setModo("avulso");
            if (tipo === "avista") setTipo("fiado");
          }}
        >
          Valor avulso
        </button>
      </div>

      <form onSubmit={fecharVenda} className="space-y-4 rounded-2xl border border-violet-500/25 p-4">
        <div className="grid grid-cols-2 gap-2">
          {tiposDisponiveis.map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setTipo(k)}
              className={`rounded-xl py-2.5 text-xs font-semibold ${
                tipo === k ? "bg-violet-600 text-white" : "border border-violet-500/30 text-violet-200"
              }`}
            >
              {k === "fiado" ? "🏷️ " : k === "avista" ? "💵 " : "💳 "}
              {label}
            </button>
          ))}
        </div>

        {(tipo === "fiado" || tipo === "pagamento" || modo === "produtos") && (
          <div className="relative block text-sm text-violet-200">
            <span>Cliente {tipo === "avista" ? "(opcional)" : ""}</span>
            <input
              className="input"
              placeholder="👤  Nome ou telefone"
              value={showCliLista || !clienteId ? buscaCliente : clienteNomeSel}
              onChange={(e) => {
                setBuscaCliente(e.target.value);
                setShowCliLista(true);
                if (clienteId) setClienteId("");
              }}
              onFocus={() => {
                setShowCliLista(true);
                setBuscaCliente(clienteNomeSel || buscaCliente);
              }}
              required={tipo === "fiado" || tipo === "pagamento"}
              autoComplete="off"
            />
            {showCliLista && (
              <ul className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-xl border border-violet-500/40 bg-[#140a22] shadow-xl">
                {clientesFiltrados.length === 0 && (
                  <li className="px-3 py-2 text-xs text-violet-400">Nenhum cliente</li>
                )}
                {clientesFiltrados.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      className="w-full px-3 py-2.5 text-left text-sm text-violet-50 hover:bg-violet-800/50"
                      onClick={() => {
                        setClienteId(c.id);
                        setBuscaCliente(c.nome);
                        setShowCliLista(false);
                      }}
                    >
                      {c.nome}
                      {c.telefone ? (
                        <span className="block text-xs text-violet-400">{c.telefone}</span>
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {modo === "produtos" ? (
          <>
            <div className="space-y-2">
              <div className="relative">
                <p className="mb-1 text-sm text-violet-200">Produto</p>
                <input
                  className="input"
                  placeholder="🔎  Nome do produto"
                  value={buscaProduto}
                  onChange={(e) => {
                    setBuscaProduto(e.target.value);
                    setShowProdLista(true);
                    setProdutoSel("");
                  }}
                  onFocus={() => {
                    setShowProdLista(true);
                    // limpa para digitar o próximo produto
                    setBuscaProduto("");
                    setProdutoSel("");
                  }}
                  autoComplete="off"
                />
                {showProdLista && (
                  <ul className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-xl border border-violet-500/40 bg-[#140a22] shadow-xl">
                    {produtosFiltrados.length === 0 && (
                      <li className="px-3 py-2 text-xs text-violet-400">Nenhum produto</li>
                    )}
                    {produtosFiltrados.map((pr) => (
                      <li key={pr.id}>
                        <button
                          type="button"
                          className="w-full px-3 py-2.5 text-left text-sm text-violet-50 hover:bg-violet-800/50"
                          onClick={() => {
                            setProdutoSel(pr.id);
                            setBuscaProduto(pr.nome);
                            setShowProdLista(false);
                          }}
                        >
                          {pr.nome}
                          <span className="block text-xs text-violet-400">
                            est. {Number(pr.estoque)} · {brl(pr.preco_venda)}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="flex gap-2">
                <div className="flex flex-1 items-center overflow-hidden rounded-xl border border-violet-500/35 bg-black/30">
                  <button
                    type="button"
                    className="px-4 py-3 text-lg font-bold text-violet-100"
                    onClick={() => {
                      const n = Math.max(1, (Number(String(qtdSel).replace(",", ".")) || 1) - 1);
                      setQtdSel(String(n));
                    }}
                  >
                    −
                  </button>
                  <input
                    className="w-full bg-transparent py-3 text-center text-sm outline-none"
                    inputMode="numeric"
                    value={qtdSel}
                    onChange={(e) => setQtdSel(e.target.value.replace(/\D/g, "") || "1")}
                  />
                  <button
                    type="button"
                    className="px-4 py-3 text-lg font-bold text-violet-100"
                    onClick={() => {
                      const n = (Number(String(qtdSel).replace(",", ".")) || 1) + 1;
                      setQtdSel(String(n));
                    }}
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={addItem}
                  className="shrink-0 rounded-xl bg-violet-700 px-5 text-sm font-semibold"
                >
                  + Add
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-400/25 bg-amber-950/25 p-3">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-amber-200/80">Nota desta venda</p>
            <ul className="space-y-2">
              {carrinho.length === 0 && (
                <li className="text-sm text-amber-100/50">Nenhum item ainda.</li>
              )}
              {carrinho.map((i) => (
                <li
                  key={i.key}
                  className="flex items-center justify-between rounded-xl bg-black/40 px-3 py-2 text-sm text-amber-50"
                >
                  <span>
                    {i.nome} × {i.quantidade}
                  </span>
                  <span className="flex items-center gap-2">
                    {brl(i.quantidade * i.preco_unitario)}
                    <button
                      type="button"
                      className="text-rose-300"
                      onClick={() =>
                        setCarrinho((prev) => prev.filter((x) => x.key !== i.key))
                      }
                    >
                      ✕
                    </button>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-lg font-bold text-amber-100">Total: {brl(totalCarrinho)}</p>
            </div>
          </>
        ) : (
          <label className="block text-sm text-violet-200">
            Valor (R$)
            <MoneyInput
              value={valorAvulso}
              onChange={setValorAvulso}
              required
              placeholder="0,00"
            />
          </label>
        )}

        <label className="block text-sm text-violet-200">
          Observação
          <input className="input" value={obs} onChange={(e) => setObs(e.target.value)} />
        </label>

        <button type="submit" className="btn-primary sticky bottom-20 z-10" disabled={saving}>
          {saving ? "Salvando…" : "Fechar venda"}
        </button>
      </form>
    </div>
  );
}
