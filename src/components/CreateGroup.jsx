import React, { useState } from 'react'
import { addEssence, ESSENCE, checkBadges, getActionMessage, BADGES } from '../utils/gamification'
import { getPosts, getGroups } from '../utils/storage'
import { notifyError, notifyAchievement, notifyEssenceGained } from '../utils/notifications'
import { validateRequiredField, validateSelect, validateTextarea } from '../utils/validation'
import './CreateGroup.css'

function CreateGroup({ user, onCreateGroup, onUserUpdate }) {
  // Conta quantos grupos o usuário já criou
  const getUserCreatedGroupsCount = () => {
    const groups = getGroups()
    return groups.filter(g => g.createdBy === user.id).length
  }
  const [formData, setFormData] = useState({
    name: '',
    game: '',
    description: ''
  })
  const [customGame, setCustomGame] = useState('')

  // Lista de jogos populares
  const availableGames = [
    'League of Legends',
    'Valorant',
    'Overwatch',
    'Apex Legends',
    'Fortnite',
    'Minecraft',
    'Among Us',
    'Genshin Impact',
    'World of Warcraft',
    'Final Fantasy XIV',
    'CS:GO',
    'Rocket League',
    'Animal Crossing',
    'Stardew Valley',
    'The Sims',
    'Outro'
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => {
      // Se mudou o jogo e não é mais "Outro", limpa o campo customizado
      if (name === 'game' && prev.game === 'Outro' && value !== 'Outro') {
        setCustomGame('')
      }
      return {
        ...prev,
        [name]: value
      }
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      notifyError('Por favor, insira um nome para o grupo.')
      return
    }

    if (!formData.game) {
      notifyError('Por favor, selecione um jogo.')
      return
    }

    // Validação para jogo "Outro"
    if (formData.game === 'Outro') {
      if (!customGame.trim()) {
        notifyError('Por favor, digite o nome do jogo.')
        return
      }
    }

    if (!formData.description.trim()) {
      notifyError('Por favor, escreva uma descrição para o grupo.')
      return
    }

    if (formData.description.trim().length < 10) {
      notifyError('A descrição deve ter pelo menos 10 caracteres.')
      return
    }

    // Conta quantos grupos o usuário já criou antes de criar o novo
    const groupsCreatedCount = getUserCreatedGroupsCount()
    
    // Determina a quantidade de essência: 10 para o primeiro grupo, 5 para os demais
    const essenceAmount = groupsCreatedCount === 0 ? ESSENCE.JOIN_GROUP : 5
    
    // Adiciona Essência ao usuário baseado no número de grupos criados
    let updatedUser = addEssence(user, essenceAmount)
    
    // Notifica sobre essências ganhas
    if (groupsCreatedCount === 0) {
      notifyEssenceGained(essenceAmount, 'Criar primeiro grupo')
    } else {
      notifyEssenceGained(essenceAmount, 'Criar grupo adicional')
    }
    
    // Salva no localStorage
    localStorage.setItem('inclusivchat_user', JSON.stringify(updatedUser))
    
    // Atualiza também na lista de usuários se existir
    const savedUsers = JSON.parse(localStorage.getItem('inclusivchat_users') || '[]')
    const userIndex = savedUsers.findIndex(u => u.id === user.id || u.email === user.email)
    if (userIndex !== -1) {
      savedUsers[userIndex] = { ...savedUsers[userIndex], ...updatedUser }
      localStorage.setItem('inclusivchat_users', JSON.stringify(savedUsers))
    }
    
    // Atualiza o usuário no componente pai
    onUserUpdate(updatedUser)

    // Cria o grupo - usa o jogo customizado se "Outro" foi selecionado
    onCreateGroup({
      name: formData.name.trim(),
      game: formData.game === 'Outro' ? customGame.trim() : formData.game,
      description: formData.description.trim()
    })

    // Verifica badges após criar grupo (com delay para garantir que o grupo foi salvo)
    setTimeout(() => {
      const posts = getPosts()
      const groups = getGroups()
      const messages = {}
      const newBadges = checkBadges(updatedUser, posts, groups, messages)
      
      // Filtra apenas badges realmente novos
      const userBadges = updatedUser.badges || []
      const trulyNewBadges = newBadges.filter(badge => !userBadges.includes(badge.id))
      
      // Se houver novos badges, adiciona ao usuário
      if (trulyNewBadges.length > 0) {
        const finalUser = {
          ...updatedUser,
          badges: [...userBadges, ...trulyNewBadges.map(b => b.id)]
        }
        onUserUpdate(finalUser)
        
        // Mostra notificação de novos badges (exceto REVEALED_ESSENCE que deve aparecer apenas ao completar perfil)
        const badgesToNotify = trulyNewBadges.filter(badge => badge.id !== BADGES.REVEALED_ESSENCE.id)
        badgesToNotify.forEach((badge, index) => {
          setTimeout(() => {
            notifyAchievement(
              badge.name,
              getActionMessage(badge.id)
            )
          }, 100 + (index * 500)) // Espaça as notificações
        })
      }
    }, 100)

    // Limpa o formulário
    setFormData({
      name: '',
      game: '',
      description: ''
    })
    setCustomGame('')
  }

  return (
    <div className="create-group-card">
      <h3>Criar Novo Grupo</h3>
      <form onSubmit={handleSubmit} className="create-group-form">
        <div className="form-group">
          <label htmlFor="group-name" className="form-label">
            Nome do Grupo <span className="required-asterisk">*</span>
          </label>
          <input
            type="text"
            id="group-name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            onBlur={(e) => validateRequiredField(e, 'Nome do Grupo')}
            className="form-input"
            placeholder="Ex: Squad Feminino de Valorant"
            required
            maxLength="50"
          />
        </div>

        <div className="form-group">
          <label htmlFor="group-game" className="form-label">
            Jogo <span className="required-asterisk">*</span>
          </label>
          <select
            id="group-game"
            name="game"
            value={formData.game}
            onChange={handleChange}
            onBlur={(e) => validateSelect(e, 'Jogo')}
            className="form-select"
            required
          >
            <option value="" disabled>Selecione um jogo</option>
            {availableGames.map(game => (
              <option key={game} value={game}>
                {game}
              </option>
            ))}
          </select>
          {formData.game === 'Outro' && (
            <input
              type="text"
              id="custom-game"
              name="customGame"
              value={customGame}
              onChange={(e) => setCustomGame(e.target.value)}
              onBlur={(e) => formData.game === 'Outro' && validateRequiredField(e, 'Nome do jogo')}
              className="form-input"
              placeholder="Digite o nome do jogo"
              style={{ marginTop: '10px' }}
              required
              maxLength="50"
            />
          )}
        </div>

        <div className="form-group">
          <label htmlFor="group-description" className="form-label">
            Descrição <span className="required-asterisk">*</span>
          </label>
          <textarea
            id="group-description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            onBlur={(e) => validateTextarea(e, 'Descrição', 10)}
            className="form-textarea"
            placeholder="Descreva o propósito do grupo, horários de jogo, etc."
            rows="4"
            required
            maxLength="200"
          />
          <div className="char-count">
            {formData.description.length}/200 caracteres
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => {
              setFormData({ name: '', game: '', description: '' })
              setCustomGame('')
            }}
            className="cancel-button"
          >
            Limpar
          </button>
          <button type="submit" className="submit-button">
            Criar Grupo
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateGroup
