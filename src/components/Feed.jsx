import React, { useState, useEffect, useCallback } from 'react'
import PostCard from './PostCard'
import CreatePost from './CreatePost'
import { fetchPosts, createPost, deletePost, subscribeToPosts } from '../lib/db'
import './Feed.css'

function Feed({ user, onUserUpdate, onOpenGroup }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreatePost, setShowCreatePost] = useState(false)

  const loadPosts = useCallback(async () => {
    const data = await fetchPosts()
    setPosts(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadPosts()
    const unsubscribe = subscribeToPosts(loadPosts)
    return unsubscribe
  }, [loadPosts])

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
            />
          ))
        )}
      </div>
    </div>
  )
}

export default Feed
