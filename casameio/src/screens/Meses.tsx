import { useNavigate } from 'react-router-dom'
import type { Role } from '../catalog'
import { brl, useStore } from '../store'

const NAMES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

function todayMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export default function Meses({ role }: { role: Role }) {
  const nav = useNavigate()
  const { openMonth, setOpenMonth, yearSum, ofMonth } = useStore()
  const year = Number(openMonth.slice(0, 4))
  const sums = yearSum(year, role)
  const hoje = todayMonth()
  return (
    <div className="screen">
      <h1><span style={{ marginRight: 8 }}>📅</span>Meses</h1>
      <p className="sub">Ano {year} · valores da sua parte</p>
      <div className="year">
        {NAMES.map((n, i) => {
          const m = `${year}-${String(i + 1).padStart(2, '0')}`
          const v = sums[m] || 0
          const open = m === openMonth
          const now = m === hoje
          const extra = ofMonth(m).length > 0 && !open && !now
          return (
            <button
              key={m}
              className={`ycell ${open ? 'open' : ''} ${now && !open ? 'hoje' : ''} ${extra ? 'has' : ''}`}
              onClick={() => { setOpenMonth(m); nav('/') }}
            >
              <b>{n}</b>
              <span>{v ? brl(v) : '—'}</span>
              {open && now && <em>agora</em>}
              {open && !now && <em>aberto</em>}
              {now && !open && <em>hoje</em>}
              {extra && <em>extra</em>}
            </button>
          )
        })}
      </div>
      <p className="note">Verde = mês que você está usando. Dourado = mês de hoje, se for outro. Extra = mês que você abriu além do atual.</p>
    </div>
  )
}
