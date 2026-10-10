import { useMemo, useState } from "react";
import {
  formatarValidade,
  gerarSenhaTemporaria,
  montarMensagemWhatsApp,
  urlWhatsApp,
  validadeEmIso,
} from "./gerarSenha";

const HORAS = 24;

export default function SenhaVendedorCard({ vendedor, onResetar }) {
  const [aberto, setAberto] = useState(false);
  const [passo, setPasso] = useState("confirmar");
  const [senha, setSenha] = useState("");
  const [expiraEm, setExpiraEm] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [copiado, setCopiado] = useState("");

  const whatsapp = vendedor?.whatsapp || vendedor?.telefone || "";
  const email = vendedor?.email || "";
  const nome = vendedor?.nome || vendedor?.loja || "Loja";

  const precisaTrocar = Boolean(vendedor?.must_change_password);
  const tempExpira = vendedor?.temp_password_expires_at;

  const mensagem = useMemo(
    () =>
      senha
        ? montarMensagemWhatsApp({
            nomeLoja: nome,
            email,
            senha,
            horas: HORAS,
          })
        : "",
    [senha, nome, email]
  );

  function abrir() {
    setErro("");
    setSenha("");
    setExpiraEm("");
    setPasso("confirmar");
    setAberto(true);
  }

  function fechar() {
    if (salvando) return;
    setAberto(false);
  }

  async function confirmarReset() {
    setSalvando(true);
    setErro("");
    try {
      const nova = gerarSenhaTemporaria(8);
      const expira = validadeEmIso(HORAS);
      if (typeof onResetar === "function") {
        await onResetar({
          senhaTemporaria: nova,
          expiresAt: expira,
          mustChangePassword: true,
        });
      }
      setSenha(nova);
      setExpiraEm(expira);
      setPasso("pronta");
    } catch (e) {
      setErro(e?.message || "Não foi possível resetar a senha.");
    } finally {
      setSalvando(false);
    }
  }

  async function copiar(texto, chave) {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(chave);
      setTimeout(() => setCopiado(""), 1800);
    } catch {
      setErro("Não deu para copiar. Selecione o texto na tela.");
    }
  }

  function abrirWhatsApp() {
    if (!whatsapp) {
      setErro("Este vendedor não tem WhatsApp cadastrado.");
      return;
    }
    window.open(urlWhatsApp(whatsapp, mensagem), "_blank", "noopener,noreferrer");
  }

  return (
    <section className="card-adm">
      <h3>Senha do vendedor</h3>
      <p className="hint">
        Gera senha temporária de 8 caracteres (letras e números), válida por 24h.
        No primeiro login o vendedor é obrigado a criar uma senha nova.
      </p>

      <div className="status-linha">
        <span>
          Precisa trocar senha:{" "}
          <strong>{precisaTrocar ? "sim" : "não"}</strong>
        </span>
        {tempExpira ? (
          <span>Última temporária vale até {formatarValidade(tempExpira)}</span>
        ) : null}
      </div>

      <button type="button" className="btn-rosa" onClick={abrir}>
        Resetar senha
      </button>

      {aberto ? (
        <div className="modal-fundo" onClick={fechar} role="presentation">
          <div
            className="modal-caixa"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {passo === "confirmar" ? (
              <>
                <h3>Confirmar reset de senha</h3>
                <p>
                  A senha atual de <strong>{nome}</strong> ({email}) deixa de
                  valer agora.
                </p>
                <p>
                  WhatsApp que vai receber:{" "}
                  <strong>{whatsapp || "não cadastrado"}</strong>
                </p>
                <p>A nova senha vale por 24 horas e só aparece uma vez nesta tela.</p>
                {erro ? <p className="erro">{erro}</p> : null}
                <div className="acoes">
                  <button type="button" className="btn-ghost" onClick={fechar} disabled={salvando}>
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="btn-rosa"
                    onClick={confirmarReset}
                    disabled={salvando}
                  >
                    {salvando ? "Gerando…" : "Confirmar e gerar"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3>Senha gerada</h3>
                <p className="senha-box">{senha}</p>
                <p className="hint">Válida até {formatarValidade(expiraEm)}</p>
                <pre className="msg-box">{mensagem}</pre>
                {erro ? <p className="erro">{erro}</p> : null}
                <div className="acoes wrap">
                  <button type="button" className="btn-verde" onClick={abrirWhatsApp}>
                    Abrir WhatsApp
                  </button>
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => copiar(senha, "senha")}
                  >
                    {copiado === "senha" ? "Senha copiada" : "Copiar senha"}
                  </button>
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => copiar(mensagem, "msg")}
                  >
                    {copiado === "msg" ? "Mensagem copiada" : "Copiar mensagem"}
                  </button>
                  <button type="button" className="btn-ghost" onClick={fechar}>
                    Fechar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}
