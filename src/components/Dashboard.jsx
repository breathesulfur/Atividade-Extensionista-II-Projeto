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

// Decorações temáticas do header
function ThemeDecorations({ theme }) {
  if (!theme) return null

  const w = 'rgba(255,255,255,'
  const heart = 'M 16,27 C 7,18 2,13 2,8 C 2,3.6 5.6,0 10,0 C 12.4,0 14.7,1.1 16,3 C 17.3,1.1 19.6,0 22,0 C 26.4,0 30,3.6 30,8 C 30,13 25,18 16,27 Z'
  const star4 = 'M 0,-9 L 2.2,-2.2 L 9,0 L 2.2,2.2 L 0,9 L -2.2,2.2 L -9,0 L -2.2,-2.2 Z'
  const diamond = 'M 0,-9 L 6,0 L 0,9 L -6,0 Z'

  const themes = {
    serene_moon: (
      <>
        <defs>
          <mask id="crescent-m">
            <rect width="800" height="80" fill="white"/>
            <circle cx="744" cy="11" r="16" fill="black"/>
          </mask>
        </defs>
        {/* Lua crescente */}
        <circle cx="735" cy="19" r="22" fill={w+'0.2)'} mask="url(#crescent-m)"/>
        {/* Estrelas dispersas */}
        <circle cx="610" cy="11" r="2.5" fill={w+'0.22)'}/>
        <circle cx="662" cy="28" r="1.8" fill={w+'0.18)'}/>
        <circle cx="575" cy="22" r="1.5" fill={w+'0.15)'}/>
        <circle cx="690" cy="38" r="2"   fill={w+'0.18)'}/>
        <circle cx="550" cy="13" r="2"   fill={w+'0.16)'}/>
        <circle cx="80"  cy="18" r="3"   fill={w+'0.1)'}/>
        <circle cx="118" cy="35" r="1.8" fill={w+'0.1)'}/>
        {/* Estrelas de 4 pontas */}
        <path d={star4} fill={w+'0.2)'}  transform="translate(637,14) scale(0.9)"/>
        <path d={star4} fill={w+'0.14)'} transform="translate(564,33) scale(0.6)"/>
        <path d={star4} fill={w+'0.12)'} transform="translate(95,38) scale(0.55)"/>
      </>
    ),

    pink_aura: (
      <>
        {/* Corações */}
        <path d={heart} fill={w+'0.18)'} transform="translate(693,10) scale(0.85)"/>
        <path d={heart} fill={w+'0.12)'} transform="translate(730,28) scale(0.55)"/>
        <path d={heart} fill={w+'0.1)'}  transform="translate(560,22) scale(0.5)"/>
        <path d={heart} fill={w+'0.1)'}  transform="translate(80,14) scale(0.6)"/>
        {/* Estrelas faíscas */}
        <path d={star4} fill={w+'0.22)'} transform="translate(655,12) scale(0.9)"/>
        <path d={star4} fill={w+'0.18)'} transform="translate(614,30) scale(0.65)"/>
        <path d={star4} fill={w+'0.15)'} transform="translate(700,35) scale(0.6)"/>
        <path d={star4} fill={w+'0.12)'} transform="translate(120,30) scale(0.55)"/>
        {/* Círculos suaves */}
        <circle cx="745" cy="14" r="7" fill={w+'0.07)'}/>
        <circle cx="762" cy="36" r="5" fill={w+'0.08)'}/>
      </>
    ),

    soft_sky: (
      <>
        {/* Nuvens — grupos de círculos */}
        <g fill={w+'0.17)'} transform="translate(610,18)">
          <circle cx="0"  cy="8"  r="10"/>
          <circle cx="13" cy="4"  r="13"/>
          <circle cx="27" cy="8"  r="10"/>
          <circle cx="38" cy="10" r="8"/>
          <rect x="-4" y="8" width="48" height="14" rx="3"/>
        </g>
        <g fill={w+'0.11)'} transform="translate(530,34)">
          <circle cx="0"  cy="5" r="7"/>
          <circle cx="9"  cy="3" r="9"/>
          <circle cx="19" cy="5" r="7"/>
          <rect x="-3" y="5" width="27" height="10" rx="2"/>
        </g>
        <g fill={w+'0.08)'} transform="translate(60,22)">
          <circle cx="0"  cy="6" r="8"/>
          <circle cx="10" cy="3" r="10"/>
          <circle cx="20" cy="6" r="8"/>
          <rect x="-3" y="6" width="28" height="10" rx="2"/>
        </g>
        {/* Pássaros */}
        <g stroke={w+'0.26)'} strokeWidth="2" fill="none" strokeLinecap="round">
          <path d="M572,14 Q576,10 580,14 Q584,10 588,14"/>
          <path d="M596,24 Q599,20 602,24 Q605,20 608,24"/>
          <path d="M556,30 Q559,27 562,30 Q565,27 568,30"/>
          <path d="M115,16 Q118,12 121,16 Q124,12 127,16"/>
        </g>
      </>
    ),

    pink_mist: (
      <>
        {/* Folhas — elipses rotacionadas */}
        <ellipse cx="695" cy="18" rx="22" ry="8" fill={w+'0.16)'} transform="rotate(-35,695,18)"/>
        <ellipse cx="730" cy="32" rx="18" ry="7" fill={w+'0.13)'} transform="rotate(22,730,32)"/>
        <ellipse cx="658" cy="14" rx="20" ry="7" fill={w+'0.18)'} transform="rotate(-55,658,14)"/>
        <ellipse cx="755" cy="22" rx="15" ry="6" fill={w+'0.11)'} transform="rotate(42,755,22)"/>
        <ellipse cx="100" cy="22" rx="16" ry="6" fill={w+'0.12)'} transform="rotate(-28,100,22)"/>
        <ellipse cx="70"  cy="38" rx="14" ry="5" fill={w+'0.1)'}  transform="rotate(48,70,38)"/>
        {/* Nervuras centrais das folhas */}
        <line x1="677" y1="10" x2="713" y2="26" stroke={w+'0.14)'} strokeWidth="1" transform="rotate(-35,695,18)"/>
        {/* Raminhos */}
        <path d="M680,70 C690,50 712,35 722,14" stroke={w+'0.12)'} strokeWidth="1.5" fill="none"/>
        <path d="M720,70 C724,52 730,38 740,24" stroke={w+'0.1)'}  strokeWidth="1.2" fill="none"/>
      </>
    ),

    lilac_dawn: (
      <>
        {/* Raios de luz diagonais */}
        <g stroke={w+'0.1)'} strokeWidth="18" strokeLinecap="round">
          <line x1="800" y1="80" x2="700" y2="-10"/>
          <line x1="800" y1="80" x2="750" y2="-10"/>
          <line x1="800" y1="80" x2="790" y2="-10"/>
        </g>
        {/* Diamantes */}
        <path d={diamond} fill={w+'0.18)'} transform="translate(630,20)"/>
        <path d={diamond} fill={w+'0.2)'}  transform="translate(662,10) scale(0.8)"/>
        <path d={diamond} fill={w+'0.13)'} transform="translate(604,34) scale(0.75)"/>
        <path d={diamond} fill={w+'0.1)'}  transform="translate(90,24) scale(0.7)"/>
        {/* Estrelas */}
        <path d={star4} fill={w+'0.22)'} transform="translate(700,15) scale(0.95)"/>
        <path d={star4} fill={w+'0.16)'} transform="translate(560,20) scale(0.7)"/>
        <path d={star4} fill={w+'0.13)'} transform="translate(115,32) scale(0.6)"/>
        {/* Círculos de brilho */}
        <circle cx="740" cy="30" r="18" fill="none" stroke={w+'0.1)'} strokeWidth="1.5"/>
        <circle cx="740" cy="30" r="28" fill="none" stroke={w+'0.07)'} strokeWidth="1"/>
      </>
    ),

    petal: (
      <>
        {/* Pétalas caindo — elipses finas rotacionadas */}
        <ellipse cx="705" cy="14" rx="14" ry="5.5" fill={w+'0.18)'} transform="rotate(-42,705,14)"/>
        <ellipse cx="728" cy="30" rx="12" ry="5"   fill={w+'0.15)'} transform="rotate(26,728,30)"/>
        <ellipse cx="748" cy="11" rx="13" ry="5"   fill={w+'0.14)'} transform="rotate(62,748,11)"/>
        <ellipse cx="763" cy="36" rx="11" ry="4.5" fill={w+'0.16)'} transform="rotate(-22,763,36)"/>
        <ellipse cx="682" cy="36" rx="10" ry="4"   fill={w+'0.12)'} transform="rotate(50,682,36)"/>
        <ellipse cx="90"  cy="20" rx="13" ry="5"   fill={w+'0.13)'} transform="rotate(-38,90,20)"/>
        <ellipse cx="112" cy="36" rx="11" ry="4.5" fill={w+'0.11)'} transform="rotate(30,112,36)"/>
        {/* Flor de 5 pétalas */}
        <g transform="translate(660,20)" fill={w+'0.13)'}>
          <ellipse cx="0" cy="-9" rx="4.5" ry="7" transform="rotate(0)"/>
          <ellipse cx="0" cy="-9" rx="4.5" ry="7" transform="rotate(72)"/>
          <ellipse cx="0" cy="-9" rx="4.5" ry="7" transform="rotate(144)"/>
          <ellipse cx="0" cy="-9" rx="4.5" ry="7" transform="rotate(216)"/>
          <ellipse cx="0" cy="-9" rx="4.5" ry="7" transform="rotate(288)"/>
          <circle cx="0" cy="0" r="3.5" fill={w+'0.22)'}/>
        </g>
        {/* Pequenos pontos */}
        <circle cx="600" cy="20" r="3" fill={w+'0.12)'}/>
        <circle cx="580" cy="36" r="2" fill={w+'0.1)'}/>
        <circle cx="632" cy="10" r="2" fill={w+'0.14)'}/>
      </>
    ),
  }

  if (!themes[theme]) return null

  return (
    <div className="header-decorations" aria-hidden="true">
      <svg viewBox="0 0 800 80" preserveAspectRatio="xMidYMid slice" className="header-decorations-svg">
        {themes[theme]}
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
        <ThemeDecorations theme={currentUser.activeTheme} />
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
