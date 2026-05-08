import React, { useState } from 'react'
import './Tour.css'

const STEPS = [
  {
    icon: '🌟',
    title: 'Bem-vinda ao InclusivChat',
    description: 'Um espaço seguro e acolhedor para pessoas LGBTQIA+ gamers se conectarem, compartilharem e se apoiarem.',
  },
  {
    icon: '📰',
    title: 'Feed',
    description: 'Publique o que está pensando, reaja com emojis e comente com carinho. Comentários respeitosos rendem essências.',
  },
  {
    icon: '🎮',
    title: 'Grupos',
    description: 'Entre em grupos dos seus jogos favoritos e converse em tempo real com outros membros. Você pode também criar novos grupos.',
  },
  {
    icon: '✨',
    title: 'Essências',
    description: 'Ganhe essências participando da comunidade — postar, comentar, denunciar conteúdo ofensivo e mais. Limite diário de 50 para incentivar equilíbrio.',
  },
  {
    icon: '🎨',
    title: 'Recompensas',
    description: 'Use suas essências pra desbloquear temas visuais, molduras de avatar e títulos místicos. Personalize seu perfil do seu jeito.',
  },
]

function Tour({ user, onClose }) {
  const [step, setStep] = useState(0)
  const isFirst = step === 0
  const isLast = step === STEPS.length - 1
  const current = STEPS[step]

  const next = () => isLast ? onClose() : setStep(s => s + 1)
  const prev = () => setStep(s => Math.max(0, s - 1))

  return (
    <div className="tour-overlay" onClick={onClose}>
      <div className="tour-modal" onClick={(e) => e.stopPropagation()}>
        <button className="tour-skip" onClick={onClose} aria-label="Pular tour">Pular</button>

        <div className="tour-icon" aria-hidden="true">{current.icon}</div>
        <h3 className="tour-title">
          {isFirst ? <>Olá, <span>{user.name}</span>!</> : current.title}
        </h3>
        {isFirst && <p className="tour-subtitle">{current.title}</p>}
        <p className="tour-description">{current.description}</p>

        <div className="tour-dots" role="tablist" aria-label="Progresso do tour">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`tour-dot ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}
              role="tab"
              aria-selected={i === step}
            />
          ))}
        </div>

        <div className="tour-actions">
          {!isFirst && (
            <button className="tour-button tour-button-secondary" onClick={prev}>
              Anterior
            </button>
          )}
          <button className="tour-button tour-button-primary" onClick={next}>
            {isLast ? 'Começar a explorar' : 'Próximo'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Tour
