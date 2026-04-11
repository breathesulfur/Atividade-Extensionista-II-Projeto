import React from 'react'
import './SuccessModal.css'

function SuccessModal({ isOpen, onClose, message = 'Dados salvos com sucesso!', title = 'Tudo certo!' }) {
  if (!isOpen) return null

  return (
    <div className="success-modal-overlay" onClick={onClose}>
      <div className="success-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="success-modal-icon">🎉</div>
        <h3 className="success-modal-title">{title}</h3>
        <p className="success-modal-message">{message}</p>
        <div className="success-modal-actions">
          <button onClick={onClose} className="success-modal-button">
            Continuar
          </button>
        </div>
      </div>
    </div>
  )
}

export default SuccessModal
