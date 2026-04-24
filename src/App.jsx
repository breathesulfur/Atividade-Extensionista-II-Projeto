import React, { useState, useEffect } from 'react'
import Login from './components/Login'
import SignUp from './components/SignUp'
import ForgotPassword from './components/ForgotPassword'
import Dashboard from './components/Dashboard'
import Notification from './components/Notification'
import LoadingSpinner from './components/LoadingSpinner'
import { setNotificationCallback } from './utils/notifications'
import { getSession, onAuthStateChange, getProfile } from './lib/db'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentView, setCurrentView] = useState('login')
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    setNotificationCallback((message, type, duration) => {
      setNotification({ message, type, duration })
    })
  }, [])

  // Verifica sessão existente e escuta mudanças de auth
  useEffect(() => {
    let mounted = true

    const loadProfile = async (session) => {
      if (!session?.user) { if (mounted) { setUser(null); setLoading(false) }; return }
      const profile = await getProfile(session.user.id, session.user.email)
      if (mounted) { setUser(profile); setLoading(false) }
    }

    getSession().then(({ data: { session } }) => loadProfile(session))

    const { data: { subscription } } = onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') loadProfile(session)
      if (event === 'SIGNED_OUT') { if (mounted) { setUser(null); setLoading(false) } }
    })

    return () => { mounted = false; subscription.unsubscribe() }
  }, [])

  const handleLogout = () => setUser(null)

  if (loading) {
    return (
      <div className="app" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <LoadingSpinner size="large" text="Carregando..." />
      </div>
    )
  }

  return (
    <div className="app">
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
              onLogin={setUser}
              onNavigateToSignUp={() => setCurrentView('signup')}
              onNavigateToForgotPassword={() => setCurrentView('forgotPassword')}
            />
          )}
          {currentView === 'signup' && (
            <SignUp
              onSignUp={setUser}
              onBackToLogin={() => setCurrentView('login')}
            />
          )}
          {currentView === 'forgotPassword' && (
            <ForgotPassword onBackToLogin={() => setCurrentView('login')} />
          )}
        </>
      ) : (
        <Dashboard user={user} onLogout={handleLogout} />
      )}
    </div>
  )
}

export default App
