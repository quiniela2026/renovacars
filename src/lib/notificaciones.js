import { supabase } from './supabase'

// Envía una notificación push al cliente cuando cambia el estado de su orden
export async function notificarCambioEstado(clienteId, vehiculoPlaca, nuevoEstado) {
  const mensajes = {
    Recibido: `Tu ${vehiculoPlaca} fue recibido en el taller 📋`,
    Lavado: `Tu ${vehiculoPlaca} está en lavado 🚿`,
    Descontaminacion: `Tu ${vehiculoPlaca} está en descontaminación 🧪`,
    Pulitura: `Tu ${vehiculoPlaca} está en pulitura ✨`,
    Proteccion: `Tu ${vehiculoPlaca} está en protección 🛡️`,
    Listo: `¡Tu ${vehiculoPlaca} está listo para recoger! ✅`,
    Entregado: `Tu ${vehiculoPlaca} fue entregado 🏁`,
  }

  const mensaje = mensajes[nuevoEstado] || `Tu vehículo ${vehiculoPlaca} cambió de estado`

  try {
    const { data, error } = await supabase.functions.invoke('send-notification', {
      body: {
        external_id: clienteId,
        title: 'RenovaCars',
        message: mensaje,
      },
    })
    if (error) console.error('Error enviando notificación:', error)
    return { data, error }
  } catch (e) {
    console.error('Error enviando notificación:', e)
    return { data: null, error: e }
  }
}
