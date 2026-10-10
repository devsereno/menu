# Reset de senha — Central ADM + Fiscal Connect

Pacote para colar no projeto. Visual no estilo do painel escuro (tral-adm).

## Fluxo

1. No login do Fiscal Connect o vendedor clica Esqueci a senha.
2. Informa e-mail + WhatsApp.
3. Se os dois baterem na base, cria pedido para o admin (sem dizer se existe).
4. Admin abre a ficha do vendedor e clica Resetar senha.
5. Confirma → sistema gera senha de 8 caracteres (letras + números, 24h).
6. Mensagem pronta abre no WhatsApp (wa.me) no número cadastrado.
7. Vendedor entra com a temporária e é obrigado a criar senha nova.
8. Pode gerar vários resets no mesmo cliente; o último cancela o anterior.

## Arquivos

- SenhaVendedorCard.jsx — ficha do vendedor no Central ADM
- senha-vendedor.css — estilo do card/modal
- gerarSenha.js — senha, validade, texto e link do WhatsApp
- exemploUso.jsx — como plugar o card
- PedidosResetCard.jsx — lista de pedidos pendentes no admin
- EsqueciSenhaPage.jsx — página do Fiscal Connect
- TrocarSenhaPage.jsx — troca obrigatória no 1º login
- login-link.exemplo.jsx — link no login
- backend/rotas.js — endpoints Express de exemplo
- backend/schema.sql — campos e tabela
- TERMUX.md — como mandar do Termux pro GitHub

## Encaixe rápido no admin

import SenhaVendedorCard from "./reset-senha-vendedor/SenhaVendedorCard";
import "./reset-senha-vendedor/senha-vendedor.css";

<SenhaVendedorCard
  vendedor={{
    id: vendedor.id,
    nome: vendedor.nome || "Loja",
    email: vendedor.email,
    whatsapp: vendedor.whatsapp,
    must_change_password: vendedor.must_change_password,
    temp_password_expires_at: vendedor.temp_password_expires_at,
  }}
  onResetar={async ({ senhaTemporaria, expiresAt, mustChangePassword }) => {
    const res = await fetch(`/api/vendedores/${vendedor.id}/reset-senha`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senhaTemporaria, expiresAt, mustChangePassword }),
    });
    if (!res.ok) throw new Error("Falha ao salvar o reset");
  }}
/>

## Regras da senha temporária

- 8 caracteres, letras + números
- Sem 0 O 1 l I
- Vale 24 horas
- Hash no banco (bcrypt)
- Texto puro só no modal, para ir no WhatsApp

## Login

Se must_change_password for true:
- temporária vencida → recusar e pedir novo reset
- temporária válida → ir para /trocar-senha e não liberar o caixa
