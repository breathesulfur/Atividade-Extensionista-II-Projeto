import React, { useEffect } from 'react'
import './RewardNotification.css'

function RewardNotification({ reward, onClose }) {
  useEffect(() => {
    // Fecha automaticamente após 5 segundos
    const timer = setTimeout(() => {
      onClose()
    }, 5000)

    return () => clearTimeout(timer)
  }, [onClose])

  if (!reward) return null

  return (
    <div className="reward-notification">
      <div className="reward-content">
        <div className="reward-icon">🎉</div>
        <div className="reward-text">
          <h3>{reward.message}</h3>
          <p>🎁 Você ganhou +{reward.bonus} Essências de bônus!</p>
        </div>
        <button onClick={onClose} className="reward-close">✕</button>
      </div>
    </div>
  )
}

export default RewardNotification
