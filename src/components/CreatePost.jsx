import React, { useState } from 'react'
import { filterProfanity } from '../utils/profanityFilter'
import { addEssence, ESSENCE, checkBadges, getActionMessage, BADGES, getEssenceGained } from '../utils/gamification'
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

    // Filtra palavras ofensivas
    const filteredContent = filterProfanity(content.trim())

    // Adiciona Essência ao usuário (respeita limite diário internamente)
    let updatedUser = addEssence(user, ESSENCE.CREATE_POST)
    onUserUpdate(updatedUser)

    // FIX QA: só notifica se realmente houve ganho — não dispara "+10 Essências"
    // quando o limite diário já foi atingido
    const gained = getEssenceGained(user, updatedUser)
    if (gained > 0) notifyEssenceGained(gained, 'Criar postagem respeitosa')

    // Cria a postagem
    onCreatePost(filteredContent)

    // Verifica badges após criar postagem (com delay para garantir que a postagem foi salva)
    setTimeout(() => {
      const posts = getPosts()
      const groups = getGroups()
      const messages = {}
      const newBadges = checkBadges(updatedUser, posts, groups, messages)
      
      // Filtra apenas badges realmente novos
      const userBadges = updatedUser.badges || []
      const trulyNewBadges = newBadges.filter(badge => !userBadges.includes(badge.id))
      
      // Se houver novos badges, adiciona ao usuário
      if (trulyNewBadges.length > 0) {
        const finalUser = {
          ...updatedUser,
          badges: [...userBadges, ...trulyNewBadges.map(b => b.id)]
        }
        onUserUpdate(finalUser)
        
        // Mostra notificação de novos badges (exceto REVEALED_ESSENCE que deve aparecer apenas ao completar perfil)
        const badgesToNotify = trulyNewBadges.filter(badge => badge.id !== BADGES.REVEALED_ESSENCE.id)
        badgesToNotify.forEach((badge, index) => {
          setTimeout(() => {
            notifyAchievement(
              badge.name,
              getActionMessage(badge.id)
            )
          }, 100 + (index * 500)) // Espaça as notificações
        })
      }
    }, 100)

    // Limpa o formulário
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
