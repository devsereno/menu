export function iconeFixo(title: string) {
  const t = title.toLowerCase()
  return (
    t.includes('aluguel') || t.includes('condom') || t.includes('iptu') ||
    t.includes('água') || t.includes('agua') || t.includes('luz') ||
    t.includes('energia') || t.includes('gás') || t.includes('gas') ||
    t.includes('coleta') || t.includes('lixo') || t.includes('garagem')
  )
}

export function billIcon(title: string) {
  const t = title.toLowerCase()
  if (t.includes('água') || t.includes('agua')) return '💧'
  if (t.includes('luz') || t.includes('energia')) return '⚡'
  if (t.includes('gás') || t.includes('gas')) return '🔥'
  if (t.includes('internet') || t.includes('wifi') || t.includes('vivo fib')) return '📶'
  if (t.includes('aluguel') || t.includes('condom')) return '🏠'
  if (t.includes('coleta') || t.includes('lixo') || t.includes('ens')) return '🧾'
  if (t.includes('netflix') || t.includes('youtube') || t.includes('prime') || t.includes('disney') || t.includes('hbo') || t.includes('crunchy')) return '▶'
  if (t.includes('spotify')) return '🎵'
  if (t.includes('nubank') || t.includes('neon') || t.includes('inter') || t.includes('cart') || t.includes('card') || t.includes('caixa')) return '💳'
  if (t.includes('claro') || t.includes('tim') || t.includes('vivo') || t.includes('telefone') || t.includes('pré') || t.includes('pos') || t.includes('pós')) return '📱'
  if (t.includes('ifood') || t.includes('mercado')) return '🍽️'
  if (t.includes('aliexpress') || t.includes('compra') || t.includes('parcela')) return '📦'
  if (t.includes('passagem') || t.includes('transcol') || t.includes('uber')) return '🚌'
  if (t.includes('serasa')) return '📄'
  if (t.includes('aluguel') === false && t.includes('emprest')) return '🏦'
  return '●'
}
