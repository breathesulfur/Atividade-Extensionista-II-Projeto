import React, { useState, useMemo, useEffect } from 'react'
import { BADGES, THEMES, unlockTheme, AVATAR_FRAMES, MYSTIC_TITLES, checkProfileHighlight } from '../utils/gamification'
import EditProfile from './EditProfile'
import ThemeSelector from './ThemeSelector'
import AvatarFrameSelector from './AvatarFrameSelector'
import MysticTitleSelector from './MysticTitleSelector'
import AvatarFrame from './AvatarFrame'
import { fetchPosts, fetchGroups } from '../lib/db'
import {
  InstagramIcon,
  TwitterIcon,
  DiscordIcon,
  TwitchIcon,
  YouTubeIcon,
  SteamIcon,
  EpicIcon,
  XboxIcon,
  PlayStationIcon,
  NintendoIcon,
  RiotIcon
} from './SocialIcons'
import './Profile.css'

function Profile({ user, onUserUpdate }) {
  const [isEditing, setIsEditing] = useState(false)

  // Obtém tema ativo e suas cores
  const activeTheme = useMemo(() => {
    if (user.activeTheme) {
      return THEMES[Object.keys(THEMES).find(key => 
        THEMES[key].id === user.activeTheme
      )] || null
    }
    return null
  }, [user.activeTheme])

  // Estilos do tema aplicados dinamicamente
  const themeStyles = useMemo(() => {
    if (!activeTheme) return {}
    
    return {
      '--theme-primary': activeTheme.colors.primary,
      '--theme-background': activeTheme.colors.background,
      '--theme-secondary': activeTheme.colors.secondary,
      '--theme-text': activeTheme.colors.text || activeTheme.colors.textPrimary,
      '--theme-textSecondary': activeTheme.colors.textSecondary || activeTheme.colors.text,
      '--theme-textDisabled': activeTheme.colors.textDisabled || activeTheme.colors.textSecondary,
      '--theme-accent': activeTheme.colors.accent,
      '--theme-links': activeTheme.colors.links || activeTheme.colors.primary,
      '--theme-glow': activeTheme.colors.glow,
      '--theme-hover': activeTheme.colors.hover || activeTheme.colors.primary,
      '--theme-disabled': activeTheme.colors.disabled || activeTheme.colors.secondary
    }
  }, [activeTheme])

  // Obtém badges do usuário
  const userBadges = user.badges || []
  const unlockedBadges = Object.values(BADGES).filter(badge =>
    userBadges.includes(badge.id)
  )

  // Obtém moldura ativa (apenas se estiver desbloqueada)
  const unlockedFrames = user.unlockedAvatarFrames || []
  const activeFrameId = user.activeAvatarFrame || null
  const activeFrame = activeFrameId && unlockedFrames.includes(activeFrameId) 
    ? activeFrameId 
    : null

  // Obtém título místico ativo (apenas se estiver desbloqueado)
  const unlockedTitles = user.unlockedMysticTitles || []
  const activeTitleId = user.activeMysticTitle || null
  const activeTitle = activeTitleId && unlockedTitles.includes(activeTitleId)
    ? Object.values(MYSTIC_TITLES).find(t => t.id === activeTitleId)
    : null

  // Estatísticas do usuário — busca do Supabase (antes lia localStorage vazio,
  // o que mantinha todos os contadores em 0 mesmo após ações)
  const [stats, setStats] = useState({
    posts: 0,
    comments: 0,
    likes: 0,
    groups: 0,
  })

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const [posts, groups] = await Promise.all([fetchPosts(), fetchGroups()])
      if (cancelled) return

      const userPosts = posts.filter((p) => p.userId === user.id)
      const userComments = posts.reduce((count, post) => {
        return count + (post.comments?.filter((c) => c.userId === user.id).length || 0)
      }, 0)
      const totalLikes = userPosts.reduce(
        (count, post) => count + (post.likes?.length || 0),
        0
      )
      const userGroups = groups.filter((g) => g.createdBy === user.id)

      setStats({
        posts: userPosts.length,
        comments: userComments,
        likes: totalLikes,
        groups: userGroups.length,
      })
    })()
    return () => {
      cancelled = true
    }
  }, [user.id])

  // Salva alterações do perfil
  const handleSaveProfile = (updatedUser) => {
    onUserUpdate(updatedUser)
    // Fecha a edição após salvar (EditProfile chama onCancel após o modal de sucesso)
  }

  const handleCloseEdit = () => {
    setIsEditing(false)
  }

  // Se estiver editando, mostra a tela de edição
  if (isEditing) {
    return (
      <div 
        className={`profile ${activeTheme ? `profile-theme-${activeTheme.id} theme-${activeTheme.id}` : ''}`}
        style={themeStyles}
      >
        <EditProfile
          user={user}
          onSave={handleSaveProfile}
          onCancel={handleCloseEdit}
          onUserUpdate={onUserUpdate}
        />
      </div>
    )
  }

  // Tela de visualização do perfil
  return (
    <div 
      className={`profile ${activeTheme ? `profile-theme-${activeTheme.id} theme-${activeTheme.id}` : ''}`}
      style={themeStyles}
    >
      <div className="profile-header">
        <h2>Meu Perfil</h2>
        <button
          onClick={() => setIsEditing(true)}
          className="edit-profile-button"
          aria-label="Editar perfil"
        >
          ✏️ Editar Perfil
        </button>
      </div>

      <div className="profile-content">
        {/* Seção Principal - Informações do Perfil */}
        <div className="profile-section profile-main-section">
          <AvatarFrame frameId={activeFrame} size="large">
            <div className="profile-avatar-large">
              {user.avatar || user.picture ? (
                <img
                  src={user.avatar || user.picture}
                  alt={user.name}
                  className="profile-avatar-img"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    const avatarDiv = e.target.parentElement
                    const fallback = avatarDiv.querySelector('.avatar-fallback')
                    if (fallback) fallback.style.display = 'flex'
                  }}
                />
              ) : null}
              <span 
                className="avatar-fallback"
                style={{ display: (user.avatar || user.picture) ? 'none' : 'flex' }}
              >
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
          </AvatarFrame>
          
          <div className="profile-info">
            <div className="profile-name-container">
              <h1 className="profile-name">{user.name || 'Usuário'}</h1>
              {activeTitle && (
                <div className="profile-mystic-title">
                  <span>{activeTitle.icon}</span>
                  {activeTitle.name}
                </div>
              )}
              {user.pronoun && (
                <p className="profile-pronoun">{user.pronoun}</p>
              )}
              {(user.city || user.state) && (
                <p className="profile-location">
                  📍 {[user.city, user.state].filter(Boolean).join(', ')}
                </p>
              )}
            </div>
            {user.bio && (
              <p className="profile-bio">{user.bio}</p>
            )}
            {!user.bio && (
              <p className="profile-bio" style={{ fontStyle: 'italic', opacity: 0.6 }}>
                Nenhuma biografia definida.
              </p>
            )}
          </div>
        </div>

        {/* Estatísticas */}
        <div className="profile-section">
          <h3 className="section-title">Estatísticas</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats.posts}</div>
              <div className="stat-label">Postagens</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.comments}</div>
              <div className="stat-label">Comentários</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.likes}</div>
              <div className="stat-label">Curtidas Recebidas</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.groups}</div>
              <div className="stat-label">Grupos Criados</div>
            </div>
          </div>
        </div>

        {/* Jogos de Interesse */}
        <div className="profile-section">
          <h3 className="section-title">Jogos de Interesse</h3>
          <div className="games-list">
            {user.games && user.games.length > 0 ? (
              user.games.map(game => (
                <span key={game} className="game-tag">
                  {game}
                </span>
              ))
            ) : (
              <p className="no-games">Nenhum jogo selecionado</p>
            )}
          </div>
        </div>

        {/* Redes Sociais */}
        {(user.socialMedia && (
          Object.values(user.socialMedia).some(value => value && value.trim())
        )) && (
          <div className="profile-section">
            <h3 className="section-title">Redes Sociais</h3>
            <div className="social-links">
              {user.socialMedia.instagram && user.socialMedia.instagram.trim() && (
                <a
                  href={`https://instagram.com/${user.socialMedia.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link instagram"
                >
                  <InstagramIcon size={20} />
                  Instagram
                </a>
              )}
              {user.socialMedia.twitter && user.socialMedia.twitter.trim() && (
                <a
                  href={`https://twitter.com/${user.socialMedia.twitter.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link twitter"
                >
                  <TwitterIcon size={20} />
                  X (Twitter)
                </a>
              )}
              {user.socialMedia.youtube && user.socialMedia.youtube.trim() && (
                <a
                  href={`https://youtube.com/@${user.socialMedia.youtube.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link youtube"
                >
                  <YouTubeIcon size={20} />
                  YouTube
                </a>
              )}
              {user.socialMedia.discord && user.socialMedia.discord.trim() && (
                <span className="social-link discord" title={user.socialMedia.discord}>
                  <DiscordIcon size={20} />
                  Discord: {user.socialMedia.discord}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Plataformas de Jogo */}
        {(user.platforms && (
          Object.values(user.platforms).some(value => value && value.trim())
        )) && (
          <div className="profile-section">
            <h3 className="section-title">Plataformas de Jogo</h3>
            <div className="platforms-list">
              {user.platforms.steam && user.platforms.steam.trim() && (
                <div className="platform-item">
                  <div className="platform-icon steam">
                    <SteamIcon size={24} />
                  </div>
                  <div className="platform-name">Steam</div>
                  <div className="platform-value">{user.platforms.steam}</div>
                </div>
              )}
              {user.platforms.xbox && user.platforms.xbox.trim() && (
                <div className="platform-item">
                  <div className="platform-icon xbox">
                    <XboxIcon size={24} />
                  </div>
                  <div className="platform-name">Xbox</div>
                  <div className="platform-value">{user.platforms.xbox}</div>
                </div>
              )}
              {user.platforms.playstation && user.platforms.playstation.trim() && (
                <div className="platform-item">
                  <div className="platform-icon playstation">
                    <PlayStationIcon size={24} />
                  </div>
                  <div className="platform-name">PlayStation</div>
                  <div className="platform-value">{user.platforms.playstation}</div>
                </div>
              )}
              {user.platforms.epic && user.platforms.epic.trim() && (
                <div className="platform-item">
                  <div className="platform-icon epic">
                    <EpicIcon size={24} />
                  </div>
                  <div className="platform-name">Epic Games</div>
                  <div className="platform-value">{user.platforms.epic}</div>
                </div>
              )}
              {user.platforms.nintendo && user.platforms.nintendo.trim() && (
                <div className="platform-item">
                  <div className="platform-icon nintendo">
                    <NintendoIcon size={24} />
                  </div>
                  <div className="platform-name">Nintendo Switch</div>
                  <div className="platform-value">{user.platforms.nintendo}</div>
                </div>
              )}
              {user.platforms.riot && user.platforms.riot.trim() && (
                <div className="platform-item">
                  <div className="platform-icon riot">
                    <RiotIcon size={24} />
                  </div>
                  <div className="platform-name">Riot Games</div>
                  <div className="platform-value">{user.platforms.riot}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Selos (Conquistas) */}
        <div className="profile-section">
          <h3 className="section-title">🏆 Conquistas</h3>
          <p className="section-subtitle" style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: 'var(--spacing-md)' }}>
            Selos desbloqueados através de comportamentos saudáveis e acolhedores
          </p>
          {unlockedBadges.length > 0 ? (
            <div className="badges-grid">
              {unlockedBadges.map(badge => (
                <div key={badge.id} className="badge-card unlocked">
                  <div className="badge-icon">{badge.icon}</div>
                  <div className="badge-info">
                    <div className="badge-name">{badge.name}</div>
                    <div className="badge-description">{badge.description}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-badges">
              Complete ações na plataforma para desbloquear selos! ✨
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile
