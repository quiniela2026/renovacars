// Inicialización de OneSignal Web Push
const ONESIGNAL_APP_ID = '46934893-f039-47b4-856b-c42026eb1792'

let initialized = false

export function initOneSignal() {
  if (initialized) return
  initialized = true

  window.OneSignalDeferred = window.OneSignalDeferred || []
  window.OneSignalDeferred.push(async function (OneSignal) {
    await OneSignal.init({
      appId: ONESIGNAL_APP_ID,
      safari_web_id: undefined,
      notifyButton: { enable: false },
      allowLocalhostAsSecureOrigin: true,
    })
  })

  // Cargar el SDK de OneSignal dinámicamente
  if (!document.getElementById('onesignal-sdk')) {
    const script = document.createElement('script')
    script.id = 'onesignal-sdk'
    script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js'
    script.defer = true
    document.head.appendChild(script)
  }
}

// Vincula el usuario logueado de Supabase con OneSignal usando su user.id como external_id
export async function loginOneSignal(userId) {
  if (!window.OneSignalDeferred) return
  window.OneSignalDeferred.push(async function (OneSignal) {
    try {
      await OneSignal.login(userId)
    } catch (e) {
      console.error('OneSignal login error', e)
    }
  })
}

export async function logoutOneSignal() {
  if (!window.OneSignalDeferred) return
  window.OneSignalDeferred.push(async function (OneSignal) {
    try {
      await OneSignal.logout()
    } catch (e) {
      console.error('OneSignal logout error', e)
    }
  })
}

// Pide permiso de notificaciones al usuario (debe llamarse tras una interacción, ej: click)
export async function requestNotificationPermission() {
  if (!window.OneSignalDeferred) return
  window.OneSignalDeferred.push(async function (OneSignal) {
    try {
      await OneSignal.Notifications.requestPermission()
    } catch (e) {
      console.error('OneSignal permission error', e)
    }
  })
}
