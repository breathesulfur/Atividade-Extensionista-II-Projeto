import React, { useState } from 'react'
import LoadingSpinner from './LoadingSpinner'
import { updatePassword, signOut } from '../lib/db'
import './ForgotPassword.css'

// Tela mostrada após o usuário clicar no link de recuperação do email.
//
// Quando o link é clicado, o SDK do Supabase já populou a sessão com
// um token temporário e disparou o evento PASSWORD_RECOVERY em App.jsx.
// Aqui só precisamos coletar a nova senha e chamar updatePassword().
//
// MIN_PASSWORD_LENGTH é o mínimo configurado no Supabase Dashboard
// (Authentication → Settings → Auth Providers → Email → Minimum password
// length, default 6).
const MIN_PASSWORD_LENGTH = 6

function ResetPassword({ onDone }) {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(`A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`)
      return
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }

    setLoading(true)

    try {
      const { error: authError } = await updatePassword(newPassword)

      if (authError) {
        console.error('Erro ao atualizar senha:', authError)
        setError(authError.message || 'Não foi possível atualizar a senha. Tente novamente.')
        return
      }

      setSuccess(true)

      // Após troca de senha bem-sucedida, deslogamos para forçar novo
      // login com a senha nova. Sem isso, o Supabase mantém a sessão
      // temporária do token de recuperação, o que confunde o estado
      // do app (usuário poderia "entrar" sem digitar a nova senha).
      await signOut()

      // Devolve o controle pro App.jsx, que volta pra tela de login.
      setTimeout(() => {
        if (onDone) onDone()
      }, 1500)
    } catch (err) {
      console.error('Erro inesperado ao atualizar senha:', err)
      setError('Erro ao atualizar senha. Tente novamente mais tarde.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <div className="forgot-password-header">
          <h1 className="forgot-password-title">Nova Senha</h1>
          <p className="forgot-password-subtitle">
            {success
              ? 'Senha alterada com sucesso! Redirecionando para o login...'
              : 'Crie uma nova senha para sua conta.'}
          </p>
        </div>

        {!success && (
          <form onSubmit={handleSubmit} className="forgot-password-form">
            <div className="form-group">
              <label htmlFor="new-password" className="form-label">
                Nova senha <span className="required-asterisk">*</span>
              </label>
              <input
                type="password"
                id="new-password"
                name="new-password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value)
                  setError('')
                }}
                className={`form-input ${error ? 'error' : ''}`}
                placeholder={`Mínimo ${MIN_PASSWORD_LENGTH} caracteres`}
                required
                aria-required="true"
                disabled={loading}
                autoComplete="new-password"
                minLength={MIN_PASSWORD_LENGTH}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirm-password" className="form-label">
                Confirme a nova senha <span className="required-asterisk">*</span>
              </label>
              <input
                type="password"
                id="confirm-password"
                name="confirm-password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  setError('')
                }}
                className={`form-input ${error ? 'error' : ''}`}
                placeholder="Digite a senha novamente"
                required
                aria-required="true"
                disabled={loading}
                autoComplete="new-password"
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
                'Salvar nova senha'
              )}
            </button>
          </form>
        )}

        {success && (
          <div className="success-message">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <p>Senha atualizada!</p>
            <p className="success-subtitle">
              Você será redirecionado para a tela de login em instantes.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ResetPassword
