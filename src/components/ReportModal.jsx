import React, { useState, useEffect } from 'react'
import './ReportModal.css'

function ReportModal({ isOpen, onClose, onSubmit, type = 'post', itemName = 'este conteúdo' }) {
  const [reportReason, setReportReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Limpa o campo quando o modal é aberto e gerencia o body
  useEffect(() => {
    if (isOpen) {
      setReportReason('')
      setIsSubmitting(false)
      // Adiciona classe ao body para desabilitar interações de fundo
      document.body.classList.add('modal-open')
      document.body.style.overflow = 'hidden'
    } else {
      // Remove classe e restaura scroll quando o modal fecha
      document.body.classList.remove('modal-open')
      document.body.style.overflow = ''
    }
    
    return () => {
      document.body.classList.remove('modal-open')
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!reportReason.trim()) {
      return
    }

    setIsSubmitting(true)

    // Chama a função de callback com o motivo
    await onSubmit(reportReason.trim())

    // Limpa o formulário
    setReportReason('')
    setIsSubmitting(false)
    onClose()
  }

  const handleCancel = () => {
    setReportReason('')
    onClose()
  }

  return (
    <div 
      className="report-modal-overlay" 
      onClick={handleCancel}
    >
      <div 
        className="report-modal-content" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="report-modal-header">
          <h2 className="report-modal-title">🚩 Denunciar {type === 'post' ? 'Postagem' : 'Comentário'}</h2>
          <button onClick={handleCancel} className="report-modal-close-button" aria-label="Fechar" disabled={isSubmitting}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="report-modal-form">
          <div className="report-modal-body">
            <p className="report-modal-description">
              Por favor, descreva o motivo da denúncia de {itemName}. Isso ajudará nossa equipe a analisar o conteúdo de forma adequada.
            </p>

            <div className="form-group">
              <label htmlFor="reportReason" className="form-label">
                Motivo da denúncia <span className="required-asterisk">*</span>
              </label>
              <textarea
                id="reportReason"
                name="reportReason"
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Descreva o motivo da denúncia (ex: conteúdo ofensivo, spam, assédio, etc.)"
                className="report-reason-textarea"
                required
                disabled={isSubmitting}
                rows={5}
                maxLength={500}
                aria-required="true"
              />
              <div className="character-count">
                {reportReason.length}/500 caracteres
              </div>
            </div>

            <p className="report-modal-note">
              💡 Sua denúncia será analisada por nossa equipe de moderação. Agradecemos por ajudar a manter nossa comunidade segura!
            </p>
          </div>

          <div className="report-modal-footer">
            <button
              type="button"
              onClick={handleCancel}
              className="report-button-cancel"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="report-button-submit"
              disabled={isSubmitting || !reportReason.trim()}
            >
              {isSubmitting ? 'Enviando...' : 'Denunciar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ReportModal
