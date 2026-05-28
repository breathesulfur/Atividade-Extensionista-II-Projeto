import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { filterProfanity } from '../utils/profanityFilter'
import { addEssence, addEssenceWithChecks, ESSENCE, checkBadges, getActionMessage, BADGES, MIN_COMMENT_LENGTH_FOR_ESSENCE } from '../utils/gamification'
import { toggleReaction as dbToggleReaction, addComment as dbAddComment, updateComment, deleteComment, createNotification } from '../lib/db'
import { getPosts, getGroups } from '../utils/storage'
import { notifyError, notifyAchievement, notifySuccess, notifyEssenceGained } from '../utils/notifications'
import EmojiPicker from './EmojiPicker'
import AvatarFrame from './AvatarFrame'
import ReportModal from './ReportModal'
import './PostCard.css'

const GROUP_REF_REGEX = /\[group:([0-9a-f-]{36})\]/i

function extractGroupRef(content) {
  const match = (content || '').match(GROUP_REF_REGEX)
  if (!match) return { text: content || '', groupId: null }
  return {
    text: content.replace(GROUP_REF_REGEX, '').trim(),
    groupId: match[1],
  }
}

function PostCard({ post, currentUser, onUpdate, onDelete, onUserUpdate, onOpenGroup, onOpenProfile }) {
  const [commentText, setCommentText] = useState('')
  const [showComments, setShowComments] = useState(false)
  const [postAuthor, setPostAuthor] = useState(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [emojiPickerFor, setEmojiPickerFor] = useState(null) // 'post' ou commentId
  const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0 })
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportType, setReportType] = useState(null) // 'post' ou 'comment'
  const [reportCommentId, setReportCommentId] = useState(null)
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editCommentText, setEditCommentText] = useState('')
  const emojiButtonRef = useRef(null)

  // Usa authorProfile já embutido no post (vem do join Supabase)
  useEffect(() => {
    if (post.authorProfile) {
      setPostAuthor(post.authorProfile)
    } else if (post.userId === currentUser.id) {
      setPostAuthor(currentUser)
    } else {
      setPostAuthor({
        id: post.userId,
        name: post.userName,
        pronoun: post.userPronoun,
        avatar: post.userAvatar || null,
      })
    }
  }, [post.authorProfile, post.userId, post.userName, post.userPronoun, post.userAvatar, currentUser])

  // Atualiza posição do modal quando necessário
  useEffect(() => {
    if (showEmojiPicker && emojiButtonRef.current) {
      const updatePosition = () => {
        if (emojiButtonRef.current) {
          const rect = emojiButtonRef.current.getBoundingClientRect()
          const modalHeight = 470
          const spacing = 10
          
          const spaceAbove = rect.top
          const spaceBelow = window.innerHeight - rect.bottom
          
          let top
          
          if (spaceAbove >= modalHeight + spacing) {
            top = rect.top - modalHeight - spacing
          } else if (spaceBelow >= modalHeight + spacing) {
            top = rect.bottom + spacing
          } else {
            top = Math.max(10, rect.top - modalHeight - spacing)
          }
          
          const modalWidth = 320
          const left = Math.max(10, Math.min(rect.left - (modalWidth / 2) + (rect.width / 2), window.innerWidth - modalWidth - 10))
          
          setPickerPosition({ top, left })
        }
      }
      
      updatePosition()
      window.addEventListener('scroll', updatePosition, true)
      window.addEventListener('resize', updatePosition)
      
      return () => {
        window.removeEventListener('scroll', updatePosition, true)
        window.removeEventListener('resize', updatePosition)
      }
    }
  }, [showEmojiPicker])

  // Verifica se o usuário já curtiu (mantém compatibilidade)
  const isLiked = post.likes?.includes(currentUser.id) || false

  // Obtém todas as reações do post (incluindo likes como ❤️ para compatibilidade)
  const getReactions = () => {
    const reactions = post.reactions || {}
    
    // Migra likes antigos para reações
    if (post.likes && post.likes.length > 0 && !reactions['❤️']) {
      reactions['❤️'] = [...post.likes]
    }
    
    return reactions
  }

  // Verifica se o usuário já reagiu com um emoji específico
  const hasUserReacted = (emoji) => {
    const reactions = getReactions()
    return reactions[emoji]?.includes(currentUser.id) || false
  }

  // Conta total de reações
  const getTotalReactions = () => {
    const reactions = getReactions()
    return Object.values(reactions).reduce((total, users) => total + users.length, 0)
  }

  // Formata data
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'agora'
    if (minutes < 60) return `${minutes} min atrás`
    if (hours < 24) return `${hours}h atrás`
    if (days < 7) return `${days}d atrás`
    return date.toLocaleDateString('pt-BR')
  }

  const handleReaction = async (emoji) => {
    const currentReactions = getReactions()
    const userReacted = hasUserReacted(emoji)
    let updatedReactions = { ...currentReactions }

    if (userReacted) {
      updatedReactions[emoji] = updatedReactions[emoji].filter(id => id !== currentUser.id)
      if (updatedReactions[emoji].length === 0) delete updatedReactions[emoji]
    } else {
      if (!updatedReactions[emoji]) updatedReactions[emoji] = []
      if (!updatedReactions[emoji].includes(currentUser.id)) {
        updatedReactions[emoji] = [...updatedReactions[emoji], currentUser.id]
      }
    }

    let updatedLikes = post.likes || []
    if (emoji === '❤️') {
      if (userReacted) {
        updatedLikes = updatedLikes.filter(id => id !== currentUser.id)
      } else if (!updatedLikes.includes(currentUser.id)) {
        updatedLikes = [...updatedLikes, currentUser.id]
      }
    }

    onUpdate(post.id, { ...post, reactions: updatedReactions, likes: updatedLikes })
    setShowEmojiPicker(false)

    await dbToggleReaction(post.id, currentUser.id, emoji)

    if (!userReacted && post.userId !== currentUser.id) {
      createNotification({
        userId: post.userId,
        type: 'reaction',
        sourceUserId: currentUser.id,
        sourceUserName: currentUser.name,
        postId: post.id,
        message: `${currentUser.name} reagiu com ${emoji} à sua postagem`,
      })
    }
  }

  const handleLike = () => handleReaction('❤️')

  // Abre o seletor de emojis
  const handleOpenEmojiPicker = (forWhat) => {
    if (emojiButtonRef.current) {
      const rect = emojiButtonRef.current.getBoundingClientRect()
      const modalHeight = 470 // altura aproximada do modal
      const spacing = 10 // espaçamento entre botão e modal
      
      // Verifica se há espaço acima do botão
      const spaceAbove = rect.top
      const spaceBelow = window.innerHeight - rect.bottom
      
      let top, left
      
      if (spaceAbove >= modalHeight + spacing) {
        // Há espaço suficiente acima - posiciona acima
        top = rect.top - modalHeight - spacing
      } else if (spaceBelow >= modalHeight + spacing) {
        // Há espaço abaixo - posiciona abaixo
        top = rect.bottom + spacing
      } else {
        // Não há espaço suficiente - posiciona acima mas ajusta para caber na tela
        top = Math.max(10, rect.top - modalHeight - spacing)
      }
      
      // Centraliza horizontalmente considerando a largura do modal (320px)
      const modalWidth = 320
      left = Math.max(10, Math.min(rect.left - (modalWidth / 2) + (rect.width / 2), window.innerWidth - modalWidth - 10))
      
      setPickerPosition({ top, left })
    }
    setEmojiPickerFor(forWhat)
    setShowEmojiPicker(true)
  }

  // Abre modal de denúncia para postagem
  const handleReportPost = () => {
    setReportType('post')
    setReportCommentId(null)
    setShowReportModal(true)
  }

  // Abre modal de denúncia para comentário
  const handleReportComment = (commentId) => {
    setReportType('comment')
    setReportCommentId(commentId)
    setShowReportModal(true)
  }

  // Processa a denúncia após o usuário preencher o motivo
  const handleSubmitReport = async (reason, type, commentId) => {
    try {
      const reportTypeToUse = type || reportType
      const commentIdToUse = commentId !== undefined ? commentId : reportCommentId
      
      // Salva denúncia no localStorage
      const reports = JSON.parse(localStorage.getItem('inclusivchat_reports') || '[]')
      const report = {
        id: Date.now().toString(),
        type: reportTypeToUse,
        postId: post.id,
        commentId: reportTypeToUse === 'comment' ? commentIdToUse : null,
        userId: currentUser.id,
        userName: currentUser.name,
        reason: reason,
        reportedAt: new Date().toISOString(),
        status: 'pending'
      }
      reports.push(report)
      localStorage.setItem('inclusivchat_reports', JSON.stringify(reports))

      // Adiciona Essência ao usuário por denunciar conteúdo
      let updatedUser = addEssence(currentUser, ESSENCE.REPORT_CONTENT)
      onUserUpdate(updatedUser)
      
      // Notifica sobre essências ganhas
      notifyEssenceGained(ESSENCE.REPORT_CONTENT, 'Denunciar conteúdo ofensivo')

      // Verifica badges (com delay para garantir que os dados foram atualizados)
      setTimeout(() => {
        const updatedPosts = getPosts()
        const updatedGroups = getGroups()
        const newBadges = checkBadges(updatedUser, updatedPosts, updatedGroups, {})
        
        if (newBadges.length > 0) {
          const trulyNewBadges = newBadges.filter(badge => 
            !(updatedUser.badges || []).includes(badge.id)
          )
          
          if (trulyNewBadges.length > 0) {
            const finalUser = {
              ...updatedUser,
              badges: [...(updatedUser.badges || []), ...trulyNewBadges.map(b => b.id)]
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
              }, 100 + (index * 500))
            })
          }
        }
      }, 100)

      notifySuccess(
        reportType === 'post' 
          ? 'Postagem denunciada. Nossa equipe analisará o conteúdo.' 
          : 'Comentário denunciado. Nossa equipe analisará o conteúdo.'
      )
    } catch (error) {
      console.error('Erro ao denunciar:', error)
      notifyError('Erro ao processar denúncia. Tente novamente.')
    }
  }

  const handleComment = async (e) => {
    e.preventDefault()

    if (!commentText.trim()) {
      notifyError('Por favor, escreva um comentário.')
      return
    }

    const filteredComment = filterProfanity(commentText.trim())

    const optimisticComment = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userPronoun: currentUser.pronoun,
      content: filteredComment,
      createdAt: new Date().toISOString(),
    }
    onUpdate(post.id, { ...post, comments: [...(post.comments || []), optimisticComment] })
    setCommentText('')
    setShowComments(true)

    const saved = await dbAddComment(post.id, currentUser.id, filteredComment)
    if (saved) {
      onUpdate(post.id, {
        ...post,
        comments: [...(post.comments || []), saved],
      })
      if (post.userId !== currentUser.id) {
        createNotification({
          userId: post.userId,
          type: 'comment',
          sourceUserId: currentUser.id,
          sourceUserName: currentUser.name,
          postId: post.id,
          message: `${currentUser.name} comentou na sua postagem: "${filteredComment.slice(0, 60)}${filteredComment.length > 60 ? '...' : ''}"`,
        })
      }
    }

    let updatedUser = currentUser
    if (filteredComment.length >= MIN_COMMENT_LENGTH_FOR_ESSENCE) {
      const result = addEssenceWithChecks(currentUser, ESSENCE.SUPPORTIVE_COMMENT, 'SUPPORTIVE_COMMENT')
      if (result.success) {
        updatedUser = result.user
        notifyEssenceGained(ESSENCE.SUPPORTIVE_COMMENT, 'Fazer comentário de apoio')
      }
    }
    onUserUpdate(updatedUser)
  }

  const handleEditComment = (comment) => {
    setEditingCommentId(comment.id)
    setEditCommentText(comment.content)
  }

  const handleSaveEditComment = async (commentId) => {
    if (!editCommentText.trim()) return
    const ok = await updateComment(commentId, editCommentText.trim())
    if (ok) {
      onUpdate(post.id, {
        ...post,
        comments: post.comments.map(c =>
          c.id === commentId ? { ...c, content: editCommentText.trim(), updatedAt: new Date().toISOString() } : c
        ),
      })
      setEditingCommentId(null)
    } else {
      notifyError('Erro ao editar comentário.')
    }
  }

  const handleDeleteComment = async (commentId) => {
    await deleteComment(commentId)
    onUpdate(post.id, {
      ...post,
      comments: (post.comments || []).filter(c => c.id !== commentId),
    })
  }

  return (
    <div id={`post-${post.id}`} className="post-card">
      <div className="post-header">
        {/* FIX P2 (#6): autor (avatar + nome) clicável → abre perfil */}
        <button
          type="button"
          className="post-author post-author-button"
          onClick={() => onOpenProfile && onOpenProfile(post.userId)}
          aria-label={`Abrir perfil de ${post.userName}`}
          title={`Abrir perfil de ${post.userName}`}
        >
          <AvatarFrame
            frameId={postAuthor?.activeAvatarFrame && postAuthor?.unlockedAvatarFrames?.includes(postAuthor.activeAvatarFrame)
              ? postAuthor.activeAvatarFrame
              : null}
            size="small"
          >
            <div className="author-avatar">
              {postAuthor && (postAuthor.avatar || postAuthor.picture) ? (
                <img
                  src={postAuthor.avatar || postAuthor.picture}
                  alt={post.userName}
                  className="author-avatar-img"
                  onError={(e) => {
                    // Se a imagem falhar ao carregar, esconde e mostra a inicial
                    const avatarDiv = e.target.parentElement
                    e.target.style.display = 'none'
                    const fallback = avatarDiv.querySelector('.avatar-fallback')
                    if (fallback) fallback.style.display = 'flex'
                  }}
                />
              ) : null}
              <span
                className="avatar-fallback"
                style={{ display: (postAuthor?.avatar || postAuthor?.picture) ? 'none' : 'flex' }}
              >
                {post.userName.charAt(0).toUpperCase()}
              </span>
            </div>
          </AvatarFrame>
          <div className="author-info">
            <div className="author-name">{post.userName}</div>
            <div className="author-pronoun">{post.userPronoun}</div>
            {(post.userCity || post.userState) && (
              <div className="author-location">
                📍 {[post.userCity, post.userState].filter(Boolean).join(', ')}
              </div>
            )}
          </div>
        </button>
        <div className="post-header-actions">
          <div className="post-date">{formatDate(post.createdAt)}</div>
          <div className="post-actions-buttons">
            {post.userId === currentUser.id && (
              <button
                onClick={() => onDelete && onDelete(post.id)}
                className="delete-button"
                aria-label="Excluir postagem"
                title="Excluir postagem"
              >
                🗑️
              </button>
            )}
            {post.userId !== currentUser.id && (
              <button
                onClick={handleReportPost}
                className="report-button"
                aria-label="Denunciar postagem"
                title="Denunciar postagem"
              >
                🚩
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="post-content">
        {extractGroupRef(post.content).text}
      </div>

      {extractGroupRef(post.content).groupId && (
        <button
          type="button"
          className="post-group-cta"
          onClick={() => onOpenGroup && onOpenGroup(extractGroupRef(post.content).groupId)}
        >
          🎮 Visitar grupo
        </button>
      )}

      <div className="post-actions">
        <div className="reactions-container">
          <div className="reaction-picker-wrapper">
            <button
              ref={emojiButtonRef}
              onClick={() => handleOpenEmojiPicker('post')}
              className="action-button reaction-button"
              aria-label="Reagir à postagem"
              title="Reagir à postagem"
            >
              😊 <span className="reaction-button-label">Reagir</span>
            </button>
            {showEmojiPicker && emojiPickerFor === 'post' && createPortal(
              <div 
                className="emoji-picker-wrapper"
                style={{
                  top: `${pickerPosition.top}px`,
                  left: `${pickerPosition.left}px`
                }}
              >
                <EmojiPicker
                  onEmojiSelect={handleReaction}
                  onClose={() => setShowEmojiPicker(false)}
                />
              </div>,
              document.body
            )}
          </div>
          
          {/* Mostra reações ativas */}
          <div className="reactions-display">
            {Object.entries(getReactions()).map(([emoji, users]) => {
              const userReacted = users.includes(currentUser.id)
              return (
                <button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className={`reaction-item ${userReacted ? 'active' : ''}`}
                  title={`${users.length} ${users.length === 1 ? 'pessoa reagiu' : 'pessoas reagiram'}`}
                >
                  <span className="reaction-emoji">{emoji}</span>
                  <span className="reaction-count">{users.length}</span>
                </button>
              )
            })}
          </div>
        </div>
        
        <button
          onClick={() => setShowComments(!showComments)}
          className="action-button comment-button"
        >
          💬 {post.comments?.length || 0}
        </button>
      </div>

      {showComments && (
        <div className="comments-section">
          <div className="comments-list">
            {post.comments && post.comments.length > 0 ? (
              post.comments.map(comment => (
                <div key={comment.id} className="comment-item">
                  <div className="comment-header">
                    {/* FIX P2 (#6): nome do comentarista é clicável → abre perfil */}
                    <button
                      type="button"
                      className="comment-author comment-author-button"
                      onClick={() => onOpenProfile && onOpenProfile(comment.userId)}
                      aria-label={`Abrir perfil de ${comment.userName}`}
                      title={`Abrir perfil de ${comment.userName}`}
                    >
                      <strong>{comment.userName}</strong>
                      <span className="comment-pronoun">({comment.userPronoun})</span>
                    </button>
                    <div className="comment-actions">
                      <div className="comment-date">{formatDate(comment.createdAt)}{comment.updatedAt && ' (editado)'}</div>
                      {comment.userId === currentUser.id ? (
                        <>
                          <button
                            onClick={() => handleEditComment(comment)}
                            className="edit-comment-button"
                            aria-label="Editar comentário"
                            title="Editar comentário"
                          >✏️</button>
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="delete-comment-button"
                            aria-label="Excluir comentário"
                            title="Excluir comentário"
                          >🗑️</button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleReportComment(comment.id)}
                          className="report-comment-button"
                          aria-label="Denunciar comentário"
                          title="Denunciar comentário"
                        >
                          🚩
                        </button>
                      )}
                    </div>
                  </div>
                  {editingCommentId === comment.id ? (
                    <div className="comment-edit-form">
                      <input
                        type="text"
                        value={editCommentText}
                        onChange={e => setEditCommentText(e.target.value)}
                        className="comment-input"
                        maxLength="200"
                        autoFocus
                      />
                      <div className="comment-edit-actions">
                        <button onClick={() => handleSaveEditComment(comment.id)} className="comment-submit">Salvar</button>
                        <button onClick={() => setEditingCommentId(null)} className="cancel-edit-button">Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <div className="comment-content">{comment.content}</div>
                  )}
                </div>
              ))
            ) : (
              <p className="no-comments">Nenhum comentário ainda. Seja o primeiro!</p>
            )}
          </div>

          <form onSubmit={handleComment} className="comment-form">
            <div className="comment-input-wrapper">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Escreva um comentário..."
                className="comment-input"
                maxLength="200"
              />
              <span className={`comment-char-count ${commentText.length >= 180 ? 'warning' : ''} ${commentText.length >= 200 ? 'limit' : ''}`}>
                {commentText.length}/200
              </span>
            </div>
            <button type="submit" className="comment-submit">
              Enviar
            </button>
          </form>
        </div>
      )}

      {/* Modal de Denúncia */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => {
          setShowReportModal(false)
          setReportType(null)
          setReportCommentId(null)
        }}
        onSubmit={(reason) => handleSubmitReport(reason, reportType, reportCommentId)}
        type={reportType || 'post'}
        itemName={reportType === 'comment' ? 'este comentário' : 'esta postagem'}
      />
    </div>
  )
}

export default PostCard
