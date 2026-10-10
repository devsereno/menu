import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

const APP = "fiscal-connect";

type Vid = { id: string; titulo: string; ordem: number };

export default function TutorialListaPage() {
  const [lista, setLista] = useState<Vid[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("tutoriais")
      .select("id,titulo,ordem")
      .eq("app_slug", APP)
      .eq("ativo", true)
      .order("ordem")
      .then(({ data }) => {
        setLista((data as Vid[]) ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Tutorial</h1>
      <p className="text-sm text-violet-300">Vídeos curtos de como usar o Fiscal Connect.</p>
      {loading ? (
        <p className="text-violet-400">Carregando…</p>
      ) : lista.length === 0 ? (
        <p className="text-sm text-violet-400">Tutorial em breve.</p>
      ) : (
        <ul className="space-y-2">
          {lista.map((v) => (
            <li key={v.id}>
              <Link to={`/tutorial/${v.id}`} className="block rounded-2xl border border-violet-500/30 bg-violet-950/40 p-4">
                <p className="font-semibold">{v.titulo}</p>
                <p className="text-xs text-violet-400">Assistir</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
