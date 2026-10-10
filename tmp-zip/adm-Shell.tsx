import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useSessaoDispositivo } from "../lib/useSessaoDispositivo";
import { IconFile, IconGear, IconUsers, IconVisao } from "../components/icons";

const NAV = [
  { to: "/", label: "Visão", Icon: IconVisao },
  { to: "/vendedores", label: "Vendedores", Icon: IconUsers },
  { to: "/comprovantes", label: "Comprovantes", Icon: IconFile },
  { to: "/recados", label: "Recados", Icon: IconFile },
  { to: "/tutorial", label: "Tutorial", Icon: IconFile },
  { to: "/config", label: "Ajustes", Icon: IconGear },
  { to: "/reset-teste", label: "Reset", Icon: IconGear },
] as const;

export default function Shell({ email }: { email: string }) {
  const nav = useNavigate();
  const loc = useLocation();
  const [apelido, setApelido] = useState((email.split("@")[0] || email));
  const [novos, setNovos] = useState(0);
  const [canalNovo, setCanalNovo] = useState("");
  useSessaoDispositivo(true);
  useEffect(() => {
    async function ping() {
      const visto = localStorage.getItem("recado_visto_adm") || "1970-01-01T00:00:00.000Z";
      const { data } = await supabase.rpc("recados_nao_lidos_adm", { p_visto: visto });
      const j = data as { qtd?: number; canal?: string | null };
      setNovos(Number(j?.qtd || 0));
      setCanalNovo(j?.canal || "");
    }
    ping();
    const tmr = setInterval(ping, 40000);
    return () => clearInterval(tmr);
  }, [loc.pathname]);

  useEffect(() => {
    supabase.rpc("obter_config_adm").then(({ data }) => {
      const j = data as { ok?: boolean; meu_nome?: string | null };
      const n = String(j?.meu_nome || "").trim();
      if (n) setApelido(n);
    });
  }, [email, loc.pathname]);
  return (
    <div className="mx-auto min-h-screen max-w-lg bg-[#0b0614] pb-8 text-violet-50">
      <header className="flex items-center justify-between border-b border-violet-500/20 px-4 py-3">
        <div>
          <p className="text-[10px] tracking-[0.2em] text-violet-400">CENTRAL ADM</p>
          <Link to="/config" className="block truncate text-xs text-violet-200 hover:underline">
            {apelido}
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Link to={canalNovo ? "/recados?canal=" + canalNovo : "/recados"} className="relative text-xs text-violet-200">
            Msg
            {novos > 0 && (
              <span className="absolute -right-3 -top-2 rounded-full bg-fuchsia-500 px-1 text-[10px] font-bold text-white">
                {novos > 9 ? "9+" : novos}
              </span>
            )}
          </Link>
          <button
            className="text-xs text-violet-200"
            onClick={async () => {
              await supabase.auth.signOut();
              nav("/");
            }}
          >
            Sair
          </button>
        </div>
      </header>
      <nav className="flex gap-2 overflow-x-auto px-4 py-3 text-sm">
        {NAV.map(({ to, label, Icon }) => {
          const on = loc.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 ${
                on
                  ? "border-fuchsia-400/50 bg-fuchsia-500/15 text-fuchsia-100"
                  : "border-violet-500/30 text-violet-100"
              }`}
            >
              <Icon className="h-4 w-4" active={on} />
              {label}
            </Link>
          );
        })}
      </nav>
      <main className="px-4 py-2">
        <Outlet />
      </main>
    </div>
  );
}
