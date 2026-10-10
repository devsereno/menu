import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { approveJoin, listJoinAsks, listMembers, savedFamily, sessionUser, type JoinAsk } from '../sync'
import { useStore } from '../store'

type Role = 'ricardo' | 'raiane'
type Theme = 'dark' | 'light'

export default function Familia({
  role, onLogout,
}: {
  role: Role
  theme: Theme
  onTheme: () => void
  onLogout: () => void
  onRole: (r: Role) => void
}) {
  const nav = useNavigate()
  const { participaCasa, setParticipa } = useStore()
  const me = savedFamily()
  const isOwner = me?.role === 'owner'
  const [membros, setMembros] = useState<{ name: string; role: string }[]>(
    me ? [{ name: me.name, role: me.role }] : [],
  )
  const [email, setEmail] = useState('')
  const [pedidos, setPedidos] = useState<JoinAsk[]>([])
  const [aviso, setAviso] = useState('')

  const recarregar = () => {
    if (!me?.familyId) return
    listMembers(me.familyId).then(setMembros).catch(() => {})
    listJoinAsks(me.familyId).then(setPedidos).catch(() => {})
  }

  useEffect(() => {
    sessionUser().then((u) => setEmail(u?.email || '')).catch(() => {})
    recarregar()
  }, [me?.familyId])

  const aceitar = async (id: string) => {
    setAviso('')
    try {
      await approveJoin(id)
      recarregar()
    } catch (e) {
      setAviso((e as { message?: string }).message || 'Não aceitou')
    }
  }

  return (
    <div className="screen">
      <h1>{isOwner ? 'Família' : 'Minha conta'}</h1>
      <p className="sub">{me?.name || ''}</p>
      {email && <p className="note">{email}</p>}

      <div className="card">
        <div className="k">Membros</div>
        {membros.map((m) => (
          <div className="v" key={m.name + m.role} style={{ fontSize: 16 }}>
            {m.name} · {m.role === 'owner' ? 'Responsável' : 'Membro'}
          </div>
        ))}
        {!membros.length && <div className="v">Ninguém listado ainda</div>}
      </div>

      <div className="card" style={{ marginTop: 10 }}>
        <div className="k">Convite</div>
        <div className="v">{me?.invite || '—'}</div>
      </div>

      {isOwner && (
        <div className="card" style={{ marginTop: 10 }}>
          <div className="k">Pedidos pra entrar</div>
          {pedidos.filter((p) => p.status === 'pending').map((p) => (
            <div key={p.id} style={{ marginTop: 10 }}>
              <div className="v" style={{ fontSize: 15 }}>{p.name}</div>
              <div className="note">{p.email}</div>
              <button className="btn" type="button" onClick={() => aceitar(p.id)}>Aceitar</button>
            </div>
          ))}
          {!pedidos.filter((p) => p.status === 'pending').length && (
            <div className="v">Nenhum pedido novo</div>
          )}
          {aviso && <p className="note" style={{ color: 'var(--red)' }}>{aviso}</p>}
        </div>
      )}

      <div className="toggle">
        <div>
          <div className="name">Participo da casa</div>
          <div className="val">Desliga = só o seu pessoal no “falta”.</div>
        </div>
        <button className={`sw ${participaCasa[role] ? 'on' : ''}`} type="button" onClick={() => setParticipa(role, !participaCasa[role])}><i /></button>
      </div>

      {isOwner && (
        <button className="btn ghost" onClick={() => nav('/admin-icones')}>Ícones (admin)</button>
      )}
      <button className="btn ghost" onClick={onLogout}>Sair</button>
    </div>
  )
}
