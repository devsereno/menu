import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";
import { brl, dataBR } from "../lib/format";
import MoneyInput from "../components/MoneyInput";
import { mascaraParaNumero } from "../lib/moneyInput";
import ModalComprovante from "../components/ModalComprovante";

type Mov = {
  tipo: string;
  valor: number;
  observacao: string | null;
  created_at: string;
};

type Painel = {
  ok: boolean;
  erro?: string;
  loja?: string;
  cliente?: { nome: string; token: string };
  saldo?: number;
  movimentacoes?: Mov[];
  pix?: string | null;
  comprovantes_pendentes?: {
    id: string;
    valor: number;
    status: string;
    created_at: string;
  }[];
};

const tipoLabel: Record<string, string> = {
  avista: "À vista",
  fiado: "Fiado",
  pagamento: "Pagamento",
};

export default function PublicoClientePage() {
  const { token } = useParams<{ token: string }>();
  const [painel, setPainel] = useState<Painel | null>(null);
  const [loading, setLoading] = useState(true);
  const [valor, setValor] = useState("");
  const [obs, setObs] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [pdfNome, setPdfNome] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [verArquivo, setVerArquivo] = useState(false);
  const [verMais, setVerMais] = useState(false);
  const [guiaUrl, setGuiaUrl] = useState<string | null>(null);

  async function carregar() {
    if (!token) return;
    setLoading(true);
    const { data, error } = await supabase.rpc("obter_painel_cliente", {
      p_token: token,
    });
    if (error) {
      setPainel({ ok: false, erro: error.message });
    } else {
      setPainel(data as Painel);
    }
    setLoading(false);
  }

  useEffect(() => {
    carregar();
  }, [token]);

  useEffect(() => {
    supabase
      .from("tutoriais")
      .select("youtube_url")
      .eq("app_slug", "fiscal-connect-cliente")
      .eq("ativo", true)
      .order("ordem")
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        const u = String((data as { youtube_url?: string } | null)?.youtube_url || "").trim();
        setGuiaUrl(u || null);
      });
  }, []);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      setPdfNome(null);
      setVerArquivo(false);
      return;
    }
    const url = URL.createObjectURL(file);
    const ehPdf =
      file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (ehPdf) {
      setPdfNome(file.name);
      setPreview(url);
    } else if (file.type.startsWith("image/")) {
      setPdfNome(null);
      setPreview(url);
    } else {
      setPdfNome(file.name);
      setPreview(url);
    }
    setVerArquivo(true);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function limparArquivo() {
    setFile(null);
    setPreview(null);
    setPdfNome(null);
  }

  async function comprimirSeImagem(f: File): Promise<File> {
    if (!f.type.startsWith("image/")) return f;
    try {
      const bitmap = await createImageBitmap(f);
      const max = 1600;
      const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
      const w = Math.round(bitmap.width * scale);
      const h = Math.round(bitmap.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return f;
      ctx.drawImage(bitmap, 0, 0, w, h);
      bitmap.close();
      const blob: Blob | null = await new Promise((r) =>
        canvas.toBlob(r, "image/jpeg", 0.72)
      );
      if (!blob) return f;
      return new File([blob], "comprovante.jpg", { type: "image/jpeg" });
    } catch {
      return f;
    }
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    const v = mascaraParaNumero(valor);
    if (!Number.isFinite(v) || v <= 0) {
      toast.error("Informe o valor pago");
      return;
    }
    if (!file) {
      toast.error("Anexe a foto ou o PDF do comprovante");
      return;
    }
    setSending(true);
    try {
      if (file.type === "application/pdf" && file.size > 5 * 1024 * 1024) {
        throw new Error("PDF acima de 5 MB. Reduza o arquivo.");
      }
      const pronto =
        file.type.startsWith("image/") ? await comprimirSeImagem(file) : file;
      if (pronto.size > 5 * 1024 * 1024) {
        throw new Error("Arquivo grande demais após compressão");
      }
      const isPdf =
        pronto.type === "application/pdf" ||
        pronto.name.toLowerCase().endsWith(".pdf");
      const ext = isPdf ? "pdf" : "jpg";
      const path = `public/${token}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("comprovantes")
        .upload(path, pronto, {
          upsert: false,
          contentType: isPdf ? "application/pdf" : "image/jpeg",
        });
      if (upErr) throw upErr;

      const { data, error } = await supabase.rpc("enviar_comprovante_cliente", {
        p_token: token,
        p_valor: v,
        p_arquivo_path: path,
        p_observacao: obs.trim() || null,
      });
      if (error) throw error;
      const res = data as { ok?: boolean; erro?: string };
      if (!res?.ok) throw new Error(res?.erro || "Falha ao enviar");

      toast.success(
        "Comprovante enviado. Aguarde a confirmação do estabelecimento."
      );
      setValor("");
      setObs("");
      limparArquivo();
      await carregar();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao enviar");
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0614] text-violet-300">
        Carregando…
      </div>
    );
  }

  if (!painel?.ok) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#0b0614] px-6 text-center">
        <p className="text-lg font-semibold text-white">
          {painel?.erro?.includes("indisponível") ? "Estabelecimento indisponível" : "Link inválido"}
        </p>
        <p className="text-sm text-violet-300/80">
          {painel?.erro || "Este link não existe ou expirou."}
        </p>
      </div>
    );
  }

  const saldo = Number(painel.saldo ?? 0);
  const movs = painel.movimentacoes ?? [];
  const movsVisiveis = verMais ? movs : movs.slice(0, 5);
  const pend = painel.comprovantes_pendentes ?? [];
  const loja = painel.loja?.trim() || "Estabelecimento";
  const podeEnviar = Boolean(file && mascaraParaNumero(valor) > 0);

  return (
    <div className="mx-auto min-h-screen max-w-lg bg-[#0b0614] px-4 py-8 text-violet-50">
      <p className="text-center text-[10px] font-semibold tracking-[0.25em] text-violet-400/90">
        FISCAL CONNECT
      </p>

      <h1 className="mt-3 text-center text-3xl font-bold leading-tight tracking-tight text-white">
        <span className="bg-gradient-to-r from-violet-200 via-fuchsia-200 to-fuchsia-400 bg-clip-text text-transparent">
          {loja}
        </span>
      </h1>
      <div className="mx-auto mt-2 h-0.5 w-24 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500" />

      <p className="mt-4 text-center text-lg text-violet-200">
        Olá, {painel.cliente?.nome}
      </p>
      <p className="mt-1 text-center text-sm text-violet-300/60">
        Sua conta neste estabelecimento
      </p>


      <section className="mt-6 rounded-2xl border border-fuchsia-500/30 bg-gradient-to-br from-violet-900/40 to-fuchsia-950/25 p-5 text-center shadow-lg shadow-fuchsia-950/20">
        <p className="text-xs text-violet-300/80">
          {saldo > 0.009 ? "Saldo em aberto" : "Situação da conta"}
        </p>
        {saldo > 0.009 ? (
          <p className="mt-1 text-3xl font-bold text-amber-300">{brl(saldo)}</p>
        ) : (
          <p className="mt-1 text-3xl font-bold text-emerald-300">Em dia</p>
        )}
      </section>

      {painel.pix && (
        <section className="mt-4 rounded-2xl border border-violet-500/30 bg-violet-950/40 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-violet-300/80">
            Pix para pagamento
          </p>
          <p className="mt-2 break-all text-lg font-semibold text-white">{painel.pix}</p>
          <button
            type="button"
            className="mt-3 w-full rounded-xl bg-fuchsia-600 py-2.5 text-sm font-semibold text-white"
            onClick={() => {
              navigator.clipboard?.writeText(painel.pix || "").then(
                () => toast.success("Chave Pix copiada"),
                () => toast.message(painel.pix || "")
              );
            }}
          >
            Copiar chave Pix
          </button>
          <p className="mt-2 text-xs text-violet-300/70">
            Pague neste Pix, depois envie o comprovante abaixo.
          </p>
        </section>
      )}

      {pend.length > 0 && (
        <section className="mt-4 rounded-2xl border border-amber-500/25 bg-amber-950/20 p-4">
          <p className="text-sm font-medium text-amber-200">
            Comprovante(s) aguardando confirmação
          </p>
          <ul className="mt-2 space-y-1 text-sm text-violet-200/80">
            {pend.map((c) => (
              <li key={c.id}>
                {brl(c.valor)} · {dataBR(c.created_at)}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-6 rounded-2xl border border-violet-500/25 bg-violet-950/40 p-4">
        <h2 className="font-semibold text-white">Enviar comprovante de pagamento</h2>
        <p className="mt-1 text-xs text-violet-300/70">
          1. Pague no Pix · 2. Salve o comprovante · 3. Veja a prévia · 4. Confirme o
          envio
        </p>
        {guiaUrl && (
          <p className="mt-2 text-sm">
            <a
              href={guiaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-fuchsia-300 underline"
            >
              Veja como funciona
            </a>
          </p>
        )}
        <form onSubmit={enviar} className="mt-4 space-y-3">
          <label className="block text-sm text-violet-200">
            Valor pago (R$)
            <MoneyInput
              value={valor}
              onChange={setValor}
              required
              placeholder="0,00"
            />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="cursor-pointer rounded-xl border border-violet-500/40 py-3 text-center text-sm">
              Tirar foto
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </label>
            <label className="cursor-pointer rounded-xl border border-violet-500/40 py-3 text-center text-sm">
              Galeria / PDF
              <input
                type="file"
                accept="image/*,application/pdf,.pdf"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          {(preview || pdfNome) && (
            <div className="space-y-2 rounded-xl border border-fuchsia-500/30 bg-black/30 p-3">
              <p className="text-xs font-medium text-fuchsia-200">
                Pré-visualização — confira se é o comprovante certo
              </p>
              {preview && !pdfNome && (
                <button type="button" className="block w-full" onClick={() => setVerArquivo(true)}>
                  <img
                    src={preview}
                    alt="Prévia do comprovante"
                    className="max-h-56 w-full rounded-lg object-contain bg-black/50"
                  />
                </button>
              )}
              {pdfNome && (
                <div className="rounded-lg bg-violet-900/40 px-3 py-3 text-center text-sm">
                  PDF: <strong>{pdfNome}</strong>
                </div>
              )}
              <button
                type="button"
                className="w-full rounded-xl border border-violet-400/40 py-2 text-sm"
                onClick={() => setVerArquivo(true)}
              >
                Ver comprovante
              </button>
              <button
                type="button"
                className="w-full text-sm text-rose-300"
                onClick={limparArquivo}
              >
                Trocar arquivo
              </button>
            </div>
          )}

          <label className="block text-sm text-violet-200">
            Observação (opcional)
            <input className="input" value={obs} onChange={(e) => setObs(e.target.value)} />
          </label>
          <button
            type="submit"
            className="btn-primary"
            disabled={sending || !podeEnviar}
          >
            {sending ? "Enviando…" : "Confirmar envio"}
          </button>
          {!file && (
            <p className="text-center text-xs text-violet-400">
              Anexe a foto ou o PDF para habilitar o envio
            </p>
          )}
        </form>
      </section>

      <section className="mt-6">
        <h2 className="mb-1 font-semibold">Histórico da conta</h2>
        <p className="mb-3 text-xs text-violet-300/60">
          Amarelo = comprou fiado · Verde = pagou · Lilás = à vista
        </p>
        <ul className="space-y-2">
          {movs.length === 0 && (
            <li className="text-sm text-violet-300/60">Nenhuma movimentação.</li>
          )}
          {movsVisiveis.map((m, i) => {
            const ehFiado = m.tipo === "fiado";
            const ehPag = m.tipo === "pagamento";
            const sinal = ehFiado ? "+" : ehPag ? "−" : "";
            const cor = ehFiado
              ? "text-amber-300"
              : ehPag
                ? "text-emerald-300"
                : "text-violet-100";
            const borda = ehFiado
              ? "border-amber-500/25"
              : ehPag
                ? "border-emerald-500/25"
                : "border-violet-500/20";
            return (
              <li
                key={`${m.created_at}-${i}`}
                className={`rounded-xl border ${borda} bg-black/30 px-3 py-2.5 text-sm`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-white">
                      {tipoLabel[m.tipo] ?? m.tipo}
                    </p>
                    <p className="text-xs text-violet-300/60">
                      {dataBR(m.created_at)}
                    </p>
                  </div>
                  <p className={`shrink-0 text-base font-semibold ${cor}`}>
                    {sinal}
                    {brl(m.valor)}
                  </p>
                </div>
                {m.observacao && (
                  <p className="mt-1.5 border-t border-white/5 pt-1.5 text-xs leading-snug text-violet-300/70">
                    {m.observacao}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
        {movs.length > 5 && (
          <button
            type="button"
            className="mt-3 w-full text-sm font-medium text-fuchsia-300"
            onClick={() => setVerMais((v) => !v)}
          >
            {verMais ? "Ver menos" : "Veja mais"}
          </button>
        )}
      </section>

      {verArquivo && preview && (
        <ModalComprovante
          url={preview}
          titulo={pdfNome ? `PDF · ${pdfNome}` : "Prévia do comprovante"}
          forcarPdf={Boolean(pdfNome)}
          onClose={() => setVerArquivo(false)}
        />
      )}
    </div>
  );
}
