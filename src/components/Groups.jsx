import React, { useState, useEffect } from 'react'
import GroupCard from './GroupCard'
import CreateGroup from './CreateGroup'
import { fetchGroups, createGroup as dbCreateGroup, deleteGroup as dbDeleteGroup, joinGroup, leaveGroup, createNotification } from '../lib/db'
import { addEssence, ESSENCE, checkBadges, getActionMessage, BADGES } from '../utils/gamification'
import { getPosts } from '../utils/storage'
import { notifyAchievement, notifyEssenceGained, notifySuccess, notifyError } from '../utils/notifications'
import './Groups.css'

// Mapa de ícones e cores por jogo
const GAME_META = {
  'valorant':          { icon: '🎯', color: '#FF4655' },
  'league of legends': { icon: '⚔️', color: '#C89B3C' },
  'lol':               { icon: '⚔️', color: '#C89B3C' },
  'overwatch':         { icon: '🛡️', color: '#F99E1A' },
  'apex legends':      { icon: '🔫', color: '#CD4F1F' },
  'fortnite':          { icon: '🏗️', color: '#00B4FF' },
  'minecraft':         { icon: '⛏️', color: '#7BAF2C' },
  'among us':          { icon: '🚀', color: '#C51111' },
  'genshin impact':    { icon: '✨', color: '#9B6B9E' },
  'world of warcraft': { icon: '🐉', color: '#0070DE' },
  'wow':               { icon: '🐉', color: '#0070DE' },
  'final fantasy':     { icon: '🌟', color: '#8B6914' },
  'cs:go':             { icon: '💣', color: '#F5B731' },
  'csgo':              { icon: '💣', color: '#F5B731' },
  'rocket league':     { icon: '🚗', color: '#1A73E8' },
  'animal crossing':   { icon: '🌿', color: '#7AC74F' },
  'stardew valley':    { icon: '🌾', color: '#86C154' },
  'the sims':          { icon: '🏠', color: '#00A65A' },
  'project zomboid':   { icon: '🧟', color: '#5C7A3A' },
}

function getGameMeta(gameName) {
  if (!gameName) return { icon: '🎮', color: '#8B5CF6' }
  const key = gameName.toLowerCase()
  for (const [pattern, meta] of Object.entries(GAME_META)) {
    if (key.includes(pattern)) return meta
  }
  return { icon: '🎮', color: '#8B5CF6' }
}

function Groups({ user, onUserUpdate, targetGroupId, onGroupOpened }) {
  const [groups, setGroups] = useState([])
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState(null)

  const loadGroups = async () => {
    const data = await fetchGroups()
    setGroups(data)
  }

  useEffect(() => { loadGroups() }, [])

  // Quando vem um targetGroupId externo (compartilhamento via post),
  // abre automaticamente o grupo correspondente.
  useEffect(() => {
    if (!targetGroupId || groups.length === 0) return
    const target = groups.find(g => g.id === targetGroupId)
    if (target) {
      setSelectedGroup(target)
      onGroupOpened?.()
    }
  }, [targetGroupId, groups, onGroupOpened])

  // Cria novo grupo
  const handleCreateGroup = async (groupData) => {
    const newGroup = await dbCreateGroup(user.id, groupData.name, groupData.description, groupData.game)
    if (newGroup) setGroups(prev => [...prev, newGroup])
    setShowCreateGroup(false)
  }

  // Exclui um grupo
  const handleDeleteGroup = async (groupId) => {
    const group = groups.find(g => g.id === groupId)
    if (!group) { notifyError('Grupo não encontrado.'); return }
    if (group.createdBy !== user.id) { notifyError('Você só pode excluir grupos que você criou.'); return }
    if (!window.confirm(`Tem certeza que deseja excluir o grupo "${group.name}"?`)) return

    await dbDeleteGroup(groupId)
    setGroups(prev => prev.filter(g => g.id !== groupId))
    notifySuccess('Grupo excluído com sucesso!')
  }

  // Entra/sai de um grupo
  const handleToggleMembership = async (groupId) => {
    const group = groups.find(g => g.id === groupId)
    const isMember = group?.members.includes(user.id) || false

    if (isMember) {
      if (!window.confirm('Tem certeza que deseja sair do grupo?')) return
      await leaveGroup(groupId, user.id)
      setGroups(prev => prev.map(g =>
        g.id === groupId ? { ...g, members: g.members.filter(id => id !== user.id) } : g
      ))
    } else {
      await joinGroup(groupId, user.id)
      setGroups(prev => prev.map(g =>
        g.id === groupId ? { ...g, members: [...g.members, user.id] } : g
      ))

      if (group.createdBy && group.createdBy !== user.id) {
        createNotification({
          userId: group.createdBy,
          type: 'group_join',
          sourceUserId: user.id,
          sourceUserName: user.name,
          groupId,
          message: `${user.name} entrou no seu grupo "${group.name}"`,
        })
      }

      const joinedGroups = user.joinedGroups || []
      const isNewGroup = !joinedGroups.includes(groupId)

      if (isNewGroup) {
        let updatedUser = addEssence(user, ESSENCE.JOIN_GROUP)
        updatedUser = { ...updatedUser, joinedGroups: [...joinedGroups, groupId] }
        notifyEssenceGained(ESSENCE.JOIN_GROUP, 'Participar de grupo inclusivo')

        setTimeout(() => {
          const posts = getPosts()
          const currentGroups = groups.map(g =>
            g.id === groupId ? { ...g, members: [...g.members, user.id] } : g
          )
          const newBadges = checkBadges(updatedUser, posts, currentGroups, {})
          const trulyNew = newBadges.filter(b => !(updatedUser.badges || []).includes(b.id))
          if (trulyNew.length > 0) {
            updatedUser = { ...updatedUser, badges: [...(updatedUser.badges || []), ...trulyNew.map(b => b.id)] }
            trulyNew.filter(b => b.id !== BADGES.REVEALED_ESSENCE.id).forEach((badge, i) => {
              setTimeout(() => notifyAchievement(badge.name, getActionMessage(badge.id)), 100 + i * 500)
            })
          }
          onUserUpdate(updatedUser)
        }, 100)
      }
    }
  }

  // Filtra grupos por jogos de interesse do usuário
  const handleCopyInviteLink = (groupId) => {
    const link = `${window.location.origin}/?group=${groupId}`
    navigator.clipboard.writeText(link).then(() => {
      notifySuccess('Link de convite copiado! 🔗')
    }).catch(() => {
      notifyError('Não foi possível copiar o link.')
    })
  }

  const userGames = user.games || []
  const relevantGroups = groups.filter(group =>
    userGames.some(game => group.game.toLowerCase().includes(game.toLowerCase()))
  )
  const otherGroups = groups.filter(group =>
    !userGames.some(game => group.game.toLowerCase().includes(game.toLowerCase()))
  )

  if (selectedGroup) {
    return (
      <GroupCard
        group={selectedGroup}
        user={user}
        onBack={() => setSelectedGroup(null)}
        onUserUpdate={onUserUpdate}
      />
    )
  }

  return (
    <div className="groups">
      <div className="groups-header">
        <h2>Grupos de Jogos</h2>
        <button
          onClick={() => setShowCreateGroup(!showCreateGroup)}
          className="create-group-button"
        >
          {showCreateGroup ? '✕ Cancelar' : '+ Criar Grupo'}
        </button>
      </div>

      {showCreateGroup && (
        <CreateGroup
          user={user}
          onCreateGroup={handleCreateGroup}
          onUserUpdate={onUserUpdate}
        />
      )}

      <div className="groups-container">
        {relevantGroups.length > 0 && (
          <div className="groups-section">
            <h3 className="section-title">
              🎯 Grupos dos seus jogos favoritos
            </h3>
            <div className="groups-grid">
              {relevantGroups.map(group => {
                const { icon, color } = getGameMeta(group.game)
                return (
                <div key={group.id} className="group-item" style={{ '--game-color': color }}>
                  <div className="group-item-header">
                    <span className="group-game-icon" style={{ background: color }}>{icon}</span>
                    <div className="group-item-title">
                      <h4>{group.name}</h4>
                      <span className="group-game" style={{ color }}>{group.game}</span>
                    </div>
                  </div>
                  <p className="group-description">{group.description}</p>
                  <div className="group-meta">
                    <span>👥 {group.members.length} membro{group.members.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="group-actions">
                    <button
                      onClick={() => setSelectedGroup(group)}
                      className="view-group-button"
                    >
                      Abrir Chat
                    </button>
                    <button
                      onClick={() => handleToggleMembership(group.id)}
                      className={`join-group-button ${
                        group.members.includes(user.id) ? 'joined' : ''
                      }`}
                    >
                      {group.members.includes(user.id) ? 'Sair' : 'Entrar'}
                    </button>
                    <button
                      onClick={() => handleCopyInviteLink(group.id)}
                      className="invite-link-button"
                      title="Copiar link de convite"
                    >
                      🔗
                    </button>
                    {group.createdBy === user.id && (
                      <button
                        onClick={() => handleDeleteGroup(group.id)}
                        className="delete-group-button"
                        title="Excluir grupo"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
                )
              })}
            </div>
          </div>
        )}

        {otherGroups.length > 0 && (
          <div className="groups-section">
            <h3 className="section-title">🎮 Outros Grupos</h3>
            <div className="groups-grid">
              {otherGroups.map(group => {
                const { icon, color } = getGameMeta(group.game)
                return (
                <div key={group.id} className="group-item" style={{ '--game-color': color }}>
                  <div className="group-item-header">
                    <span className="group-game-icon" style={{ background: color }}>{icon}</span>
                    <div className="group-item-title">
                      <h4>{group.name}</h4>
                      <span className="group-game" style={{ color }}>{group.game}</span>
                    </div>
                  </div>
                  <p className="group-description">{group.description}</p>
                  <div className="group-meta">
                    <span>👥 {group.members.length} membro{group.members.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="group-actions">
                    <button
                      onClick={() => setSelectedGroup(group)}
                      className="view-group-button"
                    >
                      Abrir Chat
                    </button>
                    <button
                      onClick={() => handleToggleMembership(group.id)}
                      className={`join-group-button ${
                        group.members.includes(user.id) ? 'joined' : ''
                      }`}
                    >
                      {group.members.includes(user.id) ? 'Sair' : 'Entrar'}
                    </button>
                    <button
                      onClick={() => handleCopyInviteLink(group.id)}
                      className="invite-link-button"
                      title="Copiar link de convite"
                    >
                      🔗
                    </button>
                    {group.createdBy === user.id && (
                      <button
                        onClick={() => handleDeleteGroup(group.id)}
                        className="delete-group-button"
                        title="Excluir grupo"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
                )
              })}
            </div>
          </div>
        )}

        {groups.length === 0 && (
          <div className="empty-state">
            <p>Nenhum grupo criado ainda. Crie o primeiro grupo de jogo! 🎮</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Groups
