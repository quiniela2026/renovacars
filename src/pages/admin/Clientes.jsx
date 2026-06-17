import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/AuthContext'

export default function Clientes() {
  const { signUp } = useAuth()
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [modo, setModo] = useState('lista')
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', password: '' })
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [buscar, setBuscar] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase.from('profiles').select('id,nombre,email,telefono,created_at').eq('rol', 'cliente').order('created_at', { ascending: false })
    setClientes(data || [])
    setLoading(false)
  }

  async function handleCrear(e) {
    e.preventDefault()
    setError(''); setSuccess('')
    if (!form.nombre || !form.email || !form.password) { setError('Completa nombre, correo y contraseña'); return }
    setGuardando(true)
    try {
      await signUp(form.email, form.password, form.nombre, 'cliente')
      if (form.telefono) {
        const { data } = await supabase.from('profiles').select('id').eq('email', form.email).single()
        if (data) await supabase.from('profiles').update({ telefono: form.telefono }).eq('id', data.id)
      }
      setSuccess(`✅ Cliente ${form.nombre} creado.\nAcceso: ${form.email} / ${form.password}`)
      setForm({ nombre: '', email: '', telefono: '', password: '' })
      load()
    } catch (err) {
      setError(err.message === 'User already registered' ? 'Este correo ya está registrado' : err.message)
    } finally { setGuardando(false) }
  }

  const filtrados = clientes.filter(c =>
    c.nombre?.toLowerCase().includes(buscar.toLowerCase()) ||
    c.email?.toLowerCase().includes(buscar.toLowerCase()) ||
    c.telefono?.includes(buscar)
  )

  if (loading) return <div className="page"><div className="loader" /></div>

  return (
    <div className="page">
      <div className="flex-b mb-16">
        <div className="sec-title" style={{ marginBottom: 0 }}>Clientes <span>({clientes.length})</span></div>
        <button className="btn-p btn-sm" style={{ width: 'auto' }} onClick={() => { setModo(modo === 'nuevo' ? 'lista' : 'nuevo'); setError(''); setSuccess('') }}>
          {modo === 'nuevo' ? '← Volver' : '+ Nuevo cliente'}
        </button>
      </div>

      {modo === 'nuevo' && (
        <div className="card mb-16">
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Crear cliente</div>
          <form onSubmit={handleCrear}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Nombre completo *</label>
                <input type="text" placeholder="Juan Pérez" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Teléfono</label>
                <input type="tel" placeholder="300 123 4567" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Correo *</label>
                <input type="email" placeholder="cliente@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Contraseña temporal *</label>
                <input type="text" placeholder="Ej: Renova123" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
              </div>
            </div>
            {error && <div className="form-error">{error}</div>}
            {success && <div style={{ fontSize: 13, color: 'var(--verde)', marginTop: 10, padding: 12, background: 'rgba(0,200,83,.1)', borderRadius: 8, whiteSpace: 'pre-line' }}>{success}</div>}
            <button type="submit" className="btn-p mt-12" disabled={guardando}>{guardando ? 'Creando...' : 'Crear cliente'}</button>
          </form>
        </div>
      )}

      <input type="text" placeholder="🔍 Buscar por nombre, correo o teléfono..." value={buscar} onChange={e => setBuscar(e.target.value)} className="mb-16" />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtrados.length === 0 && <div className="text-m" style={{ textAlign: 'center', padding: 32 }}>No hay clientes registrados</div>}
        {filtrados.map(c => (
          <div key={c.id} className="card">
            <div className="flex-b">
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{c.nombre}</div>
                <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>{c.email}{c.telefono && ` · ${c.telefono}`}</div>
                <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 3 }}>Desde: {new Date(c.created_at).toLocaleDateString('es-CO')}</div>
              </div>
              <span className="badge b-azul">cliente</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
