import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import AvatarFrame from './AvatarFrame'
import LoadingSpinner from './LoadingSpinner'
import './GroupMembersModal.css'

/**
 * Modal de listagem de membros de um grupo.
 *
 * - Busca em lote os perfis dos `memberIds` via Supabase (.in('id', ...))
 * - Renderiza lista com avatar + nome + pronome + indicador de criador/você
 * - Campo de busca client-side filtra por nome
 * - Clicar em um membro chama `onOpenProfile(userId)` e fecha o modal
 *
 * Props:
 * - isOpen: boolean
 * - onClose: () => void
 * - memberIds: string[]   (array de UUIDs de profiles)
 * - groupName: string
 * - createdBy: string     (UUID do criador, exibe selo)
 * - currentUserId: string (para marcar "Você")
 * - onOpenProfile: (userId) => void
 */
function GroupMembersModal({
  isOpen,
  onClose,
  memberIds = [],
  groupName,
  createdBy,
  currentUserId,
  onOpenProfile,
}) {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (!isOpen) return
    if (!memberIds || memberIds.length === 0) {
      setProfiles([])
      return
    }
    let cancelled = false
    setLoading(true)
    ;(async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, pronoun, avatar, active_avatar_frame, unlocked_avatar_frames')
        .in('id', memberIds)
      if (cancelled) return
      if (error) {
        console.error('Erro ao buscar membros do grupo:', error)
        setProfiles([])
      } else {
        setProfiles(data || [])
      }
      setLoading(false)
    })()
    return () => { cancelled = true }
  }, [isOpen, memberIds])

  // Foco/Esc/scroll-lock quando o modal abrir
  useEffect(() => {
    if (!isOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => { if (e.key === 'Escape') onClose && onClose() }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKey)
    }
  }, [isOpen, onClose])

  const filteredProfiles = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return profiles
    return profiles.filter(p => (p.name || '').toLowerCase().includes(q))
  }, [profiles, query])

  if (!isOpen) return null

  const handleMemberClick = (userId) => {
    if (onOpenProfile) onOpenProfile(userId)
    if (onClose) onClose()
  }

  return (
    <div
      className="members-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="members-modal-title"
    >
      <div className="members-modal" onClick={(e) => e.stopPropagation()}>
        <header className="members-modal-header">
          <div>
            <h3 id="members-modal-title">👥 Membros</h3>
            <p className="members-modal-subtitle">
              {groupName} — {memberIds.length} {memberIds.length === 1 ? 'membro' : 'membros'}
            </p>
          </div>
          <button
            type="button"
            className="members-modal-close"
            onClick={onClose}
            aria-label="Fechar"
          >
            ✕
          </button>
        </header>

        <div className="members-modal-search">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar membro pelo nome..."
            aria-label="Buscar membro"
          />
        </div>

        <div className="members-modal-list">
          {loading ? (
            <div className="members-modal-loading">
              <LoadingSpinner size="medium" text="Carregando membros..." />
            </div>
          ) : filteredProfiles.length === 0 ? (
            <p className="members-modal-empty">
              {query ? 'Nenhum membro encontrado com esse nome.' : 'Este grupo ainda não tem membros.'}
            </p>
          ) : (
            <ul>
              {filteredProfiles.map((profile) => {
                const isCreator = profile.id === createdBy
                const isMe = profile.id === currentUserId
                const frameId =
                  profile.active_avatar_frame &&
                  Array.isArray(profile.unlocked_avatar_frames) &&
                  profile.unlocked_avatar_frames.includes(profile.active_avatar_frame)
                    ? profile.active_avatar_frame
                    : null
                return (
                  <li key={profile.id}>
                    <button
                      type="button"
                      className="member-row"
                      onClick={() => handleMemberClick(profile.id)}
                      aria-label={`Abrir perfil de ${profile.name || 'usuário'}`}
                    >
                      <AvatarFrame frameId={frameId} size="small">
                        <div className="member-avatar">
                          {profile.avatar ? (
                            <img
                              src={profile.avatar}
                              alt=""
                              className="member-avatar-img"
                            />
                          ) : (
                            <span className="member-avatar-fallback">
                              {(profile.name || '?').charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                      </AvatarFrame>
                      <div className="member-info">
                        <div className="member-name">
                          {profile.name || 'Usuário'}
                          {isMe && <span className="member-badge member-badge-me">Você</span>}
                          {isCreator && <span className="member-badge member-badge-creator">Criador</span>}
                        </div>
                        {profile.pronoun && (
                          <div className="member-pronoun">{profile.pronoun}</div>
                        )}
                      </div>
                      <span className="member-arrow" aria-hidden="true">›</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export default GroupMembersModal
