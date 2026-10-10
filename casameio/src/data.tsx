export const CASA = [
  { nome: 'Água', valor: 47.6, pago: false, por: '' },
  { nome: 'Luz', valor: 438.01, pago: false, por: '' },
  { nome: 'Internet', valor: 80, pago: false, por: '' },
  { nome: 'Aluguel', valor: 650, pago: true, por: 'Ricardo' },
  { nome: 'Coleta ENS', valor: 12.84, pago: false, por: '' },
  { nome: 'Netflix', valor: 46, pago: true, por: 'Ricardo' },
  { nome: 'YouTube Prime', valor: 54, pago: true, por: 'Ricardo' },
  { nome: 'Nubank Card', valor: 348.63, pago: false, por: '' },
  { nome: 'Neon Card', valor: 590.29, pago: false, por: '' },
  { nome: 'Empréstimo geladeira 06/13', valor: 437.16, pago: true, por: 'Ricardo' },
]

export const RIC_PESSOAL = [
  { nome: 'Crunchyroll', valor: 25, pago: false },
  { nome: 'Claro pré', valor: 60, pago: false },
  { nome: 'Serasa Primer', valor: 24, pago: false },
  { nome: 'iFood', valor: 6, pago: false },
  { nome: 'Aliexpress Parcela', valor: 265.88, pago: true },
  { nome: 'Inter Card', valor: 133.33, pago: false },
]

export const RAI_PESSOAL = [
  { nome: 'Passagem Transcol', valor: 200, pago: false },
  { nome: 'Vivo pós', valor: 137.45, pago: false },
  { nome: 'Empréstimo retiro 04/12', valor: 105.53, pago: false },
]

export const brl = (n: number) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export function Logo() {
  return (
    <svg className="logo" viewBox="0 0 64 64" aria-hidden>
      <path d="M10 30 L32 10 L54 30 V54 H10 Z" fill="none" stroke="#22c55e" strokeWidth="5" />
      <path d="M32 10 L54 30 V54 H32 Z" fill="none" stroke="#3b82f6" strokeWidth="5" />
    </svg>
  )
}
