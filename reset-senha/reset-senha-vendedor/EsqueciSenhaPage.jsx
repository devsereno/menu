import { useState } from "react";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [ok, setOk] = useState(false);
  const [erro, setErro] = useState("");

  async function enviar(e) {
    e.preventDefault();
    setErro("");
    setOk(false);
    setEnviando(true);
    try {
      const res = await fetch("/api/auth/esqueci-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          whatsapp: whatsapp.replace(/\D/g, ""),
        }),
      });
      // Sempre a mesma mensagem para não vazar se o cadastro existe.
      if (!res.ok && res.status >= 500) {
        throw new Error("Falha temporária. Tente de novo.");
      }
      setOk(true);
    } catch (err) {
      setErro(err.message || "Não foi possível enviar o pedido.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="login-box">
      <h1>Esqueci a senha</h1>
      <p className="hint">
        Informe o e-mail e o WhatsApp cadastrados. Se os dados baterem, o
        administrador recebe o pedido para resetar a senha.
      </p>

      <form onSubmit={enviar}>
        <label>
          E-mail
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label>
          WhatsApp
          <input
            type="tel"
            required
            placeholder="11999999999"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
          />
        </label>

        {ok ? (
          <p className="ok">
            Se os dados estiverem cadastrados, o administrador foi notificado.
          </p>
        ) : null}
        {erro ? <p className="erro">{erro}</p> : null}

        <button type="submit" className="btn-rosa" disabled={enviando}>
          {enviando ? "Enviando…" : "Pedir reset"}
        </button>
        <a className="voltar" href="/login">
          Voltar ao login
        </a>
      </form>
    </main>
  );
}
