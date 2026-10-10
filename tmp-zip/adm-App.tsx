import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./lib/supabase";
import AuthPage from "./pages/AuthPage";
import Shell from "./pages/Shell";
import VisaoPage from "./pages/VisaoPage";
import VendedoresPage from "./pages/VendedoresPage";
import ComprovantesPage from "./pages/ComprovantesPage";
import VendedorPage from "./pages/VendedorPage";
import AguardandoPage from "./pages/AguardandoPage";
import ConfigPage from "./pages/ConfigPage";
import RecadosPage from "./pages/RecadosPage";
import ResetTestePage from "./pages/ResetTestePage";
import TutorialPage from "./pages/TutorialPage";

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [adminErro, setAdminErro] = useState<string | null>(null);

  async function checarAdmin(s: Session | null) {
    setSession(s);
    if (!s) {
      setAdmin(false);
      setAdminErro(null);
      setReady(true);
      return;
    }

    const email = (s.user.email || "").trim().toLowerCase();

    for (let i = 0; i < 8; i++) {
      const { data: rows } = await supabase.from("admins").select("email");
      const naTabela = (rows ?? []).some(
        (r) => String(r.email || "").trim().toLowerCase() === email
      );
      if (naTabela) {
        setAdmin(true);
        setAdminErro(null);
        setReady(true);
        return;
      }

      const { data: ok } = await supabase.rpc("is_admin");
      if (ok) {
        setAdmin(true);
        setAdminErro(null);
        setReady(true);
        return;
      }
      await new Promise((r) => setTimeout(r, 300));
    }

    setAdmin(false);
    setAdminErro("Não encontrado em admins: " + (s.user.email || "?"));
    setReady(true);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      void checarAdmin(data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((evento, s) => {
      if (evento === "INITIAL_SESSION") return;
      if (evento === "SIGNED_IN" || evento === "TOKEN_REFRESHED" || evento === "SIGNED_OUT") {
        if (evento === "SIGNED_IN") setReady(false);
        void checarAdmin(s);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0614] text-violet-300">
        Carregando…
      </div>
    );
  }

  if (!session) {
    return (
      <Routes>
        <Route path="*" element={<AuthPage />} />
      </Routes>
    );
  }

  if (!admin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#0b0614] px-6 text-center text-violet-100">
<AguardandoPage email={session.user.email || ""} />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Shell email={session.user.email || ""} />}>
        <Route index element={<VisaoPage />} />
        <Route path="vendedores" element={<VendedoresPage />} />
        <Route path="vendedores/:id" element={<VendedorPage />} />
        <Route path="comprovantes" element={<ComprovantesPage />} />
        <Route path="config" element={<ConfigPage />} />
        <Route path="recados" element={<RecadosPage />} />
        <Route path="reset-teste" element={<ResetTestePage />} />
        <Route path="tutorial" element={<TutorialPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
