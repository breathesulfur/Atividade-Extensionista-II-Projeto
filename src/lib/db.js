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
  // Alias para componentes que esperam unlockedMysticTitles (MysticTitleSelector,
  // Profile, gamification.canUnlockMysticTitle). Sem isso, após refresh os
  // títulos persistidos aparecem como bloqueados na UI.
  unlockedMysticTitles: row.unlocked_titles || [],
  activeTheme: row.active_theme || null,
  activeAvatarFrame: row.active_avatar_frame || null,
  activeTitle: row.active_title || null,
  // Alias para componentes (Profile, MysticTitleSelector) que leem
  // activeMysticTitle. Sem isso, após refresh o título ativo persistido
  // não aparece selecionado na UI.
  activeMysticTitle: row.active_title || null,
  dailyEssence: row.daily_essence || {},
  // Mapa de cooldowns por tipo de ação (gamification.canPerformAction).
  // Persistido em profiles.last_actions para evitar farm via refresh.
  lastActions: row.last_actions || {},
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
  // Persiste os timestamps de última ação por tipo (cooldowns).
  // Sem isto, um refresh entre duas ações idênticas burlava o cooldown.
  last_actions: user.lastActions || {},
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

// FIX QA: tirei o `profiles:user_id (name, pronoun)` que ficava DENTRO
// de comments. Embora pareça uma string a mais, esse join aninhado é
// avaliado por linha sob RLS — pra cada comentário de cada post o
// PostgREST faz um lookup de profile sob política, o que vira O(N×M)
// mesmo com índice. Em produção isso virou o gargalo: ~60s no login
// inicial. O perfil dos comentaristas agora é resolvido em uma única
// query em batch depois (ver enrichCommentAuthors).
const POST_SELECT = `
  *,
  profiles:user_id (name, pronoun, avatar, city, state, active_avatar_frame, unlocked_avatar_frames),
  post_likes (user_id),
  post_reactions (user_id, emoji),
  comments (id, user_id, content, created_at, updated_at)
`

// Mesmo SELECT mas mantendo o profile aninhado dos comments — usado em
// caminhos pontuais (criar post, refresh single post via realtime) onde
// o custo é desprezível.
const POST_SELECT_WITH_COMMENT_AUTHORS = `
  *,
  profiles:user_id (name, pronoun, avatar, city, state, active_avatar_frame, unlocked_avatar_frames),
  post_likes (user_id),
  post_reactions (user_id, emoji),
  comments (id, user_id, content, created_at, updated_at, profiles:user_id (name, pronoun))
`

// FIX QA: limit 50 → 20. Cada post traz N comentários + likes + reactions
// no payload — reduzir o tamanho do resultado também alivia o serializer.
// Quem precisar de mais posts vai via scroll paginado (follow-up).
const FEED_PAGE_SIZE = 20

// Cache em memória de perfis recentemente resolvidos pra dedupes entre
// fetchPosts e patches de realtime. TTL curto (60s) — só evita refetch
// dos mesmos perfis em bursts; mudanças de nome se refletem rápido.
const PROFILE_BATCH_CACHE_TTL = 60_000
const profileBatchCache = new Map()

// Resolve em batch os perfis dos autores dos comentários. Uma única
// query (SELECT ... WHERE id IN (...)) usando o PK index — instantâneo
// mesmo com milhares de profiles.
const enrichCommentAuthors = async (mappedPosts) => {
  const missingIds = new Set()
  const now = Date.now()
  for (const post of mappedPosts) {
    for (const c of post.comments) {
      if (!c.userId) continue
      const cached = profileBatchCache.get(c.userId)
      if (cached && now - cached.at < PROFILE_BATCH_CACHE_TTL) continue
      missingIds.add(c.userId)
    }
  }

  if (missingIds.size > 0) {
    const { data } = await supabase
      .from('profiles')
      .select('id, name, pronoun')
      .in('id', Array.from(missingIds))
    for (const row of data || []) {
      profileBatchCache.set(row.id, { data: row, at: now })
    }
  }

  // Aplica os nomes nos comentários.
  for (const post of mappedPosts) {
    for (const c of post.comments) {
      if (c.userName && c.userName !== 'Usuário') continue
      const cached = profileBatchCache.get(c.userId)?.data
      if (cached) {
        c.userName = cached.name || 'Usuário'
        c.userPronoun = cached.pronoun || ''
      }
    }
  }
  return mappedPosts
}

// performance.now() precisa ser chamado como método de `performance` —
// extrair a função (const fn = performance.now) perde o binding e
// dispara "Illegal invocation". Wrapper inline preserva o contexto.
const nowMs = () =>
  typeof performance !== 'undefined' && performance.now
    ? performance.now()
    : Date.now()

export const fetchPosts = async () => {
  const started = nowMs()
  const { data, error } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .order('created_at', { ascending: false })
    .limit(FEED_PAGE_SIZE)

  if (error) { console.error('Erro ao buscar posts:', error); return [] }
  const mapped = (data || []).map(mapPost)
  await enrichCommentAuthors(mapped)

  // Log de telemetria pra confirmar o efeito dos índices/refactor.
  const elapsed = Math.round(nowMs() - started)
  if (elapsed > 500) {
    console.warn(`[fetchPosts] demorou ${elapsed}ms (${mapped.length} posts)`)
  } else {
    console.info(`[fetchPosts] ${elapsed}ms (${mapped.length} posts)`)
  }
  return mapped
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
//
// FIX QA (v2): em vez de refazer fetchPosts() inteiro a cada evento (que com
// N usuários online vira N queries pesadas simultâneas no Supabase), aplicamos
// **patches incrementais** no cache local usando o próprio payload do
// postgres_changes. Likes e reactions são autossuficientes (não precisam ir
// ao banco); comments e posts INSERT/UPDATE buscam só a linha afetada para
// pegar o perfil do autor.
//
// Refetch global vira fallback — disparado só quando um patch falha ou quando
// chega um evento que não sabemos tratar. O fallback usa debounce com
// jitter aleatório (600ms + 0..1500ms) pra espalhar requisições entre
// clientes em vez de todos baterem no mesmo instante.
const debounceJittered = (fn, baseMs, jitterMs) => {
  let timeout
  return (...args) => {
    clearTimeout(timeout)
    const delay = baseMs + Math.random() * jitterMs
    timeout = setTimeout(() => fn(...args), delay)
  }
}

// Cache de perfis recém-buscados para enriquecer comments/posts via realtime.
// TTL curto (60s) só pra coalescer enxurradas — fora isso não vale a pena
// manter algo "global".
const profileMicroCache = new Map()
const PROFILE_CACHE_TTL = 60_000

const fetchProfileLite = async (userId, fields) => {
  const cacheKey = `${userId}:${fields}`
  const cached = profileMicroCache.get(cacheKey)
  if (cached && Date.now() - cached.at < PROFILE_CACHE_TTL) return cached.data
  const { data } = await supabase
    .from('profiles')
    .select(fields)
    .eq('id', userId)
    .maybeSingle()
  if (data) profileMicroCache.set(cacheKey, { data, at: Date.now() })
  return data
}

export const subscribeToFeed = ({ applyPatch, fallbackRefresh }) => {
  const fallback = debounceJittered(() => fallbackRefresh?.(), 600, 1500)

  const onLike = (payload) => {
    const row = payload.new && Object.keys(payload.new).length ? payload.new : payload.old
    if (!row?.post_id || !row?.user_id) return
    const { post_id, user_id } = row
    applyPatch((prev) => prev.map((p) => {
      if (p.id !== post_id) return p
      const likes = p.likes || []
      if (payload.eventType === 'INSERT') {
        return likes.includes(user_id) ? p : { ...p, likes: [...likes, user_id] }
      }
      if (payload.eventType === 'DELETE') {
        return { ...p, likes: likes.filter((id) => id !== user_id) }
      }
      return p
    }))
  }

  const onReaction = (payload) => {
    const row = payload.new && Object.keys(payload.new).length ? payload.new : payload.old
    if (!row?.post_id || !row?.user_id || !row?.emoji) return
    const { post_id, user_id, emoji } = row
    applyPatch((prev) => prev.map((p) => {
      if (p.id !== post_id) return p
      const reactions = { ...(p.reactions || {}) }
      const arr = reactions[emoji] || []
      if (payload.eventType === 'INSERT') {
        if (!arr.includes(user_id)) reactions[emoji] = [...arr, user_id]
      } else if (payload.eventType === 'DELETE') {
        const next = arr.filter((id) => id !== user_id)
        if (next.length === 0) delete reactions[emoji]
        else reactions[emoji] = next
      }
      return { ...p, reactions }
    }))
  }

  const onComment = async (payload) => {
    if (payload.eventType === 'DELETE') {
      const id = payload.old?.id
      if (!id) return
      applyPatch((prev) => prev.map((p) => ({
        ...p,
        comments: (p.comments || []).filter((c) => c.id !== id),
      })))
      return
    }

    if (payload.eventType === 'UPDATE') {
      const row = payload.new
      if (!row?.id) return
      applyPatch((prev) => prev.map((p) => ({
        ...p,
        comments: (p.comments || []).map((c) =>
          c.id === row.id
            ? { ...c, content: row.content, updatedAt: row.updated_at || null }
            : c
        ),
      })))
      return
    }

    if (payload.eventType === 'INSERT') {
      const row = payload.new
      if (!row?.id || !row?.post_id) return
      const prof = await fetchProfileLite(row.user_id, 'name, pronoun')
      const comment = {
        id: row.id,
        userId: row.user_id,
        userName: prof?.name || 'Usuário',
        userPronoun: prof?.pronoun || '',
        content: row.content,
        createdAt: row.created_at,
        updatedAt: row.updated_at || null,
      }
      applyPatch((prev) => prev.map((p) => {
        if (p.id !== row.post_id) return p
        // Dedup: o autor pode já ter inserido localmente via optimistic update.
        const existing = (p.comments || []).filter((c) => c.id !== row.id)
        return {
          ...p,
          comments: [...existing, comment].sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
          ),
        }
      }))
    }
  }

  const onPostChange = async (payload) => {
    if (payload.eventType === 'DELETE') {
      const id = payload.old?.id
      if (!id) return
      applyPatch((prev) => prev.filter((p) => p.id !== id))
      return
    }

    const id = payload.new?.id
    if (!id) return
    // Pra um único post o join aninhado de comments→profiles é trivial,
    // então usamos o SELECT completo (sem precisar de enrichCommentAuthors).
    const { data } = await supabase
      .from('posts')
      .select(POST_SELECT_WITH_COMMENT_AUTHORS)
      .eq('id', id)
      .maybeSingle()
    if (!data) return
    const mapped = mapPost(data)

    applyPatch((prev) => {
      if (payload.eventType === 'INSERT') {
        if (prev.some((p) => p.id === mapped.id)) {
          return prev.map((p) => (p.id === mapped.id ? mapped : p))
        }
        return [mapped, ...prev]
      }
      return prev.map((p) => (p.id === mapped.id ? mapped : p))
    })
  }

  const safe = (fn) => async (payload) => {
    try {
      await fn(payload)
    } catch (e) {
      console.error('[realtime] patch falhou, agendando refresh:', e)
      fallback()
    }
  }

  const channel = supabase
    .channel('public:posts-feed')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, safe(onPostChange))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'post_likes' }, safe(onLike))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'post_reactions' }, safe(onReaction))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, safe(onComment))
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
