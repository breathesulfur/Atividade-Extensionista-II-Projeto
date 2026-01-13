import React, { useState, useEffect, useRef } from 'react'
import Feed from './Feed'
import Groups from './Groups'
import Profile from './Profile'
import Logo from './Logo'
import Notification from './Notification'
import LoadingSpinner from './LoadingSpinner'
import FAQ from './FAQ'
import { updateUser } from '../utils/storage'
import { setNotificationCallback, notifyEssenceGained, notifyAchievement } from '../utils/notifications'
import { addEssence, DAILY_ESSENCE_LIMIT } from '../utils/gamification'
import './Dashboard.css'

// Componente de barra de progresso diária compacta
function DailyEssenceProgressBar({ user }) {
  const today = new Date().toDateString()
  const dailyEssence = user.dailyEssence || {}
  const todayEssence = dailyEssence[today] || 0
  const progressPercentage = Math.min(100, (todayEssence / DAILY_ESSENCE_LIMIT) * 100)
  const isComplete = todayEssence >= DAILY_ESSENCE_LIMIT

  return (
    <div className="daily-essence-bar-compact">
      <span className="daily-essence-text">{todayEssence} / {DAILY_ESSENCE_LIMIT}</span>
      <div className="daily-essence-bar-compact-container">
        <div 
          className={`daily-essence-bar-compact-fill ${isComplete ? 'complete' : ''}`}
          style={{ width: `${progressPercentage}%` }}
        >
          {isComplete && <span className="daily-essence-check">✔</span>}
        </div>
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
  const previousEssenceRef = useRef(user.essence || user.points || 0)
  const processedMilestonesRef = useRef(new Set([Math.floor((user.essence || user.points || 0) / 50)]))
  const dailyLimitNotificationRef = useRef(false)

  // Configura o sistema de notificações (fila de notificações)
  useEffect(() => {
    setNotificationCallback((message, type, duration) => {
      const id = Date.now().toString()
      const newNotification = { id, message, type, duration }
      
      setNotifications(prev => [...prev, newNotification])
      
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

  // Função para fazer logout com loading
  const handleLogout = async () => {
    setIsLoggingOut(true)
    
    // Simula um delay de processamento antes de fazer logout
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Faz o logout
    onLogout()
  }

  return (
    <div className={`dashboard ${currentUser.activeTheme ? `theme-${currentUser.activeTheme}` : ''}`}>
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
              onClick={handleLogout} 
              className="logout-button"
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <LoadingSpinner size="small" text="" />
                    <span>Saindo...</span>
                  </div>
                </>
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
