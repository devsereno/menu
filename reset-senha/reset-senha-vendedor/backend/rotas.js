/**
 * Rotas de exemplo (Express).
 * Adapte para Next.js / Firebase / Supabase se for o caso.
 *
 * npm i bcryptjs express
 */

import bcrypt from "bcryptjs";

function soDigitos(v) {
  return String(v || "").replace(/\D/g, "");
}

function normalizarWhats(v) {
  const d = soDigitos(v);
  if (!d) return "";
  return d.startsWith("55") ? d : `55${d}`;
}

export function registrarRotasReset(app, { db, exigirAdmin, exigirVendedor }) {
  // Vendedor pede reset. Nunca diga se o cadastro existe.
  app.post("/api/auth/esqueci-senha", async (req, res) => {
    try {
      const email = String(req.body?.email || "").trim().toLowerCase();
      const whatsapp = normalizarWhats(req.body?.whatsapp);
      if (!email || !whatsapp) return res.json({ ok: true });

      const vendedor = await db.vendedores.findByEmail(email);
      const whatsCadastro = normalizarWhats(vendedor?.whatsapp || vendedor?.telefone);

      if (vendedor && whatsCadastro && whatsCadastro === whatsapp) {
        const recentes = await db.pedidos_reset.countSince(vendedor.id, Date.now() - 24 * 3600 * 1000);
        if (recentes < 3) {
          await db.pedidos_reset.create({
            vendedor_id: vendedor.id,
            email,
            whatsapp,
            status: "pendente",
            created_at: new Date().toISOString(),
            ip: req.ip,
          });
        }
      }
      return res.json({ ok: true });
    } catch {
      return res.json({ ok: true });
    }
  });

  // Admin confirma e grava a temporária (hash).
  app.post("/api/vendedores/:id/reset-senha", exigirAdmin, async (req, res) => {
    const { senhaTemporaria, expiresAt } = req.body || {};
    if (!senhaTemporaria || String(senhaTemporaria).length < 8) {
      return res.status(400).json({ message: "Senha temporária inválida" });
    }
    const hash = await bcrypt.hash(senhaTemporaria, 10);
    await db.vendedores.update(req.params.id, {
      password_hash: hash,
      must_change_password: true,
      temp_password_expires_at: expiresAt,
      password_reset_at: new Date().toISOString(),
      password_reset_by: req.admin.id,
    });
    await db.pedidos_reset.marcarResetado(req.params.id);
    return res.json({ ok: true, expiresAt });
  });

  // Primeiro login / troca obrigatória.
  app.post("/api/auth/trocar-senha", exigirVendedor, async (req, res) => {
    const { senhaAtual, senhaNova } = req.body || {};
    const vendedor = req.vendedor;

    if (!senhaNova || senhaNova.length < 8 || !/[A-Za-z]/.test(senhaNova) || !/[0-9]/.test(senhaNova)) {
      return res.status(400).json({ message: "Senha nova inválida" });
    }
    if (senhaNova === senhaAtual) {
      return res.status(400).json({ message: "A senha nova não pode ser igual à temporária" });
    }

    const ok = await bcrypt.compare(senhaAtual || "", vendedor.password_hash || "");
    if (!ok) return res.status(400).json({ message: "Senha temporária incorreta" });

    if (vendedor.temp_password_expires_at && new Date(vendedor.temp_password_expires_at) < new Date()) {
      return res.status(400).json({ message: "Senha temporária vencida. Peça um novo reset." });
    }

    const hash = await bcrypt.hash(senhaNova, 10);
    await db.vendedores.update(vendedor.id, {
      password_hash: hash,
      must_change_password: false,
      temp_password_expires_at: null,
    });
    return res.json({ ok: true });
  });

  app.get("/api/admin/pedidos-reset", exigirAdmin, async (_req, res) => {
    const lista = await db.pedidos_reset.listarPendentes();
    return res.json(lista);
  });
}

/**
 * No login:
 * 1. valida e-mail/senha
 * 2. se must_change_password e temporária vencida → 403 "peça novo reset"
 * 3. se must_change_password → token limitado + redirect /trocar-senha
 */
