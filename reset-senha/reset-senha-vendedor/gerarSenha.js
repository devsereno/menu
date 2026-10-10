const ALFABETO = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";

export function gerarSenhaTemporaria(tamanho = 8) {
  const bytes = new Uint8Array(tamanho);
  crypto.getRandomValues(bytes);
  let senha = "";
  for (let i = 0; i < tamanho; i++) {
    senha += ALFABETO[bytes[i] % ALFABETO.length];
  }
  if (!/[A-Za-z]/.test(senha) || !/[0-9]/.test(senha)) {
    return gerarSenhaTemporaria(tamanho);
  }
  return senha;
}

export function validadeEmIso(horas = 24) {
  return new Date(Date.now() + horas * 60 * 60 * 1000).toISOString();
}

export function formatarValidade(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function normalizarWhatsApp(numero) {
  const digits = String(numero || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("55")) return digits;
  return `55${digits}`;
}

export function montarMensagemWhatsApp({ nomeLoja, email, senha, horas = 24 }) {
  return [
    "*Fiscal Connect — senha temporária*",
    "",
    `Loja: ${nomeLoja || "—"}`,
    `E-mail: ${email || "—"}`,
    "",
    `Sua senha temporária: *${senha}*`,
    "",
    `Válida por ${horas} horas.`,
    "No primeiro acesso o sistema vai pedir uma senha nova.",
    "",
    "Não encaminhe esta mensagem.",
  ].join("\n");
}

export function urlWhatsApp(numero, texto) {
  const n = normalizarWhatsApp(numero);
  return `https://wa.me/${n}?text=${encodeURIComponent(texto)}`;
}
