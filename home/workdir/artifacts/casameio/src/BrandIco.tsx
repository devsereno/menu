import { useState } from 'react'
import { billIcon } from './icons'

const KNOWN: [string, string][] = [
  ['netflix', 'netflix.com'],
  ['youtube', 'youtube.com'],
  ['prime', 'primevideo.com'],
  ['disney', 'disneyplus.com'],
  ['hbo', 'max.com'],
  ['crunchy', 'crunchyroll.com'],
  ['spotify', 'spotify.com'],
  ['nubank', 'nubank.com.br'],
  ['neon', 'neon.com.br'],
  ['inter', 'bancointer.com.br'],
  ['picpay', 'picpay.com'],
  ['ifood', 'ifood.com.br'],
  ['aliexpress', 'aliexpress.com'],
  ['serasa', 'serasa.com.br'],
  ['claro', 'claro.com.br'],
  ['tim', 'tim.com.br'],
  ['vivo', 'vivo.com.br'],
  ['uber', 'uber.com'],
  ['caixa', 'caixa.gov.br'],
  ['mercado pago', 'mercadopago.com.br'],
  ['magalu', 'magazineluiza.com.br'],
  ['giga', 'gigamaisfibra.com.br'],
]

const STOP = new Set([
  'de', 'da', 'do', 'das', 'dos', 'e', 'a', 'o', 'card', 'cartao', 'cartao',
  'parcela', 'internet', 'conta', 'pre', 'pos', 'coleta',
])

function slug(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
}

function quinzena() {
  return Math.floor(Date.now() / (15 * 24 * 60 * 60 * 1000))
}

function fav(domain: string) {
  const v = quinzena()
  return [
    `https://logo.clearbit.com/${domain}?v=${v}`,
    `https://www.google.com/s2/favicons?domain=${domain}&sz=128&v=${v}`,
  ]
}

export function brandCandidates(title: string) {
  const t = title.toLowerCase()
  const out: string[] = []
  const add = (d: string) => {
    for (const u of fav(d)) if (!out.includes(u)) out.push(u)
  }

  const known = KNOWN.find(([k]) => t.includes(k))
  if (known) add(known[1])

  const words = title.trim().split(/\s+/).filter(Boolean)
  const caps = words.filter((w) => w.length >= 2 && w === w.toUpperCase())
  const rest = words.filter((w) => !STOP.has(w.toLowerCase()) && w.length >= 3)

  const guesses = [...caps, slug(title), ...rest]
  for (const g of guesses) {
    const s = slug(String(g))
    if (s.length < 3) continue
    add(`${s}.com.br`)
    add(`${s}.com`)
  }
  return out
}

export default function BrandIco({ title }: { title: string }) {
  const list = brandCandidates(title)
  const [i, setI] = useState(0)
  if (i >= list.length) return <>{billIcon(title)}</>
  return (
    <img
      src={list[i]}
      alt=""
      width={22}
      height={22}
      onError={() => setI((n) => n + 1)}
    />
  )
}
