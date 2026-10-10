export function digitsOf(s: string) {
  return s.replace(/\D/g, '').slice(0, 10)
}

export function maskBRL(raw: string) {
  const d = digitsOf(raw)
  const n = Number(d || '0') / 100
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function fromBRL(s: string) {
  const d = digitsOf(s)
  return Number(d || '0') / 100
}

export function toMask(n: number) {
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
