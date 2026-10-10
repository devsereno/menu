import { useState } from 'react'
import type { Bill } from '../catalog'
import { fromBRL, maskBRL, toMask } from '../money'
import { useStore } from '../store'

export default function EditarConta({
  bill, onClose,
}: { bill: Bill; onClose: () => void }) {
  const { editBill, deleteBill } = useStore()
  const [title, setTitle] = useState(bill.title)
  const [amount, setAmount] = useState(toMask(bill.amount))
  const [paid, setPaid] = useState(bill.paid)

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Editar conta</h2>
        <div className="field"><label>Nome</label><input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
        <div className="field"><label>Valor</label><input value={amount} onChange={(e) => setAmount(maskBRL(e.target.value))} inputMode="numeric" /></div>
        <div className="toggle">
          <div>
            <div className="name">Paga</div>
            <div className="val">Marca baixa nesta conta</div>
          </div>
          <button className={`sw ${paid ? 'on' : ''}`} type="button" onClick={() => setPaid((p) => !p)}><i /></button>
        </div>
        <button className="btn" onClick={() => {
          editBill(bill.id, { title, amount: fromBRL(amount), paid })
          onClose()
        }}>Salvar</button>
        <button className="btn ghost" onClick={onClose}>Cancelar</button>
        <button className="btn ghost" style={{ color: 'var(--red)' }} onClick={() => { deleteBill(bill.id); onClose() }}>Excluir</button>
      </div>
    </div>
  )
}
