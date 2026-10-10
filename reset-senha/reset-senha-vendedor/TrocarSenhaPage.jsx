import { useState } from "react";

export default function TrocarSenhaPage() {
  const [atual, setAtual] = useState("");
  const [nova, setNova] = useState("");
  const [confirma, setConfirma] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  function validar(senha) {
    if (senha.length < 8) return "A senha nova precisa ter no mínimo 8 caracteres.";
    if (!/[A-Za-z]/.test(senha) || !/[0-9]/.test(senha)) {
      return "Use letras e números.";
    }
    if (senha === atual) return "A senha nova não pode ser igual à temporária.";
    return "";
  }

  async function salvar(e) {
    e.preventDefault();
    setErro("");
    if (nova !== confirma) {
      setErro("A confirmação não confere.");
      return;
    }
    const v = validar(nova);
    if (v) {
      setErro(v);
      return;
    }
    setEnviando(true);
    try {
      const res = await fetch("/api/auth/trocar-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senhaAtual: atual, senhaNova: nova }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Não foi possível salvar.");
      window.location.href = "/";
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="login-box">
      <h1>Criar senha nova</h1>
      <p className="hint">
        Sua senha temporária vale por 24 horas. Defina uma senha definitiva para
        continuar.
      </p>
      <form onSubmit={salvar}>
        <label>
          Senha temporária
          <input
            type="password"
            required
            value={atual}
            onChange={(e) => setAtual(e.target.value)}
          />
        </label>
        <label>
          Senha nova
          <input
            type="password"
            required
            minLength={8}
            value={nova}
            onChange={(e) => setNova(e.target.value)}
          />
        </label>
        <label>
          Confirmar senha nova
          <input
            type="password"
            required
            minLength={8}
            value={confirma}
            onChange={(e) => setConfirma(e.target.value)}
          />
        </label>
        {erro ? <p className="erro">{erro}</p> : null}
        <button type="submit" className="btn-rosa" disabled={enviando}>
          {enviando ? "Salvando…" : "Salvar senha"}
        </button>
      </form>
    </main>
  );
}
