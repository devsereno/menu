import { useEffect, useRef, useState } from "react";

type Props = {
  url: string;
  titulo?: string;
  forcarPdf?: boolean;
  onClose: () => void;
};

declare global {
  interface Window {
    pdfjsLib?: {
      GlobalWorkerOptions: { workerSrc: string };
      getDocument: (src: { data: ArrayBuffer } | string) => {
        promise: Promise<{
          numPages: number;
          getPage: (n: number) => Promise<{
            getViewport: (o: { scale: number }) => { width: number; height: number };
            render: (o: {
              canvasContext: CanvasRenderingContext2D;
              viewport: { width: number; height: number };
            }) => { promise: Promise<void> };
          }>;
        }>;
      };
    };
  }
}

function isPdfUrl(url: string) {
  const u = url.toLowerCase();
  return u.includes(".pdf") || u.includes("application/pdf");
}

async function loadPdfJs(): Promise<NonNullable<typeof window.pdfjsLib>> {
  if (window.pdfjsLib) return window.pdfjsLib;
  await new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Falha ao carregar visualizador de PDF"));
    document.head.appendChild(s);
  });
  const lib = window.pdfjsLib;
  if (!lib) throw new Error("PDF.js indisponível");
  lib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  return lib;
}

export default function ModalComprovante({ url, titulo, forcarPdf, onClose }: Props) {
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [pageImg, setPageImg] = useState<string | null>(null);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [erroPdf, setErroPdf] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const pdfData = useRef<ArrayBuffer | null>(null);
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const pinch = useRef<{ dist: number; scale: number } | null>(null);

  const pdf = Boolean(forcarPdf) || isPdfUrl(url);

  useEffect(() => {
    setScale(1);
    setPos({ x: 0, y: 0 });
    setPage(1);
    setPageImg(null);
    setErroPdf(null);
    pdfData.current = null;
  }, [url]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    if (!pdf) {
      setPageImg(url);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoadingPdf(true);
      setErroPdf(null);
      try {
        const lib = await loadPdfJs();
        if (!pdfData.current) {
          const res = await fetch(url);
          if (!res.ok) throw new Error("Não foi possível baixar o PDF");
          pdfData.current = await res.arrayBuffer();
        }
        const doc = await lib.getDocument({ data: pdfData.current.slice(0) }).promise;
        if (cancelled) return;
        setNumPages(doc.numPages);
        const p = await doc.getPage(page);
        const viewport = p.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas indisponível");
        await p.render({ canvasContext: ctx, viewport }).promise;
        if (cancelled) return;
        setPageImg(canvas.toDataURL("image/jpeg", 0.92));
      } catch (e: unknown) {
        if (!cancelled) {
          setErroPdf(e instanceof Error ? e.message : "Erro ao abrir PDF");
        }
      } finally {
        if (!cancelled) setLoadingPdf(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [url, pdf, page]);

  function zoomIn() {
    setScale((s) => Math.min(4, Math.round((s + 0.35) * 100) / 100));
  }
  function zoomOut() {
    setScale((s) => {
      const n = Math.max(1, Math.round((s - 0.35) * 100) / 100);
      if (n <= 1) setPos({ x: 0, y: 0 });
      return n;
    });
  }
  function reset() {
    setScale(1);
    setPos({ x: 0, y: 0 });
  }

  function onPointerDown(e: React.PointerEvent) {
    if (scale <= 1) return;
    dragging.current = true;
    last.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current || scale <= 1) return;
    setPos({
      x: e.clientX - last.current.x,
      y: e.clientY - last.current.y,
    });
  }
  function onPointerUp() {
    dragging.current = false;
  }

  function touchDist(t: React.TouchList) {
    if (t.length < 2) return 0;
    const a = t[0];
    const b = t[1];
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
  }

  function onTouchStart(e: React.TouchEvent) {
    if (e.touches.length === 2) {
      pinch.current = { dist: touchDist(e.touches), scale };
      dragging.current = false;
    }
  }
  function onTouchMove(e: React.TouchEvent) {
    if (e.touches.length === 2 && pinch.current) {
      e.preventDefault();
      const d = touchDist(e.touches);
      if (pinch.current.dist > 0) {
        const next = Math.min(
          4,
          Math.max(1, pinch.current.scale * (d / pinch.current.dist))
        );
        setScale(next);
        if (next <= 1) setPos({ x: 0, y: 0 });
      }
    }
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (e.touches.length < 2) pinch.current = null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/95"
      role="dialog"
      aria-modal="true"
    >
      <header className="flex shrink-0 items-center justify-between gap-2 border-b border-white/10 px-3 py-3">
        <p className="min-w-0 truncate text-sm text-violet-100">
          {titulo || "Comprovante"}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-full border border-white/20 px-3 py-1.5 text-sm text-white"
        >
          Fechar
        </button>
      </header>

      <div
        className="relative min-h-0 flex-1 touch-none overflow-hidden"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {loadingPdf && (
          <div className="flex h-full items-center justify-center text-sm text-violet-300">
            Carregando PDF…
          </div>
        )}
        {erroPdf && (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
            <p className="text-sm text-rose-300">{erroPdf}</p>
            <p className="text-xs text-violet-400">
              Tente de novo ou peça ao cliente uma foto do comprovante.
            </p>
          </div>
        )}
        {!loadingPdf && !erroPdf && pageImg && (
          <div className="flex h-full w-full items-center justify-center">
            <img
              src={pageImg}
              alt="Comprovante"
              draggable={false}
              className="max-h-full max-w-full select-none object-contain"
              style={{
                transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
                transition: dragging.current ? "none" : "transform 0.1s ease-out",
              }}
            />
          </div>
        )}
      </div>

      <footer className="flex shrink-0 flex-col gap-2 border-t border-white/10 px-3 py-3">
        {pdf && numPages > 1 && (
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              disabled={page <= 1}
              className="rounded-full border border-white/20 px-3 py-1 text-sm text-white disabled:opacity-40"
              onClick={() => {
                setPage((p) => Math.max(1, p - 1));
                reset();
              }}
            >
              ← Página
            </button>
            <span className="text-xs text-violet-300">
              {page} / {numPages}
            </span>
            <button
              type="button"
              disabled={page >= numPages}
              className="rounded-full border border-white/20 px-3 py-1 text-sm text-white disabled:opacity-40"
              onClick={() => {
                setPage((p) => Math.min(numPages, p + 1));
                reset();
              }}
            >
              Página →
            </button>
          </div>
        )}
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={zoomOut}
            className="h-11 w-11 rounded-full bg-violet-800 text-xl font-bold text-white"
            aria-label="Diminuir"
          >
            −
          </button>
          <button
            type="button"
            onClick={reset}
            className="rounded-full bg-violet-900/80 px-4 py-2 text-xs text-violet-100"
          >
            {Math.round(scale * 100)}%
          </button>
          <button
            type="button"
            onClick={zoomIn}
            className="h-11 w-11 rounded-full bg-fuchsia-600 text-xl font-bold text-white"
            aria-label="Ampliar"
          >
            +
          </button>
        </div>
        <p className="text-center text-[11px] text-violet-300/60">
          Zoom e arraste dentro do app · sem abrir fora
        </p>
      </footer>
    </div>
  );
}
