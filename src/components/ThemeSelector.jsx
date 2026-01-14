import React from 'react'
import { THEMES, canUnlockTheme, unlockTheme, applyTheme } from '../utils/gamification'
import './ThemeSelector.css'

function ThemeSelector({ user, onThemeSelect }) {
  const userEssence = user.essence || user.points || 0
  const unlockedThemes = user.unlockedThemes || []
  const activeTheme = user.activeTheme || null

  const handleThemeSelect = (themeId) => {
    // Se themeId for null, retorna ao tema padrão
    if (themeId === null || themeId === undefined) {
      onThemeSelect(null, user)
      return
    }
    
    if (unlockedThemes.includes(themeId)) {
      // Tema já desbloqueado, apenas aplica
      onThemeSelect(themeId, user)
    } else if (canUnlockTheme(user, themeId)) {
      // Pode desbloquear, então desbloqueia primeiro
      const updatedUser = unlockTheme(user, themeId)
      // Aplica o tema imediatamente após desbloquear para prévia visual
      // Garante que o tema seja aplicado diretamente no usuário atualizado
      const userWithThemeApplied = applyTheme(updatedUser, themeId)
      // Passa o usuário com tema aplicado para mostrar prévia imediatamente
      onThemeSelect(themeId, userWithThemeApplied)
    }
  }
  
  // Verifica se o tema padrão está ativo (nenhum tema selecionado)
  const isDefaultThemeActive = !activeTheme || activeTheme === null

  return (
    <div className="theme-selector">
      <h3 className="section-title">Temas Visuais</h3>
      <p className="theme-selector-description">
        Desbloqueie temas personalizados: 50, 60, 70, 80, 90 e 100 Essências
      </p>
      
      <div className="themes-grid">
        {/* Card do Tema Padrão */}
        <div
          className={`theme-card unlocked ${isDefaultThemeActive ? 'active' : ''}`}
          onClick={() => handleThemeSelect(null)}
        >
          <div className="theme-icon">🎨</div>
          <div className="theme-info">
            <div className="theme-name">Tema Padrão</div>
            <div className="theme-description">Retorna ao tema padrão do aplicativo</div>
          </div>
          
          {isDefaultThemeActive && (
            <div className="theme-active-badge">Ativo</div>
          )}
        </div>
        
        {Object.values(THEMES).map(theme => {
          const isUnlocked = unlockedThemes.includes(theme.id)
          const isActive = activeTheme === theme.id
          const canUnlock = userEssence >= theme.requiredEssence

          return (
            <div
              key={theme.id}
              className={`theme-card ${isUnlocked ? 'unlocked' : 'locked'} ${isActive ? 'active' : ''} ${canUnlock && !isUnlocked ? 'can-unlock' : ''}`}
              onClick={() => (isUnlocked || canUnlock) && handleThemeSelect(theme.id)}
            >
              <div className="theme-icon">{theme.icon}</div>
              <div className="theme-info">
                <div className="theme-name">{theme.name}</div>
                <div className="theme-description">{theme.description}</div>
              </div>
              
              {!isUnlocked && (
                <div className="theme-lock-overlay">
                  <div className="lock-icon">🔒</div>
                  <div className="lock-text">
                    {canUnlock ? (
                      <span>Clique para desbloquear e ver prévia</span>
                    ) : (
                      <span>Desbloqueie com {theme.requiredEssence} Essências</span>
                    )}
                  </div>
                </div>
              )}

              {isActive && (
                <div className="theme-active-badge">Ativo</div>
              )}

              {isUnlocked && !isActive && (
                <button
                  className="theme-apply-button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleThemeSelect(theme.id)
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

export default ThemeSelector
