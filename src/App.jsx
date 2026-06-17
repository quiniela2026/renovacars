import { useState } from 'react'
import { AuthProvider, useAuth } from './lib/AuthContext'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/admin/Dashboard'
import Clientes from './pages/admin/Clientes'
import Vehiculos from './pages/admin/Vehiculos'
import Ordenes from './pages/admin/Ordenes'
import MiAuto from './pages/cliente/MiAuto'
import MisPuntos from './pages/cliente/MisPuntos'

const Ico = ({ d }) => <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d={d}/></svg>
const IHome  = () => <Ico d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
const IUsers = () => <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
const ICar   = () => <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M5 17H3a2 2 0 01-2-2V9a2 2 0 012-2h14l4 4v4a2 2 0 01-2 2h-2M5 17a2 2 0 104 0M5 17a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"/></svg>
const IOrden = () => <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
const IStar  = () => <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>

function AdminApp() {
  const [tab, setTab] = useState('dashboard')
  const { signOut } = useAuth()
  const tabs = [
    { id: 'dashboard', label: 'Inicio',    icon: <IHome /> },
    { id: 'clientes',  label: 'Clientes',  icon: <IUsers /> },
    { id: 'vehiculos', label: 'Vehículos', icon: <ICar /> },
    { id: 'ordenes',   label: 'Órdenes',   icon: <IOrden /> },
  ]
  return (
    <>
      <nav className="nav">
        <div className="nav-inner">
          <div className="nav-logo">RenovaCars <span>Admin</span></div>
          {tabs.map(t => <button key={t.id} className={`nav-btn ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>{t.label}</button>)}
          <button className="nav-btn" onClick={signOut} style={{ marginLeft: 'auto' }}>Salir</button>
        </div>
      </nav>
      {tab === 'dashboard' && <Dashboard />}
      {tab === 'clientes'  && <Clientes />}
      {tab === 'vehiculos' && <Vehiculos />}
      {tab === 'ordenes'   && <Ordenes />}
      <div className="tabbar">
        {tabs.map(t => <button key={t.id} className={`tab-btn ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>{t.icon}{t.label}</button>)}
      </div>
    </>
  )
}

function ClienteApp() {
  const [tab, setTab] = useState('auto')
  const { signOut } = useAuth()
  const tabs = [
    { id: 'auto',   label: 'Mi Auto', icon: <ICar /> },
    { id: 'puntos', label: 'Puntos',  icon: <IStar /> },
  ]
  return (
    <>
      <nav className="nav">
        <div className="nav-inner">
          <div className="nav-logo">RenovaCars</div>
          {tabs.map(t => <button key={t.id} className={`nav-btn ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>{t.label}</button>)}
          <button className="nav-btn" onClick={signOut} style={{ marginLeft: 'auto' }}>Salir</button>
        </div>
      </nav>
      {tab === 'auto'   && <MiAuto />}
      {tab === 'puntos' && <MisPuntos />}
      <div className="tabbar">
        {tabs.map(t => <button key={t.id} className={`tab-btn ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>{t.icon}{t.label}</button>)}
      </div>
    </>
  )
}

function AppInner() {
  const { user, profile, loading } = useAuth()
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, background: 'radial-gradient(ellipse at top,#0d1f3c 0%,#0a0f1e 60%)' }}>
      <div style={{ fontSize: 52 }}>🚗</div>
      <div style={{ fontFamily: 'var(--font2)', fontSize: 28, fontWeight: 700, color: '#3399ff' }}>RenovaCars</div>
      <div className="loader" />
    </div>
  )
  if (!user) return <AuthPage />
  if (profile?.rol === 'admin') return <AdminApp />
  return <ClienteApp />
}

export default function App() {
  return <AuthProvider><AppInner /></AuthProvider>
}
