-- Campos no cadastro do vendedor
ALTER TABLE vendedores
  ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS temp_password_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS password_reset_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS password_reset_by TEXT;

-- Fila de pedidos do "esqueci a senha"
CREATE TABLE IF NOT EXISTS pedidos_reset (
  id TEXT PRIMARY KEY,
  vendedor_id TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente', -- pendente | resetado | recusado
  ip TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pedidos_reset_status ON pedidos_reset (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pedidos_reset_vendedor ON pedidos_reset (vendedor_id, created_at DESC);
