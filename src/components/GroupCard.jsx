import React, { useState, useEffect, useRef } from 'react'
import { fetchGroupMessages, sendGroupMessage, updateGroupMessage, deleteGroupMessage, subscribeToGroupMessages, createNotification, createPost } from '../lib/db'
import { getPosts } from '../utils/storage'
import { filterProfanity } from '../utils/profanityFilter'
import { checkBadges, getActionMessage, BADGES } from '../utils/gamification'
import { notifyError, notifyAchievement, notifySuccess } from '../utils/notifications'
import './GroupCard.css'

function GroupCard({ group, user, onBack, onUserUpdate, onOpenProfile }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [editingMessageId, setEditingMessageId] = useState(null)
  const [editContent, setEditContent] = useState('')
  const [showShareModal, setShowShareModal] = useState(false)
  const containerRef = useRef(null)

  // Carrega mensagens e assina realtime
  useEffect(() => {
    let mounted = true

    fetchGroupMessages(group.id).then(data => {
      if (mounted) { setMessages(data); setLoading(false) }
    })

    // Realtime: nova mensagem inserida por outro usuário
    const unsubscribe = subscribeToGroupMessages(group.id, async () => {
      const data = await fetchGroupMessages(group.id)
      if (mounted) setMessages(data)
    })

    return () => { mounted = false; unsubscribe() }
  }, [group.id])

  // Scroll para o fim quando mensagens chegam
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [messages])

  const isMember = group.members?.includes(user.id) || false

  const handleShareGroup = async () => {
    if (!isMember) { notifyError('Entre no grupo antes de compartilhar.'); return }
    setShowShareModal(true)
  }

  const handleConfirmShare = async () => {
    setShowShareModal(false)
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

    // Gamificação: verifica badges
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

  const handleEditMessage = async (messageId) => {
    if (!editContent.trim()) { notifyError('A mensagem não pode ficar vazia.'); return }
    const filteredContent = filterProfanity(editContent.trim())
    const success = await updateGroupMessage(messageId, filteredContent)
    if (success) {
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, content: filteredContent } : m))
      setEditingMessageId(null)
      setEditContent('')
      notifySuccess('Mensagem editada!')
    } else {
      notifyError('Não foi possível editar a mensagem.')
    }
  }

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Excluir esta mensagem?')) return
    const success = await deleteGroupMessage(messageId)
    if (success) {
      setMessages(prev => prev.filter(m => m.id !== messageId))
      notifySuccess('Mensagem excluída!')
    } else {
      notifyError('Não foi possível excluir a mensagem.')
    }
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
            const isEditing = editingMessageId === message.id
            return (
              <div key={message.id} className={`message-item ${isOwnMessage ? 'own-message' : ''}`}>
                <div className="message-header">
                  {/* FIX P2 (#6): nome do autor da mensagem é clicável → abre perfil */}
                  <button
                    type="button"
                    className="message-author-button"
                    onClick={() => onOpenProfile && onOpenProfile(message.userId)}
                    aria-label={`Abrir perfil de ${message.userName}`}
                    title={`Abrir perfil de ${message.userName}`}
                  >
                    <strong>{message.userName}</strong>
                    <span className="message-pronoun">({message.userPronoun})</span>
                  </button>
                </div>
                {isEditing ? (
                  <div className="message-edit-form">
                    <input
                      type="text"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="message-edit-input"
                      maxLength="300"
                      autoFocus
                    />
                    <div className="message-edit-actions">
                      <button onClick={() => handleEditMessage(message.id)} className="message-edit-save">Salvar</button>
                      <button onClick={() => { setEditingMessageId(null); setEditContent('') }} className="message-edit-cancel">Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <div className="message-content">{message.content}</div>
                )}
                <div className="message-footer">
                  <span className="message-time">{formatDate(message.createdAt)}</span>
                  {isOwnMessage && !isEditing && (
                    <div className="message-actions">
                      <button onClick={() => { setEditingMessageId(message.id); setEditContent(message.content) }} className="message-action-btn" title="Editar">✏️</button>
                      <button onClick={() => handleDeleteMessage(message.id)} className="message-action-btn delete" title="Excluir">🗑️</button>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {showShareModal && (
        <div className="share-modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="share-modal" onClick={(e) => e.stopPropagation()}>
            <h3>📢 Compartilhar Grupo</h3>
            <p>Compartilhar o grupo <strong>"{group.name}"</strong> no seu feed?</p>
            <p className="share-modal-hint">Uma publicação será criada para que outros possam encontrar e entrar no grupo.</p>
            <div className="share-modal-actions">
              <button onClick={() => setShowShareModal(false)} className="share-modal-cancel">Cancelar</button>
              <button onClick={handleConfirmShare} className="share-modal-confirm">Compartilhar</button>
            </div>
          </div>
        </div>
      )}

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
