import React, { useState, useEffect } from 'react'
import Login from './components/Login'
import SignUp from './components/SignUp'
import ForgotPassword from './components/ForgotPassword'
import ResetPassword from './components/ResetPassword'
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
  // Marca que o usuário acabou de cair no app via link de recuperação de
  // senha (evento PASSWORD_RECOVERY do Supabase). Enquanto verdadeiro,
  // forçamos a tela ResetPassword, ignorando a sessão temporária criada
  // pelo token de recuperação — sem isso o app iria direto pro Dashboard
  // sem o usuário ter trocado a senha.
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false)
  const [inviteGroupId, setInviteGroupId] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    const groupId = params.get('group')
    if (groupId) window.history.replaceState({}, '', window.location.pathname)
    return groupId
  })

  useEffect(() => {
    setNotificationCallback((message, type, duration) => {
      setNotification({ message, type, duration })
    })
  }, [])

  // Verifica sessão existente e escuta mudanças de auth
  useEffect(() => {
    let mounted = true
    // Captura local pra evitar uso de state que pode estar desatualizado
    // dentro do callback do onAuthStateChange (closure stale).
    let recovering = false

    const loadProfile = async (session) => {
      if (!session?.user) { if (mounted) { setUser(null); setLoading(false) }; return }
      // Durante o fluxo de recuperação, NÃO carregamos o profile — isso
      // evitaria mostrar Dashboard antes do usuário trocar a senha.
      if (recovering) { if (mounted) { setLoading(false) }; return }
      const profile = await getProfile(session.user.id, session.user.email)
      if (mounted) { setUser(profile); setLoading(false) }
    }

    getSession().then(({ data: { session } }) => loadProfile(session))

    const { data: { subscription } } = onAuthStateChange((event, session) => {
      // PASSWORD_RECOVERY dispara quando o usuário clica no link do email
      // de recuperação e o SDK do Supabase detecta o token na URL. A partir
      // daqui ignoramos SIGNED_IN (que também dispara nesse mesmo fluxo)
      // até o ResetPassword chamar signOut().
      if (event === 'PASSWORD_RECOVERY') {
        recovering = true
        if (mounted) {
          setIsPasswordRecovery(true)
          setUser(null)
          setLoading(false)
        }
        return
      }
      if (event === 'SIGNED_IN') loadProfile(session)
      if (event === 'SIGNED_OUT') {
        recovering = false
        if (mounted) {
          setUser(null)
          setIsPasswordRecovery(false)
          setCurrentView('login')
          setLoading(false)
        }
      }
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

      {isPasswordRecovery ? (
        // O signOut() dentro do ResetPassword vai disparar SIGNED_OUT,
        // que reseta isPasswordRecovery e volta o currentView pra 'login'.
        <ResetPassword onDone={() => { /* signOut já cuida da volta pro login */ }} />
      ) : !user ? (
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
        <Dashboard user={user} onLogout={handleLogout} initialGroupId={inviteGroupId} />
      )}
    </div>
  )
}

export default App
