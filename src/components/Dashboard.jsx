import React, { useState, useEffect, useRef, useMemo } from 'react'
import Feed from './Feed'
import Groups from './Groups'
import Profile from './Profile'
import Logo from './Logo'
import Notification from './Notification'
import LoadingSpinner from './LoadingSpinner'
import FAQ from './FAQ'
import { updateUser } from '../utils/storage'
import { setNotificationCallback, notifyEssenceGained, notifyAchievement } from '../utils/notifications'
import { addEssence, DAILY_ESSENCE_LIMIT, THEMES, MYSTIC_TITLES, canUnlockMysticTitle, unlockMysticTitle } from '../utils/gamification'
import './Dashboard.css'

// Componente de barra de progresso diária compacta
function DailyEssenceProgressBar({ user }) {
  const today = new Date().toDateString()
  const dailyEssence = user.dailyEssence || {}
  const todayEssence = dailyEssence[today] || 0
  const progressPercentage = Math.min(100, (todayEssence / DAILY_ESSENCE_LIMIT) * 100)
  const isComplete = todayEssence >= DAILY_ESSENCE_LIMIT
  const isWarning = !isComplete && progressPercentage >= 80

  if (isComplete) {
    return (
      <div className="daily-essence-complete-badge" title="Limite diário atingido!">
        ✨ {DAILY_ESSENCE_LIMIT}/{DAILY_ESSENCE_LIMIT} hoje
      </div>
    )
  }

  return (
    <div className="daily-essence-bar-compact" title={`${todayEssence} de ${DAILY_ESSENCE_LIMIT} Essências hoje`}>
      <span className={`daily-essence-text ${isWarning ? 'warning' : ''}`}>
        {todayEssence}<span className="daily-essence-limit">/{DAILY_ESSENCE_LIMIT}</span>
      </span>
      <div className="daily-essence-bar-compact-container">
        <div
          className={`daily-essence-bar-compact-fill ${isWarning ? 'warning' : ''}`}
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  )
}

function Dashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('feed')
  const [currentUser, setCurrentUser] = useState(user)
  const [notifications, setNotifications] = useState([])
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [showFAQ, setShowFAQ] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const previousEssenceRef = useRef(user.essence || user.points || 0)
  const processedMilestonesRef = useRef(new Set([Math.floor((user.essence || user.points || 0) / 50)]))
  const dailyLimitNotificationRef = useRef(false)

  // Calcula variáveis CSS do tema ativo para injetar em toda a árvore de componentes
  const themeStyles = useMemo(() => {
    if (!currentUser.activeTheme) return {}
    const themeKey = Object.keys(THEMES).find(k => THEMES[k].id === currentUser.activeTheme)
    const theme = themeKey ? THEMES[themeKey] : null
    if (!theme) return {}
    return {
      '--theme-primary': theme.colors.primary,
      '--theme-background': theme.colors.background,
      '--theme-secondary': theme.colors.secondary,
      '--theme-text': theme.colors.text,
      '--theme-accent': theme.colors.accent,
      '--theme-glow': theme.colors.glow,
      '--theme-hover': theme.colors.hover || theme.colors.primary,
      '--theme-disabled': theme.colors.disabled || theme.colors.secondary,
      '--theme-links': theme.colors.links || theme.colors.primary,
    }
  }, [currentUser.activeTheme])

  // Configura o sistema de notificações (fila de notificações)
  useEffect(() => {
    setNotificationCallback((message, type, duration) => {
      const id = Date.now().toString()
      const newNotification = { id, message, type, duration }

      setNotifications(prev => {
        // Limita a no máximo 3 notificações visíveis simultaneamente
        const updated = [...prev, newNotification]
        return updated.slice(-3)
      })

      // Remove automaticamente após a duração especificada
      if (duration > 0) {
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== id))
        }, duration)
      }
    })
  }, [])

  // Função para remover notificação específica
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  // Atualiza usuário no localStorage quando mudar
  useEffect(() => {
    updateUser(currentUser)
  }, [currentUser])

  // Verifica se atingiu limite diário e mostra notificação (apenas uma vez por dia)
  useEffect(() => {
    const today = new Date().toDateString()
    const dailyEssence = currentUser.dailyEssence || {}
    const todayEssence = dailyEssence[today] || 0
    const lastNotificationDate = currentUser.lastDailyLimitNotificationDate

    // Se atingiu 50 e ainda não mostrou notificação hoje
    if (todayEssence >= DAILY_ESSENCE_LIMIT && lastNotificationDate !== today && !dailyLimitNotificationRef.current) {
      dailyLimitNotificationRef.current = true
      
      // Atualiza usuário para marcar que notificação foi exibida
      const updatedUser = {
        ...currentUser,
        lastDailyLimitNotificationDate: today
      }
      setCurrentUser(updatedUser)
      updateUser(updatedUser)
      
      // Mostra notificação após pequeno delay
      setTimeout(() => {
        notifyAchievement(
          '✨ Limite diário alcançado!',
          'Você completou 50 Essências hoje. Volte amanhã para continuar sua jornada.',
          6000
        )
      }, 300)
    } else if (lastNotificationDate !== today) {
      // Se mudou o dia, reseta a flag da notificação
      dailyLimitNotificationRef.current = false
    }
  }, [currentUser.dailyEssence, currentUser.lastDailyLimitNotificationDate])

  // Verifica marcos de essências separadamente para evitar loops
  useEffect(() => {
    const currentEssence = currentUser.essence || currentUser.points || 0
    const previousEssence = previousEssenceRef.current
    const currentMilestone = Math.floor(currentEssence / 50)
    const previousMilestone = Math.floor(previousEssence / 50)
    
    // Só processa o bônus se realmente passou para um novo marco E ainda não foi processado
    if (currentMilestone > previousMilestone && !processedMilestonesRef.current.has(currentMilestone)) {
      const milestoneEssence = currentMilestone * 50
      const bonusAmount = 10
      
      // Marca este marco como processado ANTES de processar (evita reprocessar)
      processedMilestonesRef.current.add(currentMilestone)
      
      // Adiciona o bônus de essências ao usuário
      const updatedUser = addEssence(currentUser, bonusAmount)
      
      // Atualiza o usuário de forma assíncrona para evitar conflitos
      setTimeout(() => {
        updateUser(updatedUser)
        setCurrentUser(updatedUser)
        
        // Notifica sobre o bônus usando o sistema padrão de notificações
        setTimeout(() => {
          notifyEssenceGained(bonusAmount, `🌟 Bônus por alcançar ${milestoneEssence} Essências`)
        }, 300)
      }, 100)
    }
    
    // Atualiza a referência da essência anterior
    previousEssenceRef.current = currentEssence
  }, [currentUser.essence, currentUser.points])

  // Verifica e concede títulos místicos automaticamente quando essências totais aumentam
  useEffect(() => {
    const newTitles = Object.values(MYSTIC_TITLES).filter(title =>
      canUnlockMysticTitle(currentUser, title.id)
    )
    if (newTitles.length === 0) return

    let updatedUser = currentUser
    newTitles.forEach(title => {
      updatedUser = unlockMysticTitle(updatedUser, title.id)
    })

    updateUser(updatedUser)
    setCurrentUser(updatedUser)

    newTitles.forEach((title, index) => {
      setTimeout(() => {
        notifyAchievement(
          `${title.icon} Título desbloqueado: ${title.name}`,
          title.description,
          6000
        )
      }, 300 + index * 600)
    })
  }, [currentUser.essencias_totais])

  // Abre o modal de confirmação de logout
  const handleLogoutClick = () => {
    setShowLogoutConfirm(true)
  }

  // Confirma o logout
  const handleLogoutConfirm = async () => {
    setShowLogoutConfirm(false)
    setIsLoggingOut(true)
    await new Promise(resolve => setTimeout(resolve, 800))
    onLogout()
  }

  return (
    <div
      className={`dashboard ${currentUser.activeTheme ? `theme-${currentUser.activeTheme}` : ''}`}
      style={themeStyles}
    >
      {/* Notificações Gerais - Empilhadas uma abaixo da outra */}
      {notifications.length > 0 && (
        <div className="notifications-container">
          {notifications.map((notif) => (
            <Notification
              key={notif.id}
              message={notif.message}
              type={notif.type}
              duration={0} // Duração já gerenciada no useEffect acima
              onClose={() => removeNotification(notif.id)}
            />
          ))}
        </div>
      )}

      {/* FAQ Modal */}
      <FAQ isOpen={showFAQ} onClose={() => setShowFAQ(false)} />

      {/* Modal de confirmação de logout */}
      {showLogoutConfirm && (
        <div className="logout-confirm-overlay" onClick={() => setShowLogoutConfirm(false)}>
          <div className="logout-confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="logout-confirm-icon">👋</div>
            <h3>Deseja sair?</h3>
            <p>Sua sessão será encerrada. Até logo, <strong>{currentUser.name}</strong>!</p>
            <div className="logout-confirm-actions">
              <button
                className="logout-confirm-cancel"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancelar
              </button>
              <button
                className="logout-confirm-yes"
                onClick={handleLogoutConfirm}
              >
                Sim, sair
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <Logo size="medium" showText={true} variant="light" />
          <div className="header-right">
            <div className="user-info">
              <div className="user-name-container">
                <span className="user-name">{currentUser.name}</span>
                <span className="user-pronoun">({currentUser.pronoun})</span>
                {/* Barra compacta de progresso diário */}
                <DailyEssenceProgressBar user={currentUser} />
              </div>
              <div className="user-points">
                🔮 {currentUser.essence || currentUser.points || 0} Essências
              </div>
            </div>
            <button 
              onClick={() => setShowFAQ(true)} 
              className="faq-button-header"
              aria-label="Abrir FAQ"
              title="Perguntas Frequentes"
            >
              ❓ FAQ
            </button>
            <button
              onClick={handleLogoutClick}
              className="logout-button"
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <LoadingSpinner size="small" text="" />
                  <span>Saindo...</span>
                </div>
              ) : (
                'Sair'
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Navegação */}
      <nav className="dashboard-nav">
        <button
          className={`nav-button ${activeTab === 'feed' ? 'active' : ''}`}
          onClick={() => setActiveTab('feed')}
          aria-pressed={activeTab === 'feed'}
        >
          <span>📱</span> Feed
        </button>
        <button
          className={`nav-button ${activeTab === 'groups' ? 'active' : ''}`}
          onClick={() => setActiveTab('groups')}
          aria-pressed={activeTab === 'groups'}
        >
          <span>🎮</span> Grupos
        </button>
        <button
          className={`nav-button ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
          aria-pressed={activeTab === 'profile'}
        >
          <span>👤</span> Perfil
        </button>
      </nav>

      {/* Conteúdo */}
             <main className={`dashboard-content ${currentUser.activeTheme ? `theme-${currentUser.activeTheme}` : ''}`}>
               {activeTab === 'feed' && (
                 <Feed user={currentUser} onUserUpdate={setCurrentUser} />
               )}
               {activeTab === 'groups' && (
                 <Groups user={currentUser} onUserUpdate={setCurrentUser} />
               )}
               {activeTab === 'profile' && (
                 <Profile user={currentUser} onUserUpdate={setCurrentUser} />
               )}
             </main>

      {/* Footer com créditos */}
      <footer className="dashboard-footer">
        <p className="footer-credits">
          Criado com 💜 por <strong>Luiza C - 2026</strong>
        </p>
      </footer>
    </div>
  )
}

export default Dashboard
