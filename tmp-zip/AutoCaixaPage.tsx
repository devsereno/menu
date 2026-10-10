import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";
import { brl } from "../lib/format";
import { mascaraTelBR, soDigitosTel } from "../lib/phoneMask";

type Produto = { id: string; nome: string; preco_venda: number | null };
type Item = { id: string; nome: string; qtd: number; preco: number };

function telLimpo(v: string) {
  let d = v.replace(/\D/g, "");
  if (d.startsWith("55") && d.length >= 12) d = d.slice(2);
  return d.slice(0, 11);
}

function iniciais(nome: string) {
  const ignorar = new Set(["de", "da", "do", "das", "dos", "e", "a", "o"]);
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  const uteis = partes.filter((p) => !ignorar.has(p.toLowerCase()));
  const base = (uteis.length ? uteis : partes).slice(0, 2);
  return base.map((p) => p[0]?.toUpperCase() || "").join("") || "P";
}

export default function AutoCaixaPage() {
  const nav = useNavigate();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carrinho, setCarrinho] = useState<Item[]>([]);
  const [aberto, setAberto] = useState<Produto | null>(null);
  const [qtd, setQtd] = useState(1);
  const [etapa, setEtapa] = useState<"loja" | "fim" | "cadastro" | "codigo" | "nota">("loja");
  const [tel, setTel] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [pedidoId, setPedidoId] = useState<string | null>(null);
  const [codigo, setCodigo] = useState("");
  const [notaNome, setNotaNome] = useState("");
  const [loja, setLoja] = useState("Loja");
  const [pausas, setPausas] = useState<{ id: string; nome: string | null; total: number; status?: string }[]>([]);
  const [pedirEncerrar, setPedirEncerrar] = useState(false);
  const [verLista, setVerLista] = useState(false);
  const [historicoCheio, setHistoricoCheio] = useState(false);
  const [compras, setCompras] = useState<{ id: string; nome: string | null; total: number; created_at: string; itens: { nome?: string; qtd?: number }[] | null }[]>([]);
  const [de, setDe] = useState("");
  const [ate, setAte] = useState("");

  const total = useMemo(
    () => carrinho.reduce((s, i) => s + i.preco * i.qtd, 0),
    [carrinho]
  );
  const qtdItens = carrinho.reduce((s, i) => s + i.qtd, 0);

  useEffect(() => {
    function ficar() {
      window.history.pushState({ banca: 1 }, "");
      setEtapa("loja");
      setAberto(null);
    }
    window.history.pushState({ banca: 1 }, "");
    window.addEventListener("popstate", ficar);
    return () => window.removeEventListener("popstate", ficar);
  }, []);

  useEffect(() => {
    if (etapa !== "nota") return;
    const t = setTimeout(() => {
      setCarrinho([]);
      setSenha("");
      setCodigo("");
      setTel("");
      setNome("");
      setEtapa("loja");
    }, 5000);
    return () => clearTimeout(t);
  }, [etapa]);

  useEffect(() => {
    supabase
      .from("produtos")
      .select("id,nome,preco_venda")
      .order("nome")
      .then(({ data }) => setProdutos((data as Produto[]) ?? []));
    supabase
      .from("vendedor_status")
      .select("nome_fantasia")
      .maybeSingle()
      .then(({ data }) => {
        const n = String(data?.nome_fantasia || "").trim();
        if (n) setLoja(n);
      });
    function lerPausas() {
      supabase.rpc("listar_auto_vendedor").then(({ data }) => {
        const j = data as { autorizar?: { id: string; nome: string | null; total: number; status?: string }[] };
        setPausas(j?.autorizar ?? []);
      });
    }
    lerPausas();
    const t = setInterval(lerPausas, 15000);
    return () => clearInterval(t);
  }, []);

  function add() {
    if (!aberto) return;
    const preco = Number(aberto.preco_venda || 0);
    setCarrinho((old) => {
      const i = old.find((x) => x.id === aberto.id);
      if (i) return old.map((x) => (x.id === aberto.id ? { ...x, qtd: x.qtd + qtd } : x));
      return [...old, { id: aberto.id, nome: aberto.nome, qtd, preco }];
    });
    setAberto(null);
    setQtd(1);
  }

  async function confirmar() {
    const itens = carrinho.map((i) => ({ nome: i.nome, qtd: i.qtd, preco: i.preco }));
    const { data, error } = await supabase.rpc("iniciar_auto_compra", {
      p_telefone: telLimpo(tel),
      p_senha: senha,
      p_nome: nome,
      p_itens: itens,
      p_total: total,
    });
    if (error) return toast.error(error.message);
    const j = data as { ok?: boolean; erro?: string; status?: string; id?: string; nome?: string; aviso?: string };
    if (!j?.ok) return toast.error(j?.erro || "Não fechou");
    if (j.status === "senha_errada") {
      toast.error("Senha errada. A conta já está ativa.");
      return;
    }
    setPedidoId(j.id || null);
    setNotaNome(j.nome || nome || "Cliente");
    if (j.status === "fechado") setEtapa("nota");
    else {
      toast.message(j.aviso || "Cadastro ainda não finalizado");
      setEtapa("cadastro");
    }
  }

  async function gravarCadastro() {
    if (!nome.trim() || telLimpo(tel).length < 10 || senha.length < 4) {
      toast.error("Nome, WhatsApp e senha (mín. 4)");
      return;
    }
    const itens = carrinho.map((i) => ({ nome: i.nome, qtd: i.qtd, preco: i.preco }));
    const { data, error } = await supabase.rpc("iniciar_auto_compra", {
      p_telefone: telLimpo(tel),
      p_senha: senha,
      p_nome: nome.trim(),
      p_itens: itens,
      p_total: total,
    });
    if (error) return toast.error(error.message);
    const j = data as { ok?: boolean; id?: string; erro?: string };
    if (!j?.ok) return toast.error(j?.erro || "Falhou");
    setPedidoId(j.id || null);
    setEtapa("codigo");
    toast.success("Compra travada. Autorize no telefone e digite o código.");
  }

  async function validarCodigo() {
    if (!pedidoId) return;
    const { data, error } = await supabase.rpc("confirmar_codigo_auto", {
      p_id: pedidoId,
      p_codigo: codigo.trim(),
    });
    if (error) return toast.error(error.message);
    const j = data as { ok?: boolean; erro?: string; nome?: string };
    if (!j?.ok) return toast.error(j?.erro || "Código incorreto");
    setNotaNome(j.nome || nome);
    setEtapa("nota");
  }

  async function abrirLista(cheio = false) {
    setHistoricoCheio(cheio);
    setVerLista(true);
    let q = supabase
      .from("auto_pedidos")
      .select("id,nome,total,created_at,itens,status")
      .eq("status", "fechado")
      .order("created_at", { ascending: false });
    if (cheio && de) q = q.gte("created_at", `${de}T00:00:00`);
    if (cheio && ate) q = q.lte("created_at", `${ate}T23:59:59`);
    if (!cheio) q = q.limit(11);
    const { data } = await q;
    setCompras((data as typeof compras) ?? []);
  }

  async function encerrar() {
    await supabase.auth.signOut();
    nav("/auth");
  }

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-[#0b0614] px-4 pb-28 pt-4 text-violet-50">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-[10px] tracking-[0.2em] text-violet-400">FISCAL CONNECT</p>
          <p className="text-sm text-violet-100">{loja}</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="rounded-full border border-violet-400/40 px-3 py-1.5 text-xs" onClick={() => void abrirLista(false)}>
            Lista
          </button>
          <button type="button" className="rounded-full border border-fuchsia-400/40 px-3 py-1.5 text-xs" onClick={() => setPedirEncerrar(true)}>
            Encerrar
          </button>
        </div>
      </header>

      {etapa === "loja" && (
        <>
          <h1 className="mt-4 text-3xl font-bold">Auto caixa</h1>
          {pausas.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-amber-200">{pausas.length} compra em pausa</p>
              {pausas.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className="flex w-full items-center justify-between rounded-2xl border border-amber-400/40 px-3 py-3 text-left"
                  onClick={() => {
                    setPedidoId(p.id);
                    setNotaNome(p.nome || "Cliente");
                    setCodigo("");
                    if (p.status === "esperando_codigo") setEtapa("codigo");
                    else toast.message("Ainda esperando o vendedor autorizar");
                  }}
                >
                  <span>
                    <span className="block font-medium">{p.nome || "Cliente"}</span>
                    <span className="text-xs text-amber-200">{p.status === "esperando_codigo" ? "Digitar código" : "Esperando autorização"}</span>
                  </span>
                  <span>{brl(p.total)}</span>
                </button>
              ))}
            </div>
          )}
          <div className="mt-4 grid grid-cols-2 gap-3">
            {produtos.map((p) => (
              <button
                key={p.id}
                type="button"
                className="rounded-2xl border border-violet-500/30 p-3 text-left"
                onClick={() => {
                  setAberto(p);
                  setQtd(1);
                }}
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-fuchsia-400/40 text-lg font-bold text-fuchsia-200">
                  {iniciais(p.nome)}
                </span>
                <p className="mt-2 font-medium">{p.nome}</p>
                <p className="text-fuchsia-200">{brl(p.preco_venda)}</p>
              </button>
            ))}
          </div>
        </>
      )}

      {etapa === "fim" && (
        <form
          className="mt-6 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            void confirmar();
          }}
        >
          <h1 className="text-2xl font-bold">Finalizar compra</h1>
          <ul className="space-y-1 text-sm text-violet-200">
            {carrinho.map((i) => (
              <li key={i.id} className="flex justify-between">
                <span>{i.nome} x{i.qtd}</span>
                <span>{brl(i.preco * i.qtd)}</span>
              </li>
            ))}
          </ul>
          <p className="text-lg font-semibold">Total {brl(total)}</p>
          <label className="block text-sm">
            WhatsApp
            <input
              className="input"
              inputMode="tel"
              autoComplete="tel"
              value={mascaraTelBR(tel)}
              placeholder="(27) 98888-6756"
              onChange={(e) => setTel(telLimpo(e.target.value))}
              onPaste={(e) => {
                e.preventDefault();
                setTel(telLimpo(e.clipboardData.getData("text")));
              }}
            />
          </label>
          <label className="block text-sm">
            Senha
            <input className="input" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />
          </label>
          <button className="btn-primary" type="submit">Confirmar</button>
          <p className="text-xs text-violet-400">Se número e senha baterem, a compra entra como fiado.</p>
        </form>
      )}

      {etapa === "cadastro" && (
        <div className="mt-6 space-y-3">
          <h1 className="text-2xl font-bold">Cadastro não finalizado</h1>
          <p className="text-sm text-amber-200">Este WhatsApp ainda não tem senha.</p>
          <label className="block text-sm">Nome<input className="input" value={nome} onChange={(e) => setNome(e.target.value)} /></label>
          <label className="block text-sm">WhatsApp<input
            className="input"
            inputMode="tel"
            value={mascaraTelBR(tel)}
            onChange={(e) => setTel(telLimpo(e.target.value))}
            onPaste={(e) => {
              e.preventDefault();
              setTel(telLimpo(e.clipboardData.getData("text")));
            }}
          /></label>
          <label className="block text-sm">Senha que o cliente vai usar<input className="input" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} /></label>
          <button className="btn-primary" type="button" onClick={() => void gravarCadastro()}>Travar e pedir código</button>
        </div>
      )}

      {etapa === "codigo" && (
        <div className="mt-6 space-y-3">
          <h1 className="text-2xl font-bold">Digite o código</h1>
          <p className="text-sm text-violet-300">O código chegou no WhatsApp do cliente. Se o celular derrubou esta sessão, entre de novo: a compra continua aqui.</p>
          <input className="input text-center text-2xl tracking-[0.4em]" inputMode="numeric" maxLength={4} value={codigo} onChange={(e) => setCodigo(e.target.value.replace(/\D/g, "").slice(0, 4))} />
          <button className="btn-primary" type="button" onClick={() => void validarCodigo()}>Confirmar código</button>
          <button className="text-sm text-violet-300" type="button" onClick={() => setEtapa("loja")}>Voltar aos produtos</button>
        </div>
      )}

      {etapa === "nota" && (
        <div className="mt-6 rounded-2xl border border-violet-500/30 p-4">
          <p className="text-xs text-violet-400">Nota da compra</p>
          <h2 className="text-2xl font-bold">{loja}</h2>
          <p className="mt-1">{notaNome}</p>
          <ul className="mt-3 space-y-1 text-sm">
            {carrinho.map((i) => (
              <li key={i.id} className="flex justify-between">
                <span>{i.nome} x{i.qtd}</span>
                <span>{brl(i.preco * i.qtd)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-lg font-semibold">Total {brl(total)}</p>
          <p className="text-sm text-fuchsia-200">Forma: fiado</p>
          <p className="mt-2 text-xs text-violet-300">Voltando para a banca em 5 segundos.</p>
          <button
            className="btn-primary mt-4"
            type="button"
            onClick={() => {
              setCarrinho([]);
              setEtapa("loja");
              setSenha("");
              setCodigo("");
            }}
          >
            Nova compra
          </button>
        </div>
      )}

      {aberto && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-3xl border border-fuchsia-400/30 bg-[#140a22] p-5">
            <div className="flex justify-between">
              <h2 className="text-2xl font-bold">{aberto.nome}</h2>
              <button type="button" onClick={() => setAberto(null)}>X</button>
            </div>
            <p className="mt-1 text-xl text-fuchsia-200">{brl(aberto.preco_venda)}</p>
            <p className="mt-4 text-sm">Quantidade</p>
            <div className="mt-2 flex items-center justify-between rounded-xl border border-violet-500/30 px-4 py-2">
              <button type="button" onClick={() => setQtd((n) => Math.max(1, n - 1))}>−</button>
              <span className="text-xl">{qtd}</span>
              <button type="button" onClick={() => setQtd((n) => n + 1)}>+</button>
            </div>
            <button className="btn-primary mt-4" type="button" onClick={add}>Adicionar</button>
          </div>
        </div>
      )}

      {etapa === "loja" && (
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-violet-500/20 bg-[#0b0614]/95 px-4 py-3">
          <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
            <p className="text-sm">{qtdItens} itens · {brl(total)}</p>
            <button className="btn-primary" type="button" disabled={!carrinho.length} onClick={() => setEtapa("fim")}>
              Terminar compra
            </button>
          </div>
        </div>
      )}
      {verLista && (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-[#0b0614] px-4 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">{historicoCheio ? "Histórico" : "Últimas compras"}</h2>
            <button type="button" className="text-sm" onClick={() => setVerLista(false)}>Fechar</button>
          </div>
          {historicoCheio && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <label className="text-xs">De<input className="input" type="date" value={de} onChange={(e) => setDe(e.target.value)} /></label>
              <label className="text-xs">Até<input className="input" type="date" value={ate} onChange={(e) => setAte(e.target.value)} /></label>
              <button className="btn-primary col-span-2" type="button" onClick={() => void abrirLista(true)}>Ver período</button>
            </div>
          )}
          <div className="mt-4 space-y-2">
            {(historicoCheio ? compras : compras.slice(0, 10)).map((c) => (
              <article key={c.id} className="rounded-2xl border border-violet-500/30 p-3 text-sm">
                <p className="font-medium">{c.nome || "Cliente"} · {brl(c.total)}</p>
                <p className="text-xs text-violet-300">{new Date(c.created_at).toLocaleString("pt-BR")}</p>
                <p className="mt-1 text-violet-200">{(c.itens || []).map((i) => `${i.nome || "Item"} x${i.qtd || 1}`).join(", ")}</p>
              </article>
            ))}
            {compras.length === 0 && <p className="text-sm text-violet-400">Nenhuma compra fechada.</p>}
          </div>
          {!historicoCheio && compras.length > 10 && (
            <button className="btn-primary mt-4" type="button" onClick={() => void abrirLista(true)}>Ver histórico completo</button>
          )}
        </div>
      )}
      {pedirEncerrar && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-violet-500/40 bg-[#160c24] p-4">
            <h2 className="text-lg font-semibold">Encerrar o auto caixa?</h2>
            <p className="mt-2 text-sm text-violet-300">O vendedor sai da conta neste aparelho.</p>
            <div className="mt-4 flex justify-end gap-2">
              <button className="rounded-xl px-3 py-2 text-sm" type="button" onClick={() => setPedirEncerrar(false)}>Cancelar</button>
              <button className="rounded-xl bg-fuchsia-600 px-3 py-2 text-sm" type="button" onClick={() => void encerrar()}>Encerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
