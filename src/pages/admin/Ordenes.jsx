import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { ESTADOS, SERVICIOS, getEstadoColor, getEstadoEmoji } from '../../lib/estados'
import { notificarCambioEstado } from '../../lib/notificaciones'

export default function Ordenes() {
  const [ordenes, setOrdenes] = useState([])
  const [vehiculos, setVehiculos] = useState([])
  const [loading, setLoading] = useState(true)
  const [modo, setModo] = useState('lista')
  const [form, setForm] = useState({ vehiculo_id: '', servicio: '', precio: '', observaciones: '' })
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [filtro, setFiltro] = useState('activos')
  const [actualizando, setActualizando] = useState(null)

  useEffect(() => { load() }, [])

  async function load() {
    const [{ data: ords }, { data: vehs }] = await Promise.all([
      supabase.from('ordenes').select('*, vehiculos(id,placa,marca,modelo,cliente_id), profiles(nombre,telefono)').order('fecha_ingreso', { ascending: false }),
      supabase.from('vehiculos').select('id,placa,marca,modelo,cliente_id,profiles(id,nombre)'),
    ])
    setOrdenes(ords || [])
    setVehiculos(vehs || [])
    setLoading(false)
  }

  async function handleCrear(e) {
    e.preventDefault()
    setError('')
    if (!form.vehiculo_id || !form.servicio) { setError('Selecciona vehículo y servicio'); return }
    setGuardando(true)
    const veh = vehiculos.find(v => v.id === form.vehiculo_id)
    const servInfo = SERVICIOS.find(s => s.nombre === form.servicio)
    const clienteId = veh?.profiles?.id || veh?.cliente_id
    const { error: err, data: nueva } = await supabase.from('ordenes').insert({
      vehiculo_id: form.vehiculo_id,
      cliente_id: clienteId,
      servicio: form.servicio,
      precio: form.precio ? parseFloat(form.precio) : null,
      observaciones: form.observaciones || null,
      estado: 'Recibido',
    }).select().single()
    if (!err && nueva && servInfo && clienteId) {
      await supabase.from('puntos').insert({ cliente_id: clienteId, orden_id: nueva.id, puntos: servInfo.puntos, concepto: form.servicio })
    }
    setGuardando(false)
    if (err) { setError(err.message); return }
    setModo('lista'); setFiltro('activos')
    setForm({ vehiculo_id: '', servicio: '', precio: '', observaciones: '' })
    load()
  }

  async function cambiarEstado(ordenId, nuevoEstado) {
    setActualizando(ordenId)
    await supabase.from('ordenes').update({ estado: nuevoEstado }).eq('id', ordenId)
    const orden = ordenes.find(o => o.id === ordenId)
    setOrdenes(prev => prev.map(o => o.id === ordenId ? { ...o, estado: nuevoEstado } : o))
    setActualizando(null)
    if (orden?.cliente_id && orden?.vehiculos?.placa) {
      notificarCambioEstado(orden.cliente_id, orden.vehiculos.placa, nuevoEstado)
    }
  }

  const filtradas = ordenes.filter(o => {
    if (filtro === 'activos') return o.estado !== 'Entregado'
    if (filtro === 'entregados') return o.estado === 'Entregado'
    return o.estado === filtro
  })

  if (loading) return <div className="page"><div className="loader" /></div>

  return (
    <div className="page">
      <div className="flex-b mb-16">
        <div className="sec-title" style={{ marginBottom: 0 }}>Órdenes <span>({ordenes.length})</span></div>
        <button className="btn-p btn-sm" style={{ width: 'auto' }} onClick={() => { setModo(modo === 'nuevo' ? 'lista' : 'nuevo'); setError('') }}>
          {modo === 'nuevo' ? '← Volver' : '+ Nueva orden'}
        </button>
      </div>

      {modo === 'nuevo' && (
        <div className="card mb-16">
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Nueva orden de servicio</div>
          <form onSubmit={handleCrear}>
            <div className="form-group">
              <label className="form-label">Vehículo *</label>
              <select value={form.vehiculo_id} onChange={e => setForm({ ...form, vehiculo_id: e.target.value })} required>
                <option value="">Selecciona un vehículo</option>
                {vehiculos.map(v => <option key={v.id} value={v.id}>{v.placa} — {v.marca} {v.modelo} ({v.profiles?.nombre})</option>)}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Servicio *</label>
                <select value={form.servicio} onChange={e => setForm({ ...form, servicio: e.target.value })} required>
                  <option value="">Selecciona servicio</option>
                  {SERVICIOS.map(s => <option key={s.nombre} value={s.nombre}>{s.nombre} (+{s.puntos} pts)</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Precio ($)</label>
                <input type="number" placeholder="150000" value={form.precio} onChange={e => setForm({ ...form, precio: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Observaciones</label>
              <textarea rows={2} placeholder="Rayones en puerta derecha..." value={form.observaciones} onChange={e => setForm({ ...form, observaciones: e.target.value })} style={{ resize: 'vertical' }} />
            </div>
            {error && <div className="form-error">{error}</div>}
            <button type="submit" className="btn-p mt-12" disabled={guardando}>{guardando ? 'Creando...' : 'Crear orden'}</button>
          </form>
        </div>
      )}

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        {[{ k: 'activos', l: `Activos (${ordenes.filter(o => o.estado !== 'Entregado').length})` },
          { k: 'entregados', l: `Entregados (${ordenes.filter(o => o.estado === 'Entregado').length})` }
        ].map(f => (
          <button key={f.k} onClick={() => setFiltro(f.k)} style={{
            background: filtro === f.k ? 'var(--azul)' : 'var(--bg3)',
            color: filtro === f.k ? '#fff' : 'var(--text2)',
            border: '1px solid var(--border)', borderRadius: 8, padding: '6px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer'
          }}>{f.l}</button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtradas.length === 0 && <div className="text-m" style={{ textAlign: 'center', padding: 32 }}>No hay órdenes en este filtro</div>}
        {filtradas.map(orden => (
          <div key={orden.id} className="card">
            <div className="flex-b mb-8">
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{orden.vehiculos?.placa} — {orden.vehiculos?.marca} {orden.vehiculos?.modelo}</div>
                <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>
                  {orden.profiles?.nombre} · {orden.servicio}{orden.precio && ` · $${orden.precio.toLocaleString('es-CO')}`}
                </div>
              </div>
              <span className="badge" style={{ background: `${getEstadoColor(orden.estado)}22`, color: getEstadoColor(orden.estado) }}>
                {getEstadoEmoji(orden.estado)} {orden.estado}
              </span>
            </div>
            {orden.observaciones && (
              <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 10, padding: '8px 10px', background: 'var(--bg3)', borderRadius: 6 }}>
                📝 {orden.observaciones}
              </div>
            )}
            {orden.estado !== 'Entregado' && (
              <div>
                <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 6 }}>Cambiar estado:</div>
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                  {ESTADOS.map(e => (
                    <button key={e.key} onClick={() => cambiarEstado(orden.id, e.key)}
                      disabled={actualizando === orden.id || orden.estado === e.key}
                      style={{
                        background: orden.estado === e.key ? 'var(--azul)' : 'var(--bg3)',
                        color: orden.estado === e.key ? '#fff' : 'var(--text2)',
                        border: '1px solid var(--border)', borderRadius: 6,
                        padding: '4px 9px', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                        opacity: actualizando === orden.id ? 0.5 : 1,
                      }}>
                      {e.emoji} {e.key}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 10 }}>
              {new Date(orden.fecha_ingreso).toLocaleString('es-CO')}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
