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
import { fetchPosts, fetchGroups } from './db'

const cache = { posts: null, groups: null }
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
  notify('posts', next)
}

export const mutateGroups = (updater) => {
  const prev = cache.groups || []
  const next = typeof updater === 'function' ? updater(prev) : updater
  cache.groups = next
  notify('groups', next)
}

// Esquenta o cache logo no boot do Dashboard.
export const prefetchAll = () => {
  refreshPosts().catch(() => {})
  refreshGroups().catch(() => {})
}

// Limpa cache (ex.: logout) pra evitar vazamento entre sessões.
export const clearCache = () => {
  cache.posts = null
  cache.groups = null
}
