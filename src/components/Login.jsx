import React, { useState } from 'react'
import LoadingSpinner from './LoadingSpinner'
import Logo from './Logo'
import { notifyError } from '../utils/notifications'
import { validateEmail } from '../utils/validation'
import { signIn, getProfile } from '../lib/db'
import './Login.css'

function Login({ onLogin, onNavigateToSignUp, onNavigateToForgotPassword }) {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.email.trim()) { notifyError('Por favor, insira seu e-mail.'); return }
    if (!formData.email.includes('@')) { notifyError('Por favor, insira um e-mail válido.'); return }
    if (!formData.password) { notifyError('Por favor, insira sua senha.'); return }

    setLoading(true)
    try {
      const { data, error } = await signIn(formData.email.trim(), formData.password)

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          notifyError('E-mail ou senha incorretos.')
        } else if (error.message.includes('Email not confirmed')) {
          notifyError('Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.')
        } else {
          notifyError('Erro ao fazer login. Tente novamente.')
        }
        return
      }

      const profile = await getProfile(data.user.id, data.user.email)
      if (profile) onLogin(profile)

    } catch (err) {
      console.error('Erro ao fazer login:', err)
      notifyError('Erro ao fazer login. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      {loading && (
        <div className="login-loading-overlay">
          <LoadingSpinner size="large" text="Entrando..." />
        </div>
      )}

      <div className="login-card">
        <div className="login-header">
          <Logo size="large" showText={true} variant="dark" />
          <p className="login-subtitle">Plataforma gamer inclusiva e segura</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
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

          <div className="forgot-password-link">
            <button type="button" onClick={onNavigateToForgotPassword} className="link-button">
              Esqueci minha senha
            </button>
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? <LoadingSpinner size="small" text="" /> : 'Entrar'}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Não tem uma conta?{' '}
            <button type="button" onClick={onNavigateToSignUp} className="link-button">
              Criar conta
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
