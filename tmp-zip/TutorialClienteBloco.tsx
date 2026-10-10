import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { youtubeEmbed } from "../lib/youtube";

type Vid = { id: string; titulo: string; youtube_url: string };

export default function TutorialClienteBloco() {
  const [lista, setLista] = useState<Vid[]>([]);
  const [aberto, setAberto] = useState<Vid | null>(null);

  useEffect(() => {
    supabase
      .from("tutoriais")
      .select("id,titulo,youtube_url")
      .eq("app_slug", "fiscal-connect-cliente")
      .eq("ativo", true)
      .order("ordem")
      .then(({ data }) => setLista((data as Vid[]) ?? []));
  }, []);

  if (lista.length === 0) return null;

  const atual = aberto ?? lista[0];
  const embed = youtubeEmbed(atual.youtube_url);

  return (
    <section className="rounded-2xl border border-violet-500/30 p-4">
      <p className="text-sm font-semibold">Como usar esta página</p>
      <p className="mt-1 text-xs text-violet-300">Vídeo curto. Pode assistir aqui.</p>
      {embed && (
        <div className="mt-3 overflow-hidden rounded-xl">
          <iframe
            title={atual.titulo}
            src={embed}
            className="aspect-video w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}
      {lista.length > 1 && (
        <ul className="mt-3 space-y-1">
          {lista.map((v) => (
            <li key={v.id}>
              <button type="button" className="text-left text-sm text-violet-200 underline" onClick={() => setAberto(v)}>
                {v.titulo}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
