import React, { useState, useEffect, useCallback } from 'react'
import PostCard from './PostCard'
import CreatePost from './CreatePost'
import { fetchPosts, createPost, deletePost, subscribeToPosts } from '../lib/db'
import './Feed.css'

function WelcomeModal({ user, onClose }) {
  return (
    <div className="welcome-modal-overlay" onClick={onClose}>
      <div className="welcome-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="welcome-modal-icon">🌟</div>
        <h3 className="welcome-modal-title">
          Bem-vinda, <span>{user.name}</span>!
        </h3>
        <p className="welcome-modal-message">
          Este é o <strong>InclusivChat</strong> — um espaço seguro e acolhedor para pessoas LGBTQIA+ gamers se conectarem, compartilharem e se apoiarem.
        </p>
        <ul className="welcome-modal-tips">
          <li>💬 Publique no <strong>Feed</strong> e comente com carinho</li>
          <li>🎮 Entre em <strong>Grupos</strong> dos seus jogos favoritos</li>
          <li>✨ Ganhe <strong>Essências</strong> participando da comunidade</li>
          <li>🎨 Desbloqueie temas e molduras exclusivos</li>
        </ul>
        <button className="welcome-modal-button" onClick={onClose}>
          Começar a explorar
        </button>
      </div>
    </div>
  )
}

const welcomeSeenKey = (userId) => `inclusivchat_welcome_seen_${userId}`

function hasSeenWelcome(user) {
  if (!user?.id) return false
  return localStorage.getItem(welcomeSeenKey(user.id)) === '1'
}

function Feed({ user, onUserUpdate }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [showWelcome, setShowWelcome] = useState(() => !hasSeenWelcome(user))

  // Marca welcome como visto imediatamente ao montar
  useEffect(() => {
    if (showWelcome && user?.id) {
      try { localStorage.setItem(welcomeSeenKey(user.id), '1') } catch {}
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const loadPosts = useCallback(async () => {
    const data = await fetchPosts()
    setPosts(data)
    setLoading(false)
  }, [])

  // Carrega posts e assina realtime
  useEffect(() => {
    loadPosts()
    const unsubscribe = subscribeToPosts(loadPosts)
    return unsubscribe
  }, [loadPosts])

  const handleCloseWelcome = () => {
    setShowWelcome(false)
    if (user?.id) {
      try { localStorage.setItem(welcomeSeenKey(user.id), '1') } catch {}
    }
  }

  const handleCreatePost = async (content) => {
    const newPost = await createPost(user.id, content)
    if (newPost) {
      setPosts(prev => [newPost, ...prev])
    }
    setShowCreatePost(false)
  }

  const handleUpdatePost = (postId, updatedPost) => {
    setPosts(prev => prev.map(p => p.id === postId ? updatedPost : p))
  }

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta postagem?')) return
    await deletePost(postId)
    setPosts(prev => prev.filter(p => p.id !== postId))
  }

  return (
    <div className="feed">
      {showWelcome && (
        <WelcomeModal user={user} onClose={handleCloseWelcome} />
      )}

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
            />
          ))
        )}
      </div>
    </div>
  )
}

export default Feed
