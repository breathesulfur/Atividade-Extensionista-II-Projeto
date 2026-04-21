import React, { useState, useEffect } from 'react'
import PostCard from './PostCard'
import CreatePost from './CreatePost'
import { getPosts, savePosts } from '../utils/storage'
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

// Chave isolada por usuário — desacopla a flag "já viu o welcome" do objeto `user`,
// que é sobrescrito em vários pontos (login, editar perfil, criar/entrar em grupo)
// e pode perder a flag no meio do caminho. Ver PR de correção do modal.
const welcomeSeenKey = (userId) => `inclusivchat_welcome_seen_${userId}`

function hasSeenWelcome(user) {
  if (!user?.id) return false
  // Migração: usuários antigos podem ter a flag no próprio objeto user.
  // Se tiver, já marca a chave nova e considera visto.
  if (user.hasSeenWelcome) {
    try { localStorage.setItem(welcomeSeenKey(user.id), '1') } catch {}
    return true
  }
  return localStorage.getItem(welcomeSeenKey(user.id)) === '1'
}

function Feed({ user, onUserUpdate }) {
  const [posts, setPosts] = useState([])
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [showWelcome, setShowWelcome] = useState(() => !hasSeenWelcome(user))

  // Marca como visto imediatamente ao montar — evita reexibição ao trocar de aba
  useEffect(() => {
    if (showWelcome && user?.id) {
      try { localStorage.setItem(welcomeSeenKey(user.id), '1') } catch {}
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Carrega postagens do localStorage
  useEffect(() => {
    const savedPosts = getPosts()
    const sortedPosts = savedPosts.sort((a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt)
    )
    setPosts(sortedPosts)
  }, [])

  const handleCloseWelcome = () => {
    setShowWelcome(false)
    if (user?.id) {
      try { localStorage.setItem(welcomeSeenKey(user.id), '1') } catch {}
    }
  }

  // Cria nova postagem
  const handleCreatePost = (content) => {
    const newPost = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      userPronoun: user.pronoun,
      userAvatar: user.avatar || user.picture || null,
      userCity: user.city || '',
      userState: user.state || '',
      content: content,
      likes: [],
      reactions: {},
      comments: [],
      createdAt: new Date().toISOString()
    }

    const updatedPosts = [newPost, ...posts]
    setPosts(updatedPosts)
    savePosts(updatedPosts)
    setShowCreatePost(false)
  }

  // Atualiza postagem (após curtir/comentar)
  const handleUpdatePost = (postId, updatedPost) => {
    const updatedPosts = posts.map(post =>
      post.id === postId ? updatedPost : post
    )
    setPosts(updatedPosts)
    savePosts(updatedPosts)
  }

  // Exclui postagem
  const handleDeletePost = (postId) => {
    if (window.confirm('Tem certeza que deseja excluir esta postagem?')) {
      const updatedPosts = posts.filter(post => post.id !== postId)
      setPosts(updatedPosts)
      savePosts(updatedPosts)
    }
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
        {posts.length === 0 ? (
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
