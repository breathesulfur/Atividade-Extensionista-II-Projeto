/**
 * Cache compartilhado de posts e grupos.
 *
 * Antes, cada tela (Feed, Groups, Profile) chamava fetchPosts() / fetchGroups()
 * no seu próprio useEffect ao montar. Como o Dashboard usa
 * {activeTab === 'feed' && <Feed/>}, trocar de aba desmonta o componente e
 * a próxima vez começa do zero — round-trip ao Supabase + "0 posts" / "0
 * estatísticas" por algumas centenas de ms até a resposta chegar.
 *
 * Este módulo guarda em memória o último resultado de cada fetch e expõe:
 *  - getCachedPosts() / getCachedGroups(): snapshot atual (null = ainda
 *    nunca foi buscado nesta sessão).
 *  - refreshPosts() / refreshGroups(): dispara o fetch (de-duplicado se já
 *    houver um em voo), atualiza o cache e notifica subscribers.
 *  - subscribePosts() / subscribeGroups(): registra um listener pra ser
 *    chamado sempre que o cache mudar. Retorna função de unsubscribe.
 *  - mutatePosts() / mutateGroups(): aplica uma mutação local (insert,
 *    update, remove) — usado quando o próprio cliente cria/deleta algo e
 *    queremos refletir na UI sem esperar refetch.
 *  - prefetchAll(): atalho pra Dashboard chamar logo no mount, esquentando
 *    o cache enquanto o resto da UI ainda está renderizando.
 *
 * Resultado prático: voltar pro Feed/Groups/Profile depois da primeira
 * visita é instantâneo, e o refresh acontece em background.
 */
import { fetchPosts, fetchGroups, subscribeToFeed } from './db'

// Persistência em localStorage com TTL.
//
// Antes, mesmo com cache em memória, o primeiro acesso após login ou
// refresh da página obrigava o Feed/Groups a esperar o round-trip ao
// Supabase ("Carregando postagens..." por algumas centenas de ms).
// Agora salvamos a última lista de posts/groups no localStorage; ao
// reabrir o app, o estado inicial já vem hidratado e a UI renderiza
// instantânea, enquanto refreshPosts/refreshGroups revalidam em
// background.
//
// TTL de 24h é só pra evitar carregar dados muito antigos caso o
// usuário fique offline por dias — fora isso, qualquer mutação local
// ou refetch sobrescreve a entrada na hora.
const STORAGE_KEY = 'inclusivchat:dataCache:v1'
const TTL_MS = 24 * 60 * 60 * 1000

const readPersisted = () => {
  if (typeof localStorage === 'undefined') return { posts: null, groups: null }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { posts: null, groups: null }
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return { posts: null, groups: null }
    const now = Date.now()
    return {
      posts: parsed.posts && now - (parsed.postsAt || 0) < TTL_MS ? parsed.posts : null,
      groups: parsed.groups && now - (parsed.groupsAt || 0) < TTL_MS ? parsed.groups : null,
    }
  } catch {
    return { posts: null, groups: null }
  }
}

const writePersisted = () => {
  if (typeof localStorage === 'undefined') return
  try {
    const now = Date.now()
    const payload = {
      posts: cache.posts,
      groups: cache.groups,
      postsAt: cache.posts != null ? now : 0,
      groupsAt: cache.groups != null ? now : 0,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // localStorage cheio ou bloqueado — ignora silenciosamente, o cache
    // em memória continua funcionando.
  }
}

const cache = readPersisted()
const listeners = { posts: new Set(), groups: new Set() }
const inflight = { posts: null, groups: null }

const notify = (key, value) => {
  listeners[key].forEach((fn) => {
    try { fn(value) } catch (e) { console.error('[dataCache] listener erro:', e) }
  })
}

export const getCachedPosts = () => cache.posts
export const getCachedGroups = () => cache.groups

export const refreshPosts = () => {
  if (inflight.posts) return inflight.posts
  inflight.posts = fetchPosts()
    .then((data) => {
      cache.posts = data || []
      writePersisted()
      notify('posts', cache.posts)
      return cache.posts
    })
    .catch((err) => {
      console.error('[dataCache] refreshPosts falhou:', err)
      throw err
    })
    .finally(() => { inflight.posts = null })
  return inflight.posts
}

export const refreshGroups = () => {
  if (inflight.groups) return inflight.groups
  inflight.groups = fetchGroups()
    .then((data) => {
      cache.groups = data || []
      writePersisted()
      notify('groups', cache.groups)
      return cache.groups
    })
    .catch((err) => {
      console.error('[dataCache] refreshGroups falhou:', err)
      throw err
    })
    .finally(() => { inflight.groups = null })
  return inflight.groups
}

export const subscribePosts = (fn) => {
  listeners.posts.add(fn)
  return () => listeners.posts.delete(fn)
}

export const subscribeGroups = (fn) => {
  listeners.groups.add(fn)
  return () => listeners.groups.delete(fn)
}

// Mutação local — aceita next array OU updater (prev) => next.
// Atualiza cache E notifica subscribers, garantindo que Feed/Groups/Profile
// vejam o mesmo estado.
export const mutatePosts = (updater) => {
  const prev = cache.posts || []
  const next = typeof updater === 'function' ? updater(prev) : updater
  cache.posts = next
  writePersisted()
  notify('posts', next)
}

export const mutateGroups = (updater) => {
  const prev = cache.groups || []
  const next = typeof updater === 'function' ? updater(prev) : updater
  cache.groups = next
  writePersisted()
  notify('groups', next)
}

// Esquenta o cache logo no boot do Dashboard.
export const prefetchAll = () => {
  refreshPosts().catch(() => {})
  refreshGroups().catch(() => {})
}

// Conecta o realtime do feed ao cache compartilhado.
//
// FIX QA (v2): antes, cada evento em posts/likes/reactions/comments disparava
// um fetchPosts() completo em TODOS os clientes conectados — com N usuários
// online, isso virava N queries pesadas simultâneas no Supabase a cada
// reação. Agora os eventos viram patches incrementais via mutatePosts
// (ver subscribeToFeed em db.js), e refreshPosts só é chamado como fallback.
export const subscribeFeedRealtime = () =>
  subscribeToFeed({
    applyPatch: mutatePosts,
    fallbackRefresh: () => { refreshPosts().catch(() => {}) },
  })

// Limpa cache (ex.: logout) pra evitar vazamento entre sessões.
export const clearCache = () => {
  cache.posts = null
  cache.groups = null
  if (typeof localStorage !== 'undefined') {
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
  }
}
