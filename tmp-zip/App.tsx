import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./lib/supabase";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import PerfilPage from "./pages/PerfilPage";
import AssinaturaPage from "./pages/AssinaturaPage";
import PagarPlanoPage from "./pages/PagarPlanoPage";
import DadosPage from "./pages/DadosPage";
import ClientesPage from "./pages/ClientesPage";
import ClienteDetalhePage from "./pages/ClienteDetalhePage";
import CaixaPage from "./pages/CaixaPage";
import EstoquePage from "./pages/EstoquePage";
import CompraPage from "./pages/CompraPage";
import ContaPage from "./pages/ContaPage";
import RecadosPage from "./pages/RecadosPage";
import PublicoClientePage from "./pages/PublicoClientePage";
import TermosPage from "./pages/TermosPage";
import TutorialListaPage from "./pages/TutorialListaPage";
import TutorialPlayerPage from "./pages/TutorialPlayerPage";
import ComprovantesFilaPage from "./pages/ComprovantesFilaPage";
import AutoCaixaPage from "./pages/AutoCaixaPage";
import AutoFilaPage from "./pages/AutoFilaPage";
import AppShell from "./components/AppShell";

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
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

  return (
    <Routes>
      {/* Público: sem login */}
      <Route path="/p/:token" element={<PublicoClientePage />} />
      <Route path="/termos" element={<TermosPage />} />

      <Route path="/auth" element={session ? <Navigate to="/" replace /> : <AuthPage />} />

      <Route
        path="/"
        element={session ? <AppShell session={session} /> : <Navigate to="/auth" replace />}
      >
        <Route index element={<HomePage />} />
        <Route path="caixa" element={<CaixaPage />} />
        <Route path="estoque" element={<EstoquePage />} />
        <Route path="compras" element={<CompraPage />} />
        <Route path="clientes" element={<ClientesPage />} />
        <Route path="clientes/:id" element={<ClienteDetalhePage />} />
        <Route path="conta" element={<ContaPage />} />
        <Route path="tutorial" element={<TutorialListaPage />} />
        <Route path="tutorial/:id" element={<TutorialPlayerPage />} />
        <Route path="comprovantes" element={<ComprovantesFilaPage />} />
        <Route path="auto" element={<AutoFilaPage />} />
        <Route path="auto-caixa" element={<AutoCaixaPage />} />
        <Route path="recados" element={<RecadosPage />} />
        <Route path="perfil" element={<PerfilPage />} />
        <Route path="assinatura" element={<AssinaturaPage />} />
        <Route path="assinatura/pagar" element={<PagarPlanoPage />} />
        <Route path="dados" element={<DadosPage />} />
        <Route path="produtos" element={<Navigate to="/estoque" replace />} />
        <Route path="fiados" element={<Navigate to="/clientes?fiados=1" replace />} />
      </Route>

      <Route path="*" element={<Navigate to={session ? "/" : "/auth"} replace />} />
    </Routes>
  );
}
