import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { FLOATING, type Bill, type Kind, type Recurrence, type Role } from './catalog'
import { pullBills, pushBill, removeBill, savedFamily, setPaid, supabaseReady } from './sync'

export type { Bill }

const KEY = 'cm-bills-v1'
const MONTH_KEY = 'cm-open-month'
const PART_KEY = 'cm-participa'

const seedSept: Bill[] = [
  { id: 's1', month: '2026-09', kind: 'casa', title: 'Água', amount: 47.6, paid: false, recurrence: 'mes' },
  { id: 's2', month: '2026-09', kind: 'casa', title: 'Luz', amount: 438.01, paid: false, recurrence: 'mes' },
  { id: 's3', month: '2026-09', kind: 'casa', title: 'Internet', amount: 80, paid: false, recurrence: 'mes' },
  { id: 's4', month: '2026-09', kind: 'casa', title: 'Aluguel', amount: 650, paid: true, paidBy: 'ricardo', recurrence: 'mes' },
  { id: 's5', month: '2026-09', kind: 'casa', title: 'Coleta ENS', amount: 12.84, paid: false, recurrence: 'mes' },
  { id: 's6', month: '2026-09', kind: 'casa', title: 'Netflix', amount: 46, paid: true, paidBy: 'ricardo', recurrence: 'mes' },
  { id: 's7', month: '2026-09', kind: 'casa', title: 'YouTube Prime', amount: 54, paid: true, paidBy: 'ricardo', recurrence: 'mes' },
  { id: 's8', month: '2026-09', kind: 'casa', title: 'Nubank Card', amount: 348.63, paid: false, recurrence: 'mes' },
  { id: 's9', month: '2026-09', kind: 'casa', title: 'Neon Card', amount: 590.29, paid: false, recurrence: 'mes' },
  { id: 's10', month: '2026-09', kind: 'casa', title: 'Nubank · geladeira', amount: 437.16, paid: true, paidBy: 'ricardo', recurrence: 'parcela', seriesId: 'gel', parcela: { n: 6, total: 13 }, banco: 'Nubank' },
  { id: 'p1', month: '2026-09', kind: 'pessoal', title: 'Crunchyroll', amount: 25, paid: false, recurrence: 'mes', owner: 'ricardo' },
  { id: 'p2', month: '2026-09', kind: 'pessoal', title: 'Claro pré', amount: 60, paid: false, recurrence: 'mes', owner: 'ricardo' },
  { id: 'p3', month: '2026-09', kind: 'pessoal', title: 'Serasa Primer', amount: 24, paid: false, recurrence: 'mes', owner: 'ricardo' },
  { id: 'p4', month: '2026-09', kind: 'pessoal', title: 'iFood', amount: 6, paid: false, recurrence: 'mes', owner: 'ricardo' },
  { id: 'p5', month: '2026-09', kind: 'pessoal', title: 'Aliexpress Parcela', amount: 265.88, paid: true, recurrence: 'unico', owner: 'ricardo' },
  { id: 'p6', month: '2026-09', kind: 'pessoal', title: 'Inter Card', amount: 133.33, paid: false, recurrence: 'mes', owner: 'ricardo' },
  { id: 'r1', month: '2026-09', kind: 'pessoal', title: 'Passagem Transcol', amount: 200, paid: false, recurrence: 'mes', owner: 'raiane' },
  { id: 'r2', month: '2026-09', kind: 'pessoal', title: 'Vivo pós', amount: 137.45, paid: false, recurrence: 'mes', owner: 'raiane' },
  { id: 'r3', month: '2026-09', kind: 'pessoal', title: 'Nubank · retiro', amount: 105.53, paid: false, recurrence: 'parcela', owner: 'raiane', seriesId: 'ret', parcela: { n: 4, total: 12 }, banco: 'Nubank' },
]

function loadBills(): Bill[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return seedSept
}

function nextMonth(m: string) {
  const [y, mo] = m.split('-').map(Number)
  const d = new Date(y, mo, 1) // mo is 1-indexed from split? '2026-09' → 2026, 9 → Date(2026, 9, 1) is Oct
  // month in string is 1-based
  const dt = new Date(y, mo - 1 + 1, 1)
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`
}

function uid() {
  return crypto.randomUUID()
}

type Ctx = {
  bills: Bill[]
  openMonth: string
  participaCasa: Record<Role, boolean>
  setParticipa: (r: Role, v: boolean) => void
  setOpenMonth: (m: string) => void
  ofMonth: (m: string, kind?: Kind) => Bill[]
  togglePaid: (id: string, by: Role) => void
  addBill: (b: Omit<Bill, 'id'>) => void
  editBill: (id: string, patch: Partial<Pick<Bill, 'title' | 'amount' | 'paid' | 'paidBy'>>) => void
  deleteBill: (id: string) => void
  applyMolde: (opts: { kind: Kind; month: string; items: { title: string; amount: number }[]; owner?: Role; replace: boolean }) => void
  addSeries: (opts: { kind: Kind; banco: string; motivo: string; amount: number; total: number; start: number; owner?: Role; startMonth: string }) => void
  openNext: () => string
  forecast: (role: Role, month: string) => { certo: number; estimado: number; total: number }
  yearSum: (year: number, role: Role) => Record<string, number>
  falta: (role: Role, month: string) => { casa: number; pessoal: number; total: number; pagou: number; deveria: number }
}

const C = createContext<Ctx | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [bills, setBills] = useState<Bill[]>(loadBills)
  const [openMonth, setOpenMonthState] = useState(() => localStorage.getItem(MONTH_KEY) || '2026-09')
  const [participaCasa, setPart] = useState<Record<Role, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem(PART_KEY) || '')
    } catch {
      return { ricardo: true, raiane: true }
    }
  })

  useEffect(() => {
    const fam = savedFamily()
    if (!supabaseReady || !fam) return
    pullBills(fam.familyId)
      .then(({ bills: remote }) => {
        setBills(remote)
        localStorage.setItem(KEY, JSON.stringify(remote))
      })
      .catch(() => {})
  }, [])

  const persist = (next: Bill[]) => {
    setBills(next)
    localStorage.setItem(KEY, JSON.stringify(next))
  }

  const pushOne = (b: Bill) => {
    const fam = savedFamily()
    if (!supabaseReady || !fam) return
    pushBill(fam.familyId, fam.userId, b).catch(() => {})
  }

  const setOpenMonth = (m: string) => {
    setOpenMonthState(m)
    localStorage.setItem(MONTH_KEY, m)
  }

  const setParticipa = (r: Role, v: boolean) => {
    const next = { ...participaCasa, [r]: v }
    setPart(next)
    localStorage.setItem(PART_KEY, JSON.stringify(next))
  }

  const ofMonth = (m: string, kind?: Kind) =>
    bills.filter((b) => b.month === m && (!kind || b.kind === kind))

  const togglePaid = (id: string, by: Role) => {
    const cur = bills.find((b) => b.id === id)
    const nextPaid = cur ? !cur.paid : true
    persist(
      bills.map((b) =>
        b.id === id ? { ...b, paid: !b.paid, paidBy: !b.paid ? by : undefined } : b,
      ),
    )
    const fam = savedFamily()
    if (fam && cur) setPaid(id, nextPaid, fam.userId).catch(() => {})
  }

  const addBill = (b: Omit<Bill, 'id'>) => {
    const row = { ...b, id: uid() }
    persist([...bills, row])
    pushOne(row)
  }

  const editBill = (id: string, patch: Partial<Pick<Bill, 'title' | 'amount' | 'paid' | 'paidBy'>>) => {
    const cur = bills.find((b) => b.id === id)
    if (!cur) return
    const next = { ...cur, ...patch }
    persist(bills.map((b) => (b.id === id ? next : b)))
    pushOne(next)
  }

  const deleteBill = (id: string) => {
    persist(bills.filter((b) => b.id !== id))
    const fam = savedFamily()
    if (fam) removeBill(id).catch(() => {})
  }

  const applyMolde = (opts: { kind: Kind; month: string; items: { title: string; amount: number }[]; owner?: Role; replace: boolean }) => {
    let next = bills
    if (opts.replace) {
      const drop = next.filter((b) =>
        b.month === opts.month && b.kind === opts.kind && (opts.kind === 'casa' || b.owner === opts.owner)
      )
      next = next.filter((b) => !drop.includes(b))
      const fam = savedFamily()
      if (fam) drop.forEach((b) => removeBill(b.id).catch(() => {}))
    }
    const extra: Bill[] = []
    for (const m of opts.items) {
      const exists = next.some((b) =>
        b.month === opts.month && b.kind === opts.kind && (opts.kind === 'casa' || b.owner === opts.owner) &&
        (b.title.toLowerCase().includes(m.title.toLowerCase()) || m.title.toLowerCase().includes(b.title.toLowerCase()))
      )
      if (exists) continue
      extra.push({
        id: uid(),
        month: opts.month,
        kind: opts.kind,
        title: m.title,
        amount: m.amount,
        paid: false,
        recurrence: 'mes',
        owner: opts.owner,
      })
    }
    next = [...next, ...extra]
    persist(next)
    extra.forEach(pushOne)
  }

  const addSeries = (opts: {
    kind: Kind; banco: string; motivo: string; amount: number; total: number; start: number; owner?: Role; startMonth: string
  }) => {
    const seriesId = uid()
    const title = opts.motivo ? `${opts.banco} · ${opts.motivo}` : `${opts.banco} · parcela`
    const extra: Bill[] = []
    let m = opts.startMonth
    for (let n = opts.start; n <= opts.total; n++) {
      extra.push({
        id: uid(),
        month: m,
        kind: opts.kind,
        title,
        amount: opts.amount,
        paid: false,
        recurrence: 'parcela',
        owner: opts.owner,
        seriesId,
        parcela: { n, total: opts.total },
        banco: opts.banco,
      })
      m = nextMonth(m)
    }
    persist([...bills, ...extra])
    extra.forEach(pushOne)
  }

  const openNext = () => {
    const nxt = nextMonth(openMonth)
    const already = bills.some((b) => b.month === nxt)
    if (!already) {
      const copies: Bill[] = ofMonth(openMonth)
        .filter((b) => b.recurrence === 'mes' || b.recurrence === 'parcela')
        .map((b) => {
          if (b.recurrence === 'parcela') {
            const existing = bills.find(
              (x) => x.seriesId && x.seriesId === b.seriesId && x.month === nxt,
            )
            if (existing) return null
            if (b.parcela && b.parcela.n >= b.parcela.total) return null
            return {
              ...b,
              id: uid(),
              month: nxt,
              paid: false,
              paidBy: undefined,
              parcela: b.parcela ? { n: b.parcela.n + 1, total: b.parcela.total } : undefined,
            }
          }
          return { ...b, id: uid(), month: nxt, paid: false, paidBy: undefined }
        })
        .filter(Boolean) as Bill[]
      persist([...bills, ...copies])
    }
    setOpenMonth(nxt)
    return nxt
  }

  const sharers = () =>
    (Object.keys(participaCasa) as Role[]).filter((r) => participaCasa[r]).length || 1

  const forecast = (role: Role, month: string) => {
    let list = ofMonth(month)
    if (!list.length) {
      list = ofMonth(openMonth).filter((b) => b.recurrence === 'mes' || b.recurrence === 'parcela')
    }
    const split = sharers()
    let certo = 0
    let estimado = 0
    for (const b of list) {
      const minePessoal = b.kind === 'pessoal' && b.owner === role
      const mineCasa = b.kind === 'casa' && participaCasa[role]
      if (!minePessoal && !mineCasa) continue
      const part = mineCasa && b.kind === 'casa' ? b.amount / split : b.amount
      if (b.recurrence === 'unico') continue
      if (FLOATING.has(b.title)) estimado += part
      else certo += part
    }
    return { certo, estimado, total: certo + estimado }
  }

  const yearSum = (year: number, role: Role) => {
    const out: Record<string, number> = {}
    for (let i = 1; i <= 12; i++) {
      const m = `${year}-${String(i).padStart(2, '0')}`
      out[m] = ofMonth(m).reduce((s, b) => {
        const minePessoal = b.kind === 'pessoal' && b.owner === role
        const mineCasa = b.kind === 'casa' && participaCasa[role]
        if (!minePessoal && !mineCasa) return s
        const part = mineCasa && b.kind === 'casa' ? b.amount / sharers() : b.amount
        return s + part
      }, 0)
    }
    return out
  }

  const falta = (role: Role, month: string) => {
    const list = ofMonth(month)
    const split = sharers()
    let casa = 0
    let pessoal = 0
    let pagou = 0
    let deveria = 0
    for (const b of list) {
      if (b.kind === 'casa' && participaCasa[role]) {
        const part = b.amount / split
        deveria += part
        if (b.paid && b.paidBy === role) pagou += b.amount
        else if (!b.paid) casa += part
      }
      if (b.kind === 'pessoal' && b.owner === role) {
        deveria += b.amount
        if (b.paid) pagou += b.amount
        else pessoal += b.amount
      }
    }
    // crédito: pagou conta inteira de casa, só conta a metade como "sua"
    // falta casa already only unpaid share
    return { casa, pessoal, total: casa + pessoal, pagou, deveria }
  }

  const value = useMemo(
    () => ({
      bills, openMonth, participaCasa, setParticipa, setOpenMonth,
      ofMonth, togglePaid, addBill, editBill, deleteBill, applyMolde, addSeries, openNext, forecast, yearSum, falta,
    }),
    [bills, openMonth, participaCasa],
  )

  return <C.Provider value={value}>{children}</C.Provider>
}

export function useStore() {
  const v = useContext(C)
  if (!v) throw new Error('store')
  return v
}

export const brl = (n: number) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export const monthLabel = (m: string) => {
  const [y, mo] = m.split('-')
  const names = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
  return `${names[Number(mo) - 1]} ${y}`
}
