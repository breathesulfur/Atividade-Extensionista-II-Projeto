import React, { useState, useMemo } from 'react'
import ThemeSelector from './ThemeSelector'
import AvatarFrameSelector from './AvatarFrameSelector'
import MysticTitleSelector from './MysticTitleSelector'
import { THEMES, applyTheme } from '../utils/gamification'
import { updateProfile } from '../lib/db'
import './Rewards.css'

/**
 * Tela dedicada de Recompensas — extraída do "Editar Perfil" para ficar
 * mais visível e acessível direto pela navegação principal do dashboard.
 *
 * Reúne os três seletores cosméticos:
 *  - Temas (cores do app)
 *  - Molduras de avatar
 *  - Títulos místicos
 *
 * Cada seletor já cuida internamente de exibir o que está desbloqueado,
 * o que requer mais Essências, e o que está ativo. Aqui só fornecemos
 * os handlers que persistem a escolha no Supabase e propagam o user
 * atualizado para o Dashboard via onUserUpdate.
 */
function Rewards({ user, onUserUpdate }) {
  // Estado local para preview imediato (a UI dos seletores depende de
  // ler o user atualizado para refletir mudanças sem esperar refetch).
  const [currentUser, setCurrentUser] = useState(user)

  // Sincroniza com o user externo quando ele mudar (ex.: ganho de essências)
  React.useEffect(() => {
    setCurrentUser(user)
  }, [user])

  // Aplica variáveis CSS do tema ativo para que o preview funcione na tela
  const themeStyles = useMemo(() => {
    if (!currentUser?.activeTheme) return {}
    const themeKey = Object.keys(THEMES).find((k) => THEMES[k].id === currentUser.activeTheme)
    const theme = themeKey ? THEMES[themeKey] : null
    if (!theme) return {}
    return {
      '--theme-primary': theme.colors.primary,
      '--theme-background': theme.colors.background,
      '--theme-secondary': theme.colors.secondary,
      '--theme-text': theme.colors.text,
      '--theme-accent': theme.colors.accent,
      '--theme-glow': theme.colors.glow,
    }
  }, [currentUser?.activeTheme])

  // Persiste a atualização no BD e propaga via onUserUpdate
  const persistAndPropagate = async (updatedUser) => {
    setCurrentUser(updatedUser)
    if (typeof onUserUpdate === 'function') onUserUpdate(updatedUser)
    try {
      await updateProfile(user.id, updatedUser)
    } catch (err) {
      console.error('Erro ao salvar recompensa:', err)
    }
  }

  const handleThemeSelect = async (themeId, updatedUser) => {
    if (!updatedUser) return
    const withTheme = themeId == null
      ? { ...updatedUser, activeTheme: null }
      : applyTheme(updatedUser, themeId)
    await persistAndPropagate(withTheme)
  }

  const handleFrameSelect = async (frameId, updatedUser) => {
    if (!updatedUser) return
    await persistAndPropagate(updatedUser)
  }

  const handleTitleSelect = async (titleId, updatedUser) => {
    if (!updatedUser) return
    await persistAndPropagate(updatedUser)
  }

  return (
    <div
      className={`rewards ${currentUser?.activeTheme ? `theme-${currentUser.activeTheme}` : ''}`}
      style={themeStyles}
    >
      <header className="rewards-header">
        <h2>🎁 Recompensas</h2>
        <p className="rewards-subtitle">
          Personalize seu perfil com temas, molduras e títulos místicos
          desbloqueados pelo seu acúmulo de Essências.
        </p>
      </header>

      <div className="rewards-content">
        <section className="rewards-section">
          <ThemeSelector
            user={currentUser || user}
            onThemeSelect={handleThemeSelect}
          />
        </section>

        <section className="rewards-section">
          <AvatarFrameSelector
            user={currentUser || user}
            onFrameSelect={handleFrameSelect}
          />
        </section>

        <section className="rewards-section">
          <MysticTitleSelector
            user={currentUser || user}
            onTitleSelect={handleTitleSelect}
          />
        </section>
      </div>
    </div>
  )
}

export default Rewards
