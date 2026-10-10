import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";
import { useSituacao, situacaoLabel } from "../hooks/useSituacao";
import { dataBR } from "../lib/format";

export default function ContaPage() {
  const { data, recarregar } = useSituacao();
  const sit = data?.situacao ?? "ativa";
  const [passo, setPasso] = useState(0);

  async function pausar() {
    const { data: d, error } = await supabase.rpc("encerrar_minha_conta", { p_apagar: false });
    if (error) toast.error(error.message);
    else {
      const j = d as { ok?: boolean; erro?: string };
      if (!j?.ok) toast.error(j?.erro || "Falha");
      else toast.success("Conta pausada. Você tem 3 meses para voltar.");
    }
    await recarregar();
    setPasso(0);
  }

  async function apagar() {
    const { data: d, error } = await supabase.rpc("encerrar_minha_conta", { p_apagar: true });
    if (error) toast.error(error.message);
    else {
      const j = d as { ok?: boolean; erro?: string };
      if (!j?.ok) toast.error(j?.erro || "Falha");
      else {
        toast.success("Pedido de exclusão registrado.");
        await supabase.auth.signOut();
      }
    }
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Conta</h1>
      <Link to="/assinatura" className="block rounded-2xl border border-violet-500/30 bg-violet-950/40 p-4">
        <p className="font-semibold">Minha assinatura</p>
        <p className="mt-1 text-sm text-violet-200/80">
          {situacaoLabel[sit]} · pago até {dataBR(data?.pago_ate)}
        </p>
      </Link>
      <Link to="/perfil" className="block rounded-2xl border border-violet-500/30 bg-violet-950/40 p-4">
        <p className="font-semibold">Perfil da loja</p>
      </Link>
      <Link to="/tutorial" className="block rounded-2xl border border-violet-500/30 bg-violet-950/40 p-4">
        <p className="font-semibold">Ver tutorial</p>
        <p className="mt-1 text-xs text-violet-300">Vídeos de como usar o caixa, o estoque e o cliente.</p>
      </Link>
      <Link to="/recados" className="block rounded-2xl border border-violet-500/30 bg-violet-950/40 p-4">
        <p className="font-semibold">Falar com o admin</p>
        <p className="mt-1 text-xs text-violet-300">Recado. Não é conversa ao vivo.</p>
      </Link>

      <section className="rounded-2xl border border-rose-500/25 p-4">
        <p className="font-semibold text-rose-200">Encerrar conta</p>
        {passo === 0 && (
          <button type="button" className="mt-3 w-full rounded-xl border border-rose-400/40 py-2 text-sm" onClick={() => setPasso(1)}>
            Encerrar ou pausar
          </button>
        )}
        {passo === 1 && (
          <div className="mt-3 space-y-2 text-sm text-violet-200">
            <p>Não quer só pausar? Pausada, a conta fica 3 meses. Se voltar nesse prazo, reativa. Depois de 3 meses os dados podem ser apagados.</p>
            <button type="button" className="w-full rounded-xl bg-amber-700 py-2 font-semibold" onClick={pausar}>
              Pausar 3 meses
            </button>
            <button type="button" className="w-full rounded-xl border border-rose-400/40 py-2" onClick={() => setPasso(2)}>
              Não quero pausar, quero excluir
            </button>
            <button type="button" className="w-full py-2 text-violet-300" onClick={() => setPasso(0)}>
              Cancelar
            </button>
          </div>
        )}
        {passo === 2 && (
          <div className="mt-3 space-y-2 text-sm text-rose-100">
            <p>Excluir apaga o acesso agora. Clientes, fotos e dívidas podem ser removidos. Isso não tem volta depois de 3 meses.</p>
            <button type="button" className="w-full rounded-xl bg-rose-700 py-2 font-semibold" onClick={apagar}>
              Sim, excluir minha conta
            </button>
            <button type="button" className="w-full py-2 text-violet-300" onClick={() => setPasso(0)}>
              Não excluir
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
