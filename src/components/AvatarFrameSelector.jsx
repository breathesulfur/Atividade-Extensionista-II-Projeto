import React from 'react'
import { AVATAR_FRAMES, canUnlockAvatarFrame, unlockAvatarFrame } from '../utils/gamification'
import AvatarFrame from './AvatarFrame'
import './AvatarFrameSelector.css'

function AvatarFrameSelector({ user, onFrameSelect }) {
  const userEssence = user.essence || user.points || 0
  const unlockedFrames = user.unlockedAvatarFrames || []
  const activeFrame = user.activeAvatarFrame || null

  const handleFrameSelect = (frameId) => {
    if (unlockedFrames.includes(frameId)) {
      // Moldura já desbloqueada, apenas aplica
      const updatedUser = {
        ...user,
        activeAvatarFrame: frameId
      }
      onFrameSelect(frameId, updatedUser)
    } else if (canUnlockAvatarFrame(user, frameId)) {
      // Pode desbloquear, então desbloqueia primeiro e depois aplica
      const updatedUser = unlockAvatarFrame(user, frameId)
      updatedUser.activeAvatarFrame = frameId
      onFrameSelect(frameId, updatedUser)
    }
  }

  return (
    <div className="avatar-frame-selector">
      <h3 className="section-title">🧿 Molduras de Avatar</h3>
      <p className="frame-selector-description">
        Recompensas cosméticas para personalizar seu avatar
      </p>
      
      <div className="frames-grid">
        {Object.values(AVATAR_FRAMES).map(frame => {
          const isUnlocked = unlockedFrames.includes(frame.id)
          const isActive = activeFrame === frame.id
          const canUnlock = userEssence >= frame.requiredEssence

          return (
            <div
              key={frame.id}
              className={`frame-card ${isUnlocked ? 'unlocked' : 'locked'} ${isActive ? 'active' : ''} ${canUnlock && !isUnlocked ? 'can-unlock' : ''}`}
              onClick={() => (isUnlocked || canUnlock) && handleFrameSelect(frame.id)}
            >
              <div className="frame-preview">
                <AvatarFrame frameId={isUnlocked || canUnlock ? frame.id : null} size="medium">
                  <div className="frame-preview-avatar">
                    <span className="frame-preview-emoji">👤</span>
                  </div>
                </AvatarFrame>
              </div>
              
              <div className="frame-info">
                <div className="frame-name">
                  {frame.icon} {frame.name}
                </div>
                <div className="frame-description">{frame.description}</div>
                <div className="frame-requirement">
                  🔮 {frame.requiredEssence} Essências
                </div>
              </div>
              
              {!isUnlocked && (
                <div className="frame-lock-overlay">
                  <div className="lock-icon">🔒</div>
                  <div className="lock-text">
                    {canUnlock ? (
                      <span>Clique para desbloquear</span>
                    ) : (
                      <span>Desbloqueie com {frame.requiredEssence} Essências</span>
                    )}
                  </div>
                </div>
              )}

              {isActive && (
                <div className="frame-active-badge">Ativa</div>
              )}

              {isUnlocked && !isActive && (
                <button
                  className="frame-apply-button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleFrameSelect(frame.id)
                  }}
                >
                  Aplicar
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default AvatarFrameSelector
