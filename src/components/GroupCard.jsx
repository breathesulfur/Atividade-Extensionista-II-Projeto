import React, { useState, useEffect } from 'react'
import { getGroupMessages, saveGroupMessages, getPosts, getGroups } from '../utils/storage'
import { filterProfanity } from '../utils/profanityFilter'
import { checkBadges, getActionMessage, BADGES } from '../utils/gamification'
import { notifyError, notifyAchievement } from '../utils/notifications'
import './GroupCard.css'

function GroupCard({ group, user, onBack, onUserUpdate }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')

  // Carrega mensagens do localStorage
  useEffect(() => {
    const savedMessages = getGroupMessages(group.id)
    setMessages(savedMessages)
  }, [group.id])

  // Salva mensagens no localStorage quando mudarem
  useEffect(() => {
    if (messages.length > 0) {
      saveGroupMessages(group.id, messages)
    }
  }, [messages, group.id])

  // Verifica se o usuário é membro do grupo
  const isMember = group.members?.includes(user.id) || false

  // Formata data
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)

    if (minutes < 1) return 'agora'
    if (minutes < 60) return `${minutes} min atrás`
    if (hours < 24) return `${hours}h atrás`
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Envia mensagem
  const handleSendMessage = (e) => {
    e.preventDefault()

    if (!isMember) {
      notifyError('Você precisa ser membro do grupo para enviar mensagens.')
      return
    }

    if (!newMessage.trim()) {
      notifyError('Por favor, escreva uma mensagem.')
      return
    }

    // Filtra palavras ofensivas
    const filteredMessage = filterProfanity(newMessage.trim())

    const message = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      userPronoun: user.pronoun,
      content: filteredMessage,
      createdAt: new Date().toISOString()
    }

    setMessages([...messages, message])
    setNewMessage('')
    
    // Verifica badges após enviar mensagem (com delay para garantir que a mensagem foi salva)
    setTimeout(() => {
      const posts = getPosts()
      const groups = getGroups()
      const allMessages = { [group.id]: [...messages, message] }
      const newBadges = checkBadges(user, posts, groups, allMessages)
      
      // Filtra apenas badges realmente novos
      const userBadges = user.badges || []
      const trulyNewBadges = newBadges.filter(badge => !userBadges.includes(badge.id))
      
      // Se houver novos badges, adiciona ao usuário
      if (trulyNewBadges.length > 0) {
        const finalUser = {
          ...user,
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

    // Scroll para a última mensagem
    setTimeout(() => {
      const messagesContainer = document.getElementById('messages-container')
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight
      }
    }, 100)
  }

  if (!isMember) {
    return (
      <div className="group-chat">
        <div className="chat-header">
          <button onClick={onBack} className="back-button">
            ← Voltar
          </button>
          <h2>{group.name}</h2>
        </div>
        <div className="not-member-message">
          <p>Você precisa ser membro deste grupo para ver o chat.</p>
          <p>Entre no grupo primeiro para começar a conversar!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="group-chat">
      <div className="chat-header">
        <button onClick={onBack} className="back-button">
          ← Voltar
        </button>
        <div className="chat-header-info">
          <h2>{group.name}</h2>
          <span className="chat-game">{group.game}</span>
        </div>
      </div>

      <div className="chat-description">
        <p>{group.description}</p>
      </div>

      <div id="messages-container" className="messages-container">
        {messages.length === 0 ? (
          <div className="empty-messages">
            <p>Nenhuma mensagem ainda. Seja o primeiro a conversar! 💬</p>
          </div>
        ) : (
          messages.map(message => {
            const isOwnMessage = message.userId === user.id
            return (
              <div
                key={message.id}
                className={`message-item ${isOwnMessage ? 'own-message' : ''}`}
              >
                <div className="message-header">
                  <strong>{message.userName}</strong>
                  <span className="message-pronoun">({message.userPronoun})</span>
                </div>
                <div className="message-content">{message.content}</div>
                <div className="message-time">{formatDate(message.createdAt)}</div>
              </div>
            )
          })
        )}
      </div>

      <form onSubmit={handleSendMessage} className="message-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Digite sua mensagem..."
          className="message-input"
          maxLength="300"
        />
        <button type="submit" className="send-button">
          Enviar
        </button>
      </form>
    </div>
  )
}

export default GroupCard
