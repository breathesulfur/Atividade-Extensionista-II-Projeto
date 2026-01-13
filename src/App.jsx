import React, { useState, useEffect } from 'react'
import Login from './components/Login'
import SignUp from './components/SignUp'
import ForgotPassword from './components/ForgotPassword'
import Dashboard from './components/Dashboard'
import Notification from './components/Notification'
import { initializeSeedData } from './utils/seedData'
import { setNotificationCallback } from './utils/notifications'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [currentView, setCurrentView] = useState('login') // 'login', 'signup', 'forgotPassword'
  const [notification, setNotification] = useState(null)

  // Configura o sistema de notificações
  useEffect(() => {
    setNotificationCallback((message, type, duration) => {
      setNotification({ message, type, duration })
    })
  }, [])

  // Inicializa dados iniciais e verifica se há usuário logado
  useEffect(() => {
    // Inicializa dados de exemplo (postagens e grupos)
    initializeSeedData()
    
    // Verifica se há usuário logado no localStorage
    const savedUser = localStorage.getItem('inclusivchat_user')
    if (savedUser) {
      const userData = JSON.parse(savedUser)
      setUser(userData)
    }
  }, [])

  // Função para fazer login
  const handleLogin = (userData) => {
    // Garante que avatar/picture seja preservado
    const savedUser = localStorage.getItem('inclusivchat_user')
    if (savedUser) {
      const previousUser = JSON.parse(savedUser)
      if (previousUser.avatar || previousUser.picture) {
        userData.avatar = userData.avatar || previousUser.avatar || previousUser.picture
        userData.picture = userData.picture || previousUser.picture || previousUser.avatar
      }
      // Preserva lastLoginDates
      if (previousUser.lastLoginDates) {
        userData.lastLoginDates = previousUser.lastLoginDates
      }
    }
    
    setUser(userData)
    localStorage.setItem('inclusivchat_user', JSON.stringify(userData))
    setCurrentView('login')
  }

  // Função para fazer cadastro
  const handleSignUp = (userData) => {
    // Salva o usuário na lista de usuários (em produção seria no backend)
    const savedUsers = JSON.parse(localStorage.getItem('inclusivchat_users') || '[]')
    savedUsers.push(userData)
    localStorage.setItem('inclusivchat_users', JSON.stringify(savedUsers))
    
    // Faz login automaticamente após cadastro
    const { password, ...userWithoutPassword } = userData
    handleLogin(userWithoutPassword)
  }

  // Função para fazer logout
  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('inclusivchat_user')
    setCurrentView('login')
  }

  return (
    <div className="app">
      {/* Notificações para telas de login/signup */}
      {!user && notification && (
        <div className="notifications-container">
          <Notification
            message={notification.message}
            type={notification.type}
            duration={notification.duration}
            onClose={() => setNotification(null)}
          />
        </div>
      )}

      {!user ? (
        <>
          {currentView === 'login' && (
            <Login
              onLogin={handleLogin}
              onNavigateToSignUp={() => setCurrentView('signup')}
              onNavigateToForgotPassword={() => setCurrentView('forgotPassword')}
            />
          )}
          {currentView === 'signup' && (
            <SignUp
              onSignUp={handleSignUp}
              onBackToLogin={() => setCurrentView('login')}
            />
          )}
          {currentView === 'forgotPassword' && (
            <ForgotPassword
              onBackToLogin={() => setCurrentView('login')}
            />
          )}
        </>
      ) : (
        <Dashboard user={user} onLogout={handleLogout} />
      )}
    </div>
  )
}

export default App
