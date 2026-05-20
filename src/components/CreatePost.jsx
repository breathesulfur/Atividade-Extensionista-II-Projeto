import React, { useState } from 'react'
import { filterProfanity } from '../utils/profanityFilter'
import { addEssence, ESSENCE, checkBadges, getActionMessage, BADGES } from '../utils/gamification'
import { getPosts, getGroups } from '../utils/storage'
import { notifyError, notifyAchievement, notifyEssenceGained } from '../utils/notifications'
import { validateTextarea } from '../utils/validation'
import './CreatePost.css'

function CreatePost({ user, onCreatePost, onUserUpdate }) {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!content.trim()) {
      notifyError('Por favor, escreva algo na sua postagem.')
      return
    }

    if (content.trim().length < 5) {
      notifyError('A postagem deve ter pelo menos 5 caracteres.')
      return
    }

    setIsSubmitting(true)

    const filteredContent = filterProfanity(content.trim())

    let updatedUser = addEssence(user, ESSENCE.CREATE_POST)
    onUserUpdate(updatedUser)
    notifyEssenceGained(ESSENCE.CREATE_POST, 'Criar postagem respeitosa')
    onCreatePost(filteredContent)

    setTimeout(() => {
      const posts = getPosts()
      const groups = getGroups()
      const newBadges = checkBadges(updatedUser, posts, groups, {})

      const userBadges = updatedUser.badges || []
      const trulyNewBadges = newBadges.filter(badge => !userBadges.includes(badge.id))

      if (trulyNewBadges.length > 0) {
        const finalUser = {
          ...updatedUser,
          badges: [...userBadges, ...trulyNewBadges.map(b => b.id)]
        }
        onUserUpdate(finalUser)

        trulyNewBadges
          .filter(badge => badge.id !== BADGES.REVEALED_ESSENCE.id)
          .forEach((badge, index) => {
            setTimeout(() => notifyAchievement(badge.name, getActionMessage(badge.id)), 100 + (index * 500))
          })
      }
    }, 100)

    setContent('')
    setIsSubmitting(false)
  }

  return (
    <div className="create-post-card">
      <form onSubmit={handleSubmit} className="create-post-form">
        <div className="form-group">
          <label htmlFor="post-content" className="form-label">
            O que você está pensando?
          </label>
          <textarea
            id="post-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={(e) => {
              if (e.target.value.trim() && e.target.value.trim().length < 5) {
                notifyError('A postagem deve ter pelo menos 5 caracteres.')
                e.target.setCustomValidity('A postagem deve ter pelo menos 5 caracteres.')
              } else {
                e.target.setCustomValidity('')
              }
            }}
            className="post-textarea"
            placeholder="Compartilhe suas experiências, dicas de jogos, ou apenas converse com a comunidade!"
            rows="4"
            maxLength="500"
          />
          <div className="char-count">
            {content.length}/500 caracteres
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => setContent('')}
            className="cancel-button"
            disabled={isSubmitting}
          >
            Limpar
          </button>
          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting || !content.trim()}
          >
            {isSubmitting ? 'Publicando...' : 'Publicar'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreatePost
