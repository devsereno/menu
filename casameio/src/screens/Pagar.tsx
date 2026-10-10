import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { Role } from '../catalog'
import BrandIco from '../BrandIco'
import { fromBRL, maskBRL, toMask } from '../money'
import { brl, useStore } from '../store'

export default function Pagar({ role }: { role: Role }) {
  const { id } = useParams()
  const nav = useNavigate()
  const { bills, editBill } = useStore()
  const b = bills.find((x) => x.id === id)
  const [valor, setValor] = useState(() => (b ? toMask(b.amount) : '0,00'))
  if (!b) return <div className="screen"><p>Conta não encontrada.</p></div>
  const pago = fromBRL(valor)

  const confirmar = () => {
    if (pago <= 0) return
    editBill(b.id, { amount: pago, paid: true, paidBy: role })
    nav(-1)
  }

  return (
    <div className="screen">
      <button className="btn ghost" onClick={() => nav(-1)}>← Voltar</button>
      <h1>Registrar pagamento</h1>
      <p className="sub">
        <span className="ico" style={{ display: 'inline-flex', verticalAlign: 'middle', marginRight: 8 }}><BrandIco title={b.title} /></span>
        {b.title}{b.parcela ? ` · ${b.parcela.n}/${b.parcela.total}` : ''}
      </p>
      <div className="field">
        <label>Valor pago</label>
        <input
          value={valor}
          onChange={(e) => setValor(maskBRL(e.target.value))}
          inputMode="numeric"
        />
      </div>
      {pago !== b.amount && (
        <p className="note">Lançado era {brl(b.amount)}. Entra o que você pagou de verdade (juros, atraso, desconto).</p>
      )}
      {b.kind === 'casa' && (
        <p className="note">Quem paga a conta inteira credita a metade na cota dele.</p>
      )}
      {pago <= 0 && <p className="note" style={{ color: 'var(--red)' }}>Põe o valor que saiu de verdade. Não confirma R$ 0,00.</p>}
      <button className="btn" onClick={confirmar} disabled={pago <= 0}>
        {b.paid ? 'Salvar valor' : `Confirmar ${brl(pago)}`}
      </button>
    </div>
  )
}
