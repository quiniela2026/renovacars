import { useState } from 'react'
import { useAuth } from '../lib/AuthContext'

export default function AuthPage() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
    } catch (err) {
      const msgs = {
        'Invalid login credentials': 'Correo o contraseña incorrectos',
        'Email not confirmed': 'Confirma tu correo primero',
      }
      setError(msgs[err.message] || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <div style={{ fontSize: 52, marginBottom: 6 }}>🚗</div>
          <div className="auth-logo">RenovaCars</div>
          <div className="auth-sub">El historial inteligente de tu vehículo</div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Correo electrónico</label>
            <input type="email" placeholder="tucorreo@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input type="password" placeholder="Tu contraseña" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          {error && <div className="form-error">{error}</div>}
          <button type="submit" className="btn-p mt-16" disabled={loading}>
            {loading ? 'Entrando...' : 'Iniciar sesión'}
          </button>
        </form>
        <div style={{ marginTop: 20, padding: 14, background: 'var(--bg3)', borderRadius: 10, fontSize: 13, color: 'var(--text2)' }}>
          <strong style={{ color: 'var(--text)' }}>¿Primera vez?</strong><br />
          El administrador del negocio crea tu cuenta y te envía el acceso.
        </div>
      </div>
      <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'var(--text2)' }}>
        RenovaCars — Estética Automotriz Profesional
      </div>
    </div>
  )
}
