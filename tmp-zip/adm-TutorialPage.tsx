import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";
import { youtubeId } from "../lib/youtube";

type AppRow = { slug: string; nome: string };
type Vid = {
  id: string;
  app_slug: string;
  titulo: string;
  youtube_url: string;
  ordem: number;
  ativo: boolean;
};

export default function TutorialPage() {
  const [apps, setApps] = useState<AppRow[]>([]);
  const [lista, setLista] = useState<Vid[]>([]);
  const [slug, setSlug] = useState("fiscal-connect");
  const [titulo, setTitulo] = useState("");
  const [url, setUrl] = useState("");
  const [ordem, setOrdem] = useState("1");
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  async function carregarApps() {
    const { data, error } = await supabase.from("apps").select("slug,nome").order("nome");
    if (error) toast.error(error.message);
    const rows = (data as AppRow[]) ?? [];
    setApps(rows);
    if (rows.length && !rows.some((a) => a.slug === slug)) setSlug(rows[0].slug);
  }

  async function carregar() {
    const { data, error } = await supabase
      .from("tutoriais")
      .select("id,app_slug,titulo,youtube_url,ordem,ativo")
      .order("app_slug")
      .order("ordem");
    if (error) toast.error(error.message);
    else setLista((data as Vid[]) ?? []);
  }

  useEffect(() => {
    void carregarApps();
    void carregar();
  }, []);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo.trim() || !url.trim()) return;
    if (!youtubeId(url)) {
      toast.error("Cole o link do YouTube (não listado).");
      return;
    }
    setSaving(true);
    const payload = {
      app_slug: slug,
      titulo: titulo.trim(),
      youtube_url: url.trim(),
      ordem: Number(ordem) || 1,
      ativo: true,
    };
    const { error } = editId
      ? await supabase.from("tutoriais").update(payload).eq("id", editId)
      : await supabase.from("tutoriais").insert(payload);
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success(editId ? "Vídeo atualizado" : "Vídeo cadastrado");
      setEditId(null);
      setTitulo("");
      setUrl("");
      await carregar();
    }
  }

  function editar(v: Vid) {
    setEditId(v.id);
    setSlug(v.app_slug);
    setTitulo(v.titulo);
    setUrl(v.youtube_url);
    setOrdem(String(v.ordem));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelarEdicao() {
    setEditId(null);
    setTitulo("");
    setUrl("");
    setOrdem("1");
  }

  async function apagar(id: string) {
    if (!window.confirm("Tirar este vídeo da lista?")) return;
    const { error } = await supabase.from("tutoriais").delete().eq("id", id);
    if (error) toast.error(error.message);
    else await carregar();
  }

  async function toggle(v: Vid) {
    const { error } = await supabase.from("tutoriais").update({ ativo: !v.ativo }).eq("id", v.id);
    if (error) toast.error(error.message);
    else await carregar();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Tutoriais</h1>
      <p className="text-sm text-violet-300">
        Escolha o app, ponha o nome e o link do YouTube não listado. O Fiscal só mostra o que estiver ativo.
      </p>

      <form
        onSubmit={salvar}
        className={`space-y-3 rounded-2xl border p-4 ${
          editId ? "border-amber-400/70 bg-amber-950/35" : "border-violet-500/30"
        }`}
      >
        {editId && (
          <p className="rounded-xl bg-amber-400 px-3 py-2 text-sm font-semibold text-black">
            Modo edição — alterando “{titulo || "vídeo"}”
          </p>
        )}
        <label className="block text-sm">
          App
          <select
            className="input"
            style={editId ? { backgroundColor: "#3b2a12", borderColor: "#fbbf24" } : undefined}
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          >
            {apps.length === 0 && <option value="fiscal-connect">fiscal-connect</option>}
            {apps.map((a) => (
              <option key={a.slug} value={a.slug}>
                {a.nome} ({a.slug})
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          Nome do vídeo
          <input className={`input ${editId ? "border-amber-400/60 bg-amber-950/50" : ""}`} required value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Operando o caixa" />
        </label>
        <label className="block text-sm">
          Link do YouTube
          <input className={`input ${editId ? "border-amber-400/60 bg-amber-950/50" : ""}`} required value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://youtu.be/..." />
        </label>
        <label className="block text-sm">
          Ordem
          <input className={`input ${editId ? "border-amber-400/60 bg-amber-950/50" : ""}`} inputMode="numeric" value={ordem} onChange={(e) => setOrdem(e.target.value)} />
        </label>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? "Salvando…" : editId ? "Salvar alteração" : "Cadastrar vídeo"}
        </button>
        {editId && (
          <button type="button" className="w-full text-sm text-violet-300" onClick={cancelarEdicao}>
            Cancelar edição
          </button>
        )}
      </form>

      <ul className="space-y-2">
        {lista.length === 0 && <li className="text-sm text-violet-400">Nenhum vídeo ainda.</li>}
        {lista.map((v) => (
          <li
            key={v.id}
            className={`rounded-xl border p-3 text-sm ${
              editId === v.id ? "border-amber-400/70 bg-amber-950/25" : "border-violet-500/25"
            }`}
          >
            <p className="font-medium">{v.titulo}</p>
            <p className="text-xs text-violet-400">
              {v.app_slug} · ordem {v.ordem} · {v.ativo ? "ativo" : "oculto"}
            </p>
            <div className="mt-2 flex gap-2">
              <button type="button" className="rounded-lg border border-fuchsia-400/40 px-2 py-1 text-xs" onClick={() => editar(v)}>
                Editar
              </button>
              <button type="button" className="rounded-lg border border-violet-500/40 px-2 py-1 text-xs" onClick={() => toggle(v)}>
                {v.ativo ? "Ocultar" : "Ativar"}
              </button>
              <button type="button" className="rounded-lg border border-rose-400/40 px-2 py-1 text-xs text-rose-200" onClick={() => apagar(v.id)}>
                Apagar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
