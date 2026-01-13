import React, { useState } from 'react'
import LoadingSpinner from './LoadingSpinner'
import Logo from './Logo'
import { notifyError, notifyEssenceGained } from '../utils/notifications'
import { addEssence, ESSENCE } from '../utils/gamification'
import { validateEmail, validateRequiredField } from '../utils/validation'
import './Login.css'

function Login({ onLogin, onNavigateToSignUp, onNavigateToForgotPassword }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Manipula mudanças nos campos do formulário
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Valida e submete o formulário
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.email.trim()) {
      notifyError('Por favor, insira seu e-mail.')
      return
    }

    if (!formData.email.includes('@')) {
      notifyError('Por favor, insira um e-mail válido.')
      return
    }

    if (!formData.password) {
      notifyError('Por favor, insira sua senha.')
      return
    }

    setLoading(true)

    try {
      // Simula delay de requisição
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Em produção, aqui seria feita a validação com o backend
      // Busca usuário no localStorage
      const savedUsers = JSON.parse(localStorage.getItem('inclusivchat_users') || '[]')
      const user = savedUsers.find(u => 
        u.email.toLowerCase().trim() === formData.email.toLowerCase().trim() && 
        u.password === formData.password
      )
      
      if (user) {
        // Remove a senha antes de fazer login
        const { password, ...userData } = user
        
        // Registra login diário para selo Ritual Diário e essências
        const today = new Date().toDateString()
        const lastLogins = userData.lastLoginDates || []
        let updatedUserData = { ...userData }
        let shouldAwardEssence = false
        
        if (!lastLogins.includes(today)) {
          // Mantém apenas os últimos 7 dias
          const recentLogins = lastLogins.filter(date => {
            const loginDate = new Date(date)
            const daysDiff = (new Date() - loginDate) / (1000 * 60 * 60 * 24)
            return daysDiff < 7
          })
          updatedUserData.lastLoginDates = [...recentLogins, today]
          
          // Verifica se o usuário fez login por 3 dias consecutivos
          if (updatedUserData.lastLoginDates.length >= 3) {
            const sortedLogins = updatedUserData.lastLoginDates
              .map(date => new Date(date).getTime())
              .sort((a, b) => b - a)
              .slice(0, 3)
            
            // Verifica se são consecutivos
            const isConsecutive = sortedLogins.every((date, index) => {
              if (index === 0) return true
              const daysDiff = (sortedLogins[index - 1] - date) / (1000 * 60 * 60 * 24)
              return daysDiff === 1
            })
            
            // Verifica se já ganhou essência por esta sequência de 3 dias
            const lastEssenceDate = updatedUserData.lastDailyLoginEssenceDate
            const threeDaysAgo = sortedLogins[2] // O login mais antigo dos 3
            const threeDaysAgoString = new Date(threeDaysAgo).toDateString()
            
            if (isConsecutive && lastEssenceDate !== threeDaysAgoString) {
              // Adiciona essência por login consecutivo
              updatedUserData = addEssence(updatedUserData, ESSENCE.DAILY_LOGIN)
              updatedUserData.lastDailyLoginEssenceDate = threeDaysAgoString
              shouldAwardEssence = true
              
              // Salva no localStorage
              const savedUsers = JSON.parse(localStorage.getItem('inclusivchat_users') || '[]')
              const userIndex = savedUsers.findIndex(u => u.id === user.id || u.email === user.email)
              if (userIndex !== -1) {
                savedUsers[userIndex] = { ...savedUsers[userIndex], ...updatedUserData }
                localStorage.setItem('inclusivchat_users', JSON.stringify(savedUsers))
              }
            }
          }
        }
        
        // Se ganhou essência, mostra notificação depois de um pequeno delay
        if (shouldAwardEssence) {
          setTimeout(() => {
            notifyEssenceGained(ESSENCE.DAILY_LOGIN, 'Login por 3 dias consecutivos')
          }, 1500) // Delay para não conflitar com a notificação de login
        }
        
        onLogin(updatedUserData)
      } else {
        notifyError('E-mail ou senha incorretos. Se você não tem uma conta, clique em "Criar conta".')
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error)
      notifyError('Erro ao fazer login. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      {/* Overlay de Loading */}
      {loading && (
        <div className="login-loading-overlay">
          <LoadingSpinner size="large" text="Entrando..." />
        </div>
      )}
      
      <div className="login-card">
        <div className="login-header">
          <Logo size="large" showText={true} variant="dark" />
          <p className="login-subtitle">
            Plataforma gamer inclusiva e segura
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {/* Campo de E-mail */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              E-mail <span className="required-asterisk">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={validateEmail}
              className="form-input"
              placeholder="Digite seu e-mail"
              required
              aria-required="true"
            />
          </div>

          {/* Campo de Senha */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Senha <span className="required-asterisk">*</span>
            </label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={(e) => validateRequiredField(e, 'Senha')}
                className="form-input password-input"
                placeholder="Digite sua senha"
                required
                aria-required="true"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                tabIndex={0}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Link de Esqueci minha senha */}
          <div className="forgot-password-link">
            <button
              type="button"
              onClick={onNavigateToForgotPassword}
              className="link-button"
            >
              Esqueci minha senha
            </button>
          </div>

          {/* Botão de Submit */}
          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? (
              <LoadingSpinner size="small" text="" />
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        {/* Link para cadastro */}
        <div className="login-footer">
          <p>
            Não tem uma conta?{' '}
            <button
              type="button"
              onClick={onNavigateToSignUp}
              className="link-button"
            >
              Criar conta
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
