const STORAGE_KEYS = {
  USER: 'inclusivchat_user',
  POSTS: 'inclusivchat_posts',
  GROUPS: 'inclusivchat_groups',
  MESSAGES: 'inclusivchat_messages'
}

export const getStorage = (key) => {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error(`Erro ao ler ${key} do localStorage:`, error)
    return null
  }
}

export const setStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error(`Erro ao salvar ${key} no localStorage:`, error)
  }
}

export const getPosts = () => getStorage(STORAGE_KEYS.POSTS) || []

export const savePosts = (posts) => setStorage(STORAGE_KEYS.POSTS, posts)

export const getGroups = () => getStorage(STORAGE_KEYS.GROUPS) || []

export const saveGroups = (groups) => setStorage(STORAGE_KEYS.GROUPS, groups)

export const getGroupMessages = (groupId) => {
  const allMessages = getStorage(STORAGE_KEYS.MESSAGES) || {}
  return allMessages[groupId] || []
}

export const saveGroupMessages = (groupId, messages) => {
  const allMessages = getStorage(STORAGE_KEYS.MESSAGES) || {}
  allMessages[groupId] = messages
  setStorage(STORAGE_KEYS.MESSAGES, allMessages)
}

export const updateUser = (userData) => setStorage(STORAGE_KEYS.USER, userData)
