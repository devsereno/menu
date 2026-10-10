export type IconEntry = {
  title: string
  slug: string
  site?: string
  icon?: string
  pending: boolean
}

const KEY = 'cm-icon-map'

export function slugName(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

export function loadMap(): IconEntry[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch {
    return []
  }
}

function save(list: IconEntry[]) {
  localStorage.setItem(KEY, JSON.stringify(list))
}

export function upsertPending(title: string) {
  const slug = slugName(title)
  if (!slug) return
  const list = loadMap()
  if (list.some((e) => e.slug === slug)) return
  list.push({ title, slug, pending: true })
  save(list)
}

export function setIcon(slug: string, site: string, icon: string) {
  const list = loadMap()
  const i = list.findIndex((e) => e.slug === slug)
  const row: IconEntry = {
    title: list[i]?.title || slug,
    slug,
    site: site || undefined,
    icon: icon || undefined,
    pending: !(site || icon),
  }
  if (i >= 0) list[i] = { ...list[i], ...row, pending: !(row.site || row.icon) }
  else list.push(row)
  save(list)
}

export function findEntry(title: string) {
  const slug = slugName(title)
  return loadMap().find((e) => e.slug === slug || title.toLowerCase().includes(e.slug))
}

export function iconsFromSite(site: string) {
  try {
    const u = new URL(site.includes('://') ? site : `https://${site}`)
    const host = u.hostname.replace(/^www\./, '')
    return [
      `https://icons.duckduckgo.com/ip3/${host}.ico`,
      `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${host}&size=128`,
      `https://www.google.com/s2/favicons?domain=${host}&sz=128`,
    ]
  } catch {
    return []
  }
}

export function iconFromSite(site: string) {
  return iconsFromSite(site)[0] || ''
}
