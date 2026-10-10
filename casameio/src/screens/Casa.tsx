import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Bill } from '../catalog'
import { brl, monthLabel, useStore } from '../store'
import BrandIco from '../BrandIco'
import EditarConta from './EditarConta'
import ExemploModal from './ExemploModal'

export default function Casa() {
  const nav = useNavigate()
  const { openMonth, ofMonth } = useStore()
  const [edit, setEdit] = useState<Bill | null>(null)
  const [modo, setModo] = useState(false)
  const [ex, setEx] = useState(false)
  const list = ofMonth(openMonth, 'casa')
  useEffect(() => { if (list.length === 0) setEx(true) }, [list.length])
  const tot = list.reduce((s, b) => s + b.amount, 0)
  const pago = list.filter((b) => b.paid).reduce((s, b) => s + b.amount, 0)

  const toque = (c: Bill) => {
    if (modo) setEdit(c)
    else if (c.amount <= 0) setEdit(c)
    else nav(`/pagar/${c.id}`)
  }

  return (
    <div className="screen">
      <h1>Conta de casa</h1>
      <div className="month-now">{monthLabel(openMonth)}</div>
      <div className="toggle">
        <div>
          <div className="name">Editar</div>
          <div className="val">{modo ? 'Toque altera ou apaga' : 'Toque paga · valor zero pede o valor primeiro'}</div>
        </div>
        <button className={`sw ${modo ? 'on' : ''}`} type="button" onClick={() => setModo((v) => !v)}><i /></button>
      </div>
      {list.length > 0 && <p className="sub">pago {brl(pago)} de {brl(tot)}</p>}
      <div className="list">
        {list.map((c) => (
          <button
            key={c.id}
            className="item"
            style={{ width: '100%', textAlign: 'left', color: 'inherit' }}
            onClick={() => toque(c)}
          >
            <div className="left">
              <span className="ico"><BrandIco title={c.title} /></span>
              <div>
                <div className="name">{c.title}{c.parcela ? ` ${c.parcela.n}/${c.parcela.total}` : ''}</div>
                <div className="val">{c.amount <= 0 ? 'Ponha o valor' : brl(c.amount)}</div>
              </div>
            </div>
            <span className={`pill ${c.paid ? 'on' : 'off'}`}>{c.paid ? 'Pago' : 'Aberto'}</span>
          </button>
        ))}
      </div>
      <button className="btn" onClick={() => nav('/nova?kind=casa')}>+ Nova conta</button>
      {list.length > 0 && (
        <button className="btn ghost" onClick={() => setEx(true)}>Exemplos</button>
      )}
      {ex && <ExemploModal kind="casa" onClose={() => setEx(false)} />}
      {edit && <EditarConta bill={edit} onClose={() => setEdit(null)} />}
    </div>
  )
}
