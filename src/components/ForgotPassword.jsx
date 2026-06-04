import React, { useState } from 'react'
import LoadingSpinner from './LoadingSpinner'
import { validateEmail } from '../utils/validation'
import { requestPasswordReset } from '../lib/db'
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
      // Usa Supabase Auth nativo. O SDK envia email com link que abre o
      // app de volta no host atual (redirectTo definido em db.js) e o
      // SDK detecta o token na URL emitindo o evento PASSWORD_RECOVERY,
      // capturado em App.jsx.
      //
      // Nota de segurança/UX: a resposta é a mesma se o email existir ou
      // não — o Supabase não confirma a existência da conta pra evitar
      // enumeração de usuários. Por isso a tela de sucesso fala em
      // "se este email estiver cadastrado".
      const { error: authError } = await requestPasswordReset(email.trim())

      if (authError) {
        // Erros típicos: limite de envios atingido, formato inválido
        // após validação extra do Supabase. Mostramos amigável mas
        // logamos o detalhe pro DevTools.
        console.error('Erro do Supabase ao enviar email de recuperação:', authError)
        setError(authError.message || 'Não foi possível enviar o e-mail. Tente novamente em alguns minutos.')
        return
      }

      setIsSubmitted(true)
    } catch (err) {
      console.error('Erro inesperado ao enviar email de recuperação:', err)
      setError('Erro ao enviar e-mail. Tente novamente mais tarde.')
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
            <p>Se este e-mail estiver cadastrado, enviamos um link de recuperação.</p>
            <p className="success-subtitle">
              Verifique sua caixa de entrada (e a pasta de spam) e siga as instruções para redefinir sua senha.
              O link expira em 1 hora.
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
