import React, { useState, useEffect, useRef, useMemo } from 'react'
import Feed from './Feed'
import Groups from './Groups'
import Profile from './Profile'
import Logo from './Logo'
import Notification from './Notification'
import LoadingSpinner from './LoadingSpinner'
import FAQ from './FAQ'
import Tour from './Tour'
import NotificationBell from './NotificationBell'
import FeedbackForm from './FeedbackForm'
import { updateProfile } from '../lib/db'
import { setNotificationCallback, notifyEssenceGained, notifyAchievement } from '../utils/notifications'
import { addEssence, DAILY_ESSENCE_LIMIT, THEMES, MYSTIC_TITLES, canUnlockMysticTitle, unlockMysticTitle } from '../utils/gamification'
import './Dashboard.css'

// Decorações mescladas de todos os temas no header
function HeaderDecorations() {
  const w = 'rgba(255,255,255,'
  const heart   = 'M 16,27 C 7,18 2,13 2,8 C 2,3.6 5.6,0 10,0 C 12.4,0 14.7,1.1 16,3 C 17.3,1.1 19.6,0 22,0 C 26.4,0 30,3.6 30,8 C 30,13 25,18 16,27 Z'
  const star4   = 'M 0,-9 L 2.2,-2.2 L 9,0 L 2.2,2.2 L 0,9 L -2.2,2.2 L -9,0 L -2.2,-2.2 Z'
  const diamond = 'M 0,-9 L 6,0 L 0,9 L -6,0 Z'

  return (
    <div className="header-decorations" aria-hidden="true">
      <svg viewBox="0 0 800 80" preserveAspectRatio="xMidYMid slice" className="header-decorations-svg">
        <defs>
          <mask id="hd-crescent">
            <rect width="800" height="80" fill="white"/>
            <circle cx="744" cy="11" r="16" fill="black"/>
          </mask>
        </defs>

        {/* ── Raios de luz de fundo (lilac_dawn) ── */}
        <g stroke={w+'0.06)'} strokeWidth="24" strokeLinecap="round">
          <line x1="800" y1="80" x2="700" y2="-10"/>
          <line x1="800" y1="80" x2="755" y2="-5"/>
          <line x1="0"   y1="80" x2="85"  y2="-10"/>
          <line x1="0"   y1="80" x2="40"  y2="-5"/>
        </g>

        {/* ── 🌙 Lua crescente (serene_moon) ── */}
        <circle cx="735" cy="19" r="22" fill={w+'0.18)'} mask="url(#hd-crescent)"/>

        {/* ── ☁️ Nuvem esquerda (soft_sky) ── */}
        <g fill={w+'0.13)'} transform="translate(28,22)">
          <circle cx="0"  cy="8"  r="9"/>
          <circle cx="12" cy="4"  r="12"/>
          <circle cx="24" cy="8"  r="9"/>
          <circle cx="34" cy="10" r="7"/>
          <rect x="-3" y="8" width="42" height="13" rx="3"/>
        </g>

        {/* ── ☁️ Nuvem central direita (soft_sky) ── */}
        <g fill={w+'0.09)'} transform="translate(468,30)">
          <circle cx="0"  cy="5" r="7"/>
          <circle cx="9"  cy="3" r="9"/>
          <circle cx="20" cy="5" r="7"/>
          <rect x="-2" y="5" width="25" height="9" rx="2"/>
        </g>

        {/* ── 🐦 Pássaros (soft_sky) ── */}
        <g stroke={w+'0.22)'} strokeWidth="1.8" fill="none" strokeLinecap="round">
          <path d="M112,14 Q115,10 118,14 Q121,10 124,14"/>
          <path d="M540,16 Q543,12 546,16 Q549,12 552,16"/>
          <path d="M558,26 Q561,22 564,26 Q567,22 570,26"/>
        </g>

        {/* ── 🌿 Folhas (pink_mist) ── */}
        <ellipse cx="218" cy="20" rx="20" ry="7"   fill={w+'0.14)'} transform="rotate(-42,218,20)"/>
        <ellipse cx="258" cy="38" rx="16" ry="5.5" fill={w+'0.10)'} transform="rotate(28,258,38)"/>
        <ellipse cx="590" cy="14" rx="18" ry="6.5" fill={w+'0.13)'} transform="rotate(-50,590,14)"/>
        <ellipse cx="625" cy="38" rx="14" ry="5"   fill={w+'0.09)'} transform="rotate(35,625,38)"/>

        {/* ── 💜 Corações (pink_aura) ── */}
        <path d={heart} fill={w+'0.15)'} transform="translate(330,6)  scale(0.78)"/>
        <path d={heart} fill={w+'0.11)'} transform="translate(680,22) scale(0.56)"/>
        <path d={heart} fill={w+'0.09)'} transform="translate(162,28) scale(0.50)"/>
        <path d={heart} fill={w+'0.08)'} transform="translate(440,32) scale(0.44)"/>

        {/* ── 💎 Diamantes (lilac_dawn) ── */}
        <path d={diamond} fill={w+'0.16)'} transform="translate(420,18)"/>
        <path d={diamond} fill={w+'0.12)'} transform="translate(193,12) scale(0.8)"/>
        <path d={diamond} fill={w+'0.11)'} transform="translate(382,36) scale(0.75)"/>
        <path d={diamond} fill={w+'0.10)'} transform="translate(650,34) scale(0.72)"/>

        {/* ── ⭐ Estrelas 4 pontas (serene_moon / lilac_dawn) ── */}
        <path d={star4} fill={w+'0.20)'} transform="translate(616,13) scale(0.92)"/>
        <path d={star4} fill={w+'0.16)'} transform="translate(474,22) scale(0.70)"/>
        <path d={star4} fill={w+'0.14)'} transform="translate(762,28) scale(0.65)"/>
        <path d={star4} fill={w+'0.12)'} transform="translate(290,16) scale(0.55)"/>
        <path d={star4} fill={w+'0.10)'} transform="translate(86,36)  scale(0.52)"/>
        <path d={star4} fill={w+'0.09)'} transform="translate(170,46) scale(0.48)"/>

        {/* ── 🌸 Flor de 5 pétalas (petal) ── */}
        <g transform="translate(356,44)" fill={w+'0.11)'}>
          <ellipse cx="0" cy="-8" rx="4"   ry="6" transform="rotate(0)"/>
          <ellipse cx="0" cy="-8" rx="4"   ry="6" transform="rotate(72)"/>
          <ellipse cx="0" cy="-8" rx="4"   ry="6" transform="rotate(144)"/>
          <ellipse cx="0" cy="-8" rx="4"   ry="6" transform="rotate(216)"/>
          <ellipse cx="0" cy="-8" rx="4"   ry="6" transform="rotate(288)"/>
          <circle  cx="0" cy="0"  r="2.8"          fill={w+'0.20)'}/>
        </g>

        {/* ── 🌸 Pétalas soltas (petal) ── */}
        <ellipse cx="138" cy="20" rx="12"  ry="4.5" fill={w+'0.13)'} transform="rotate(-40,138,20)"/>
        <ellipse cx="402" cy="10" rx="12"  ry="4.5" fill={w+'0.11)'} transform="rotate(55,402,10)"/>
        <ellipse cx="500" cy="46" rx="11"  ry="4"   fill={w+'0.10)'} transform="rotate(-28,500,46)"/>
        <ellipse cx="716" cy="40" rx="10"  ry="4"   fill={w+'0.12)'} transform="rotate(-22,716,40)"/>

        {/* ── Círculos de brilho (lilac_dawn) ── */}
        <circle cx="740" cy="28" r="20" fill="none" stroke={w+'0.08)'} strokeWidth="1.5"/>
        <circle cx="740" cy="28" r="30" fill="none" stroke={w+'0.05)'} strokeWidth="1"/>

        {/* ── Pontos brilhantes espalhados ── */}
        <circle cx="308" cy="12" r="2.5" fill={w+'0.18)'}/>
        <circle cx="455" cy="40" r="2"   fill={w+'0.15)'}/>
        <circle cx="663" cy="18" r="2.5" fill={w+'0.20)'}/>
        <circle cx="70"  cy="48" r="1.8" fill={w+'0.12)'}/>
        <circle cx="776" cy="52" r="1.5" fill={w+'0.14)'}/>
        <circle cx="530" cy="52" r="2"   fill={w+'0.10)'}/>
      </svg>
    </div>
  )
}

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
  const [showFeedback, setShowFeedback] = useState(false)
  const [pendingGroupId, setPendingGroupId] = useState(null)
  const tourSeenKey = `inclusivchat_welcome_seen_${user.id}`
  const [showTour, setShowTour] = useState(() => {
    try { return localStorage.getItem(tourSeenKey) !== '1' } catch { return false }
  })

  const handleOpenGroup = (groupId) => {
    setPendingGroupId(groupId)
    setActiveTab('groups')
  }
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
    updateProfile(currentUser.id, currentUser)
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
      updateProfile(updatedUser.id, updatedUser)

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
        updateProfile(updatedUser.id, updatedUser)
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

    updateProfile(updatedUser.id, updatedUser)
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
    const { signOut } = await import('../lib/db')
    await signOut()
    await new Promise(resolve => setTimeout(resolve, 400))
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
      <FAQ
        isOpen={showFAQ}
        onClose={() => setShowFAQ(false)}
        onShowTour={() => { setShowFAQ(false); setShowTour(true) }}
      />

      {/* Feedback Modal */}
      {showFeedback && <FeedbackForm user={currentUser} onClose={() => setShowFeedback(false)} />}

      {/* Tour de boas-vindas */}
      {showTour && (
        <Tour
          user={currentUser}
          onClose={() => {
            setShowTour(false)
            try { localStorage.setItem(tourSeenKey, '1') } catch {}
          }}
        />
      )}

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
        <HeaderDecorations />
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
            <NotificationBell user={currentUser} />
            <button
              onClick={() => setShowFeedback(true)}
              className="faq-button-header"
              aria-label="Enviar Feedback"
              title="Enviar Feedback"
            >
              💜 Feedback
            </button>
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
          <span>📰</span> Feed
        </button>
        <button
          className={`nav-button ${activeTab === 'groups' ? 'active' : ''}`}
          onClick={() => setActiveTab('groups')}
          aria-pressed={activeTab === 'groups'}
        >
          <span>🎯</span> Grupos
        </button>
        <button
          className={`nav-button ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
          aria-pressed={activeTab === 'profile'}
        >
          <span>🙋</span> Perfil
        </button>
      </nav>

      {/* Conteúdo */}
             <main className={`dashboard-content ${currentUser.activeTheme ? `theme-${currentUser.activeTheme}` : ''}`}>
               {activeTab === 'feed' && (
                 <Feed user={currentUser} onUserUpdate={setCurrentUser} onOpenGroup={handleOpenGroup} />
               )}
               {activeTab === 'groups' && (
                 <Groups
                   user={currentUser}
                   onUserUpdate={setCurrentUser}
                   targetGroupId={pendingGroupId}
                   onGroupOpened={() => setPendingGroupId(null)}
                 />
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
