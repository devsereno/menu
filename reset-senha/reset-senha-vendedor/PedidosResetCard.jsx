export default function PedidosResetCard({ pedidos = [], onAbrirVendedor }) {
  if (!pedidos.length) return null;

  return (
    <section className="card-adm">
      <h3>Pedidos de reset</h3>
      <p className="hint">O vendedor pediu pelo “esqueci a senha”. Abra a ficha e use Resetar senha.</p>
      <ul className="lista-pedidos">
        {pedidos.map((p) => (
          <li key={p.id}>
            <div>
              <strong>{p.nome || p.email}</strong>
              <div className="hint">
                {p.email} · {p.whatsapp} · {new Date(p.created_at).toLocaleString("pt-BR")}
              </div>
            </div>
            <button type="button" className="btn-rosa" onClick={() => onAbrirVendedor(p)}>
              Abrir vendedor
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
