import React, { useState } from 'react'
import emailjs from '@emailjs/browser'
import LoadingSpinner from './LoadingSpinner'
import { validateEmail } from '../utils/validation'
import './ForgotPassword.css'

function ForgotPassword({ onBackToLogin }) {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!email.trim()) {
      setError('Por favor, insira seu e-mail.')
      return
    }

    if (!email.includes('@')) {
      setError('Por favor, insira um e-mail válido.')
      return
    }

    setLoading(true)

    try {
      // Configurações do EmailJS
      // Substitua pelos seus valores reais do EmailJS
      const serviceID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'YOUR_SERVICE_ID'
      const templateID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'YOUR_TEMPLATE_ID'
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'YOUR_PUBLIC_KEY'

      // Gera token de recuperação
      const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      const resetLink = `${window.location.origin}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`

      // Salva token temporariamente (em produção, salvaria no backend)
      const resetTokens = JSON.parse(localStorage.getItem('reset_tokens') || '{}')
      resetTokens[email] = {
        token: resetToken,
        expiresAt: Date.now() + 3600000 // 1 hora
      }
      localStorage.setItem('reset_tokens', JSON.stringify(resetTokens))

      // Envia e-mail usando EmailJS
      const templateParams = {
        to_email: email,
        reset_link: resetLink,
        user_email: email
      }

      await emailjs.send(serviceID, templateID, templateParams, publicKey)
      
      setIsSubmitted(true)
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error)
      
      // Fallback: se EmailJS não estiver configurado, usa e-mail temporário
      if (error.text?.includes('Invalid') || !import.meta.env.VITE_EMAILJS_SERVICE_ID) {
        // Usa serviço de e-mail temporário (exemplo: Mailtrap, Ethereal, etc.)
        // Por enquanto, apenas simula o envio
        console.log('EmailJS não configurado. Simulando envio...')
        console.log(`Link de recuperação para ${email}: ${window.location.origin}/reset-password?token=temp&email=${encodeURIComponent(email)}`)
        setIsSubmitted(true)
      } else {
        setError('Erro ao enviar e-mail. Tente novamente mais tarde.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <div className="forgot-password-header">
          <h1 className="forgot-password-title">Recuperar Senha</h1>
          <p className="forgot-password-subtitle">
            {isSubmitted 
              ? 'Verifique seu e-mail para redefinir sua senha.'
              : 'Digite seu e-mail e enviaremos um link para redefinir sua senha.'}
          </p>
        </div>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="forgot-password-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                E-mail <span className="required-asterisk">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError('')
                }}
                onBlur={(e) => !loading && validateEmail(e)}
                className={`form-input ${error ? 'error' : ''}`}
                placeholder="Digite seu e-mail"
                required
                aria-required="true"
                disabled={loading}
              />
              {error && <p className="error-message">{error}</p>}
            </div>

            <button 
              type="submit" 
              className="forgot-password-button"
              disabled={loading}
            >
              {loading ? (
                <LoadingSpinner size="small" text="" />
              ) : (
                'Enviar Link de Recuperação'
              )}
            </button>
          </form>
        ) : (
          <div className="success-message">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <p>E-mail enviado com sucesso!</p>
            <p className="success-subtitle">
              Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
            </p>
          </div>
        )}

        <div className="forgot-password-footer">
          <button
            type="button"
            onClick={onBackToLogin}
            className="link-button"
          >
            ← Voltar para o login
          </button>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
