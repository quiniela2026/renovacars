import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/AuthContext'
import { ESTADOS, getEstadoColor, getEstadoEmoji, getEstadoIndex } from '../../lib/estados'
import { requestNotificationPermission } from '../../lib/onesignal'

export default function MiAuto() {
  const { user, profile } = useAuth()
  const [vehiculos, setVehiculos] = useState([])
  const [ordenes, setOrdenes] = useState([])
  const [loading, setLoading] = useState(true)
  const [activo, setActivo] = useState(null)

  useEffect(() => {
    async function load() {
      const [{ data: vehs }, { data: ords }] = await Promise.all([
        supabase.from('vehiculos').select('*').eq('cliente_id', user.id),
        supabase.from('ordenes').select('*').eq('cliente_id', user.id).order('fecha_ingreso', { ascending: false }),
      ])
      setVehiculos(vehs || [])
      setOrdenes(ords || [])
      if (vehs?.length > 0) setActivo(vehs[0].id)
      setLoading(false)
    }
    load()

    // Tiempo real — actualiza estado automáticamente
    const ch = supabase.channel('ordenes-live')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'ordenes' }, payload => {
        setOrdenes(prev => prev.map(o => o.id === payload.new.id ? { ...o, ...payload.new } : o))
      })
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [user.id])

  if (loading) return <div className="page"><div className="loader" /></div>

  const ordenActiva = ordenes.find(o => o.vehiculo_id === activo && o.estado !== 'Entregado')
  const historial = ordenes.filter(o => o.vehiculo_id === activo && o.estado === 'Entregado')
  const veh = vehiculos.find(v => v.id === activo)
  const estadoIdx = ordenActiva ? getEstadoIndex(ordenActiva.estado) : -1

  return (
    <div className="page">
      <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 2 }}>Bienvenido</div>
      <div className="sec-title">{profile?.nombre} <span>👋</span></div>

      <button onClick={() => requestNotificationPermission()} style={{
        background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text2)',
        borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 600, marginBottom: 16, cursor: 'pointer'
      }}>
        🔔 Activar notificaciones de mi vehículo
      </button>

      {vehiculos.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🚗</div>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Sin vehículos registrados</div>
          <div className="text-m">El negocio registrará tu vehículo pronto</div>
        </div>
      ) : (
        <>
          {vehiculos.length > 1 && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              {vehiculos.map(v => (
                <button key={v.id} onClick={() => setActivo(v.id)} style={{
                  background: activo === v.id ? 'var(--azul)' : 'var(--bg3)',
                  color: activo === v.id ? '#fff' : 'var(--text2)',
                  border: '1px solid var(--border)', borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer'
                }}>{v.placa}</button>
              ))}
            </div>
          )}

          {/* Card vehículo */}
          {veh && (
            <div className="card mb-16" style={{ background: 'linear-gradient(135deg,rgba(0,102,204,.15) 0%,transparent 60%)' }}>
              <div className="flex-g">
                <div style={{ fontSize: 44 }}>🚗</div>
                <div>
                  <div style={{ fontFamily: 'var(--font2)', fontSize: 24, fontWeight: 700 }}>{veh.placa}</div>
                  <div style={{ fontSize: 15, color: 'var(--text2)' }}>{veh.marca} {veh.modelo} {veh.anio && `(${veh.anio})`}</div>
                  {veh.color && <div style={{ fontSize: 13, color: 'var(--text2)' }}>Color: {veh.color}</div>}
                  {veh.kilometraje && <div style={{ fontSize: 13, color: 'var(--text2)' }}>{veh.kilometraje.toLocaleString()} km</div>}
                </div>
              </div>
            </div>
          )}

          {/* Orden activa */}
          {ordenActiva ? (
            <div className="card mb-16" style={{ borderColor: 'rgba(0,102,204,.4)' }}>
              <div style={{ fontSize: 13, color: 'var(--azul2)', fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                🔧 En servicio — actualización en vivo
              </div>
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{ordenActiva.servicio}</div>
              {ordenActiva.observaciones && (
                <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 12 }}>📝 {ordenActiva.observaciones}</div>
              )}

              {/* Barra progreso */}
              <div className="prog-bar">
                {ESTADOS.map((e, i) => (
                  <div key={e.key} className={`prog-paso ${i < estadoIdx ? 'done' : i === estadoIdx ? 'act' : ''}`} />
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                {ESTADOS.map((e, i) => (
                  <div key={e.key} style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ fontSize: 13 }}>{i <= estadoIdx ? e.emoji : '⬜'}</div>
                    <div style={{ fontSize: 8, color: i === estadoIdx ? 'var(--azul2)' : i < estadoIdx ? 'var(--verde)' : 'var(--text2)', marginTop: 1, fontWeight: i === estadoIdx ? 700 : 400 }}>
                      {e.key}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
                <div style={{ fontSize: 13, color: 'var(--text2)' }}>
                  Estado: <strong style={{ color: 'var(--azul2)' }}>{ordenActiva.estado}</strong>
                </div>
                {ordenActiva.precio && (
                  <div style={{ fontSize: 13, color: 'var(--text2)' }}>
                    Valor: <strong style={{ color: 'var(--text)' }}>${ordenActiva.precio.toLocaleString('es-CO')}</strong>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="alert alert-ok mb-16">✅ Tu vehículo no está en servicio actualmente</div>
          )}

          {/* Historial */}
          {historial.length > 0 && (
            <>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Historial</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {historial.map(o => (
                  <div key={o.id} className="card">
                    <div className="flex-b">
                      <div>
                        <div style={{ fontWeight: 600 }}>{o.servicio}</div>
                        <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>
                          {new Date(o.fecha_ingreso).toLocaleDateString('es-CO')}{o.precio && ` · $${o.precio.toLocaleString('es-CO')}`}
                        </div>
                      </div>
                      <span className="badge b-gray">Entregado ✓</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
