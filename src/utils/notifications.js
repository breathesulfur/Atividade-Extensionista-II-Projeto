let notificationCallback = null

export const setNotificationCallback = (callback) => {
  notificationCallback = callback
}

export const showNotification = (message, type = 'info', duration = 4000) => {
  if (notificationCallback) {
    notificationCallback(message, type, duration)
  } else {
    console.warn('Sistema de notificações não inicializado.')
    if (typeof message === 'string') {
      alert(message)
    } else {
      alert(message.title || message.text || 'Notificação')
    }
  }
}

export const notifySuccess = (message, duration = 4000) =>
  showNotification(message, 'success', duration)

export const notifyError = (message, duration = 5000) =>
  showNotification(message, 'error', duration)

export const notifyWarning = (message, duration = 4000) =>
  showNotification(message, 'warning', duration)

export const notifyInfo = (message, duration = 4000) =>
  showNotification(message, 'info', duration)

export const notifyAchievement = (title, description, duration = 5000) =>
  showNotification({ title, text: description }, 'achievement', duration)

export const notifyEssenceGained = (essenceAmount, action, duration = 4000) => {
  showNotification(`🔮 ${action}: +${essenceAmount} Essências`, 'essence', duration)
}
