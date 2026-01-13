import React, { useState, useRef, useEffect } from 'react'
import './EmojiPicker.css'

// Lista de emojis populares para reações
const EMOJI_CATEGORIES = {
  reactions: ['❤️', '🔥', '👍', '🎉', '😂', '😮', '😢', '😡', '👏', '🎯', '💪', '⚡', '🏆', '🌟', '💜', '🎮', '⚔️', '🛡️', '🚗', '⚽', '🧟', '😱', '🎨', '✨', '💯', '🎊', '🎈', '🎁', '💝', '🎪', '🎭', '🎬', '🎤', '🎧'],
  emotions: ['😊', '🥰', '😍', '🤔', '😴', '🤗', '😎', '🤩', '🙄', '😇', '😌', '😋', '😝', '😜', '🤪', '😏', '😒', '😔', '😪', '🤤', '😴', '😪', '🤯', '🥳', '😭', '😤', '🤬', '🤢', '🤮', '😵'],
  objects: ['⭐', '💎', '🎁', '🎊', '🎈', '🎀', '🏅', '🥇', '🎖️', '🏵️', '👑', '💍', '💎', '🔮', '🎯', '🎲', '🎰', '🎮', '🕹️', '🎸', '🎺', '🎷', '🥁', '🎻', '📱', '💻', '⌚', '📷', '🎥', '📺']
}

// Ícones para as categorias
const CATEGORY_ICONS = {
  reactions: '❤️',
  emotions: '😊',
  objects: '⭐'
}

function EmojiPicker({ onEmojiSelect, onClose }) {
  const [activeCategory, setActiveCategory] = useState('reactions')
  const [customEmoji, setCustomEmoji] = useState('')
  const pickerRef = useRef(null)
  const inputRef = useRef(null)

  // Fecha o picker ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onClose])

  const handleEmojiClick = (emoji) => {
    onEmojiSelect(emoji)
    onClose()
  }

  const allEmojis = [...EMOJI_CATEGORIES.reactions, ...EMOJI_CATEGORIES.emotions, ...EMOJI_CATEGORIES.objects]

  return (
    <div className="emoji-picker-container" ref={pickerRef}>
      <div className="emoji-picker">
        <div className="emoji-picker-header">
          <span className="emoji-picker-title">Escolha uma reação</span>
          <button 
            className="emoji-picker-close"
            onClick={onClose}
            aria-label="Fechar seletor de emojis"
          >
            ×
          </button>
        </div>
        
        <div className="emoji-picker-categories">
          <button
            className={`emoji-category-btn ${activeCategory === 'reactions' ? 'active' : ''}`}
            onClick={() => setActiveCategory('reactions')}
            title="Reações"
          >
            <span className="category-icon">{CATEGORY_ICONS.reactions}</span>
            <span className="category-label">Reações</span>
          </button>
          <button
            className={`emoji-category-btn ${activeCategory === 'emotions' ? 'active' : ''}`}
            onClick={() => setActiveCategory('emotions')}
            title="Emoções"
          >
            <span className="category-icon">{CATEGORY_ICONS.emotions}</span>
            <span className="category-label">Emoções</span>
          </button>
          <button
            className={`emoji-category-btn ${activeCategory === 'objects' ? 'active' : ''}`}
            onClick={() => setActiveCategory('objects')}
            title="Objetos"
          >
            <span className="category-icon">{CATEGORY_ICONS.objects}</span>
            <span className="category-label">Objetos</span>
          </button>
        </div>

        <div className="emoji-picker-grid">
          {EMOJI_CATEGORIES[activeCategory].map((emoji, index) => (
            <button
              key={`${emoji}-${index}`}
              className="emoji-item"
              onClick={() => handleEmojiClick(emoji)}
              aria-label={`Reagir com ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Campo para emoji customizado */}
        <div className="emoji-custom-input">
          <input
            ref={inputRef}
            type="text"
            placeholder="Digite um emoji..."
            maxLength="4"
            className="emoji-text-input"
            value={customEmoji}
            onChange={(e) => setCustomEmoji(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && customEmoji.trim()) {
                handleEmojiClick(customEmoji.trim())
                setCustomEmoji('')
              }
            }}
          />
          <button
            type="button"
            className="emoji-add-custom"
            onClick={() => {
              if (customEmoji.trim()) {
                handleEmojiClick(customEmoji.trim())
                setCustomEmoji('')
                if (inputRef.current) {
                  inputRef.current.focus()
                }
              }
            }}
            disabled={!customEmoji.trim()}
          >
            Adicionar
          </button>
        </div>
      </div>
    </div>
  )
}

export default EmojiPicker
