import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Logo } from '../data'
import { supabaseReady } from '../supabase'
import { createFamily, displayNameFromUser, loadFamily, sessionUser, signIn } from '../sync'

export default function Login({ onEnter }: { onEnter: (r: 'ricardo' | 'raiane') => void }) {
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  const entrar = async () => {
    setBusy(true)
    setMsg('')
    try {
      await signIn(email, pass)
      let fam = await loadFamily()
      if (!fam) {
        const user = await sessionUser()
        fam = await createFamily('Casa', displayNameFromUser(user))
      }
      localStorage.setItem('cm-name', fam.name)
      onEnter(fam.role === 'member' ? 'raiane' : 'ricardo')
      nav('/', { replace: true })
    } catch (e) {
      const err = e as { message?: string }
      setMsg(err?.message || 'Não entrou')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login-wrap">
      <div className="center-logo"><Logo /></div>
      <h1>CasaMeio</h1>
      <p className="tag">A casa no meio. O pessoal no seu bolso.</p>
      {supabaseReady && (
        <>
          <div className="field"><label>E-mail</label><input value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></div>
          <div className="field"><label>Senha</label><input type="password" value={pass} onChange={(e) => setPass(e.target.value)} autoComplete="current-password" /></div>
          <button className="btn" disabled={busy} onClick={entrar}>Entrar</button>
          {msg && <p className="note" style={{ color: 'var(--red)' }}>{msg}</p>}
          <p className="note" style={{ textAlign: 'center' }}>
            <Link to="/registro">Criar conta</Link>
          </p>
          <p className="note" style={{ textAlign: 'center' }}>
            <Link to="/familia-entrar">🏠 Entrar na família</Link>
          </p>
        </>
      )}
    </div>
  )
}
