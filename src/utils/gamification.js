/**
 * Sistema de gamificação - Essência, Selos e Temas
 * Focado em comportamentos saudáveis, empatia e pertencimento
 */

// Definição de Selos (Badges) disponíveis
export const BADGES = {
  GENTLE_VOICE: {
    id: 'gentle_voice',
    name: 'Voz Gentil',
    description: 'Sua voz foi compartilhada com respeito.',
    icon: '💬',
    points: 10
  },
  SUPPORT_AURA: {
    id: 'support_aura',
    name: 'Aura de Apoio',
    description: 'Suas palavras acolheram alguém.',
    icon: '💜',
    points: 5
  },
  SPACE_GUARDIAN: {
    id: 'space_guardian',
    name: 'Guardião do Espaço',
    description: 'Você ajudou a manter este espaço seguro.',
    icon: '🛡️',
    points: 15
  },
  BELONGING_CIRCLE: {
    id: 'belonging_circle',
    name: 'Círculo de Pertencimento',
    description: 'Você faz parte da construção coletiva.',
    icon: '🌈',
    points: 10
  },
  REVEALED_ESSENCE: {
    id: 'revealed_essence',
    name: 'Essência Revelada',
    description: 'Sua presença agora reflete quem você é.',
    icon: '🔮',
    points: 20
  },
  DAILY_RITUAL: {
    id: 'daily_ritual',
    name: 'Ritual Diário',
    description: 'Você cuidou da sua presença hoje.',
    icon: '🕯️',
    points: 10
  }
}

/**
 * Retorna a mensagem da ação realizada baseada no badge
 * @param {string} badgeId - ID do badge
 * @returns {string} - Mensagem da ação realizada
 */
export const getActionMessage = (badgeId) => {
  const actionMessages = {
    'gentle_voice': 'Fez sua primeira postagem',
    'support_aura': 'Fez seu primeiro comentário com apoio',
    'space_guardian': 'Criou um grupo',
    'belonging_circle': 'Entrou em um grupo',
    'revealed_essence': 'Completou o perfil',
    'daily_ritual': 'Fez login por 3 dias consecutivos'
  }
  return actionMessages[badgeId] || BADGES[Object.keys(BADGES).find(key => BADGES[key].id === badgeId)]?.name || 'Nova conquista desbloqueada'
}

// Temas visuais desbloqueáveis
export const THEMES = {
  SERENE_MOON: {
    id: 'serene_moon',
    name: 'Lua Serena',
    icon: '🌙',
    description: 'Calma, introspecção e acolhimento.',
    colors: {
      primary: '#B8910E',      // Âmbar dourado rico
      background: '#FEFBF0',   // Creme quase branco
      secondary: '#FFFDF6',    // Branco quente
      text: '#5C4A1E',         // Marrom dourado escuro
      accent: '#C9A227',       // Ouro accent
      glow: 'rgba(184, 145, 14, 0.28)'
    },
    requiredEssence: 50,
    theme: 'light'
  },
  PINK_AURA: {
    id: 'pink_aura',
    name: 'Floresta Encantada',
    icon: '🌲',
    description: 'Mistério, proteção e acolhimento.',
    colors: {
      primary: '#2A6040',      // Verde floresta profundo
      background: '#F5FAF7',   // Branco menta suave
      secondary: '#EEF7F2',    // Verde muito claro
      text: '#1A3D20',         // Verde escuro
      accent: '#3E8058',       // Verde floresta accent
      glow: 'rgba(42, 96, 64, 0.28)'
    },
    requiredEssence: 70,
    theme: 'light'
  },
  SOFT_SKY: {
    id: 'soft_sky',
    name: 'Céu Suave',
    icon: '☁️',
    description: 'Serenidade, leveza e paz interior.',
    colors: {
      primary: '#4090B8',      // Azul céu claro
      background: '#F5FBFF',   // Branco gelo
      secondary: '#EEF8FF',    // Azul muito claro
      text: '#1A5080',         // Azul escuro
      accent: '#68B8D8',       // Azul névoa celeste
      glow: 'rgba(64, 144, 184, 0.28)'
    },
    requiredEssence: 70,
    theme: 'light'
  },
  PINK_MIST: {
    id: 'pink_mist',
    name: 'Coração Mágico',
    icon: '❤️‍🔥',
    description: 'Amor, emoção e força interior.',
    colors: {
      primary: '#B01830',      // Carmim vibrante
      background: '#FFF5F7',   // Branco rosado quente
      secondary: '#FFF0F4',    // Rosa muito claro
      text: '#6A0A18',         // Vermelho escuro
      accent: '#D83050',       // Carmim accent
      glow: 'rgba(176, 24, 48, 0.28)'
    },
    requiredEssence: 60,
    theme: 'light'
  },
  LILAC_DAWN: {
    id: 'lilac_dawn',
    name: 'Amanhecer Lilás',
    icon: '🌅',
    description: 'Espiritual, calmo, início de ciclos.',
    colors: {
      primary: '#7060C0',      // Lilás claro vibrante
      background: '#FAF8FF',   // Branco lavanda
      secondary: '#F4F0FF',    // Lavanda muito claro
      text: '#3A2070',         // Roxo escuro
      accent: '#9080E0',       // Lilás accent
      glow: 'rgba(112, 96, 192, 0.28)'
    },
    requiredEssence: 80,
    theme: 'light'
  },
  PETAL: {
    id: 'petal',
    name: 'Pétala Rosa',
    icon: '🌸',
    description: 'Delicado, emocional, seguro.',
    colors: {
      primary: '#D04878',      // Rosa delicado
      background: '#FFF6F9',   // Branco pétala
      secondary: '#FFF0F5',    // Rosa muito claro
      text: '#6A1040',         // Rosa escuro
      accent: '#F068A0',       // Rosa suave accent
      glow: 'rgba(208, 72, 120, 0.28)'
    },
    requiredEssence: 100,
    theme: 'light'
  }
}

/**
 * Pontos de Essência baseado em ações
 * Nome: Essência (não "pontos")
 */
export const ESSENCE = {
  CREATE_POST: 10,        // Postagem respeitosa (sem denúncias por 48h)
  SUPPORTIVE_COMMENT: 5,   // Comentário com apoio
  REPORT_CONTENT: 15,      // Denunciar conteúdo ofensivo corretamente
  JOIN_GROUP: 10,          // Participar de grupos inclusivos
  COMPLETE_PROFILE: 20,    // Completar perfil (pronomes + bio)
  DAILY_LOGIN: 10          // Login por 3 dias consecutivos
}

/**
 * Limite diário de Essências que podem ser ganhas
 */
export const DAILY_ESSENCE_LIMIT = 50

/**
 * Cooldowns em minutos para cada tipo de ação
 */
export const ACTION_COOLDOWNS = {
  CREATE_POST: 30,         // 30 minutos entre postagens
  SUPPORTIVE_COMMENT: 10,  // 10 minutos entre comentários
  REPORT_CONTENT: 60,      // 1 hora entre denúncias válidas
  JOIN_GROUP: 0,           // Sem cooldown (mas apenas primeira vez dá Essência)
  COMPLETE_PROFILE: 0,     // Sem cooldown (ação única)
  DAILY_LOGIN: 0           // Sem cooldown (verificado por sistema de dias consecutivos)
}

/**
 * Mínimo de caracteres para que um comentário gere Essência
 */
export const MIN_COMMENT_LENGTH_FOR_ESSENCE = 10

/**
 * Adiciona Essência ao usuário
 * Respeita limite diário e separa essencias_totais de essencias_disponiveis
 * @param {Object} user - Dados do usuário
 * @param {number} essence - Essência a adicionar
 * @returns {Object} - Usuário atualizado
 */
export const addEssence = (user, essence) => {
  // Inicializa contadores se não existirem (migração para novos usuários)
  const essenciasTotais = user.essencias_totais ?? (user.essence || user.points || 0)
  const essenciasDisponiveis = user.essencias_disponiveis ?? (user.essence || user.points || 0)
  
  // Verifica limite diário
  const today = new Date().toDateString()
  const dailyEssence = user.dailyEssence || {}
  const todayEssence = dailyEssence[today] || 0
  
  if (todayEssence >= DAILY_ESSENCE_LIMIT) {
    // Limite diário atingido, não adiciona às disponíveis, mas registra a ação
    return {
      ...user,
      essencias_totais: essenciasTotais + essence,
      essence: essenciasDisponiveis,   // Campo persistido no BD (precisa ser sempre sincronizado)
      points: essenciasDisponiveis,    // Mantém compatibilidade legada
    }
  }

  // Calcula quanto pode ser adicionado hoje
  const remainingDaily = DAILY_ESSENCE_LIMIT - todayEssence
  const essenceToAdd = Math.min(essence, remainingDaily)

  // Atualiza contadores
  const newEssenciasTotais = essenciasTotais + essence // Sempre incrementa total
  const newEssenciasDisponiveis = essenciasDisponiveis + essenceToAdd // Incrementa disponível apenas dentro do limite

  // Atualiza registro diário
  const updatedDailyEssence = {
    ...dailyEssence,
    [today]: todayEssence + essenceToAdd
  }

  return {
    ...user,
    essencias_totais: newEssenciasTotais,
    essencias_disponiveis: newEssenciasDisponiveis,
    essence: newEssenciasDisponiveis, // FIX P0: campo persistido no BD (antes era "essencia" com typo, nunca atualizava "essence")
    points: newEssenciasDisponiveis,  // Mantém compatibilidade legada
    dailyEssence: updatedDailyEssence
  }
}

/**
 * Verifica se pode realizar uma ação baseado em cooldown
 * @param {Object} user - Dados do usuário
 * @param {string} actionType - Tipo de ação (CREATE_POST, SUPPORTIVE_COMMENT, etc)
 * @returns {Object} - { canPerform: boolean, cooldownRemaining: number (em minutos) }
 */
export const canPerformAction = (user, actionType) => {
  const cooldown = ACTION_COOLDOWNS[actionType]
  if (!cooldown || cooldown === 0) {
    return { canPerform: true, cooldownRemaining: 0 }
  }
  
  const lastActions = user.lastActions || {}
  const lastActionTime = lastActions[actionType]
  
  if (!lastActionTime) {
    return { canPerform: true, cooldownRemaining: 0 }
  }
  
  const now = new Date().getTime()
  const elapsed = (now - new Date(lastActionTime).getTime()) / (1000 * 60) // minutos
  const cooldownRemaining = Math.max(0, cooldown - elapsed)
  
  return {
    canPerform: cooldownRemaining === 0,
    cooldownRemaining: Math.ceil(cooldownRemaining)
  }
}

/**
 * Registra uma ação realizada
 * @param {Object} user - Dados do usuário
 * @param {string} actionType - Tipo de ação
 * @returns {Object} - Usuário atualizado
 */
export const registerAction = (user, actionType) => {
  const lastActions = user.lastActions || {}
  return {
    ...user,
    lastActions: {
      ...lastActions,
      [actionType]: new Date().toISOString()
    }
  }
}

/**
 * Adiciona Essência verificando cooldown e limite diário
 * Esta função combina verificação de cooldown, registro de ação e adição de Essências
 * @param {Object} user - Dados do usuário
 * @param {number} essence - Essência a adicionar
 * @param {string} actionType - Tipo de ação (CREATE_POST, SUPPORTIVE_COMMENT, etc)
 * @returns {Object} - { user: Object, success: boolean, message?: string }
 */
export const addEssenceWithChecks = (user, essence, actionType) => {
  // Verifica cooldown
  const { canPerform, cooldownRemaining } = canPerformAction(user, actionType)
  
  if (!canPerform) {
    return {
      user,
      success: false,
      message: `Aguarde ${cooldownRemaining} minuto${cooldownRemaining > 1 ? 's' : ''} antes de realizar esta ação novamente.`
    }
  }
  
  // Registra ação e adiciona Essência
  let updatedUser = registerAction(user, actionType)
  updatedUser = addEssence(updatedUser, essence)
  
  return {
    user: updatedUser,
    success: true
  }
}

/**
 * Subtrai Essência do usuário (apenas de essencias_disponiveis)
 * Usado apenas ao desbloquear recompensas cosméticas (temas e molduras)
 * @param {Object} user - Dados do usuário
 * @param {number} essence - Essência a subtrair
 * @returns {Object} - Usuário atualizado
 */
export const subtractEssence = (user, essence) => {
  // Usa essencias_disponiveis, com fallback para compatibilidade
  const essenciasDisponiveis = user.essencias_disponiveis ?? (user.essence || user.points || 0)
  const essenciasTotais = user.essencias_totais ?? essenciasDisponiveis
  
  const newEssenciasDisponiveis = Math.max(0, essenciasDisponiveis - essence) // Não permite valores negativos

  return {
    ...user,
    essencias_totais: essenciasTotais, // Total nunca diminui
    essencias_disponiveis: newEssenciasDisponiveis,
    essence: newEssenciasDisponiveis, // FIX P0: precisa atualizar o campo persistido no BD
    points: newEssenciasDisponiveis,  // Mantém compatibilidade legada
  }
}

/**
 * Verifica e concede selos baseado nas ações do usuário
 * @param {Object} user - Dados do usuário (já com essência atualizada)
 * @param {Array} posts - Todas as postagens
 * @param {Array} groups - Todos os grupos
 * @param {Object} messages - Todas as mensagens
 * @returns {Array} - Array de novos selos conquistados (apenas os que o usuário ainda não tem)
 */
export const checkBadges = (user, posts, groups, messages) => {
  const newBadges = []
  const userBadges = user.badges || []

  // Conta ações do usuário
  const userPosts = posts.filter(p => p.userId === user.id)
  const userComments = posts.reduce((count, post) => {
    return count + (post.comments?.filter(c => c.userId === user.id).length || 0)
  }, 0)
  const userGroups = groups.filter(g => g.members?.includes(user.id))
  const userCreatedGroups = groups.filter(g => g.createdBy === user.id)

  // 🪶 Voz Gentil - Criar postagem respeitosa (sem denúncias por 48h)
  // Simplificado: primeira postagem sem denúncias
  if (userPosts.length >= 1 && !userBadges.includes(BADGES.GENTLE_VOICE.id)) {
    // Verifica se há denúncias (simplificado - em produção seria verificado por moderação)
    const hasReports = userPosts.some(post => post.reports && post.reports.length > 0)
    if (!hasReports) {
      newBadges.push(BADGES.GENTLE_VOICE)
    }
  }

  // 💜 Aura de Apoio - Comentar com apoio (comentário com curtidas e zero denúncias)
  if (userComments >= 1 && !userBadges.includes(BADGES.SUPPORT_AURA.id)) {
    // Verifica se comentários têm curtidas (simplificado)
    const commentsWithLikes = posts.some(post => 
      post.comments?.some(c => c.userId === user.id && c.likes && c.likes.length > 0)
    )
    if (commentsWithLikes) {
      newBadges.push(BADGES.SUPPORT_AURA)
    }
  }

  // 🛡️ Guardião do Espaço - Denunciar conteúdo ofensivo corretamente
  // Simplificado: usuário que criou grupos (representa moderação ativa)
  if (userCreatedGroups.length >= 1 && !userBadges.includes(BADGES.SPACE_GUARDIAN.id)) {
    newBadges.push(BADGES.SPACE_GUARDIAN)
  }

  // 🫂 Círculo de Pertencimento - Participar de grupos inclusivos
  if (userGroups.length >= 1 && !userBadges.includes(BADGES.BELONGING_CIRCLE.id)) {
    newBadges.push(BADGES.BELONGING_CIRCLE)
  }

  // 🔮 Essência Revelada - Completar perfil (pronomes + bio)
  if (user.pronoun && user.bio && user.bio.trim().length > 0 && !userBadges.includes(BADGES.REVEALED_ESSENCE.id)) {
    newBadges.push(BADGES.REVEALED_ESSENCE)
  }

  // 🕯️ Ritual Diário - Login por 3 dias consecutivos
  const lastLogins = user.lastLoginDates || []
  if (lastLogins.length >= 3 && !userBadges.includes(BADGES.DAILY_RITUAL.id)) {
    // Verifica se há 3 dias consecutivos
    const sortedLogins = lastLogins
      .map(date => new Date(date).getTime())
      .sort((a, b) => b - a)
      .slice(0, 3)
    
    // Verifica se são consecutivos
    const isConsecutive = sortedLogins.every((date, index) => {
      if (index === 0) return true
      const daysDiff = (sortedLogins[index - 1] - date) / (1000 * 60 * 60 * 24)
      return daysDiff === 1
    })
    
    if (isConsecutive) {
      newBadges.push(BADGES.DAILY_RITUAL)
    }
  }

  return newBadges
}

/**
 * Verifica se o usuário pode desbloquear um tema
 * @param {Object} user - Dados do usuário
 * @param {string} themeId - ID do tema
 * @returns {boolean} - Se o tema pode ser desbloqueado
 */
export const canUnlockTheme = (user, themeId) => {
  const theme = THEMES[themeId.toUpperCase().replace('-', '_')] || Object.values(THEMES).find(t => t.id === themeId)
  if (!theme) return false
  
  // Usa essencias_disponiveis para desbloqueio de recompensas cosméticas
  const essenciasDisponiveis = user.essencias_disponiveis ?? (user.essence || user.points || 0)
  const unlockedThemes = user.unlockedThemes || []
  
  return essenciasDisponiveis >= theme.requiredEssence && !unlockedThemes.includes(themeId)
}

/**
 * Desbloqueia um tema para o usuário
 * @param {Object} user - Dados do usuário
 * @param {string} themeId - ID do tema
 * @returns {Object} - Usuário atualizado
 */
export const unlockTheme = (user, themeId) => {
  const unlockedThemes = user.unlockedThemes || []
  if (!unlockedThemes.includes(themeId)) {
    const theme = THEMES[Object.keys(THEMES).find(key => THEMES[key].id === themeId)] || Object.values(THEMES).find(t => t.id === themeId)
    if (!theme) return user
    
    // Subtrai as essências necessárias
    let updatedUser = subtractEssence(user, theme.requiredEssence)
    
    return {
      ...updatedUser,
      unlockedThemes: [...unlockedThemes, themeId]
    }
  }
  return user
}

/**
 * Aplica um tema ao perfil do usuário
 * @param {Object} user - Dados do usuário
 * @param {string} themeId - ID do tema
 * @returns {Object} - Usuário atualizado
 */
export const applyTheme = (user, themeId) => {
  const unlockedThemes = user.unlockedThemes || []
  if (unlockedThemes.includes(themeId)) {
    return {
      ...user,
      activeTheme: themeId
    }
  }
  return user
}

/**
 * Recompensas por marcos de Essência (50, 100, 150, etc.)
 */
export const REWARD_MILESTONE = 50
export const REWARD_BONUS = 10

/**
 * Molduras de Avatar (Recompensas Cosméticas)
 */
export const AVATAR_FRAMES = {
  LUNAR_FRAME: {
    id: 'lunar_frame',
    name: 'Moldura Lunar',
    icon: '🌙',
    description: 'Aparência suave, brilho sutil',
    requiredEssence: 30,
    character: null
  },
  AURA_FRAME: {
    id: 'aura_frame',
    name: 'Moldura de Aura',
    icon: '✨',
    description: 'Efeito etéreo translúcido',
    requiredEssence: 50,
    character: null
  },
  BEAR_FRAME: {
    id: 'bear_frame',
    name: 'Moldura Ursinho',
    icon: '🐻',
    description: 'Um ursinho carinhoso te acompanha',
    requiredEssence: 40,
    character: 'bear'
  },
  KITTY_FRAME: {
    id: 'kitty_frame',
    name: 'Moldura Gatinho',
    icon: '🐱',
    description: 'Um gatinho fofo ao seu lado',
    requiredEssence: 60,
    character: 'kitty'
  },
  BUNNY_FRAME: {
    id: 'bunny_frame',
    name: 'Moldura Coelhinho',
    icon: '🐰',
    description: 'Um coelhinho saltitante te acompanha',
    requiredEssence: 70,
    character: 'bunny'
  },
  OWL_FRAME: {
    id: 'owl_frame',
    name: 'Moldura Coruja',
    icon: '🦉',
    description: 'Uma coruja sábia te observa',
    requiredEssence: 80,
    character: 'owl'
  },
  STAR_FRAME: {
    id: 'star_frame',
    name: 'Moldura Estrela',
    icon: '⭐',
    description: 'Brilho estelar ao redor',
    requiredEssence: 90,
    character: null
  }
}

/**
 * Títulos Místicos (Desbloqueados com Essências)
 */
export const MYSTIC_TITLES = {
  SERENE_WALKER: {
    id: 'serene_walker',
    name: 'Caminhante Serena',
    icon: '🌙',
    description: 'Interações respeitosas recorrentes',
    requiredEssence: 35
  },
  WELCOMING_GUARDIAN: {
    id: 'welcoming_guardian',
    name: 'Guardiã do Acolhimento',
    icon: '💜',
    description: 'Completar perfil e apoiar comunidade',
    requiredEssence: 45
  },
  CONNECTION_WEAVER: {
    id: 'connection_weaver',
    name: 'Tecelã de Conexões',
    icon: '🔮',
    description: 'Participação ativa em grupos inclusivos',
    requiredEssence: 55
  },
  GENTLE_SOUL: {
    id: 'gentle_soul',
    name: 'Alma Gentil',
    icon: '💝',
    description: 'Espalhando gentileza por onde passa',
    requiredEssence: 65
  },
  WISE_MENTOR: {
    id: 'wise_mentor',
    name: 'Mentora Sábia',
    icon: '📚',
    description: 'Compartilhando sabedoria e apoio',
    requiredEssence: 75
  },
  HEART_GUARDIAN: {
    id: 'heart_guardian',
    name: 'Guardiã do Coração',
    icon: '💖',
    description: 'Protegendo e acolhendo a comunidade',
    requiredEssence: 85
  }
}

/**
 * Mensagens Narrativas Exclusivas
 */
export const NARRATIVE_MESSAGES = {
  COMMUNITY_CAREGIVER: {
    id: 'community_caregiver',
    message: 'Sua presença fortalece este espaço. Obrigada por cuidar da comunidade.',
    icon: '🕯️',
    trigger: 'positive_cycle_completed'
  },
  ESSENCE_REVEALED: {
    id: 'essence_revealed',
    message: 'Sua essência resplandece. Este espaço é mais acolhedor com você aqui.',
    icon: '✨',
    trigger: 'essence_milestone'
  },
  WELCOMING_SPIRIT: {
    id: 'welcoming_spirit',
    message: 'Você tece conexões que acolhem. Obrigada por ser quem você é.',
    icon: '💜',
    trigger: 'welcoming_actions'
  }
}

/**
 * Recompensas Coletivas para Grupos
 */
export const GROUP_REWARDS = {
  WELCOMING_SHIELD: {
    id: 'welcoming_shield',
    name: '🛡️ Selo de Grupo Acolhedor',
    description: 'Este grupo cultivou um espaço seguro e respeitoso.',
    unlockConditions: {
      minPositiveInteractions: 50,
      zeroConfirmedReports: true,
      minActiveMembers: 5,
      timePeriod: 7 // dias
    }
  },
  COLLECTIVE_THEME: {
    id: 'collective_theme',
    name: 'Tema Coletivo Temporário',
    description: 'O grupo recebeu um tema visual especial por 24h.',
    unlockConditions: {
      minPositiveInteractions: 100,
      zeroConfirmedReports: true,
      minActiveMembers: 10
    },
    duration: 24 // horas
  }
}

/**
 * Verifica se o usuário pode desbloquear uma moldura de avatar
 * Usa essencias_disponiveis (saldo atual)
 */
export const canUnlockAvatarFrame = (user, frameId) => {
  const frame = Object.values(AVATAR_FRAMES).find(f => f.id === frameId)
  if (!frame) return false

  // Usa essencias_disponiveis para desbloqueio de recompensas cosméticas
  const essenciasDisponiveis = user.essencias_disponiveis ?? (user.essence || user.points || 0)
  const unlockedFrames = user.unlockedAvatarFrames || []
  
  // Se já está desbloqueada, não pode desbloquear novamente
  if (unlockedFrames.includes(frameId)) return false

  // Verifica se tem essências disponíveis suficientes
  if (essenciasDisponiveis < frame.requiredEssence) return false

  // Verifica outras condições de desbloqueio (simplificado para demonstração)
  // Em produção, verificaria comentários de apoio, participação em grupos, etc.
  return true
}

/**
 * Desbloqueia uma moldura de avatar
 */
export const unlockAvatarFrame = (user, frameId) => {
  const unlockedFrames = user.unlockedAvatarFrames || []
  if (!unlockedFrames.includes(frameId)) {
    const frame = Object.values(AVATAR_FRAMES).find(f => f.id === frameId)
    if (!frame) return user
    
    // Subtrai as essências necessárias
    let updatedUser = subtractEssence(user, frame.requiredEssence)
    
    return {
      ...updatedUser,
      unlockedAvatarFrames: [...unlockedFrames, frameId]
    }
  }
  return user
}

/**
 * Verifica se o usuário pode desbloquear um título místico (baseado em essencias_disponiveis)
 * Títulos consomem Essências disponíveis para desbloqueio
 */
export const canUnlockMysticTitle = (user, titleId) => {
  const title = Object.values(MYSTIC_TITLES).find(t => t.id === titleId)
  if (!title) return false

  // Usa essencias_disponiveis para verificar desbloqueio de títulos
  const essenciasDisponiveis = user.essencias_disponiveis ?? (user.essence || user.points || 0)
  const unlockedTitles = user.unlockedMysticTitles || []

  // Se já está desbloqueado, não pode desbloquear novamente
  if (unlockedTitles.includes(titleId)) return false

  // Verifica se tem essências disponíveis suficientes
  return essenciasDisponiveis >= title.requiredEssence
}

/**
 * Desbloqueia um título místico
 * Títulos consomem Essências disponíveis ao desbloquear
 */
export const unlockMysticTitle = (user, titleId) => {
  const unlockedTitles = user.unlockedMysticTitles || []
  if (!unlockedTitles.includes(titleId)) {
    const title = Object.values(MYSTIC_TITLES).find(t => t.id === titleId)
    if (!title) return user

    // Consome essências disponíveis ao desbloquear título
    let updatedUser = subtractEssence(user, title.requiredEssence)

    return {
      ...updatedUser,
      unlockedMysticTitles: [...unlockedTitles, titleId]
    }
  }
  return user
}

/**
 * Verifica e concede destaque temporário no perfil (24h)
 */
export const checkProfileHighlight = (user) => {
  const now = new Date()
  const highlightExpiresAt = user.profileHighlightExpiresAt

  // Se já tem destaque ativo, retorna
  if (highlightExpiresAt && new Date(highlightExpiresAt) > now) {
    return user
  }

  // Condições para destaque (simplificado - denúncia correta ou ações positivas)
  const hasPositiveAction = user.positiveActionsThisWeek >= 5 || user.correctReportsCount > 0

  if (hasPositiveAction) {
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000) // 24 horas
    return {
      ...user,
      hasProfileHighlight: true,
      profileHighlightExpiresAt: expiresAt.toISOString()
    }
  }

  return user
}

/**
 * Verifica recompensas coletivas de um grupo
 */
export const checkGroupRewards = (group, posts, reports) => {
  const now = new Date()
  const groupCreatedAt = new Date(group.createdAt)
  const daysSinceCreation = Math.floor((now - groupCreatedAt) / (1000 * 60 * 60 * 24))

  // Conta interações positivas do grupo (posts + comentários com reações positivas)
  const groupPosts = posts.filter(p => p.groupId === group.id)
  const positiveInteractions = groupPosts.reduce((count, post) => {
    const reactionsCount = Object.values(post.reactions || {}).reduce((sum, users) => sum + users.length, 0)
    const commentsCount = (post.comments || []).length
    return count + reactionsCount + commentsCount
  }, 0)

  // Verifica denúncias confirmadas
  const groupReports = reports.filter(r => 
    r.type === 'post' && groupPosts.some(p => p.id === r.postId) ||
    r.type === 'comment' && groupPosts.some(p => 
      p.comments?.some(c => c.id === r.commentId)
    )
  )
  const confirmedReports = groupReports.filter(r => r.status === 'confirmed')

  const rewards = group.rewards || []

  // Selo de Grupo Acolhedor
  if (positiveInteractions >= 50 && 
      confirmedReports.length === 0 && 
      (group.members?.length || 0) >= 5 &&
      daysSinceCreation >= 7 &&
      !rewards.includes(GROUP_REWARDS.WELCOMING_SHIELD.id)) {
    return {
      ...group,
      rewards: [...rewards, GROUP_REWARDS.WELCOMING_SHIELD.id]
    }
  }

  // Tema Coletivo Temporário
  if (positiveInteractions >= 100 && 
      confirmedReports.length === 0 && 
      (group.members?.length || 0) >= 10 &&
      !rewards.includes(GROUP_REWARDS.COLLECTIVE_THEME.id)) {
    const themeExpiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    return {
      ...group,
      rewards: [...rewards, GROUP_REWARDS.COLLECTIVE_THEME.id],
      collectiveThemeExpiresAt: themeExpiresAt.toISOString()
    }
  }

  return group
}

/**
 * Mantém compatibilidade com código antigo
 */
export const POINTS = ESSENCE
export const addPoints = addEssence
