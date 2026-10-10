import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Logo } from '../data'
import { supabase } from '../supabase'
import { createFamily, loadFamily } from '../sync'

export default function ConfirmarEmail({ onEnter }: { onEnter: (r: 'ricardo' | 'raiane') => void }) {
  const nav = useNavigate()
  const [ok, setOk] = useState(false)
  const [msg, setMsg] = useState('Confirme o e-mail no link que enviamos. Esta página fecha sozinha quando o link voltar.')
  const email = localStorage.getItem('cm-pending-email') || ''

  useEffect(() => {
    if (!supabase) return
    const go = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) return
      const nome = localStorage.getItem('cm-pending-nome') || 'Responsável'
      try {
        const fam = await loadFamily()
        if (!fam) await createFamily('Casa', nome)
        localStorage.removeItem('cm-pending-nome')
        localStorage.removeItem('cm-pending-email')
        setOk(true)
        onEnter('ricardo')
        nav('/', { replace: true })
      } catch (e) {
        const err = e as { message?: string }
        setMsg(err?.message || 'E-mail ok, mas a família não criou.')
      }
    }
    go()
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) go()
    })
    return () => sub.subscription.unsubscribe()
  }, [nav, onEnter])

  return (
    <div className="login-wrap">
      <div className="center-logo"><Logo /></div>
      <h1>{ok ? 'Pronto' : 'Confirme o e-mail'}</h1>
      <p className="tag">{email}</p>
      <p className="note">{msg}</p>
      <p className="note">Abra o e-mail no mesmo celular. O link volta para cá.</p>
      <Link to="/login" className="btn ghost" style={{ display: 'block', textAlign: 'center' }}>Ir para o login</Link>
    </div>
  )
}
