import type { Bill } from './catalog'
import { supabase, supabaseReady } from './supabase'

export type FamilyInfo = {
  familyId: string
  invite: string
  memberId: string
  userId: string
  name: string
  role: 'owner' | 'member'
}

const FAM = 'cm-family'

export function savedFamily(): FamilyInfo | null {
  try {
    const r = localStorage.getItem(FAM)
    return r ? JSON.parse(r) : null
  } catch {
    return null
  }
}

export function saveFamily(f: FamilyInfo | null) {
  if (!f) localStorage.removeItem(FAM)
  else localStorage.setItem(FAM, JSON.stringify(f))
}

function code() {
  return 'CAS-' + Math.random().toString(36).slice(2, 6).toUpperCase()
}

export async function signIn(email: string, password: string) {
  if (!supabase) throw new Error('Supabase não configurado')
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
}

export async function signUp(email: string, password: string, nome?: string) {
  if (!supabase) throw new Error('Supabase não configurado')
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/confirmar`,
      data: { full_name: nome || '' },
    },
  })
  if (error) throw error
  return { needsConfirm: !data.session }
}

export function displayNameFromUser(user: { email?: string | null; user_metadata?: Record<string, unknown> } | null) {
  const meta = String(user?.user_metadata?.full_name || '').trim()
  if (meta) return meta
  const mail = user?.email || ''
  const local = mail.split('@')[0] || ''
  return local.replace(/[._0-9]+/g, ' ').trim() || 'Você'
}

export async function signOut() {
  await supabase?.auth.signOut()
  saveFamily(null)
}

export async function sessionUser() {
  if (!supabase) return null
  const { data } = await supabase.auth.getUser()
  return data.user ?? null
}

export async function listMembers(familyId: string) {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('members')
    .select('name, role, user_id')
    .eq('family_id', familyId)
    .order('created_at')
  if (error) throw error
  return (data || []) as { name: string; role: 'owner' | 'member'; user_id: string }[]
}

export type JoinAsk = { id: string; email: string; name: string; status: string }

export async function requestJoin(invite: string, email: string, name: string) {
  if (!supabase) throw new Error('Supabase não configurado')
  const { error } = await supabase.rpc('request_join', {
    p_invite: invite,
    p_email: email,
    p_name: name,
  })
  if (error) throw error
}

export async function listJoinAsks(familyId: string) {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('join_requests')
    .select('id, email, name, status')
    .eq('family_id', familyId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data || []) as JoinAsk[]
}

export async function approveJoin(id: string) {
  if (!supabase) throw new Error('Supabase não configurado')
  const { error } = await supabase.rpc('approve_join', { p_id: id })
  if (error) throw error
}

export async function loadFamily(): Promise<FamilyInfo | null> {
  if (!supabase) return savedFamily()
  const user = await sessionUser()
  if (!user) return null
  const { data: rows } = await supabase
    .from('members')
    .select('id, family_id, name, role, families(invite_code)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
  const data = rows?.[0]
  if (!data) return savedFamily()
  const fam: FamilyInfo = {
    familyId: data.family_id,
    invite: (data as { families?: { invite_code: string } }).families?.invite_code || '',
    memberId: data.id,
    userId: user.id,
    name: data.name,
    role: data.role as 'owner' | 'member',
  }
  saveFamily(fam)
  return fam
}

export async function createFamily(name: string, display: string): Promise<FamilyInfo> {
  if (!supabase) throw new Error('Supabase não configurado')
  const user = await sessionUser()
  if (!user) throw new Error('Entre com e-mail primeiro')
  const invite = code()
  const { data: fam, error } = await supabase
    .from('families')
    .insert({ name, invite_code: invite })
    .select()
    .single()
  if (error) throw error
  const { data: mem, error: e2 } = await supabase
    .from('members')
    .insert({ family_id: fam.id, user_id: user.id, name: display, role: 'owner' })
    .select()
    .single()
  if (e2) throw e2
  const info: FamilyInfo = {
    familyId: fam.id,
    invite,
    memberId: mem.id,
    userId: user.id,
    name: display,
    role: 'owner',
  }
  saveFamily(info)
  return info
}

export async function joinFamily(invite: string, display: string): Promise<FamilyInfo> {
  if (!supabase) throw new Error('Supabase não configurado')
  const user = await sessionUser()
  if (!user) throw new Error('Entre com e-mail primeiro')
  const { data: fam, error } = await supabase
    .from('families')
    .select()
    .eq('invite_code', invite.trim().toUpperCase())
    .maybeSingle()
  if (error) throw error
  if (!fam) throw new Error('Código inválido')
  const { data: mem, error: e2 } = await supabase
    .from('members')
    .insert({ family_id: fam.id, user_id: user.id, name: display, role: 'member' })
    .select()
    .single()
  if (e2) throw e2
  const info: FamilyInfo = {
    familyId: fam.id,
    invite: fam.invite_code,
    memberId: mem.id,
    userId: user.id,
    name: display,
    role: 'member',
  }
  saveFamily(info)
  return info
}

type Row = {
  id: string
  month: string
  kind: 'casa' | 'pessoal'
  title: string
  amount: number
  paid: boolean
  paid_by: string | null
  recurrence: 'unico' | 'mes' | 'parcela'
  owner_user_id: string | null
  series_id: string | null
  parcela_n: number | null
  parcela_total: number | null
  banco: string | null
}

export function rowToBill(r: Row, members: { user_id: string; name: string }[]): Bill {
  const owner = members.find((m) => m.user_id === r.owner_user_id)
  const payer = members.find((m) => m.user_id === r.paid_by)
  const who = (n?: string) =>
    n?.toLowerCase().includes('raiane') ? 'raiane' : n ? 'ricardo' : undefined
  return {
    id: r.id,
    month: r.month,
    kind: r.kind,
    title: r.title,
    amount: Number(r.amount),
    paid: r.paid,
    paidBy: who(payer?.name),
    recurrence: r.recurrence,
    owner: who(owner?.name),
    seriesId: r.series_id || undefined,
    parcela:
      r.parcela_n && r.parcela_total
        ? { n: r.parcela_n, total: r.parcela_total }
        : undefined,
    banco: r.banco || undefined,
  }
}

export async function pullBills(familyId: string): Promise<{ bills: Bill[]; members: { user_id: string; name: string; role: string }[] }> {
  if (!supabase) return { bills: [], members: [] }
  const { data: members, error: e1 } = await supabase
    .from('members')
    .select('user_id, name, role')
    .eq('family_id', familyId)
  if (e1) throw e1
  const { data, error } = await supabase.from('bills').select('*').eq('family_id', familyId)
  if (error) throw error
  const mems = members || []
  return {
    members: mems,
    bills: (data || []).map((r) => rowToBill(r as Row, mems)),
  }
}

export async function pushBill(familyId: string, userId: string, b: Bill) {
  if (!supabase) return
  const owner =
    b.kind === 'pessoal'
      ? userId
      : null
  const { error } = await supabase.from('bills').upsert({
    id: b.id.match(/^[0-9a-f-]{36}$/i) ? b.id : undefined,
    family_id: familyId,
    month: b.month,
    kind: b.kind,
    title: b.title,
    amount: b.amount,
    paid: b.paid,
    paid_by: b.paid ? userId : null,
    recurrence: b.recurrence,
    owner_user_id: owner,
    series_id: b.seriesId || null,
    parcela_n: b.parcela?.n ?? null,
    parcela_total: b.parcela?.total ?? null,
    banco: b.banco || null,
  })
  if (error) throw error
}

export async function removeBill(id: string) {
  if (!supabase) return
  const { error } = await supabase.from('bills').delete().eq('id', id)
  if (error) throw error
}

export async function setPaid(id: string, paid: boolean, userId: string) {
  if (!supabase) return
  const { error } = await supabase
    .from('bills')
    .update({ paid, paid_by: paid ? userId : null, paid_at: paid ? new Date().toISOString() : null })
    .eq('id', id)
  if (error) throw error
}

export { supabaseReady }
