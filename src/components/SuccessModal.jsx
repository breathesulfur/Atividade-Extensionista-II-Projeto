import React, { useEffect } from 'react'
import './SuccessModal.css'

function SuccessModal({ isOpen, onClose, message = 'Dados salvos com sucesso!' }) {
  useEffect(() => {
    if (isOpen) {
      // Fecha automaticamente após 3 segundos
      const timer = setTimeout(() => {
        onClose()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="success-modal-overlay" onClick={onClose}>
      <div className="success-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="success-modal-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <h3 className="success-modal-title">Sucesso!</h3>
        <p className="success-modal-message">{message}</p>
        <button onClick={onClose} className="success-modal-button">
          OK
        </button>
      </div>
    </div>
  )
}

export default SuccessModal
