import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import {
  IconHome,
  IconCaixa,
  IconEstoque,
  IconClientes,
  IconConta,
} from "./icons";
import { useSituacao, situacaoLabel } from "../hooks/useSituacao";
import { useSessaoDispositivo } from "../lib/useSessaoDispositivo";
import ThemeToggle from "./ThemeToggle";

const NAV = [
  { to: "/", label: "Início", Icon: IconHome },
  { to: "/caixa", label: "Caixa", Icon: IconCaixa },
  { to: "/estoque", label: "Estoque", Icon: IconEstoque },
  { to: "/clientes", label: "Clientes", Icon: IconClientes },
  { to: "/conta", label: "Conta", Icon: IconConta },
] as const;

const LIVRES = ["/conta", "/assinatura", "/perfil", "/dados", "/recados", "/tutorial", "/comprovantes", "/auto"];

export default function AppShell({ session }: { session: Session }) {
  const nav = useNavigate();
  const loc = useLocation();
  const { data, loading } = useSituacao();
  const [apelido, setApelido] = useState("");
  const [novos, setNovos] = useState(0);
  const [filaComp, setFilaComp] = useState(0);
  const [filaAuto, setFilaAuto] = useState(0);
  const [filaBanca, setFilaBanca] = useState(0);
  const [menuAuto, setMenuAuto] = useState(false);
  useSessaoDispositivo(true);
  const sit = data?.situacao ?? "ativa";
  const bloqueado = sit === "bloqueio_vendedor" || sit === "bloqueio_total";
  const caminhoLivre = LIVRES.some(
    (p) => loc.pathname === p || loc.pathname.startsWith(p + "/")
  );

  useEffect(() => {
    const uid = session.user.id;
    const email = (session.user.email || "").toLowerCase();
    async function pingRecados() {
      const { data } = await supabase.rpc("listar_recados", { p_canal: uid });
      const j = data as { itens?: { created_at: string; autor_email: string }[] };
      const visto = localStorage.getItem("recado_visto_" + uid) || "";
      const qtd = (j?.itens || []).filter((m) => m.autor_email !== email && m.created_at > visto).length;
      setNovos(qtd);
    }
    pingRecados();
    async function pingFila() {
      const { data } = await supabase.rpc("listar_comprovantes_fila");
      const j = data as { itens?: unknown[] };
      setFilaComp((j?.itens || []).length);
    }
    pingFila();
    async function pingAuto() {
      const { data } = await supabase.rpc("listar_auto_vendedor");
      const j = data as { autorizar?: unknown[]; notas?: unknown[] };
      const pausas = (j?.autorizar || []).length;
      const notas = (j?.notas || []).length;
      setFilaBanca(pausas);
      setFilaAuto(pausas + notas);
    }
    pingAuto();
    const tmr = setInterval(() => {
      pingRecados();
      pingFila();
      pingAuto();
    }, 40000);
    return () => clearInterval(tmr);
  }, [session.user.id, session.user.email, loc.pathname]);

  useEffect(() => {
    supabase
      .from("vendedor_status")
      .select("nome_fantasia")
      .eq("user_id", session.user.id)
      .maybeSingle()
      .then(({ data: row }) => {
        const n = String(row?.nome_fantasia || "").trim();
        const meta = String(session.user.user_metadata?.nome || session.user.user_metadata?.full_name || "").trim();
        setApelido(n || meta || (session.user.email || "").split("@")[0]);
      });
  }, [session.user.id, session.user.email, loc.pathname]);

  async function sair() {
    await supabase.auth.signOut();
    nav("/auth");
  }

  return (
    <div className="app-shell mx-auto min-h-screen max-w-lg pb-28">
      <header className="app-header sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-violet-500/15 px-4 py-3.5 backdrop-blur-md">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold tracking-[0.2em] text-violet-400">
            FISCAL CONNECT
          </p>
          <Link to="/conta" className="block truncate text-sm text-violet-100/90 underline-offset-2 hover:underline">
            {apelido || session.user.email}
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="relative">
            <button
              type="button"
              className="relative rounded-full border border-fuchsia-400/40 px-2.5 py-1.5 text-xs"
              onClick={() => setMenuAuto((v) => !v)}
            >
              Auto
              {filaAuto > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-bold text-black">
                  {filaAuto > 9 ? "9+" : filaAuto}
                </span>
              )}
            </button>
            {menuAuto && (
              <div className="absolute right-0 z-30 mt-2 w-44 rounded-2xl border border-violet-500/30 bg-[#160c24] p-2 shadow-xl">
                <Link to="/auto-caixa" className="flex items-center justify-between rounded-xl px-3 py-2 text-sm" onClick={() => setMenuAuto(false)}>
                  Banca
                  {filaBanca > 0 && <span className="rounded-full bg-amber-400 px-1.5 text-[10px] font-bold text-black">{filaBanca}</span>}
                </Link>
                <Link to="/auto" className="flex items-center justify-between rounded-xl px-3 py-2 text-sm" onClick={() => setMenuAuto(false)}>
                  Auto
                  {filaAuto > 0 && <span className="rounded-full bg-amber-400 px-1.5 text-[10px] font-bold text-black">{filaAuto}</span>}
                </Link>
              </div>
            )}
          </div>
          <Link to="/comprovantes" className="relative rounded-full border border-amber-400/40 px-2.5 py-1.5 text-xs">
            Pix
            {filaComp > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-bold text-black">
                {filaComp > 9 ? "9+" : filaComp}
              </span>
            )}
          </Link>
          <Link to="/recados" className="relative rounded-full border border-violet-400/35 px-2.5 py-1.5 text-xs">
            Msg
            {novos > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-fuchsia-500 px-1 text-[10px] font-bold">
                {novos > 9 ? "9+" : novos}
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={sair}
            className="shrink-0 rounded-full border border-violet-400/35 bg-violet-950/50 px-3.5 py-1.5 text-xs font-medium text-violet-100"
          >
            Sair
          </button>
        </div>
      </header>

      {bloqueado && !loading && (
        <div className="mx-4 mt-3 rounded-xl border border-amber-500/40 bg-amber-950/30 px-3 py-2 text-xs text-amber-100">
          {data?.situacao_manual
            ? "Conta pausada pelo administrador."
            : `${situacaoLabel[sit]} — pague a mensalidade para liberar o caixa.`}
          <Link to="/assinatura" className="ml-1 underline">
            Minha assinatura
          </Link>
        </div>
      )}

      <main className="px-4 py-5">
        {bloqueado && !caminhoLivre && !loading ? (
          <div className="space-y-4 rounded-2xl border border-amber-500/30 bg-amber-950/20 p-5">
            <h1 className="text-xl font-bold text-white">Acesso limitado</h1>
            <p className="text-sm text-violet-200/80">
              {data?.situacao_manual
                ? sit === "bloqueio_total"
                  ? "Sua conta foi bloqueada pelo administrador. O caixa e os links dos clientes estão pausados."
                  : "Sua conta foi pausada pelo administrador. O caixa está bloqueado. Os links dos clientes ainda funcionam."
                : sit === "bloqueio_total"
                  ? "Sua assinatura está atrasada. O caixa e os links dos clientes estão bloqueados."
                  : "Sua assinatura venceu. O caixa está bloqueado. Os links dos clientes ainda funcionam."}
            </p>
            <Link to="/assinatura" className="btn-primary block text-center">
              Ir para Minha assinatura
            </Link>
          </div>
        ) : (
          <Outlet />
        )}
      </main>

      <nav className="app-nav fixed bottom-0 left-0 right-0 z-20 border-t border-violet-500/15 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg justify-between px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
          {NAV.map(({ to, label, Icon }) => {
            const active =
              to === "/"
                ? loc.pathname === "/"
                : loc.pathname === to || loc.pathname.startsWith(to + "/");
            return (
              <Link
                key={to}
                to={to}
                className={`flex min-w-[3.5rem] flex-col items-center gap-0.5 rounded-xl px-2 py-1 ${
                  active ? "text-fuchsia-300" : "text-violet-300/80"
                }`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                    active ? "bg-fuchsia-500/15" : ""
                  }`}
                >
                  <Icon active={active} />
                </span>
                <span className={`text-[10px] ${active ? "font-semibold" : ""}`}>
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
