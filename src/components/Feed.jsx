import React, { useState, useEffect } from 'react'
import PostCard from './PostCard'
import CreatePost from './CreatePost'
import { getPosts, savePosts } from '../utils/storage'
import './Feed.css'

function Feed({ user, onUserUpdate }) {
  const [posts, setPosts] = useState([])
  const [showCreatePost, setShowCreatePost] = useState(false)

  // Carrega postagens do localStorage
  useEffect(() => {
    const savedPosts = getPosts()
    // Ordena por data (mais recentes primeiro)
    const sortedPosts = savedPosts.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    )
    setPosts(sortedPosts)
  }, [])

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
