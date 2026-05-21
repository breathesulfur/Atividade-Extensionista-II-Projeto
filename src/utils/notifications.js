/**
 * Sistema de notificações global
 * Permite exibir notificações customizadas em qualquer componente
 */

let notificationCallback = null

/**
 * Registra a função callback para exibir notificações
 * @param {Function} callback - Função que recebe (message, type, duration)
 */
export const setNotificationCallback = (callback) => {
  notificationCallback = callback
}

/**
 * Exibe uma notificação
 * @param {string|Object} message - Mensagem ou objeto com {title, text}
 * @param {string} type - Tipo: 'success', 'error', 'warning', 'info', 'achievement'
 * @param {number} duration - Duração em ms (0 para não fechar automaticamente)
 */
export const showNotification = (message, type = 'info', duration = 4000) => {
  if (notificationCallback) {
    notificationCallback(message, type, duration)
  } else {
    // Fallback para alert se o sistema de notificações não estiver inicializado
    console.warn('Sistema de notificações não inicializado. Usando alert como fallback.')
    if (typeof message === 'string') {
      alert(message)
    } else {
      alert(message.title || message.text || 'Notificação')
    }
  }
}

/**
 * Helpers para tipos específicos de notificação
 */
export const notifySuccess = (message, duration = 4000) => {
  showNotification(message, 'success', duration)
}

export const notifyError = (message, duration = 5000) => {
  showNotification(message, 'error', duration)
}

export const notifyWarning = (message, duration = 4000) => {
  showNotification(message, 'warning', duration)
}

export const notifyInfo = (message, duration = 4000) => {
  showNotification(message, 'info', duration)
}

export const notifyAchievement = (title, description, duration = 5000) => {
  showNotification({ title, text: description }, 'achievement', duration)
}

/**
 * Notifica o usuário sobre essências ganhas
 * @param {number} essenceAmount - Quantidade de essências ganhas
 * @param {string} action - Ação realizada (ex: "Criar postagem", "Comentar")
 * @param {number} duration - Duração em ms
 */
export const notifyEssenceGained = (essenceAmount, action, duration = 4000) => {
  const message = `🔮 ${action}: +${essenceAmount} Essências`
  showNotification(message, 'essence', duration)
}
