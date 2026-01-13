import React, { useEffect } from 'react'
import './Notification.css'

function Notification({ message, type = 'info', onClose, duration = 4000 }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
    achievement: '🏆',
    essence: '🔮'
  }

  const icon = icons[type] || icons.info

  return (
    <div className={`notification notification-${type}`}>
      <div className="notification-content">
        <div className="notification-icon">{icon}</div>
        <div className="notification-message">
          {typeof message === 'string' ? (
            <p>{message}</p>
          ) : (
            <>
              {message.title && <h4>{message.title}</h4>}
              {message.text && <p>{message.text}</p>}
            </>
          )}
        </div>
        <button onClick={onClose} className="notification-close" aria-label="Fechar">
          ✕
        </button>
      </div>
    </div>
  )
}

export default Notification
