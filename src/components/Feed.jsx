import React, { useState, useEffect, useCallback } from 'react'
import PostCard from './PostCard'
import CreatePost from './CreatePost'
import { createPost, deletePost, subscribeToPosts } from '../lib/db'
import {
  getCachedPosts,
  refreshPosts,
  subscribePosts,
  mutatePosts,
} from '../lib/dataCache'
import './Feed.css'

function Feed({ user, onUserUpdate, onOpenGroup, onOpenProfile }) {
  // FIX QA: estado inicial vem do cache compartilhado (dataCache).
  // Antes, voltar pro Feed depois de visitar Groups/Profile remontava o
  // componente com posts=[] e loading=true, mostrando "Carregando..." de
  // novo enquanto o fetchPosts repetia a viagem ao Supabase.
  const [posts, setPosts] = useState(() => getCachedPosts() || [])
  const [loading, setLoading] = useState(() => getCachedPosts() === null)
  const [showCreatePost, setShowCreatePost] = useState(false)

  const loadPosts = useCallback(async () => {
    await refreshPosts()
    // cache + listener cuidam de atualizar o estado; só desligamos loading
    setLoading(false)
  }, [])

  // Carrega posts (ou usa cache) e assina realtime + cache
  useEffect(() => {
    // Sincroniza com o cache atual (caso outro consumidor já tenha atualizado)
    const cached = getCachedPosts()
    if (cached) {
      setPosts(cached)
      setLoading(false)
    }

    const unsubCache = subscribePosts((next) => {
      setPosts(next)
      setLoading(false)
    })

    loadPosts()
    const unsubRealtime = subscribeToPosts(loadPosts)

    return () => {
      unsubCache()
      unsubRealtime()
    }
  }, [loadPosts])

  const handleCreatePost = async (content) => {
    const newPost = await createPost(user.id, content)
    if (newPost) {
      mutatePosts((prev) => [newPost, ...prev])
    }
    setShowCreatePost(false)
  }

  const handleUpdatePost = (postId, updatedPost) => {
    mutatePosts((prev) => prev.map((p) => (p.id === postId ? updatedPost : p)))
  }

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta postagem?')) return
    await deletePost(postId)
    mutatePosts((prev) => prev.filter((p) => p.id !== postId))
  }

  return (
    <div className="feed">
      <div className="feed-header">
        <h2>Feed de Postagens</h2>
        <button
          onClick={() => setShowCreatePost(!showCreatePost)}
          className="create-post-button"
        >
          {showCreatePost ? '✕ Cancelar' : '+ Nova Postagem'}
        </button>
      </div>

      {showCreatePost && (
        <CreatePost
          user={user}
          onCreatePost={handleCreatePost}
          onUserUpdate={onUserUpdate}
        />
      )}

      <div className="posts-container">
        {loading ? (
          <div className="empty-state"><p>Carregando postagens...</p></div>
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <p>Nenhuma postagem ainda. Seja o primeiro a compartilhar algo! 🎮</p>
          </div>
        ) : (
          posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              currentUser={user}
              onUpdate={handleUpdatePost}
              onDelete={handleDeletePost}
              onUserUpdate={onUserUpdate}
              onOpenGroup={onOpenGroup}
              onOpenProfile={onOpenProfile}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default Feed
