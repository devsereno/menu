import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Logo } from '../data'
import { createFamily, loadFamily, signUp } from '../sync'

export default function Registro({ onEnter }: { onEnter: (r: 'ricardo' | 'raiane') => void }) {
  const nav = useNavigate()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  const criar = async () => {
    if (!email || !pass || !nome) {
      setMsg('Preencha nome, e-mail e senha.')
      return
    }
    setBusy(true)
    setMsg('')
    try {
      const r = await signUp(email, pass, nome)
      if (r.needsConfirm) {
        localStorage.setItem('cm-pending-nome', nome)
        localStorage.setItem('cm-pending-email', email)
        nav('/confirmar', { replace: true })
        return
      }
      const fam = await loadFamily()
      if (!fam) await createFamily('Casa', nome)
      onEnter('ricardo')
      nav('/', { replace: true })
    } catch (e) {
      const err = e as { message?: string }
      setMsg(err?.message || 'Não criou a conta')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login-wrap">
      <div className="center-logo"><Logo /></div>
      <h1>Criar conta</h1>
      <p className="tag">Você vira o responsável da família.</p>
      <div className="field"><label>Seu nome</label><input value={nome} onChange={(e) => setNome(e.target.value)} /></div>
      <div className="field"><label>E-mail</label><input value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></div>
      <div className="field"><label>Senha</label><input type="password" value={pass} onChange={(e) => setPass(e.target.value)} autoComplete="new-password" /></div>
      <button className="btn" disabled={busy} onClick={criar}>Criar e enviar e-mail</button>
      {msg && <p className="note" style={{ color: 'var(--red)' }}>{msg}</p>}
      <p className="note" style={{ textAlign: 'center' }}><Link to="/login">Já tenho conta</Link></p>
    </div>
  )
}
