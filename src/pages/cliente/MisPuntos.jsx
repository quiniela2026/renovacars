import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/AuthContext'
import { BENEFICIOS } from '../../lib/estados'

export default function MisPuntos() {
  const { user } = useAuth()
  const [puntos, setPuntos] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('puntos').select('*').eq('cliente_id', user.id).order('created_at', { ascending: false })
      setPuntos(data || [])
      setTotal((data || []).reduce((s, p) => s + p.puntos, 0))
      setLoading(false)
    }
    load()
  }, [user.id])

  if (loading) return <div className="page"><div className="loader" /></div>

  const beneficioActual = [...BENEFICIOS].reverse().find(b => total >= b.puntos)
  const proximo = BENEFICIOS.find(b => total < b.puntos)

  return (
    <div className="page">
      <div className="sec-title">Mis <span>Puntos</span></div>

      <div className="card mb-16" style={{ textAlign: 'center', background: 'linear-gradient(135deg,rgba(255,214,0,.1) 0%,transparent 60%)', borderColor: 'rgba(255,214,0,.3)' }}>
        <div style={{ fontFamily: 'var(--font2)', fontSize: 64, color: 'var(--oro)', lineHeight: 1 }}>{total}</div>
        <div style={{ fontSize: 16, color: 'var(--text2)', marginTop: 4 }}>puntos acumulados</div>
        {beneficioActual && (
          <div style={{ marginTop: 12, padding: '8px 16px', background: 'rgba(255,214,0,.1)', borderRadius: 8, display: 'inline-block', fontSize: 14, color: 'var(--oro)' }}>
            {beneficioActual.emoji} Tienes disponible: {beneficioActual.descripcion}
          </div>
        )}
      </div>

      {proximo && (
        <div className="card mb-16">
          <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 8 }}>
            Próximo beneficio: <strong style={{ color: 'var(--text)' }}>{proximo.emoji} {proximo.descripcion}</strong>
          </div>
          <div style={{ height: 8, background: 'var(--bg3)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'var(--oro)', borderRadius: 4, width: `${Math.min((total/proximo.puntos)*100,100)}%`, transition: 'width .5s ease' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 12, color: 'var(--text2)' }}>
            <span>{total} pts</span><span>Faltan {proximo.puntos - total} pts</span><span>{proximo.puntos} pts</span>
          </div>
        </div>
      )}

      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Beneficios</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
        {BENEFICIOS.map(b => (
          <div key={b.puntos} className="card" style={{ borderColor: total >= b.puntos ? 'rgba(255,214,0,.4)' : 'var(--border)', opacity: total >= b.puntos ? 1 : 0.6 }}>
            <div className="flex-b">
              <div className="flex-g">
                <span style={{ fontSize: 24 }}>{b.emoji}</span>
                <div>
                  <div style={{ fontWeight: 600 }}>{b.descripcion}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)' }}>{b.puntos} puntos</div>
                </div>
              </div>
              {total >= b.puntos
                ? <span className="badge b-oro">✓ Disponible</span>
                : <span className="badge b-gray">Faltan {b.puntos - total} pts</span>
              }
            </div>
          </div>
        ))}
      </div>

      {puntos.length > 0 && (
        <>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Historial de puntos</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {puntos.map(p => (
              <div key={p.id} className="card" style={{ padding: '12px 16px' }}>
                <div className="flex-b">
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{p.concepto}</div>
                    <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>{new Date(p.created_at).toLocaleDateString('es-CO')}</div>
                  </div>
                  <span className="puntos-pill">+{p.puntos} pts</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {puntos.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 32, color: 'var(--text2)' }}>
          Aún no tienes puntos. ¡Tu primer servicio los genera automáticamente!
        </div>
      )}
    </div>
  )
}
