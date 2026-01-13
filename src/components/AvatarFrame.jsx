import React from 'react'
import { AVATAR_FRAMES } from '../utils/gamification'
import './AvatarFrame.css'

/**
 * Componente de Moldura de Avatar
 * Exibe uma moldura cosmética ao redor do avatar do usuário
 * Pode incluir personagens decorativos
 */
function AvatarFrame({ frameId, children, size = 'medium' }) {
  if (!frameId) return children

  const frame = Object.values(AVATAR_FRAMES).find(f => f.id === frameId)
  if (!frame) return children

  const hasCharacter = frame?.character
  const hasEmoji = !hasCharacter && frame?.icon

  const frameClasses = `avatar-frame avatar-frame-${frameId} avatar-frame-size-${size} ${hasCharacter ? 'avatar-frame-with-character' : ''}`

  return (
    <div className={frameClasses}>
      {children}
      {hasCharacter && (
        <div className={`avatar-frame-character avatar-frame-character-${frame.character}`}>
          {frame.character === 'bear' && '🐻'}
          {frame.character === 'kitty' && '🐱'}
          {frame.character === 'bunny' && '🐰'}
          {frame.character === 'owl' && '🦉'}
        </div>
      )}
      {hasEmoji && (
        <div className={`avatar-frame-decoration avatar-frame-decoration-${frameId}`}>
          <span className="frame-emoji" aria-hidden="true">{frame.icon}</span>
        </div>
      )}
    </div>
  )
}

export default AvatarFrame
