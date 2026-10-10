import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";
import { brl } from "../lib/format";
import { mascaraTelBR } from "../lib/phoneMask";

type Item = {
  id: string;
  nome: string | null;
  telefone: string;
  total: number;
  status?: string;
};

function wa(tel: string, texto: string) {
  const d = tel.replace(/\D/g, "");
  const n = d.startsWith("55") ? d : `55${d}`;
  return `https://wa.me/${n}?text=${encodeURIComponent(texto)}`;
}

export default function AutoFilaPage() {
  const [autorizar, setAutorizar] = useState<Item[]>([]);
  const [notas, setNotas] = useState<Item[]>([]);
  const [alvo, setAlvo] = useState<Item | null>(null);

  async function carregar() {
    const { data, error } = await supabase.rpc("listar_auto_vendedor");
    if (error) return toast.error(error.message);
    const j = data as { autorizar?: Item[]; notas?: Item[] };
    setAutorizar(j?.autorizar ?? []);
    setNotas(j?.notas ?? []);
  }

  useEffect(() => {
    void carregar();
  }, []);

  async function autorizarPedido(p: Item) {
    const { data, error } = await supabase.rpc("autorizar_auto_pedido", { p_id: p.id });
    if (error) return toast.error(error.message);
    const j = data as { ok?: boolean; erro?: string; codigo?: string; telefone?: string; nome?: string; total?: number };
    if (!j?.ok) return toast.error(j?.erro || "Não autorizou");
    const texto = `Codigo de ativacao Fiscal Connect: ${j.codigo}\n${j.nome || "Cliente"} · ${brl(j.total)}\nDigite este codigo no tablet para fechar a compra.`;
    window.open(wa(j.telefone || p.telefone, texto), "_blank");
    toast.success("WhatsApp aberto com o código");
    await carregar();
  }

  async function excluir() {
    if (!alvo) return;
    const { error } = await supabase.rpc("cancelar_auto_pedido", { p_id: alvo.id });
    if (error) return toast.error(error.message);
    setAlvo(null);
    toast.success("Solicitação excluída");
    await carregar();
  }

  async function enviarNota(p: Item) {
    const texto = `*Fiscal Connect – Comprovante*\nCliente: ${p.nome || "Cliente"}\nTotal: ${brl(p.total)}\nForma: Fiado\nAuto caixa`;
    window.open(wa(p.telefone, texto), "_blank");
    await supabase.rpc("marcar_nota_auto", { p_id: p.id });
    await carregar();
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Auto caixa</h1>
      <section className="space-y-2">
        <h2 className="font-semibold">Para autorizar</h2>
        {autorizar.length === 0 && <p className="text-sm text-violet-400">Nenhuma conta esperando.</p>}
        {autorizar.map((p) => (
          <article key={p.id} className="rounded-2xl border border-amber-500/30 p-3">
            <p className="font-medium">{p.nome || "Sem nome"}</p>
            <p className="text-sm text-violet-300">{mascaraTelBR(p.telefone)} · {brl(p.total)}</p>
            <p className="text-xs text-amber-200">{p.status === "esperando_codigo" ? "Código já gerado" : "Aguardando autorização"}</p>
            <button className="btn-primary mt-2" type="button" onClick={() => void autorizarPedido(p)}>
              Autorizar e abrir WhatsApp
            </button>
            <button className="mt-2 block text-sm text-rose-300" type="button" onClick={() => setAlvo(p)}>
              Excluir solicitação
            </button>
          </article>
        ))}
      </section>
      <section className="space-y-2">
        <h2 className="font-semibold">Notas a enviar</h2>
        {notas.length === 0 && <p className="text-sm text-violet-400">Nenhuma nota pendente.</p>}
        {notas.map((p) => (
          <article key={p.id} className="flex items-center justify-between rounded-2xl border border-violet-500/25 p-3">
            <div>
              <p className="font-medium">{p.nome || "Cliente"}</p>
              <p className="text-sm text-violet-300">{brl(p.total)}</p>
            </div>
            <button className="rounded-xl bg-fuchsia-600 px-3 py-2 text-sm" type="button" onClick={() => void enviarNota(p)}>
              Enviar
            </button>
          </article>
        ))}
      </section>
      {alvo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-rose-500/40 bg-[#160c24] p-4">
            <h2 className="text-lg font-semibold">Excluir esta solicitação?</h2>
            <p className="mt-2 text-sm text-violet-300">{alvo.nome || "Sem nome"} sai da lista. A compra não vira fiado.</p>
            <div className="mt-4 flex justify-end gap-2">
              <button className="rounded-xl px-3 py-2 text-sm" type="button" onClick={() => setAlvo(null)}>Cancelar</button>
              <button className="rounded-xl bg-rose-600 px-3 py-2 text-sm" type="button" onClick={() => void excluir()}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
