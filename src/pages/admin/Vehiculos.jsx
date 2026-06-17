import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Vehiculos() {
  const [vehiculos, setVehiculos] = useState([])
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [modo, setModo] = useState('lista')
  const [form, setForm] = useState({ cliente_id: '', placa: '', marca: '', modelo: '', anio: '', color: '', kilometraje: '' })
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [buscar, setBuscar] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    const [{ data: vehs }, { data: clts }] = await Promise.all([
      supabase.from('vehiculos').select('*, profiles(nombre,email)').order('created_at', { ascending: false }),
      supabase.from('profiles').select('id,nombre,email').eq('rol', 'cliente').order('nombre'),
    ])
    setVehiculos(vehs || [])
    setClientes(clts || [])
    setLoading(false)
  }

  async function handleCrear(e) {
    e.preventDefault()
    setError('')
    if (!form.cliente_id || !form.placa || !form.marca || !form.modelo) { setError('Completa los campos obligatorios'); return }
    setGuardando(true)
    const { error: err } = await supabase.from('vehiculos').insert({
      cliente_id: form.cliente_id,
      placa: form.placa.toUpperCase(),
      marca: form.marca,
      modelo: form.modelo,
      anio: form.anio ? parseInt(form.anio) : null,
      color: form.color || null,
      kilometraje: form.kilometraje ? parseInt(form.kilometraje) : null,
    })
    setGuardando(false)
    if (err) { setError(err.message); return }
    setModo('lista')
    setForm({ cliente_id: '', placa: '', marca: '', modelo: '', anio: '', color: '', kilometraje: '' })
    load()
  }

  const filtrados = vehiculos.filter(v =>
    v.placa?.toLowerCase().includes(buscar.toLowerCase()) ||
    v.marca?.toLowerCase().includes(buscar.toLowerCase()) ||
    v.modelo?.toLowerCase().includes(buscar.toLowerCase()) ||
    v.profiles?.nombre?.toLowerCase().includes(buscar.toLowerCase())
  )

  if (loading) return <div className="page"><div className="loader" /></div>

  return (
    <div className="page">
      <div className="flex-b mb-16">
        <div className="sec-title" style={{ marginBottom: 0 }}>Vehículos <span>({vehiculos.length})</span></div>
        <button className="btn-p btn-sm" style={{ width: 'auto' }} onClick={() => { setModo(modo === 'nuevo' ? 'lista' : 'nuevo'); setError('') }}>
          {modo === 'nuevo' ? '← Volver' : '+ Nuevo vehículo'}
        </button>
      </div>

      {modo === 'nuevo' && (
        <div className="card mb-16">
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Registrar vehículo</div>
          <form onSubmit={handleCrear}>
            <div className="form-group">
              <label className="form-label">Cliente *</label>
              <select value={form.cliente_id} onChange={e => setForm({ ...form, cliente_id: e.target.value })} required>
                <option value="">Selecciona un cliente</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre} — {c.email}</option>)}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Placa *</label>
                <input type="text" placeholder="ABC123" value={form.placa} onChange={e => setForm({ ...form, placa: e.target.value.toUpperCase() })} required style={{ textTransform: 'uppercase' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Color</label>
                <input type="text" placeholder="Blanco" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Marca *</label>
                <input type="text" placeholder="Toyota" value={form.marca} onChange={e => setForm({ ...form, marca: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Modelo *</label>
                <input type="text" placeholder="Corolla" value={form.modelo} onChange={e => setForm({ ...form, modelo: e.target.value })} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Año</label>
                <input type="number" placeholder="2020" min="1990" max="2030" value={form.anio} onChange={e => setForm({ ...form, anio: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Kilometraje</label>
                <input type="number" placeholder="45000" value={form.kilometraje} onChange={e => setForm({ ...form, kilometraje: e.target.value })} />
              </div>
            </div>
            {error && <div className="form-error">{error}</div>}
            <button type="submit" className="btn-p mt-12" disabled={guardando}>{guardando ? 'Guardando...' : 'Registrar vehículo'}</button>
          </form>
        </div>
      )}

      <input type="text" placeholder="🔍 Buscar por placa, marca, modelo o cliente..." value={buscar} onChange={e => setBuscar(e.target.value)} className="mb-16" />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtrados.length === 0 && <div className="text-m" style={{ textAlign: 'center', padding: 32 }}>No hay vehículos registrados</div>}
        {filtrados.map(v => (
          <div key={v.id} className="card">
            <div className="flex-b">
              <div>
                <div className="flex-g">
                  <span style={{ fontSize: 22 }}>🚗</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{v.placa}</div>
                    <div style={{ fontSize: 14 }}>{v.marca} {v.modelo} {v.anio && `(${v.anio})`}</div>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 6 }}>
                  {v.profiles?.nombre}{v.color && ` · ${v.color}`}{v.kilometraje && ` · ${v.kilometraje.toLocaleString()} km`}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
