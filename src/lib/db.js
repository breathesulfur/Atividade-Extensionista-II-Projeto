import { supabase } from './supabase'

// ─────────────────────────────────────────────
// Helpers de mapeamento
// ─────────────────────────────────────────────

const groupReactions = (rows) => {
  const result = {}
  for (const r of rows) {
    if (!result[r.emoji]) result[r.emoji] = []
    result[r.emoji].push(r.user_id)
  }
  return result
}

const mapProfile = (row, email) => ({
  id: row.id,
  email: email || '',
  name: row.name,
  pronoun: row.pronoun,
  bio: row.bio || '',
  city: row.city || '',
  state: row.state || '',
  avatar: row.avatar || null,
  games: row.games || [],
  platforms: row.platforms || {},
  essence: row.essence || 0,
  points: row.essence || 0,
  essencias_totais: row.essence || 0,
  essencias_disponiveis: row.essence || 0,
  badges: row.badges || [],
  joinedGroups: row.daily_essence?.joinedGroupsHistory || [],
  lastLoginDates: row.last_login_dates || [],
  lastDailyLoginEssenceDate: row.last_daily_login_essence_date || null,
  unlockedThemes: row.unlocked_themes || [],
  unlockedAvatarFrames: row.unlocked_avatar_frames || [],
  unlockedTitles: row.unlocked_titles || [],
  activeTheme: row.active_theme || null,
  activeAvatarFrame: row.active_avatar_frame || null,
  activeTitle: row.active_title || null,
  // Alias para componentes (Profile, MysticTitleSelector) que leem
  // activeMysticTitle. Sem isso, após refresh o título ativo persistido
  // não aparece selecionado na UI.
  activeMysticTitle: row.active_title || null,
  dailyEssence: row.daily_essence || {},
  hasSeenWelcome: row.has_seen_welcome || false,
  createdAt: row.created_at,
})

const toDbProfile = (user) => ({
  name: user.name,
  pronoun: user.pronoun,
  bio: user.bio || '',
  city: user.city || '',
  state: user.state || '',
  avatar: user.avatar || null,
  games: user.games || [],
  platforms: user.platforms || {},
  // Prioriza essencias_disponiveis (saldo atual após gastos/ganhos),
  // depois essence/points. Usa ?? em vez de || para aceitar 0 como valor válido.
  essence: user.essencias_disponiveis ?? user.essence ?? user.points ?? 0,
  badges: user.badges || [],
  last_login_dates: user.lastLoginDates || [],
  last_daily_login_essence_date: user.lastDailyLoginEssenceDate || null,
  unlocked_themes: user.unlockedThemes || [],
  unlocked_avatar_frames: user.unlockedAvatarFrames || [],
  unlocked_titles: user.unlockedTitles || [],
  active_theme: user.activeTheme || null,
  active_avatar_frame: user.activeAvatarFrame || null,
  active_title: user.activeTitle || null,
  daily_essence: {
    ...(user.dailyEssence || {}),
    joinedGroupsHistory: user.joinedGroups || [],
  },
  has_seen_welcome: user.hasSeenWelcome || false,
})

const mapPost = (row) => ({
  id: row.id,
  userId: row.user_id,
  userName: row.profiles?.name || 'Usuário',
  userPronoun: row.profiles?.pronoun || '',
  userAvatar: row.profiles?.avatar || null,
  userCity: row.profiles?.city || '',
  userState: row.profiles?.state || '',
  authorProfile: {
    id: row.user_id,
    name: row.profiles?.name || 'Usuário',
    pronoun: row.profiles?.pronoun || '',
    avatar: row.profiles?.avatar || null,
    activeAvatarFrame: row.profiles?.active_avatar_frame || null,
    unlockedAvatarFrames: row.profiles?.unlocked_avatar_frames || [],
  },
  content: row.content,
  likes: (row.post_likes || []).map((l) => l.user_id),
  reactions: groupReactions(row.post_reactions || []),
  comments: (row.comments || [])
    .map((c) => ({
      id: c.id,
      userId: c.user_id,
      userName: c.profiles?.name || 'Usuário',
      userPronoun: c.profiles?.pronoun || '',
      content: c.content,
      createdAt: c.created_at,
      updatedAt: c.updated_at || null,
    }))
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
  createdAt: row.created_at,
})

const mapGroup = (row) => ({
  id: row.id,
  name: row.name,
  description: row.description || '',
  game: row.game,
  createdBy: row.created_by,
  members: (row.group_members || []).map((m) => m.user_id),
  createdAt: row.created_at,
})

const mapMessage = (row) => ({
  id: row.id,
  userId: row.user_id,
  userName: row.profiles?.name || 'Usuário',
  userPronoun: row.profiles?.pronoun || '',
  content: row.content,
  createdAt: row.created_at,
})

// ─────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────

export const signIn = (email, password) =>
  supabase.auth.signInWithPassword({ email, password })

export const signUp = (email, password, metadata) =>
  supabase.auth.signUp({ email, password, options: { data: metadata } })

export const signOut = () => supabase.auth.signOut()

export const getSession = () => supabase.auth.getSession()

export const onAuthStateChange = (callback) =>
  supabase.auth.onAuthStateChange(callback)

// ─────────────────────────────────────────────
// Perfil
// ─────────────────────────────────────────────

export const getProfile = async (userId, email) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !data) return null
  return mapProfile(data, email)
}

export const updateProfile = async (userId, userData) => {
  const { error } = await supabase
    .from('profiles')
    .update(toDbProfile(userData))
    .eq('id', userId)

  if (error) console.error('Erro ao atualizar perfil:', error)
}

// ─────────────────────────────────────────────
// Posts
// ─────────────────────────────────────────────

const POST_SELECT = `
  *,
  profiles:user_id (name, pronoun, avatar, city, state, active_avatar_frame, unlocked_avatar_frames),
  post_likes (user_id),
  post_reactions (user_id, emoji),
  comments (id, user_id, content, created_at, updated_at, profiles:user_id (name, pronoun))
`

// FIX QA: limita o feed aos 50 posts mais recentes. Sem o limit, a query
// com todos os joins (profiles, likes, reactions, comments + perfil de cada
// comment) carregava TODOS os posts do banco a cada login E a cada
// reação/comentário de qualquer usuário (via realtime), causando lentidão
// crescente conforme o banco cresce. 50 é o suficiente pra preencher
// várias telas de scroll; carregar mais é um follow-up de paginação real.
const FEED_PAGE_SIZE = 50

export const fetchPosts = async () => {
  const { data, error } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .order('created_at', { ascending: false })
    .limit(FEED_PAGE_SIZE)

  if (error) { console.error('Erro ao buscar posts:', error); return [] }
  return (data || []).map(mapPost)
}

export const createPost = async (userId, content) => {
  const { data, error } = await supabase
    .from('posts')
    .insert({ user_id: userId, content })
    .select(POST_SELECT)
    .single()

  if (error) { console.error('Erro ao criar post:', error); return null }
  return mapPost(data)
}

export const deletePost = async (postId) => {
  const { error } = await supabase.from('posts').delete().eq('id', postId)
  if (error) console.error('Erro ao deletar post:', error)
}

export const toggleLike = async (postId, userId) => {
  const { data: existing } = await supabase
    .from('post_likes')
    .select('post_id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle()

  if (existing) {
    await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', userId)
  } else {
    await supabase.from('post_likes').insert({ post_id: postId, user_id: userId })
  }
}

export const toggleReaction = async (postId, userId, emoji) => {
  const { data: existing } = await supabase
    .from('post_reactions')
    .select('post_id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .eq('emoji', emoji)
    .maybeSingle()

  if (existing) {
    await supabase
      .from('post_reactions')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId)
      .eq('emoji', emoji)
  } else {
    await supabase.from('post_reactions').insert({ post_id: postId, user_id: userId, emoji })
  }
}

export const addComment = async (postId, userId, content) => {
  const { data, error } = await supabase
    .from('comments')
    .insert({ post_id: postId, user_id: userId, content })
    .select('id, user_id, content, created_at, updated_at, profiles:user_id (name, pronoun)')
    .single()

  if (error) { console.error('Erro ao comentar:', error); return null }
  return {
    id: data.id,
    userId: data.user_id,
    userName: data.profiles?.name || 'Usuário',
    userPronoun: data.profiles?.pronoun || '',
    content: data.content,
    createdAt: data.created_at,
    updatedAt: null,
  }
}

export const updateComment = async (commentId, content) => {
  const { error } = await supabase
    .from('comments')
    .update({ content, updated_at: new Date().toISOString() })
    .eq('id', commentId)

  if (error) { console.error('Erro ao editar comentário:', error); return false }
  return true
}

export const deleteComment = async (commentId) => {
  const { error } = await supabase.from('comments').delete().eq('id', commentId)
  if (error) console.error('Erro ao deletar comentário:', error)
}

// Realtime: feed
// FIX QA: aplica debounce de 600ms no callback de refresh — antes, cada
// reação/comentário/curtida de QUALQUER usuário disparava um refetch
// completo (com todos os joins), saturando o cliente em momentos de
// atividade. Agora múltiplos eventos em sequência colapsam num único
// refetch.
const debounce = (fn, ms) => {
  let timeout
  return (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => fn(...args), ms)
  }
}

export const subscribeToPosts = (onRefresh) => {
  const debouncedRefresh = debounce(onRefresh, 600)
  const channel = supabase
    .channel('public:posts-feed')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, debouncedRefresh)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'post_likes' }, debouncedRefresh)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'post_reactions' }, debouncedRefresh)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, debouncedRefresh)
    .subscribe()

  return () => supabase.removeChannel(channel)
}

// ─────────────────────────────────────────────
// Groups
// ─────────────────────────────────────────────

const GROUP_SELECT = `*, group_members (user_id)`

export const fetchGroups = async () => {
  const { data, error } = await supabase
    .from('groups')
    .select(GROUP_SELECT)
    .order('created_at', { ascending: false })

  if (error) { console.error('Erro ao buscar grupos:', error); return [] }
  return (data || []).map(mapGroup)
}

export const createGroup = async (userId, name, description, game) => {
  const { data: group, error } = await supabase
    .from('groups')
    .insert({ created_by: userId, name, description, game })
    .select('id')
    .single()

  if (error) { console.error('Erro ao criar grupo:', error); return null }

  await supabase.from('group_members').insert({ group_id: group.id, user_id: userId })

  const { data } = await supabase
    .from('groups')
    .select(GROUP_SELECT)
    .eq('id', group.id)
    .single()

  return data ? mapGroup(data) : null
}

export const deleteGroup = async (groupId) => {
  const { error } = await supabase.from('groups').delete().eq('id', groupId)
  if (error) console.error('Erro ao deletar grupo:', error)
}

export const joinGroup = async (groupId, userId) => {
  const { error } = await supabase
    .from('group_members')
    .insert({ group_id: groupId, user_id: userId })

  if (error) console.error('Erro ao entrar no grupo:', error)
}

export const leaveGroup = async (groupId, userId) => {
  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', userId)

  if (error) console.error('Erro ao sair do grupo:', error)
}

// Realtime: membros do grupo
export const subscribeToGroupMembers = (groupId, onRefresh) => {
  const channel = supabase
    .channel(`group-members-${groupId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'group_members', filter: `group_id=eq.${groupId}` },
      onRefresh
    )
    .subscribe()

  return () => supabase.removeChannel(channel)
}

// ─────────────────────────────────────────────
// Mensagens de grupo
// ─────────────────────────────────────────────

export const fetchGroupMessages = async (groupId) => {
  const { data, error } = await supabase
    .from('group_messages')
    .select('*, profiles:user_id (name, pronoun)')
    .eq('group_id', groupId)
    .order('created_at', { ascending: true })

  if (error) { console.error('Erro ao buscar mensagens:', error); return [] }
  return (data || []).map(mapMessage)
}

export const sendGroupMessage = async (groupId, userId, content) => {
  const { data, error } = await supabase
    .from('group_messages')
    .insert({ group_id: groupId, user_id: userId, content })
    .select('*, profiles:user_id (name, pronoun)')
    .single()

  if (error) { console.error('Erro ao enviar mensagem:', error); return null }
  return mapMessage(data)
}

export const updateGroupMessage = async (messageId, content) => {
  const { error } = await supabase
    .from('group_messages')
    .update({ content })
    .eq('id', messageId)

  if (error) { console.error('Erro ao editar mensagem:', error); return false }
  return true
}

export const deleteGroupMessage = async (messageId) => {
  const { error } = await supabase
    .from('group_messages')
    .delete()
    .eq('id', messageId)

  if (error) { console.error('Erro ao deletar mensagem:', error); return false }
  return true
}

export const subscribeToGroupMessages = (groupId, onMessage) => {
  const channel = supabase
    .channel(`group-chat-${groupId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'group_messages', filter: `group_id=eq.${groupId}` },
      (payload) => onMessage(payload.new)
    )
    .subscribe()

  return () => supabase.removeChannel(channel)
}

// ─────────────────────────────────────────────
// Notificações
// ─────────────────────────────────────────────

export const createNotification = async ({ userId, type, sourceUserId, sourceUserName, postId, groupId, message }) => {
  // Não notifica a si mesmo
  if (userId === sourceUserId) return

  const { error } = await supabase.from('notifications').insert({
    user_id: userId,
    type,
    source_user_id: sourceUserId,
    source_user_name: sourceUserName,
    post_id: postId || null,
    group_id: groupId || null,
    message,
  })

  if (error) console.error('Erro ao criar notificação:', error)
}

export const fetchNotifications = async (userId) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) { console.error('Erro ao buscar notificações:', error); return [] }
  return data || []
}

export const markNotificationRead = async (notificationId) => {
  await supabase.from('notifications').update({ read: true }).eq('id', notificationId)
}

export const markAllNotificationsRead = async (userId) => {
  await supabase.from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false)
}

export const deleteNotification = async (notificationId) => {
  await supabase.from('notifications').delete().eq('id', notificationId)
}

export const subscribeToNotifications = (userId, onNew) => {
  const channel = supabase
    .channel(`notifications-${userId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
      (payload) => onNew(payload.new)
    )
    .subscribe()

  return () => supabase.removeChannel(channel)
}

// ─────────────────────────────────────────────
// Feedback
// ─────────────────────────────────────────────

export const submitFeedback = async ({ userId, userName, rating, category, message }) => {
  const { error } = await supabase.from('feedback').insert({
    user_id: userId,
    user_name: userName,
    rating,
    category,
    message,
  })

  if (error) { console.error('Erro ao enviar feedback:', error); return false }
  return true
}
