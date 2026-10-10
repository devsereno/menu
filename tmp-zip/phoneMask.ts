/** Máscara BR: (27) 98888-6756. Tira o 55 se colar +55 27 99517-1018. */
export function soDigitosTel(v: string): string {
  let d = v.replace(/\D/g, "");
  if (d.startsWith("55") && d.length >= 12) d = d.slice(2);
  return d.slice(0, 11);
}

export function mascaraTelBR(v: string): string {
  const d = soDigitosTel(v);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) {
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  }
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7, 11)}`;
}

export function formatarTelExibir(v: string | null | undefined): string {
  if (!v) return "—";
  const d = soDigitosTel(v);
  if (d.length < 10) return v;
  return mascaraTelBR(d);
}
