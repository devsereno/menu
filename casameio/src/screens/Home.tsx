import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Logo } from '../data'
import { brl, monthLabel, useStore } from '../store'
import type { Role } from '../catalog'
import { loadFamily, savedFamily } from '../sync'

export default function Home({ role }: { role: Role }) {
  const nav = useNavigate()
  const { openMonth, falta, forecast, openNext, participaCasa, ofMonth } = useStore()
  const f = falta(role, openMonth)
  const [y, mo] = openMonth.split('-').map(Number)
  const d = new Date(y, mo, 1)
  const next = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  const prev = forecast(role, next)
  const temConta = ofMonth(openMonth).length > 0
  const [nome, setNome] = useState(savedFamily()?.name || localStorage.getItem('cm-name') || '')

  useEffect(() => {
    loadFamily().then((fam) => {
      if (fam?.name) {
        setNome(fam.name)
        localStorage.setItem('cm-name', fam.name)
      }
    }).catch(() => {})
  }, [])

  return (
    <div className="screen">
      <div className="top">
        <div className="brand"><Logo /> CasaMeio</div>
      </div>
      <p className="sub">Olá, {nome || 'você'}</p>
      <button className="month-bar" type="button" onClick={() => nav('/meses')}>
        <span className="cal">📅</span>
        <span>
          <b>{monthLabel(openMonth)}</b>
          <small>Mês aberto</small>
        </span>
        <span className="go">›</span>
      </button>
      <p className="sub">Falta para você</p>
      <div className={`hero ${f.total > 0 ? 'faltou' : ''}`}>{brl(f.total)}</div>
      <div className="cards">
        {participaCasa[role] && (
          <div className="card" onClick={() => nav('/casa')} style={{ cursor: 'pointer' }}>
            <div className="k">Sua parte da casa</div>
            <div className="v">{brl(f.casa)}</div>
          </div>
        )}
        <div className="card" onClick={() => nav('/pessoal')} style={{ cursor: 'pointer' }}>
          <div className="k">Seu pessoal</div>
          <div className="v">{brl(f.pessoal)}</div>
        </div>
        <div className="card">
          <div className="k">Já lançou como pago</div>
          <div className="v paid">{brl(f.pagou)}</div>
        </div>
        {temConta && prev.total > 0 && (
          <div className="card" style={{ background: 'var(--gold-bg)' }}>
            <div className="k">{monthLabel(next)} · previsão</div>
            <div className="v" style={{ color: 'var(--gold)' }}>{brl(prev.total)}</div>
          </div>
        )}
      </div>
      {temConta && (
        <button className="btn gold" onClick={() => openNext()}>
          Abrir {monthLabel(next).split(' ')[0].toLowerCase()}
        </button>
      )}
      <button className="btn ghost" onClick={() => nav('/meses')}>Meses</button>
    </div>
  )
}
