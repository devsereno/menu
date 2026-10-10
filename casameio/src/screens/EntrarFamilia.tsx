import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Logo } from '../data'
import { joinFamily, loadFamily, requestJoin, signIn, signUp } from '../sync'

function codigoDe(raw: string) {
  const m = raw.toUpperCase().match(/CAS-[A-Z0-9]+/)
  return m ? m[0] : raw.trim().toUpperCase()
}

export default function EntrarFamilia({ onEnter }: { onEnter: (r: 'ricardo' | 'raiane') => void }) {
  const nav = useNavigate()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [invite, setInvite] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  const entrar = async () => {
    const code = codigoDe(invite)
    if (!code || !email || !pass || !nome) {
      setMsg('Nome, e-mail, senha e código.')
      return
    }
    setBusy(true)
    setMsg('')
    try {
      try {
        await signIn(email, pass)
      } catch {
        const r = await signUp(email, pass)
        if (r.needsConfirm) {
          try { await signIn(email, pass) } catch {
            await requestJoin(code, email, nome)
            setMsg('Pedido enviado. O responsável confirma o seu e-mail na tela Família.')
            return
          }
        }
      }
      await joinFamily(code, nome)
      const fam = await loadFamily()
      onEnter(fam?.role === 'member' ? 'raiane' : 'ricardo')
      nav('/', { replace: true })
    } catch (e) {
      const err = e as { message?: string }
      setMsg(err?.message || 'Não entrou na família')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login-wrap">
      <div className="center-logo"><Logo /></div>
      <h1>🏠 Entrar na família</h1>
      <p className="tag">Cole o código ou o link. Membro não confirma e-mail — só o responsável.</p>
      <div className="field"><label>Seu nome</label><input value={nome} onChange={(e) => setNome(e.target.value)} /></div>
      <div className="field"><label>E-mail</label><input value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></div>
      <div className="field"><label>Senha</label><input type="password" value={pass} onChange={(e) => setPass(e.target.value)} /></div>
      <div className="field"><label>Código ou link</label><input value={invite} onChange={(e) => setInvite(e.target.value)} placeholder="CAS-XXXX ou cole o link" /></div>
      <button className="btn" disabled={busy} onClick={entrar}>Entrar na família</button>
      {msg && <p className="note" style={{ color: 'var(--red)' }}>{msg}</p>}
      <p className="note" style={{ textAlign: 'center' }}><Link to="/login">Voltar ao login</Link></p>
    </div>
  )
}
