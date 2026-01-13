import React, { useEffect, useState } from 'react'
import { NARRATIVE_MESSAGES } from '../utils/gamification'
import './NarrativeMessage.css'

/**
 * Componente de Mensagem Narrativa Exclusiva
 * Exibe mensagens simbólicas ao atingir metas importantes
 */
function NarrativeMessage({ messageId, onClose }) {
  const [isVisible, setIsVisible] = useState(true)
  const message = NARRATIVE_MESSAGES[messageId.toUpperCase()] || 
                  Object.values(NARRATIVE_MESSAGES).find(m => m.id === messageId)

  if (!message) return null

  useEffect(() => {
    // Auto-fecha após 8 segundos
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => {
        if (onClose) onClose()
      }, 500) // Aguarda animação de saída
    }, 8000)

    return () => clearTimeout(timer)
  }, [onClose])

  if (!isVisible) return null

  return (
    <div className={`narrative-message ${!isVisible ? 'narrative-message-exit' : ''}`}>
      <div className="narrative-message-content">
        <div className="narrative-message-icon">{message.icon}</div>
        <div className="narrative-message-text">
          <p>{message.message}</p>
        </div>
        <button 
          className="narrative-message-close"
          onClick={() => {
            setIsVisible(false)
            setTimeout(() => {
              if (onClose) onClose()
            }, 500)
          }}
          aria-label="Fechar mensagem"
        >
          ×
        </button>
      </div>
    </div>
  )
}

export default NarrativeMessage
