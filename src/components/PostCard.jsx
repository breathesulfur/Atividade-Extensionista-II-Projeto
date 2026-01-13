import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { filterProfanity } from '../utils/profanityFilter'
import { addEssence, ESSENCE, checkBadges, getActionMessage, BADGES } from '../utils/gamification'
import { getStorage, getPosts, getGroups } from '../utils/storage'
import { notifyError, notifyAchievement, notifySuccess, notifyEssenceGained } from '../utils/notifications'
import EmojiPicker from './EmojiPicker'
import AvatarFrame from './AvatarFrame'
import ReportModal from './ReportModal'
import './PostCard.css'

function PostCard({ post, currentUser, onUpdate, onDelete, onUserUpdate }) {
  const [commentText, setCommentText] = useState('')
  const [showComments, setShowComments] = useState(false)
  const [postAuthor, setPostAuthor] = useState(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [emojiPickerFor, setEmojiPickerFor] = useState(null) // 'post' ou commentId
  const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0 })
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportType, setReportType] = useState(null) // 'post' ou 'comment'
  const [reportCommentId, setReportCommentId] = useState(null)
  const emojiButtonRef = useRef(null)

  // Busca dados do autor da postagem
  useEffect(() => {
    const savedUsers = getStorage('inclusivchat_users') || []
    let author = savedUsers.find(u => u.id === post.userId)
    
    // Se não encontrou nos usuários salvos, usa o usuário atual se for ele
    if (!author && post.userId === currentUser.id) {
      author = currentUser
    }
    
    // Se ainda não encontrou, cria um objeto básico com os dados da postagem
    if (!author) {
      author = {
        id: post.userId,
        name: post.userName,
        pronoun: post.userPronoun,
        avatar: post.userAvatar || null,
        picture: post.userAvatar || null
      }
    }
    
    setPostAuthor(author)
  }, [post.userId, post.userName, post.userPronoun, post.userAvatar, currentUser])

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

  // Manipula reação (novo sistema)
  const handleReaction = (emoji) => {
    const currentReactions = getReactions()
    const userReacted = hasUserReacted(emoji)
    let updatedReactions = { ...currentReactions }

    if (userReacted) {
      // Remove reação
      updatedReactions[emoji] = updatedReactions[emoji].filter(id => id !== currentUser.id)
      // Remove emoji se não houver mais reações
      if (updatedReactions[emoji].length === 0) {
        delete updatedReactions[emoji]
      }
    } else {
      // Adiciona reação
      if (!updatedReactions[emoji]) {
        updatedReactions[emoji] = []
      }
      // Garante que não duplica o usuário
      if (!updatedReactions[emoji].includes(currentUser.id)) {
        updatedReactions[emoji] = [...updatedReactions[emoji], currentUser.id]
      }
      
      // Nota: Reações não concedem essências conforme o sistema de gamificação
      // As essências são concedidas apenas pelas ações principais listadas no FAQ
    }

    // Atualiza likes também para compatibilidade (se for ❤️)
    let updatedLikes = post.likes || []
    if (emoji === '❤️') {
      if (userReacted) {
        updatedLikes = updatedLikes.filter(id => id !== currentUser.id)
      } else {
        // Garante que não duplica o usuário
        if (!updatedLikes.includes(currentUser.id)) {
          updatedLikes = [...updatedLikes, currentUser.id]
        }
      }
    }

    const updatedPost = {
      ...post,
      reactions: updatedReactions,
      likes: updatedLikes
    }

    onUpdate(post.id, updatedPost)
    setShowEmojiPicker(false)
  }

  // Manipula curtida (mantém para compatibilidade)
  const handleLike = () => {
    handleReaction('❤️')
  }

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

  // Manipula comentário
  const handleComment = (e) => {
    e.preventDefault()

    if (!commentText.trim()) {
      notifyError('Por favor, escreva um comentário.')
      return
    }

    // Filtra palavras ofensivas
    const filteredComment = filterProfanity(commentText.trim())

    const newComment = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userPronoun: currentUser.pronoun,
      content: filteredComment,
      createdAt: new Date().toISOString()
    }

    const updatedPost = {
      ...post,
      comments: [...(post.comments || []), newComment]
    }

    // Adiciona Essência ao usuário
    let updatedUser = addEssence(currentUser, ESSENCE.SUPPORTIVE_COMMENT)
    onUserUpdate(updatedUser)
    
    // Notifica sobre essências ganhas
    notifyEssenceGained(ESSENCE.SUPPORTIVE_COMMENT, 'Fazer comentário de apoio')

    onUpdate(post.id, updatedPost)
    
    // Verifica badges após comentar (com delay para garantir que o comentário foi salvo)
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
    
    setCommentText('')
    setShowComments(true)
  }

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="post-author">
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
        </div>
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
        {post.content}
      </div>

      <div className="post-actions">
        <div className="reactions-container">
          <div className="reaction-picker-wrapper">
            <button
              ref={emojiButtonRef}
              onClick={() => handleOpenEmojiPicker('post')}
              className="action-button reaction-button"
              aria-label="Adicionar reação"
              title="Adicionar reação"
            >
              😊
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
                    <div className="comment-author">
                      <strong>{comment.userName}</strong>
                      <span className="comment-pronoun">({comment.userPronoun})</span>
                    </div>
                    <div className="comment-actions">
                      <div className="comment-date">{formatDate(comment.createdAt)}</div>
                      {comment.userId !== currentUser.id && (
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
                  <div className="comment-content">{comment.content}</div>
                </div>
              ))
            ) : (
              <p className="no-comments">Nenhum comentário ainda. Seja o primeiro!</p>
            )}
          </div>

          <form onSubmit={handleComment} className="comment-form">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Escreva um comentário..."
              className="comment-input"
              maxLength="200"
            />
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
