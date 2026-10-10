export type Kind = 'casa' | 'pessoal'
export type Recurrence = 'unico' | 'mes' | 'parcela'
export type Role = 'ricardo' | 'raiane'

export type Bill = {
  id: string
  month: string
  kind: Kind
  title: string
  amount: number
  paid: boolean
  paidBy?: Role
  recurrence: Recurrence
  owner?: Role
  seriesId?: string
  parcela?: { n: number; total: number }
  banco?: string
}

export const CATEGORIES = [
  { id: 'moradia', label: 'Aluguel', kind: 'casa' as Kind, items: ['Aluguel', 'Condomínio'] },
  { id: 'luz', label: 'Luz', kind: 'casa' as Kind, items: ['Luz'], float: true },
  { id: 'agua', label: 'Água', kind: 'casa' as Kind, items: ['Água'], float: true },
  { id: 'gas', label: 'Gás', kind: 'casa' as Kind, items: ['Gás'], float: true },
  { id: 'net', label: 'Internet', kind: 'casa' as Kind, items: ['Internet', 'Telefone'] },
  { id: 'entre', label: 'Entretenimento', kind: 'pessoal' as Kind, items: ['Netflix', 'YouTube', 'Prime Video', 'Disney+', 'Spotify', 'Crunchyroll'] },
  { id: 'tel', label: 'Telefone', kind: 'pessoal' as Kind, items: ['Claro', 'Vivo', 'Tim', 'Claro pré'] },
  { id: 'card', label: 'Cartão', kind: 'pessoal' as Kind, items: ['Nubank', 'Neon', 'Inter', 'Caixa', 'PicPay'] },
  { id: 'emp', label: 'Empréstimo', kind: 'pessoal' as Kind, items: [] },
  { id: 'mais', label: 'Mais', kind: 'casa' as Kind, items: ['Coleta ENS', 'Outra…'] },
]


export const MOLDE_CASA = [
  { title: 'Água', amount: 47.6 },
  { title: 'Luz', amount: 438.01 },
  { title: 'Giga Internet', amount: 80 },
  { title: 'Aluguel', amount: 650 },
  { title: 'Coleta ENS', amount: 12.84 },
  { title: 'Netflix', amount: 46 },
  { title: 'YouTube Prime', amount: 54 },
  { title: 'Nubank Card', amount: 348.63 },
  { title: 'Neon Card', amount: 590.29 },
]

export const MOLDE_PESSOAL = {
  ricardo: [
    { title: 'Crunchyroll', amount: 25 },
    { title: 'Claro pré', amount: 60 },
    { title: 'Serasa Primer', amount: 24 },
    { title: 'iFood', amount: 6 },
    { title: 'Aliexpress Parcela', amount: 265.88 },
    { title: 'Inter Card', amount: 133.33 },
  ],
  raiane: [
    { title: 'Passagem Transcol', amount: 200 },
    { title: 'Vivo pós', amount: 137.45 },
    { title: 'Nubank · retiro', amount: 105.53 },
  ],
}

export const EXEMPLO_CASA = [
  { title: 'Água', amount: 0, grupo: 'todos' as const },
  { title: 'Luz', amount: 0, grupo: 'todos' as const },
  { title: 'Gás', amount: 0, grupo: 'todos' as const },
  { title: 'Internet', amount: 0, grupo: 'todos' as const },
  { title: 'Telefone fixo', amount: 0, grupo: 'todos' as const },
  { title: 'Coleta de lixo', amount: 0, grupo: 'todos' as const },
  { title: 'Netflix', amount: 0, grupo: 'todos' as const },
  { title: 'YouTube / Prime', amount: 0, grupo: 'todos' as const },
  { title: 'Aluguel', amount: 0, grupo: 'aluguel' as const },
  { title: 'IPTU', amount: 0, grupo: 'aluguel' as const },
  { title: 'Condomínio', amount: 0, grupo: 'condominio' as const },
  { title: 'IPTU do apto', amount: 0, grupo: 'condominio' as const },
  { title: 'Garagem', amount: 0, grupo: 'condominio' as const },
  { title: 'Água do prédio', amount: 0, grupo: 'condominio' as const },
]

export const EXEMPLO_PESSOAL = [
  { title: 'Celular', amount: 0 },
  { title: 'Cartão de crédito', amount: 0 },
  { title: 'Transporte', amount: 0 },
  { title: 'Combustível', amount: 0 },
  { title: 'Streaming', amount: 0 },
  { title: 'Delivery', amount: 0 },
  { title: 'Academia', amount: 0 },
  { title: 'Farmácia', amount: 0 },
  { title: 'Parcela / empréstimo', amount: 0 },
]

export const BANCOS = ['Nubank', 'Neon', 'Caixa', 'Inter', 'Magazine Luiza', 'Outro']

export const FLOATING = new Set(['Luz', 'Água', 'Gás'])
