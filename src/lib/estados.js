export const ESTADOS = [
  { key: 'Recibido',         emoji: '📋', color: '#7986cb' },
  { key: 'Lavado',           emoji: '🚿', color: '#3399ff' },
  { key: 'Descontaminacion', emoji: '🧪', color: '#ff6d00' },
  { key: 'Pulitura',         emoji: '✨', color: '#ffd600' },
  { key: 'Proteccion',       emoji: '🛡️', color: '#ce93d8' },
  { key: 'Listo',            emoji: '✅', color: '#00c853' },
  { key: 'Entregado',        emoji: '🏁', color: '#666'    },
]

export const SERVICIOS = [
  { nombre: 'Lavado Premium',     puntos: 1 },
  { nombre: 'Pulitura',           puntos: 2 },
  { nombre: 'Cerámico',           puntos: 5 },
  { nombre: 'Detailing Interior', puntos: 3 },
  { nombre: 'Restauración',       puntos: 4 },
  { nombre: 'Descontaminación',   puntos: 2 },
]

export const BENEFICIOS = [
  { puntos: 3,  descripcion: '10% de descuento',  emoji: '🏷️' },
  { puntos: 5,  descripcion: 'Lavado gratis',      emoji: '🎁' },
  { puntos: 10, descripcion: 'Detailing interior', emoji: '⭐' },
]

export function getEstadoColor(estado) {
  return ESTADOS.find(e => e.key === estado)?.color || '#7986cb'
}
export function getEstadoEmoji(estado) {
  return ESTADOS.find(e => e.key === estado)?.emoji || '📋'
}
export function getEstadoIndex(estado) {
  return ESTADOS.findIndex(e => e.key === estado)
}
