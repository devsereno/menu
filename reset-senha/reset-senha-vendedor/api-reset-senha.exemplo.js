/**
 * Exemplo de endpoint (Express / Next API).
 * Ajuste para o backend que você já usa.
 *
 * Campos sugeridos no vendedor:
 * - password_hash
 * - must_change_password: boolean
 * - temp_password_expires_at: datetime
 * - password_reset_at: datetime
 */

import bcrypt from "bcryptjs";

export async function resetSenhaVendedor(req, res, { db, adminId }) {
  const { senhaTemporaria, expiresAt, mustChangePassword } = req.body || {};
  const vendedorId = req.params.id;

  if (!senhaTemporaria || senhaTemporaria.length < 8) {
    return res.status(400).json({ message: "Senha temporária inválida" });
  }

  const hash = await bcrypt.hash(senhaTemporaria, 10);

  await db.vendedores.update(vendedorId, {
    password_hash: hash,
    must_change_password: mustChangePassword !== false,
    temp_password_expires_at: expiresAt,
    password_reset_at: new Date().toISOString(),
    password_reset_by: adminId,
  });

  // Não devolva a senha no response.
  return res.json({ ok: true, expiresAt });
}

/**
 * No login do Fiscal Connect:
 * 1) Se must_change_password e agora > temp_password_expires_at → recusar.
 * 2) Se senha ok e must_change_password → redirecionar para /trocar-senha.
 * 3) Ao salvar senha nova: must_change_password=false, temp_password_expires_at=null.
 */
