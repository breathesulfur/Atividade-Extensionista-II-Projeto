/**
 * Utilitários para gerenciar dados no localStorage
 */

const STORAGE_KEYS = {
  USER: 'inclusivchat_user',
  POSTS: 'inclusivchat_posts',
  GROUPS: 'inclusivchat_groups',
  MESSAGES: 'inclusivchat_messages'
}

/**
 * Obtém dados do localStorage
 * @param {string} key - Chave do storage
 * @returns {any} - Dados armazenados ou null
 */
export const getStorage = (key) => {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error(`Erro ao ler ${key} do localStorage:`, error)
    return null
  }
}

/**
 * Salva dados no localStorage
 * @param {string} key - Chave do storage
 * @param {any} data - Dados a serem salvos
 */
export const setStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error(`Erro ao salvar ${key} no localStorage:`, error)
  }
}

/**
 * Obtém todas as postagens
 * @returns {Array} - Array de postagens
 */
export const getPosts = () => {
  return getStorage(STORAGE_KEYS.POSTS) || []
}

/**
 * Salva postagens
 * @param {Array} posts - Array de postagens
 */
export const savePosts = (posts) => {
  setStorage(STORAGE_KEYS.POSTS, posts)
}

/**
 * Obtém todos os grupos
 * @returns {Array} - Array de grupos
 */
export const getGroups = () => {
  return getStorage(STORAGE_KEYS.GROUPS) || []
}

/**
 * Salva grupos
 * @param {Array} groups - Array de grupos
 */
export const saveGroups = (groups) => {
  setStorage(STORAGE_KEYS.GROUPS, groups)
}

/**
 * Obtém mensagens de um grupo
 * @param {string} groupId - ID do grupo
 * @returns {Array} - Array de mensagens
 */
export const getGroupMessages = (groupId) => {
  const allMessages = getStorage(STORAGE_KEYS.MESSAGES) || {}
  return allMessages[groupId] || []
}

/**
 * Salva mensagens de um grupo
 * @param {string} groupId - ID do grupo
 * @param {Array} messages - Array de mensagens
 */
export const saveGroupMessages = (groupId, messages) => {
  const allMessages = getStorage(STORAGE_KEYS.MESSAGES) || {}
  allMessages[groupId] = messages
  setStorage(STORAGE_KEYS.MESSAGES, allMessages)
}

/**
 * Atualiza dados do usuário
 * @param {Object} userData - Dados do usuário
 */
export const updateUser = (userData) => {
  setStorage(STORAGE_KEYS.USER, userData)
}
