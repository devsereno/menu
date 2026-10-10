import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Bill, Role } from '../catalog'
import { brl, monthLabel, useStore } from '../store'
import BrandIco from '../BrandIco'
import EditarConta from './EditarConta'
import ExemploModal from './ExemploModal'

export default function Pessoal({ role }: { role: Role }) {
  const nav = useNavigate()
  const { openMonth, ofMonth } = useStore()
  const [edit, setEdit] = useState<Bill | null>(null)
  const [modo, setModo] = useState(false)
  const [ex, setEx] = useState(false)
  const list = ofMonth(openMonth, 'pessoal').filter((b) => b.owner === role)
  const outros = ofMonth(openMonth, 'pessoal').filter((b) => b.owner && b.owner !== role)
  const aberto = list.filter((i) => !i.paid).reduce((s, i) => s + i.amount, 0)
  useEffect(() => { if (list.length === 0) setEx(true) }, [list.length])

  const toque = (c: Bill) => {
    if (modo) setEdit(c)
    else if (c.amount <= 0) setEdit(c)
    else nav(`/pagar/${c.id}`)
  }

  return (
    <div className="screen">
      <h1>Meu pessoal</h1>
      <div className="month-now">{monthLabel(openMonth)}</div>
      <div className="toggle">
        <div>
          <div className="name">Editar</div>
          <div className="val">{modo ? 'Toque altera ou apaga' : 'Toque paga'}</div>
        </div>
        <button className={`sw ${modo ? 'on' : ''}`} type="button" onClick={() => setModo((v) => !v)}><i /></button>
      </div>
      {list.length > 0 && <p className="sub">em aberto {brl(aberto)}</p>}
      <div className="list">
        {list.map((i) => (
          <button key={i.id} className="item" style={{ width: '100%', textAlign: 'left', color: 'inherit' }}
            onClick={() => toque(i)}>
            <div className="left">
              <span className="ico"><BrandIco title={i.title} /></span>
              <div>
                <div className="name">{i.title}{i.parcela ? ` ${i.parcela.n}/${i.parcela.total}` : ''}</div>
                <div className="val">{i.amount <= 0 ? 'Ponha o valor' : brl(i.amount)}</div>
              </div>
            </div>
            <span className={`pill ${i.paid ? 'on' : 'off'}`}>{i.paid ? 'Pago' : 'Aberto'}</span>
          </button>
        ))}
      </div>
      {role === 'ricardo' && outros.length > 0 && (
        <>
          <h1 style={{ marginTop: 24, fontSize: 20 }}>Pessoal da família</h1>
          <p className="sub">Só o dono da conta edita.</p>
          <div className="list">
            {outros.map((i) => (
              <div className="item" key={i.id}>
                <div className="left">
                  <span className="ico"><BrandIco title={i.title} /></span>
                  <div>
                    <div className="name">{i.title}</div>
                    <div className="val">{brl(i.amount)}</div>
                  </div>
                </div>
                <span className={`pill ${i.paid ? 'on' : 'off'}`}>{i.paid ? 'Pago' : 'Aberto'}</span>
              </div>
            ))}
          </div>
        </>
      )}
      <button className="btn" onClick={() => nav('/nova?kind=pessoal')}>+ Nova conta</button>
      {list.length > 0 && (
        <button className="btn ghost" onClick={() => setEx(true)}>Exemplos</button>
      )}
      {ex && <ExemploModal kind="pessoal" role={role} onClose={() => setEx(false)} />}
      {edit && <EditarConta bill={edit} onClose={() => setEdit(null)} />}
    </div>
  )
}
