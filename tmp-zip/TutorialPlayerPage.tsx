import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { youtubeEmbed } from "../lib/youtube";

const APP = "fiscal-connect";

type Vid = { id: string; titulo: string; youtube_url: string };

export default function TutorialPlayerPage() {
  const { id } = useParams();
  const [atual, setAtual] = useState<Vid | null>(null);
  const [outros, setOutros] = useState<Vid[]>([]);

  useEffect(() => {
    if (!id) return;
    supabase
      .from("tutoriais")
      .select("id,titulo,youtube_url")
      .eq("app_slug", APP)
      .eq("ativo", true)
      .order("ordem")
      .then(({ data }) => {
        const rows = (data as Vid[]) ?? [];
        setAtual(rows.find((r) => r.id === id) || null);
        setOutros(rows.filter((r) => r.id !== id));
      });
  }, [id]);

  const embed = atual ? youtubeEmbed(atual.youtube_url) : null;

  return (
    <div className="space-y-4">
      <Link to="/tutorial" className="text-sm text-violet-300">
        ← Todos os tutoriais
      </Link>
      {!atual ? (
        <p className="text-sm text-violet-400">Vídeo não encontrado.</p>
      ) : (
        <>
          <h1 className="text-xl font-bold">{atual.titulo}</h1>
          {embed ? (
            <div className="overflow-hidden rounded-2xl border border-violet-500/30">
              <iframe
                title={atual.titulo}
                src={embed}
                className="aspect-video w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <p className="text-sm text-rose-300">Link do vídeo inválido.</p>
          )}
        </>
      )}
      {outros.length > 0 && (
        <section>
          <p className="mb-2 text-sm font-medium text-violet-200">Outros deste app</p>
          <ul className="space-y-2">
            {outros.map((v) => (
              <li key={v.id}>
                <Link to={`/tutorial/${v.id}`} className="block rounded-xl border border-violet-500/25 p-3 text-sm">
                  {v.titulo}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
