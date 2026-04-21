/**
 * Dados iniciais para popular o aplicativo
 */

import { savePosts, saveGroups, saveGroupMessages } from './storage'

// Usuários de exemplo para as postagens e grupos
// Nota: Estes são usuários fictícios apenas para as postagens iniciais
// Eles não têm contas reais, apenas dados básicos para exibição
const exampleUsers = [
  { id: 'user1', name: 'Ana Clara', pronoun: 'Ela/Dela', avatar: null, city: 'São Paulo', state: 'SP' },
  { id: 'user2', name: 'João Pedro', pronoun: 'Ele/Dele', avatar: null, city: 'Rio de Janeiro', state: 'RJ' },
  { id: 'user3', name: 'Sam', pronoun: 'Elu/Delu', avatar: null, city: 'Belo Horizonte', state: 'MG' },
  { id: 'user4', name: 'Maria Eduarda', pronoun: 'Ela/Ele', avatar: null, city: 'Brasília', state: 'DF' },
  { id: 'user5', name: 'Lucas', pronoun: 'Ela/Dela', avatar: null, city: 'Curitiba', state: 'PR' }
]

// 8 Postagens iniciais
export const initialPosts = [
  {
    id: 'post1',
    userId: 'user1',
    userName: 'Ana Clara',
    userPronoun: 'Ela/Dela',
    userAvatar: null,
    userCity: 'São Paulo',
    userState: 'SP',
    content: 'Acabei de terminar minha primeira partida ranqueada no Valorant! Foi incrível! Alguém mais joga? 🎮',
    likes: ['user2', 'user3'],
    comments: [
      {
        id: 'comment1',
        userId: 'user2',
        userName: 'João Pedro',
        userPronoun: 'Ele/Dele',
        content: 'Parabéns! Qual rank você conseguiu?',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'post2',
    userId: 'user2',
    userName: 'João Pedro',
    userPronoun: 'Ele/Dele',
    userAvatar: null,
    userCity: 'Rio de Janeiro',
    userState: 'RJ',
    content: 'Procurando pessoas para jogar Apex Legends no modo ranked. Prefiro jogar com pessoas que respeitam os pronomes de todos! 💜',
    likes: ['user1', 'user3', 'user4'],
    comments: [
      {
        id: 'comment2',
        userId: 'user3',
        userName: 'Sam',
        userPronoun: 'Elu/Delu',
        content: 'Eu topo! Qual seu rank atual?',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'comment3',
        userId: 'user4',
        userName: 'Maria Eduarda',
        userPronoun: 'Ela/Ele',
        content: 'Também estou procurando squad! Me chama!',
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'post3',
    userId: 'user3',
    userName: 'Sam',
    userPronoun: 'Elu/Delu',
    userAvatar: null,
    userCity: 'Belo Horizonte',
    userState: 'MG',
    content: 'Alguém mais está hypado para o novo update do Genshin Impact? Vamos fazer um grupo para explorar juntos! ⚔️',
    likes: ['user1', 'user5'],
    comments: [],
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'post4',
    userId: 'user4',
    userName: 'Maria Eduarda',
    userPronoun: 'Ela/Ele',
    userAvatar: null,
    userCity: 'Brasília',
    userState: 'DF',
    content: 'Finalmente consegui passar daquele boss difícil no Final Fantasy XIV! Obrigada a todos que me ajudaram com dicas! 🎉',
    likes: ['user1', 'user2', 'user3', 'user5'],
    comments: [
      {
        id: 'comment4',
        userId: 'user5',
        userName: 'Lucas',
        userPronoun: 'Ela/Dela',
        content: 'Parabéns! Qual boss era?',
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'post5',
    userId: 'user5',
    userName: 'Lucas',
    userPronoun: 'Ela/Dela',
    userAvatar: null,
    userCity: 'Curitiba',
    userState: 'PR',
    content: 'Criando um servidor no Discord para jogadoras de League of Legends! Quem quiser entrar, me chama! Vamos criar um ambiente seguro e inclusivo! 💪',
    likes: ['user1', 'user2', 'user3', 'user4'],
    comments: [
      {
        id: 'comment5',
        userId: 'user1',
        userName: 'Ana Clara',
        userPronoun: 'Ela/Dela',
        content: 'Adoraria participar! Qual seu Discord?',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'comment6',
        userId: 'user2',
        userName: 'João Pedro',
        userPronoun: 'Ele/Dele',
        content: 'Também quero entrar!',
        createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'post6',
    userId: 'user1',
    userName: 'Ana Clara',
    userPronoun: 'Ela/Dela',
    userAvatar: null,
    userCity: 'São Paulo',
    userState: 'SP',
    content: 'Alguém mais está viciado em Stardew Valley? Acabei de completar o Centro Comunitário! Preciso de mais pessoas para jogar no modo multiplayer! 🌾',
    likes: ['user2', 'user5'],
    reactions: { '❤️': ['user2'], '🎉': ['user5'] },
    comments: [
      {
        id: 'comment7',
        userId: 'user3',
        userName: 'Sam',
        userPronoun: 'Elu/Delu',
        content: 'Parabéns! É uma conquista e tanto!',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'post7',
    userId: 'user2',
    userName: 'João Pedro',
    userPronoun: 'Ele/Dele',
    userAvatar: null,
    userCity: 'Rio de Janeiro',
    userState: 'RJ',
    content: 'Acabei de desbloquear o Platinado no CS:GO! Foi uma jornada longa mas valeu a pena. Quem mais tem o troféu? 🏆',
    likes: ['user1', 'user3', 'user4'],
    reactions: { '🏆': ['user1', 'user3'], '🔥': ['user4'] },
    comments: [],
    createdAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'post8',
    userId: 'user3',
    userName: 'Sam',
    userPronoun: 'Elu/Delu',
    userAvatar: null,
    userCity: 'Belo Horizonte',
    userState: 'MG',
    content: 'Alguém quer fazer um speedrun de Minecraft juntos? Estou tentando melhorar meu tempo e seria legal ter companhia! ⚡',
    likes: ['user1', 'user2'],
    reactions: { '⚡': ['user1'], '💪': ['user2'] },
    comments: [
      {
        id: 'comment8',
        userId: 'user4',
        userName: 'Maria Eduarda',
        userPronoun: 'Ela/Ele',
        content: 'Eu topo! Quando você quer jogar?',
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString()
  }
]

// 5 Grupos iniciais
export const initialGroups = [
  {
    id: 'group1',
    name: 'Valorant Ranked BR',
    description: 'Grupo para jogadoras e jogadores que querem fazer ranked no Valorant. Ambiente respeitoso e inclusivo!',
    game: 'Valorant',
    createdBy: 'user1',
    members: ['user1', 'user2', 'user3'],
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'group2',
    name: 'Apex Legends Squad',
    description: 'Procurando squad para Apex Legends? Este é o lugar! Respeitamos todos os pronomes e identidades.',
    game: 'Apex Legends',
    createdBy: 'user2',
    members: ['user2', 'user3', 'user4'],
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'group3',
    name: 'Genshin Impact Exploradores',
    description: 'Grupo para explorar Teyvat juntos! Vamos fazer quests, domínios e eventos em grupo.',
    game: 'Genshin Impact',
    createdBy: 'user3',
    members: ['user3', 'user1', 'user5'],
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'group4',
    name: 'FFXIV Free Company',
    description: 'Free Company inclusiva no Final Fantasy XIV! Todos são bem-vindos, independente de identidade ou gênero.',
    game: 'Final Fantasy XIV',
    createdBy: 'user4',
    members: ['user4', 'user1', 'user2', 'user5'],
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'group5',
    name: 'League of Legends BR',
    description: 'Grupo para jogadoras e jogadores de LoL no servidor brasileiro. Ambiente seguro e acolhedor!',
    game: 'League of Legends',
    createdBy: 'user5',
    members: ['user5', 'user1', 'user2', 'user3', 'user4'],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
]

// Mensagens iniciais para os grupos
const initialMessages = {
  group1: [
    {
      id: 'msg1',
      userId: 'user1',
      userName: 'Ana Clara',
      userPronoun: 'Ela/Dela',
      content: 'Olá pessoal! Quem está online para jogar agora?',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'msg2',
      userId: 'user2',
      userName: 'João Pedro',
      userPronoun: 'Ele/Dele',
      content: 'Eu estou! Vamos fazer umas partidas?',
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
    }
  ],
  group2: [
    {
      id: 'msg3',
      userId: 'user2',
      userName: 'João Pedro',
      userPronoun: 'Ele/Dele',
      content: 'Alguém quer fazer ranked hoje?',
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'msg4',
      userId: 'user3',
      userName: 'Sam',
      userPronoun: 'Elu/Delu',
      content: 'Eu topo! Qual horário?',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    }
  ],
  group3: [
    {
      id: 'msg5',
      userId: 'user3',
      userName: 'Sam',
      userPronoun: 'Elu/Delu',
      content: 'Vamos fazer o novo evento juntos?',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
    }
  ],
  group4: [
    {
      id: 'msg6',
      userId: 'user4',
      userName: 'Maria Eduarda',
      userPronoun: 'Ela/Ele',
      content: 'Bem-vindos à nossa Free Company!',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'msg7',
      userId: 'user1',
      userName: 'Ana Clara',
      userPronoun: 'Ela/Dela',
      content: 'Obrigada pelo acolhimento!',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
    }
  ],
  group5: [
    {
      id: 'msg8',
      userId: 'user5',
      userName: 'Lucas',
      userPronoun: 'Ela/Dela',
      content: 'Vamos criar um ambiente seguro para todos!',
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'msg9',
      userId: 'user2',
      userName: 'João Pedro',
      userPronoun: 'Ele/Dele',
      content: 'Adorei a iniciativa!',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'msg10',
      userId: 'user3',
      userName: 'Sam',
      userPronoun: 'Elu/Delu',
      content: 'Também estou aqui para apoiar!',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
    }
  ]
}

/**
 * Cria usuário de teste com 1000 essências (apenas em desenvolvimento)
 */
export const createTestUser = () => {
  const testUser = {
    id: 'test-user-1000',
    name: 'Teste Usuário',
    email: 'teste@teste.com.br',
    password: '123456',
    pronoun: 'Elu/Delu',
    games: ['League of Legends', 'Valorant', 'Minecraft'],
    city: 'São Paulo',
    state: 'SP',
    bio: 'Usuário de teste para verificar desbloqueio de recompensas',
    essencias_totais: 1000,
    essencias_disponiveis: 1000,
    essence: 1000,
    points: 1000,
    badges: [],
    joinedGroups: [],
    createdAt: new Date().toISOString(),
    lastLoginDates: [],
    unlockedThemes: [],
    unlockedAvatarFrames: [],
    unlockedTitles: [],
    activeTheme: null,
    activeAvatarFrame: null,
    activeTitle: null,
    dailyEssence: {}
  }

  // Busca usuários existentes
  const savedUsers = JSON.parse(localStorage.getItem('inclusivchat_users') || '[]')
  
  // Verifica se o usuário de teste já existe
  const testUserExists = savedUsers.some(u => u.email === testUser.email)
  
  if (!testUserExists) {
    // Remove usuário de teste se já existir (por email)
    const filteredUsers = savedUsers.filter(u => u.email !== testUser.email)
    
    // Adiciona o novo usuário de teste
    filteredUsers.push(testUser)
    
    // Salva no localStorage
    localStorage.setItem('inclusivchat_users', JSON.stringify(filteredUsers))
    
    console.log('✅ Usuário de teste criado!')
    console.log('📧 Email: teste@teste.com.br')
    console.log('🔑 Senha: 123456')
    console.log('🔮 Essências: 1000')
    return true
  }
  
  return false
}

/**
 * Inicializa dados no localStorage se ainda não existirem
 */
export const initializeSeedData = () => {
  // Verifica se já existem dados
  const existingPosts = localStorage.getItem('inclusivchat_posts')
  const existingGroups = localStorage.getItem('inclusivchat_groups')

  // Só inicializa se não houver dados
  if (!existingPosts || JSON.parse(existingPosts).length === 0) {
    savePosts(initialPosts)
    console.log('✅ Postagens iniciais criadas!')
  }

  if (!existingGroups || JSON.parse(existingGroups).length === 0) {
    saveGroups(initialGroups)
    
    // Salva mensagens iniciais para cada grupo
    Object.keys(initialMessages).forEach(groupId => {
      saveGroupMessages(groupId, initialMessages[groupId])
    })
    
    console.log('✅ Grupos iniciais criados!')
  }

  // Usuário de teste desabilitado temporariamente para teste limpo de produção.
  // (Ver também o diagnóstico de produção: este bloco tinha um fallback no catch
  //  que criava o usuário mesmo em build de produção.)
}
