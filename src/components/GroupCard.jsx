import React, { useState, useEffect, useRef } from 'react'
import { fetchGroupMessages, sendGroupMessage, subscribeToGroupMessages, createNotification, createPost } from '../lib/db'
import { getPosts } from '../utils/storage'
import { filterProfanity } from '../utils/profanityFilter'
import { checkBadges, getActionMessage, BADGES } from '../utils/gamification'
import { notifyError, notifyAchievement, notifySuccess } from '../utils/notifications'
import './GroupCard.css'

function GroupCard({ group, user, onBack, onUserUpdate }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const containerRef = useRef(null)

  useEffect(() => {
    let mounted = true

    fetchGroupMessages(group.id).then(data => {
      if (mounted) { setMessages(data); setLoading(false) }
    })

    const unsubscribe = subscribeToGroupMessages(group.id, async () => {
      const data = await fetchGroupMessages(group.id)
      if (mounted) setMessages(data)
    })

    return () => { mounted = false; unsubscribe() }
  }, [group.id])

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [messages])

  const isMember = group.members?.includes(user.id) || false

  const handleCopyInviteLink = () => {
    const link = `${window.location.origin}/?group=${group.id}`
    navigator.clipboard.writeText(link).then(() => {
      notifySuccess('Link de convite copiado! 🔗')
    }).catch(() => {
      notifyError('Não foi possível copiar o link.')
    })
  }

  const handleShareGroup = async () => {
    if (!isMember) { notifyError('Entre no grupo antes de compartilhar.'); return }
    if (!window.confirm(`Compartilhar o grupo "${group.name}" no seu feed?`)) return

    const description = (group.description || '').trim()
    const summary = description ? `\n\n📝 ${description}` : ''
    const content = `🎮 Vem participar do grupo "${group.name}" (${group.game})!${summary}\n\n[group:${group.id}]`

    const newPost = await createPost(user.id, content)
    if (newPost) notifySuccess('Grupo compartilhado no feed! 💜')
    else notifyError('Não foi possível compartilhar agora.')
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    if (minutes < 1) return 'agora'
    if (minutes < 60) return `${minutes} min atrás`
    if (hours < 24) return `${hours}h atrás`
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!isMember) { notifyError('Você precisa ser membro do grupo para enviar mensagens.'); return }
    if (!newMessage.trim()) { notifyError('Por favor, escreva uma mensagem.'); return }

    const filteredMessage = filterProfanity(newMessage.trim())
    setNewMessage('')

    const saved = await sendGroupMessage(group.id, user.id, filteredMessage)
    if (saved) {
      setMessages(prev => [...prev, saved])
      if (group.createdBy && group.createdBy !== user.id) {
        createNotification({
          userId: group.createdBy,
          type: 'group_message',
          sourceUserId: user.id,
          sourceUserName: user.name,
          groupId: group.id,
          message: `${user.name} enviou uma mensagem no seu grupo "${group.name}"`,
        })
      }
    }

    setTimeout(() => {
      const posts = getPosts()
      const newBadges = checkBadges(user, posts, [group], { [group.id]: messages })
      const trulyNew = newBadges.filter(b => !(user.badges || []).includes(b.id))
      if (trulyNew.length > 0) {
        const updated = { ...user, badges: [...(user.badges || []), ...trulyNew.map(b => b.id)] }
        onUserUpdate(updated)
        trulyNew.filter(b => b.id !== BADGES.REVEALED_ESSENCE.id).forEach((badge, i) => {
          setTimeout(() => notifyAchievement(badge.name, getActionMessage(badge.id)), 100 + i * 500)
        })
      }
    }, 100)
  }

  if (!isMember) {
    return (
      <div className="group-chat">
        <div className="chat-header">
          <button onClick={onBack} className="back-button">← Voltar</button>
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
        <button onClick={onBack} className="back-button">← Voltar</button>
        <div className="chat-header-info">
          <h2>{group.name}</h2>
          <div className="chat-header-meta">
            <span className="chat-game">{group.game}</span>
            <span className="chat-members">👥 {group.members?.length || 0} membro{(group.members?.length || 0) !== 1 ? 's' : ''}</span>
          </div>
        </div>
        <button
          onClick={handleCopyInviteLink}
          className="chat-invite-button"
          aria-label="Copiar link de convite"
          title="Copiar link de convite"
        >
          🔗 Convidar
        </button>
        <button
          onClick={handleShareGroup}
          className="chat-share-button"
          aria-label="Compartilhar grupo no feed"
          title="Compartilhar grupo no feed"
        >
          📢 Compartilhar
        </button>
      </div>

      <div className="chat-description">
        <p>{group.description}</p>
      </div>

      <div id="messages-container" ref={containerRef} className="messages-container">
        {loading ? (
          <div className="empty-messages"><p>Carregando mensagens...</p></div>
        ) : messages.length === 0 ? (
          <div className="empty-messages"><p>Nenhuma mensagem ainda. Seja o primeiro a conversar! 💬</p></div>
        ) : (
          messages.map(message => {
            const isOwnMessage = message.userId === user.id
            return (
              <div key={message.id} className={`message-item ${isOwnMessage ? 'own-message' : ''}`}>
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
        <button type="submit" className="send-button">Enviar</button>
      </form>
    </div>
  )
}

export default GroupCard
