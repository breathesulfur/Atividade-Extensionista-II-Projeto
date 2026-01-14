import React, { useState, useEffect } from 'react'
import GroupCard from './GroupCard'
import CreateGroup from './CreateGroup'
import { getGroups, saveGroups } from '../utils/storage'
import { addEssence, ESSENCE, checkBadges, getActionMessage, BADGES } from '../utils/gamification'
import { getPosts } from '../utils/storage'
import { notifyAchievement, notifyEssenceGained, notifySuccess, notifyError } from '../utils/notifications'
import './Groups.css'

function Groups({ user, onUserUpdate }) {
  const [groups, setGroups] = useState([])
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState(null)

  // Carrega grupos do localStorage
  useEffect(() => {
    const savedGroups = getGroups()
    setGroups(savedGroups)
  }, [])

  // Cria novo grupo
  const handleCreateGroup = (groupData) => {
    const newGroup = {
      id: Date.now().toString(),
      ...groupData,
      createdBy: user.id,
      members: [user.id],
      createdAt: new Date().toISOString()
    }

    const updatedGroups = [...groups, newGroup]
    setGroups(updatedGroups)
    saveGroups(updatedGroups)
    setShowCreateGroup(false)
  }

  // Exclui um grupo (apenas grupos criados pelo usuário)
  const handleDeleteGroup = (groupId) => {
    const group = groups.find(g => g.id === groupId)
    
    if (!group) {
      notifyError('Grupo não encontrado.')
      return
    }

    if (group.createdBy !== user.id) {
      notifyError('Você só pode excluir grupos que você criou.')
      return
    }

    const confirmed = window.confirm(`Tem certeza que deseja excluir o grupo "${group.name}"? Esta ação não pode ser desfeita.`)
    if (!confirmed) {
      return
    }

    const updatedGroups = groups.filter(g => g.id !== groupId)
    setGroups(updatedGroups)
    saveGroups(updatedGroups)
    notifySuccess('Grupo excluído com sucesso!')
  }

  // Entra/sai de um grupo
  const handleToggleMembership = (groupId) => {
    const group = groups.find(g => g.id === groupId)
    const isMember = group?.members.includes(user.id) || false

    // Se for sair, pede confirmação
    if (isMember) {
      const confirmed = window.confirm('Tem certeza que deseja sair do grupo?')
      if (!confirmed) {
        return
      }
    }

    const updatedGroups = groups.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          members: isMember
            ? group.members.filter(id => id !== user.id)
            : [...group.members, user.id]
        }
      }
      return group
    })

    setGroups(updatedGroups)
    saveGroups(updatedGroups)

    // Se entrou no grupo, verifica se já entrou antes e adiciona Essência apenas na primeira vez
    if (!isMember) {
      // Obtém lista de grupos que o usuário já entrou (guarda histórico)
      const joinedGroups = user.joinedGroups || []
      
      // Verifica se este é um grupo novo (não está no histórico)
      const isNewGroup = !joinedGroups.includes(groupId)
      
      let updatedUser = { ...user }
      
      // Só adiciona essência se for um grupo novo
      if (isNewGroup) {
        updatedUser = addEssence(user, ESSENCE.JOIN_GROUP)
        
        // Notifica sobre essências ganhas
        notifyEssenceGained(ESSENCE.JOIN_GROUP, 'Participar de grupo inclusivo')
        
        // Adiciona o grupo ao histórico de grupos que o usuário já entrou
        updatedUser = {
          ...updatedUser,
          joinedGroups: [...joinedGroups, groupId]
        }
        
        // Salva no localStorage
        localStorage.setItem('inclusivchat_user', JSON.stringify(updatedUser))
        
        // Atualiza também na lista de usuários
        const savedUsers = JSON.parse(localStorage.getItem('inclusivchat_users') || '[]')
        const userIndex = savedUsers.findIndex(u => u.id === user.id || u.email === user.email)
        if (userIndex !== -1) {
          savedUsers[userIndex] = { ...savedUsers[userIndex], ...updatedUser }
          localStorage.setItem('inclusivchat_users', JSON.stringify(savedUsers))
        }
        
        // Verifica badges após entrar no grupo
        setTimeout(() => {
          const posts = getPosts()
          const messages = {}
          const newBadges = checkBadges(updatedUser, posts, updatedGroups, messages)
          
          const userBadges = updatedUser.badges || []
          const trulyNewBadges = newBadges.filter(badge => !userBadges.includes(badge.id))
          
          if (trulyNewBadges.length > 0) {
            updatedUser = {
              ...updatedUser,
              badges: [...userBadges, ...trulyNewBadges.map(b => b.id)]
            }
            
            // Mostra notificação de novos selos (exceto REVEALED_ESSENCE que deve aparecer apenas ao completar perfil)
            const badgesToNotify = trulyNewBadges.filter(badge => badge.id !== BADGES.REVEALED_ESSENCE.id)
            badgesToNotify.forEach((badge, index) => {
              setTimeout(() => {
                notifyAchievement(
                  badge.name,
                  getActionMessage(badge.id)
                )
              }, 100 + (index * 500))
            })
          }
          
          onUserUpdate(updatedUser)
        }, 100)
      } else {
        // Mesmo que não tenha ganho essência, atualiza o usuário (pode ter mudado algo)
        onUserUpdate(updatedUser)
      }
    }
  }

  // Filtra grupos por jogos de interesse do usuário
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
              {relevantGroups.map(group => (
                <div key={group.id} className="group-item">
                  <div className="group-item-header">
                    <h4>{group.name}</h4>
                    <span className="group-game">{group.game}</span>
                  </div>
                  <p className="group-description">{group.description}</p>
                  <div className="group-meta">
                    <span>👥 {group.members.length} membro(s)</span>
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
              ))}
            </div>
          </div>
        )}

        {otherGroups.length > 0 && (
          <div className="groups-section">
            <h3 className="section-title">🎮 Outros Grupos</h3>
            <div className="groups-grid">
              {otherGroups.map(group => (
                <div key={group.id} className="group-item">
                  <div className="group-item-header">
                    <h4>{group.name}</h4>
                    <span className="group-game">{group.game}</span>
                  </div>
                  <p className="group-description">{group.description}</p>
                  <div className="group-meta">
                    <span>👥 {group.members.length} membro(s)</span>
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
              ))}
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
