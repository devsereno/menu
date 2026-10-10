import { useMemo, useState } from 'react'
import type { Kind, Role } from '../catalog'
import { EXEMPLO_CASA, EXEMPLO_PESSOAL } from '../catalog'
import { useStore } from '../store'

type Tipo = 'todos' | 'aluguel' | 'condominio'

export default function ExemploModal({
  kind, role, onClose,
}: {
  kind: Kind
  role?: Role
  onClose: () => void
}) {
  const { openMonth, applyMolde } = useStore()
  const [tipo, setTipo] = useState<Tipo>('todos')
  const base = kind === 'casa'
    ? EXEMPLO_CASA.filter((i) => tipo === 'todos' || i.grupo === 'todos' || i.grupo === tipo)
    : EXEMPLO_PESSOAL
  const [sel, setSel] = useState<Record<string, boolean>>({})

  const marked = useMemo(() => {
    const on = Object.entries(sel).filter(([, v]) => v).map(([k]) => k)
    return base.filter((i) => on.includes(i.title))
  }, [sel, base])

  const toggle = (title: string) => setSel((s) => ({ ...s, [title]: !s[title] }))
  const allOn = base.every((i) => sel[i.title])
  const all = () => {
    const next: Record<string, boolean> = {}
    base.forEach((i) => { next[i.title] = !allOn })
    setSel(next)
  }

  const apply = () => {
    if (!marked.length) return
    applyMolde({
      kind,
      month: openMonth,
      items: marked.map((i) => ({ title: i.title, amount: i.amount })),
      owner: kind === 'pessoal' ? role : undefined,
      replace: false,
    })
    onClose()
  }

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{kind === 'casa' ? 'Exemplos da casa' : 'Exemplos pessoais'}</h2>
        <p className="note">Marca um por um ou todos. Valor começa zerado pra você preencher.</p>
        {kind === 'casa' && (
          <div className="seg" style={{ marginBottom: 10 }}>
            <button type="button" className={tipo === 'todos' ? 'on' : ''} onClick={() => setTipo('todos')}>Os dois</button>
            <button type="button" className={tipo === 'aluguel' ? 'on' : ''} onClick={() => setTipo('aluguel')}>Casa alugada</button>
            <button type="button" className={tipo === 'condominio' ? 'on' : ''} onClick={() => setTipo('condominio')}>Condomínio</button>
          </div>
        )}
        <button className="btn ghost" type="button" onClick={all}>{allOn ? 'Desmarcar todos' : 'Selecionar todos'}</button>
        <div className="list" style={{ marginTop: 10, maxHeight: 280, overflow: 'auto' }}>
          {base.map((i) => (
            <button
              key={i.title}
              type="button"
              className="item"
              style={{ width: '100%', textAlign: 'left', color: 'inherit' }}
              onClick={() => toggle(i.title)}
            >
              <div className="name">{i.title}</div>
              <span className={`pill ${sel[i.title] ? 'on' : 'off'}`}>{sel[i.title] ? 'Sim' : 'Não'}</span>
            </button>
          ))}
        </div>
        <button className="btn" type="button" onClick={apply} disabled={!marked.length}>
          Adicionar {marked.length || ''}
        </button>
        <button className="btn ghost" type="button" onClick={onClose}>Agora não</button>
      </div>
    </div>
  )
}
