import React from 'react'
import { MYSTIC_TITLES, canUnlockMysticTitle, unlockMysticTitle } from '../utils/gamification'
import './MysticTitleSelector.css'

function MysticTitleSelector({ user, onTitleSelect }) {
  const userEssence = user.essence || user.points || 0
  const unlockedTitles = user.unlockedMysticTitles || []
  const activeTitle = user.activeMysticTitle || null

  const handleTitleSelect = (titleId) => {
    if (unlockedTitles.includes(titleId)) {
      // Título já desbloqueado, apenas aplica.
      // FIX: grava nos DOIS campos. Componentes (Profile, este selector)
      // leem activeMysticTitle, mas o toDbProfile em db.js persiste a
      // partir de activeTitle. Sem o alias, a seleção do título ativo
      // ficava só em memória e se perdia no próximo refresh.
      const updatedUser = {
        ...user,
        activeMysticTitle: titleId,
        activeTitle: titleId
      }
      onTitleSelect(titleId, updatedUser)
    } else if (canUnlockMysticTitle(user, titleId)) {
      // Pode desbloquear, então desbloqueia primeiro e depois aplica
      const updatedUser = unlockMysticTitle(user, titleId)
      updatedUser.activeMysticTitle = titleId
      updatedUser.activeTitle = titleId
      onTitleSelect(titleId, updatedUser)
    }
  }

  return (
    <div className="mystic-title-selector">
      <h3 className="section-title">🌈 Títulos Místicos</h3>
      <p className="title-selector-description">
        Títulos simbólicos que refletem sua participação na comunidade
      </p>
      
      <div className="titles-grid">
        {Object.values(MYSTIC_TITLES).map(title => {
          const isUnlocked = unlockedTitles.includes(title.id)
          const isActive = activeTitle === title.id
          const canUnlock = canUnlockMysticTitle(user, title.id)

          return (
            <div
              key={title.id}
              className={`title-card ${isUnlocked ? 'unlocked' : 'locked'} ${isActive ? 'active' : ''} ${canUnlock && !isUnlocked ? 'can-unlock' : ''}`}
              onClick={() => (isUnlocked || canUnlock) && handleTitleSelect(title.id)}
            >
              <div className="title-icon">{title.icon}</div>
              
              <div className="title-info">
                <div className="title-name">{title.name}</div>
                <div className="title-description">{title.description}</div>
                {/* FIX QA: removido o display "🔮 N Essências". Títulos
                    são desbloqueados por comportamento ao longo do tempo
                    (vide FAQ), não por threshold de essência. */}
              </div>
              
              {!isUnlocked && (
                <div className="title-lock-overlay">
                  <div className="lock-icon">🔒</div>
                  <div className="lock-text">
                    {canUnlock ? 'Clique para desbloquear' : 'Bloqueado'}
                  </div>
                </div>
              )}

              {isActive && (
                <div className="title-active-badge">Ativo</div>
              )}

              {isUnlocked && !isActive && (
                <button
                  className="title-apply-button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleTitleSelect(title.id)
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

export default MysticTitleSelector
