import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { brl, dataBR } from "../lib/format";

type Item = {
  id: string;
  cliente_id: string;
  nome: string;
  valor: number;
  created_at: string;
};

export default function ComprovantesFilaPage() {
  const [itens, setItens] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.rpc("listar_comprovantes_fila").then(({ data }) => {
      const j = data as { itens?: Item[] };
      setItens(j?.itens ?? []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Comprovantes</h1>
      <p className="text-sm text-violet-300">Quem enviou Pix. Toque para abrir e conferir.</p>
      {loading ? (
        <p className="text-violet-400">Carregando…</p>
      ) : itens.length === 0 ? (
        <p className="text-sm text-violet-400">Nenhum comprovante esperando.</p>
      ) : (
        <ul className="space-y-2">
          {itens.map((i) => (
            <li key={i.id}>
              <Link
                to={`/clientes/${i.cliente_id}`}
                className="block rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4"
              >
                <p className="font-semibold">{i.nome}</p>
                <p className="text-sm text-amber-200">
                  {brl(i.valor)} · {dataBR(i.created_at)}
                </p>
                <p className="mt-1 text-xs text-violet-400">Abrir ficha para aprovar</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
