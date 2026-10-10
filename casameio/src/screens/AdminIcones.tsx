import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BrandIco from '../BrandIco'
import { findEntry, iconFromSite, loadMap, setIcon as saveIcon, slugName, type IconEntry } from '../iconMap'
import { useStore } from '../store'

export default function AdminIcones() {
  const nav = useNavigate()
  const { bills } = useStore()
  const [, tick] = useState(0)
  const names = useMemo(() => {
    const set = new Map<string, string>()
    bills.forEach((b) => set.set(slugName(b.title), b.title))
    loadMap().forEach((e) => set.set(e.slug, e.title))
    return [...set.entries()].map(([slug, title]) => {
      const e = findEntry(title)
      return { slug, title, pending: !e || e.pending || !(e.site || e.icon), entry: e }
    }).sort((a, b) => Number(b.pending) - Number(a.pending) || a.title.localeCompare(b.title))
  }, [bills, tick])

  const pending = names.filter((n) => n.pending).length

  return (
    <div className="screen">
      <button className="btn ghost" onClick={() => nav(-1)}>← Voltar</button>
      <h1>Ícones</h1>
      <p className="sub">Só o responsável. Nomes das contas, sem valor.</p>
      {pending > 0 && (
        <p className="note" style={{ color: 'var(--gold)' }}>{pending} ícone(s) não encontrado(s)</p>
      )}
      <div className="list">
        {names.map((n) => (
          <Row key={n.slug} title={n.title} slug={n.slug} pending={n.pending} entry={n.entry} onSave={() => tick((x) => x + 1)} />
        ))}
      </div>
    </div>
  )
}

function Row({
  title, slug, pending, entry, onSave,
}: {
  title: string
  slug: string
  pending: boolean
  entry?: IconEntry
  onSave: () => void
}) {
  const [site, setSite] = useState(entry?.site || '')
  const [icon, setIcon] = useState(entry?.icon || '')
  return (
    <div className="card" style={{ marginBottom: 8 }}>
      <div className="left" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <span className="ico"><BrandIco title={title} /></span>
        <div>
          <div className="name">{title}</div>
          <div className="val">{pending ? 'ícone não encontrado' : 'ícone ok'}</div>
        </div>
      </div>
      <div className="field">
        <label>Site</label>
        <input value={site} onChange={(e) => setSite(e.target.value)} placeholder="https://gigainternet.com.br" />
      </div>
      <div className="field">
        <label>Ou endereço do ícone</label>
        <input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="https://…/logo.png" />
      </div>
      <button
        className="btn"
        onClick={() => {
          const finalIcon = icon || (site ? iconFromSite(site) : '')
          saveIcon(slug, site, finalIcon)
          onSave()
        }}
      >
        Salvar ícone
      </button>
    </div>
  )
}
