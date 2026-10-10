import { useEffect, useState } from 'react'
import { NavLink, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import Home from './screens/Home'
import Login from './screens/Login'
import Registro from './screens/Registro'
import ConfirmarEmail from './screens/ConfirmarEmail'
import EntrarFamilia from './screens/EntrarFamilia'
import Casa from './screens/Casa'
import Pagar from './screens/Pagar'
import Pessoal from './screens/Pessoal'
import NovaConta from './screens/NovaConta'
import Familia from './screens/Familia'
import Meses from './screens/Meses'
import AdminIcones from './screens/AdminIcones'
import { StoreProvider } from './store'
import { signOut } from './sync'

type Theme = 'dark' | 'light'
type Role = 'ricardo' | 'raiane'

function Avatar({ role }: { role: Role }) {
  const woman = role === 'raiane'
  return (
    <svg viewBox="0 0 64 64" width="28" height="28" aria-hidden>
      <circle cx="32" cy="32" r="32" fill="#c5c5c5" />
      {woman ? (
        <>
          <path d="M18 58c2-14 10-20 14-20s12 6 14 20" fill="#8d8d8d" />
          <circle cx="32" cy="24" r="9" fill="#8d8d8d" />
          <path d="M16 28c2-16 10-20 16-16 8-6 18-2 18 14 0 6-4 10-8 8-6 8-18 8-24 0-3 1-6-2-6-6z" fill="#8d8d8d" />
        </>
      ) : (
        <>
          <path d="M16 58c3-16 12-22 16-22s13 6 16 22" fill="#8d8d8d" />
          <circle cx="32" cy="24" r="10" fill="#8d8d8d" />
        </>
      )}
    </svg>
  )
}

function Nav() {
  const item = (to: string, ic: string, label: string) => (
    <NavLink to={to} className={({ isActive }) => (isActive ? 'active' : '')}>
      <span className="ic">{ic}</span>
      {label}
    </NavLink>
  )
  return (
    <nav className="nav">
      {item('/', '⌂', 'Início')}
      {item('/casa', '▦', 'Casa')}
      {item('/pessoal', '☺', 'Pessoal')}
      {item('/meses', '▦', 'Meses')}
    </nav>
  )
}

function Shell() {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem('cm-theme') as Theme) || 'dark',
  )
  const [role, setRole] = useState<Role>(
    () => (localStorage.getItem('cm-role') as Role) || 'ricardo',
  )
  const [authed, setAuthed] = useState(() => localStorage.getItem('cm-in') === '1')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('cm-theme', theme)
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#0f1419' : '#f4f1ea')
  }, [theme])

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  const login = (r: Role) => {
    setRole(r)
    setAuthed(true)
    localStorage.setItem('cm-role', r)
    localStorage.setItem('cm-in', '1')
  }
  const logout = () => {
    setAuthed(false)
    localStorage.removeItem('cm-in')
    signOut().catch(() => {})
  }

  const nav = useNavigate()
  return (
    <div className="app">
      <div className="fab-row">
        {authed && (
          <button className="acct-fab" onClick={() => nav('/familia')} aria-label="Minha conta">
            <Avatar role={role} />
          </button>
        )}
        <button className="theme-fab" onClick={toggleTheme} aria-label="Tema">
          {theme === 'dark' ? '☀ Claro' : '🌙 Escuro'}
        </button>
      </div>
      <Routes>
        <Route
          path="/login"
          element={authed ? <Navigate to="/" replace /> : <Login onEnter={login} />}
        />
        <Route
          path="/registro"
          element={authed ? <Navigate to="/" replace /> : <Registro onEnter={login} />}
        />
        <Route
          path="/confirmar"
          element={<ConfirmarEmail onEnter={login} />}
        />
        <Route
          path="/familia-entrar"
          element={authed ? <Navigate to="/" replace /> : <EntrarFamilia onEnter={login} />}
        />
        <Route
          path="/*"
          element={
            authed ? (
              <>
                <Routes>
                  <Route path="/" element={<Home role={role} />} />
                  <Route path="/casa" element={<Casa />} />
                  <Route path="/pagar/:id" element={<Pagar role={role} />} />
                  <Route path="/pessoal" element={<Pessoal role={role} />} />
                  <Route path="/nova" element={<NovaConta role={role} />} />
                  <Route path="/meses" element={<Meses role={role} />} />
                  <Route path="/admin-icones" element={role === 'ricardo' ? <AdminIcones /> : <Navigate to="/" />} />
                  <Route
                    path="/familia"
                    element={
                      <Familia
                        role={role}
                        theme={theme}
                        onTheme={toggleTheme}
                        onLogout={logout}
                        onRole={(r) => {
                          setRole(r)
                          localStorage.setItem('cm-role', r)
                        }}
                      />
                    }
                  />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
                <Nav />
              </>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  )
}
