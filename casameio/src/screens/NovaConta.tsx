import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { BANCOS, CATEGORIES, type Kind, type Recurrence, type Role } from '../catalog'
import { upsertPending } from '../iconMap'
import { fromBRL, maskBRL } from '../money'
import { useStore } from '../store'

export default function NovaConta({ role }: { role: Role }) {
  const nav = useNavigate()
  const [sp] = useSearchParams()
  const { openMonth, addBill, addSeries } = useStore()
  const [kind, setKind] = useState<Kind>((sp.get('kind') as Kind) || 'casa')
  const [cat, setCat] = useState(CATEGORIES[0].id)
  const [item, setItem] = useState('')
  const [outro, setOutro] = useState('')
  const [amount, setAmount] = useState('0,00')
  const [rec, setRec] = useState<Recurrence>('mes')
  const [banco, setBanco] = useState('Nubank')
  const [motivo, setMotivo] = useState('')
  const [total, setTotal] = useState('15')
  const [start, setStart] = useState('1')

  const category = CATEGORIES.find((c) => c.id === cat)!
  const items = useMemo(() => category.items, [category])
  const isEmp = cat === 'emp'

  const save = () => {
    const val = fromBRL(amount)
    if (isEmp) {
      addSeries({
        kind,
        banco,
        motivo,
        amount: val,
        total: Number(total) || 1,
        start: Number(start) || 1,
        owner: kind === 'pessoal' ? role : undefined,
        startMonth: openMonth,
      })
      nav(-1)
      return
    }
    const title = item === 'Outra…' || !item ? (outro || 'Outra') : item
    upsertPending(title)
    addBill({
      month: openMonth,
      kind,
      title,
      amount: val,
      paid: false,
      recurrence: rec,
      owner: kind === 'pessoal' ? role : undefined,
    })
    nav(-1)
  }

  return (
    <div className="screen">
      <button className="btn ghost" onClick={() => nav(-1)}>← Voltar</button>
      <h1>Nova conta</h1>
      <div className="field">
        <label>Onde entra</label>
        <div className="seg">
          <button className={kind === 'casa' ? 'on' : ''} type="button" onClick={() => setKind('casa')}>Casa</button>
          <button className={kind === 'pessoal' ? 'on' : ''} type="button" onClick={() => setKind('pessoal')}>Pessoal</button>
        </div>
      </div>
      <div className="field">
        <label>Categoria</label>
        <div className="chips">
          {CATEGORIES.map((c) => (
            <button key={c.id} className={cat === c.id ? 'on' : ''} type="button" onClick={() => { setCat(c.id); setItem('') }}>
              {c.label}
            </button>
          ))}
        </div>
      </div>
      {isEmp ? (
        <>
          <div className="field">
            <label>Banco</label>
            <div className="chips">
              {BANCOS.map((b) => (
                <button key={b} className={banco === b ? 'on' : ''} type="button" onClick={() => setBanco(b)}>{b}</button>
              ))}
            </div>
          </div>
          <div className="field"><label>Motivo (opcional)</label><input value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="geladeira, retiro…" /></div>
          <div className="field"><label>Parcela atual</label><input value={start} onChange={(e) => setStart(e.target.value)} /></div>
          <div className="field"><label>Total de vezes</label><input value={total} onChange={(e) => setTotal(e.target.value)} /></div>
        </>
      ) : (
        <div className="field">
          <label>Qual conta</label>
          <div className="chips">
            {items.map((it) => (
              <button key={it} className={item === it ? 'on' : ''} type="button" onClick={() => setItem(it)}>{it}</button>
            ))}
            {!items.includes('Outra…') && (
              <button className={item === 'Outra…' ? 'on' : ''} type="button" onClick={() => setItem('Outra…')}>Outra…</button>
            )}
          </div>
        </div>
      )}
      {(item === 'Outra…' || (!isEmp && !item && items.length === 0)) && (
        <div className="field"><label>Nome</label><input value={outro} onChange={(e) => setOutro(e.target.value)} /></div>
      )}
      <div className="field"><label>Valor</label><input value={amount} onChange={(e) => setAmount(maskBRL(e.target.value))} inputMode="numeric" /></div>
      {!isEmp && (
        <div className="field">
          <label>Repetir</label>
          <div className="seg">
            <button className={rec === 'unico' ? 'on' : ''} type="button" onClick={() => setRec('unico')}>Só este mês</button>
            <button className={rec === 'mes' ? 'on' : ''} type="button" onClick={() => setRec('mes')}>Todo mês</button>
            <button className={rec === 'parcela' ? 'on' : ''} type="button" onClick={() => { setRec('parcela'); setCat('emp') }}>Parcelado</button>
          </div>
        </div>
      )}
      <p className="note">
        {isEmp
          ? 'Cria todas as parcelas na previsão até a última.'
          : rec === 'mes'
            ? 'Permanente: preenche o ano e passa para o ano seguinte.'
            : rec === 'unico'
              ? 'Não entra em outubro nem na previsão.'
              : ''}
      </p>
      <button className="btn" onClick={save}>Salvar</button>
    </div>
  )
}
