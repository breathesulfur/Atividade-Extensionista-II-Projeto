import React, { useState } from 'react'
import { submitFeedback } from '../lib/db'
import { notifySuccess, notifyError } from '../utils/notifications'
import './FeedbackForm.css'

const CATEGORIES = [
  { value: 'geral', label: '💬 Geral' },
  { value: 'bug', label: '🐛 Reportar Bug' },
  { value: 'sugestao', label: '💡 Sugestão' },
  { value: 'elogio', label: '🌟 Elogio' },
]

function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          className={`star ${star <= (hovered || value) ? 'active' : ''}`}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          aria-label={`${star} estrela${star > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  )
}

function FeedbackForm({ user, onClose }) {
  const [form, setForm] = useState({ rating: 0, category: 'geral', message: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.rating === 0) { notifyError('Por favor, selecione uma avaliação.'); return }
    if (!form.message.trim()) { notifyError('Por favor, escreva sua mensagem.'); return }

    setLoading(true)
    const ok = await submitFeedback({
      userId: user.id,
      userName: user.name,
      rating: form.rating,
      category: form.category,
      message: form.message.trim(),
    })

    setLoading(false)
    if (ok) {
      notifySuccess('Feedback enviado! Obrigada pela sua opinião 💜')
      onClose()
    } else {
      notifyError('Erro ao enviar feedback. Tente novamente.')
    }
  }

  return (
    <div className="feedback-overlay" onClick={onClose}>
      <div className="feedback-modal" onClick={e => e.stopPropagation()}>
        <div className="feedback-header">
          <h3>Enviar Feedback</h3>
          <button className="feedback-close" onClick={onClose}>✕</button>
        </div>

        <p className="feedback-subtitle">Sua opinião ajuda a tornar o InclusivChat melhor para todas! 🌈</p>

        <form onSubmit={handleSubmit} className="feedback-form">
          <div className="feedback-field">
            <label>Como você avalia sua experiência?</label>
            <StarRating value={form.rating} onChange={r => setForm(f => ({ ...f, rating: r }))} />
          </div>

          <div className="feedback-field">
            <label>Categoria</label>
            <div className="category-chips">
              {CATEGORIES.map(c => (
                <button
                  key={c.value}
                  type="button"
                  className={`category-chip ${form.category === c.value ? 'active' : ''}`}
                  onClick={() => setForm(f => ({ ...f, category: c.value }))}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="feedback-field">
            <label>Mensagem <span className="required">*</span></label>
            <textarea
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              placeholder="Conta pra gente o que você achou, o que faltou ou o que adorou..."
              rows={4}
              maxLength={500}
              className="feedback-textarea"
            />
            <span className="feedback-count">{form.message.length}/500</span>
          </div>

          <button type="submit" className="feedback-submit" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar Feedback 💜'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default FeedbackForm
