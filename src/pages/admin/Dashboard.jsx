import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [enProceso, setEnProceso] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: clientes }, { data: vehiculos }, { data: ordenes }] = await Promise.all([
        supabase.from('profiles').select('id').eq('rol', 'cliente'),
        supabase.from('vehiculos').select('id'),
        supabase.from('ordenes').select('*, vehiculos(placa,marca,modelo), profiles(nombre)').order('fecha_ingreso', { ascending: false }),
      ])
      const activas = ordenes?.filter(o => o.estado !== 'Entregado') || []
      const now = new Date()
      const ingresosMes = ordenes?.filter(o => {
        const d = new Date(o.fecha_ingreso)
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      }).reduce((s, o) => s + (o.precio || 0), 0) || 0
      setStats({ clientes: clientes?.length || 0, vehiculos: vehiculos?.length || 0, enProceso: activas.length, ingresosMes })
      setEnProceso(activas.slice(0, 6))
      setLoading(false)
    }
    load()
  }, [])

  const colores = { Recibido: '#7986cb', Lavado: '#3399ff', Descontaminacion: '#ff6d00', Pulitura: '#ffd600', Proteccion: '#ce93d8', Listo: '#00c853', Entregado: '#666' }

  if (loading) return <div className="page"><div className="loader" /></div>

  return (
    <div className="page">
      <div className="sec-title">Dashboard <span>Admin</span></div>
      <div className="grid2 mb-16">
        <div className="card stat-card"><div className="stat-n">{stats.clientes}</div><div className="stat-l">Clientes registrados</div></div>
        <div className="card stat-card"><div className="stat-n">{stats.vehiculos}</div><div className="stat-l">Vehículos</div></div>
        <div className="card stat-card"><div className="stat-n" style={{ color: 'var(--oro)' }}>{stats.enProceso}</div><div className="stat-l">En proceso ahora</div></div>
        <div className="card stat-card"><div className="stat-n" style={{ color: 'var(--verde)', fontSize: 24 }}>${stats.ingresosMes.toLocaleString('es-CO')}</div><div className="stat-l">Ingresos este mes</div></div>
      </div>

      {enProceso.length > 0 && (
        <>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Vehículos en proceso</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {enProceso.map(o => (
              <div key={o.id} className="card">
                <div className="flex-b">
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{o.vehiculos?.placa} — {o.vehiculos?.marca} {o.vehiculos?.modelo}</div>
                    <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>{o.profiles?.nombre} · {o.servicio}</div>
                    <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{new Date(o.fecha_ingreso).toLocaleDateString('es-CO')}</div>
                  </div>
                  <span className="badge" style={{ background: `${colores[o.estado]}22`, color: colores[o.estado] }}>{o.estado}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {enProceso.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 32, color: 'var(--text2)' }}>
          No hay vehículos en proceso actualmente
        </div>
      )}
    </div>
  )
}
