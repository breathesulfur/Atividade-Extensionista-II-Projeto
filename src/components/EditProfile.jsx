import React, { useState, useEffect, useRef } from 'react'
import LoadingSpinner from './LoadingSpinner'
import SuccessModal from './SuccessModal'
import { notifyError, notifyEssenceGained } from '../utils/notifications'
import { addEssence, ESSENCE, checkBadges, BADGES, THEMES, applyTheme } from '../utils/gamification'
import { getPosts, getGroups } from '../utils/storage'
import { validateRequiredField, validateEmail, validateSelect, validatePassword, validateConfirmPassword } from '../utils/validation'
import ThemeSelector from './ThemeSelector'
import AvatarFrameSelector from './AvatarFrameSelector'
import MysticTitleSelector from './MysticTitleSelector'
import './EditProfile.css'

function EditProfile({ user, onSave, onCancel }) {
  // Refs para preservar foco e scroll
  const scrollPositionRef = useRef(0)
  const focusedElementRef = useRef(null)
  const containerRef = useRef(null)
  // Verifica se user existe, se não, mostra loading
  if (!user) {
    return (
      <div className="edit-profile">
        <LoadingSpinner text="Carregando perfil..." />
      </div>
    )
  }

  // Estado para rastrear o usuário atualizado em tempo real (recompensas)
  const [currentUser, setCurrentUser] = useState(user || {})
  
  // Obtém tema ativo e suas cores (simplificado)
  let activeTheme = null
  const themeId = (currentUser && currentUser.activeTheme) || (user && user.activeTheme)
  if (themeId && THEMES) {
    const themeKey = Object.keys(THEMES).find(key => THEMES[key] && THEMES[key].id === themeId)
    if (themeKey) {
      activeTheme = THEMES[themeKey]
    }
  }

  // Estilos do tema aplicados dinamicamente (simplificado)
  const themeStyles = activeTheme ? {
    '--theme-primary': activeTheme.colors?.primary || '',
    '--theme-background': activeTheme.colors?.background || '',
    '--theme-secondary': activeTheme.colors?.secondary || '',
    '--theme-text': activeTheme.colors?.text || activeTheme.colors?.textPrimary || '',
    '--theme-textSecondary': activeTheme.colors?.textSecondary || activeTheme.colors?.text || '',
    '--theme-textDisabled': activeTheme.colors?.textDisabled || activeTheme.colors?.textSecondary || '',
    '--theme-accent': activeTheme.colors?.accent || '',
    '--theme-links': activeTheme.colors?.links || activeTheme.colors?.primary || '',
    '--theme-glow': activeTheme.colors?.glow || '',
    '--theme-hover': activeTheme.colors?.hover || activeTheme.colors?.primary || '',
    '--theme-disabled': activeTheme.colors?.disabled || activeTheme.colors?.secondary || ''
  } : {}
  const safeUser = user || {}
  const safeCurrentUser = currentUser || {}
  
  const [formData, setFormData] = useState({
    name: safeUser.name || '',
    pronoun: safeUser.pronoun && !['Ela/Dela', 'Ele/Dele', 'Elu/Delu', 'Ela/Ele'].includes(safeUser.pronoun) ? 'Outro' : (safeUser.pronoun || ''),
    email: safeUser.email || '',
    password: '',
    confirmPassword: '',
    bio: safeUser.bio || '',
    games: safeUser.games || [],
    city: safeUser.city || '',
    state: safeUser.state || '',
    socialMedia: {
      instagram: safeUser.socialMedia?.instagram || '',
      twitter: safeUser.socialMedia?.twitter || '',
      discord: safeUser.socialMedia?.discord || '',
      twitch: safeUser.socialMedia?.twitch || '',
      youtube: safeUser.socialMedia?.youtube || ''
    },
    platforms: {
      steam: safeUser.platforms?.steam || '',
      epic: safeUser.platforms?.epic || '',
      xbox: safeUser.platforms?.xbox || '',
      playstation: safeUser.platforms?.playstation || '',
      nintendo: safeUser.platforms?.nintendo || '',
      riot: safeUser.platforms?.riot || ''
    },
    avatar: safeUser.avatar || safeUser.picture || ''
  })
  const [avatarPreview, setAvatarPreview] = useState(safeUser.avatar || safeUser.picture || '')
  const [loading, setLoading] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [customGame, setCustomGame] = useState('')
  const [customPronoun, setCustomPronoun] = useState(safeUser.pronoun && !['Ela/Dela', 'Ele/Dele', 'Elu/Delu', 'Ela/Ele'].includes(safeUser.pronoun) ? safeUser.pronoun : '')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // Estado para controlar accordion (apenas uma seção aberta por vez)
  const [openSection, setOpenSection] = useState(null)
  const [lastErrorSection, setLastErrorSection] = useState(null)
  
  // Estado para rastrear se houve alterações (simplificado)
  const [hasChanges, setHasChanges] = useState(false)
  
  // Dados iniciais para comparação (simplificado)
  const initialFormData = {
    name: safeUser.name || '',
    pronoun: safeUser.pronoun && !['Ela/Dela', 'Ele/Dele', 'Elu/Delu', 'Ela/Ele'].includes(safeUser.pronoun) ? 'Outro' : (safeUser.pronoun || ''),
    email: safeUser.email || '',
    password: '',
    confirmPassword: '',
    bio: safeUser.bio || '',
    games: safeUser.games || [],
    city: safeUser.city || '',
    state: safeUser.state || '',
    socialMedia: {
      instagram: safeUser.socialMedia?.instagram || '',
      twitter: safeUser.socialMedia?.twitter || '',
      discord: safeUser.socialMedia?.discord || '',
      twitch: safeUser.socialMedia?.twitch || '',
      youtube: safeUser.socialMedia?.youtube || ''
    },
    platforms: {
      steam: safeUser.platforms?.steam || '',
      epic: safeUser.platforms?.epic || '',
      xbox: safeUser.platforms?.xbox || '',
      playstation: safeUser.platforms?.playstation || '',
      nintendo: safeUser.platforms?.nintendo || '',
      riot: safeUser.platforms?.riot || ''
    },
    avatar: safeUser.avatar || safeUser.picture || ''
  }
  
  // Previne scroll automático ao montar/atualizar
  useEffect(() => {
    // Garante que não há scroll automático ao carregar
    const preventAutoScroll = () => {
      // Não faz nada - apenas previne scroll automático
    }
    return preventAutoScroll
  }, [])

  // Detecta alterações comparando com dados iniciais (simplificado, com preservação de scroll)
  useEffect(() => {
    const formDataToCompare = { ...formData }
    if (!formDataToCompare.password) {
      delete formDataToCompare.password
    }
    if (!formDataToCompare.confirmPassword) {
      delete formDataToCompare.confirmPassword
    }
    const initialToCompare = { ...initialFormData }
    delete initialToCompare.password
    delete initialToCompare.confirmPassword
    
    const hasFormChanges = JSON.stringify(formDataToCompare) !== JSON.stringify(initialToCompare) ||
      JSON.stringify({
        activeTheme: safeCurrentUser.activeTheme,
        activeAvatarFrame: safeCurrentUser.activeAvatarFrame,
        activeMysticTitle: safeCurrentUser.activeMysticTitle
      }) !== JSON.stringify({
        activeTheme: safeUser.activeTheme,
        activeAvatarFrame: safeUser.activeAvatarFrame,
        activeMysticTitle: safeUser.activeMysticTitle
      })
    setHasChanges(hasFormChanges)
  }, [formData, currentUser])
  
  // Função para alternar seção do accordion - preserva scroll
  const toggleSection = (sectionId) => {
    // Preserva posição do scroll antes de abrir/fechar seção
    scrollPositionRef.current = window.scrollY || document.documentElement.scrollTop
    focusedElementRef.current = document.activeElement
    
    setOpenSection(openSection === sectionId ? null : sectionId)
    
    // Garante que scroll não mude após abrir/fechar seção
    requestAnimationFrame(() => {
      // Restaura posição do scroll se necessário
      const currentScroll = window.scrollY || document.documentElement.scrollTop
      if (Math.abs(currentScroll - scrollPositionRef.current) > 5) {
        window.scrollTo(0, scrollPositionRef.current)
      }
    })
  }

  // Atualiza currentUser quando user prop mudar
  useEffect(() => {
    if (user && user.id !== (currentUser && currentUser.id)) {
      setCurrentUser(user)
    }
  }, [user])

  // Se houver erro em uma seção, abre automaticamente
  useEffect(() => {
    if (lastErrorSection && openSection !== lastErrorSection) {
      setOpenSection(lastErrorSection)
    }
  }, [lastErrorSection])

  // Lista de jogos disponíveis
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
    'Project Zomboid'
  ]

  const pronouns = [
    'Ela/Dela',
    'Ele/Dele',
    'Elu/Delu',
    'Ela/Ele',
    'Outro'
  ]

  // Estados brasileiros
  const states = [
    { value: 'AC', label: 'Acre' },
    { value: 'AL', label: 'Alagoas' },
    { value: 'AP', label: 'Amapá' },
    { value: 'AM', label: 'Amazonas' },
    { value: 'BA', label: 'Bahia' },
    { value: 'CE', label: 'Ceará' },
    { value: 'DF', label: 'Distrito Federal' },
    { value: 'ES', label: 'Espírito Santo' },
    { value: 'GO', label: 'Goiás' },
    { value: 'MA', label: 'Maranhão' },
    { value: 'MT', label: 'Mato Grosso' },
    { value: 'MS', label: 'Mato Grosso do Sul' },
    { value: 'MG', label: 'Minas Gerais' },
    { value: 'PA', label: 'Pará' },
    { value: 'PB', label: 'Paraíba' },
    { value: 'PR', label: 'Paraná' },
    { value: 'PE', label: 'Pernambuco' },
    { value: 'PI', label: 'Piauí' },
    { value: 'RJ', label: 'Rio de Janeiro' },
    { value: 'RN', label: 'Rio Grande do Norte' },
    { value: 'RS', label: 'Rio Grande do Sul' },
    { value: 'RO', label: 'Rondônia' },
    { value: 'RR', label: 'Roraima' },
    { value: 'SC', label: 'Santa Catarina' },
    { value: 'SP', label: 'São Paulo' },
    { value: 'SE', label: 'Sergipe' },
    { value: 'TO', label: 'Tocantins' }
  ]

  // Cidades brasileiras - 10 cidades principais por estado
  const citiesByState = {
    'AC': ['Rio Branco', 'Cruzeiro do Sul', 'Sena Madureira', 'Tarauacá', 'Feijó', 'Brasiléia', 'Xapuri', 'Epitaciolândia', 'Mâncio Lima', 'Plácido de Castro'],
    'AL': ['Maceió', 'Arapiraca', 'Palmeira dos Índios', 'Rio Largo', 'Penedo', 'União dos Palmares', 'São Miguel dos Campos', 'Coruripe', 'Marechal Deodoro', 'Santana do Ipanema'],
    'AP': ['Macapá', 'Santana', 'Laranjal do Jari', 'Oiapoque', 'Mazagão', 'Porto Grande', 'Vitória do Jari', 'Ferreira Gomes', 'Cutias', 'Amapá'],
    'AM': ['Manaus', 'Parintins', 'Itacoatiara', 'Manacapuru', 'Coari', 'Tefé', 'Tabatinga', 'Rio Preto da Eva', 'Iranduba', 'Manicoré'],
    'BA': ['Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Camaçari', 'Juazeiro', 'Ilhéus', 'Itabuna', 'Jequié', 'Alagoinhas', 'Barreiras'],
    'CE': ['Fortaleza', 'Caucaia', 'Juazeiro do Norte', 'Maracanaú', 'Sobral', 'Crato', 'Itapipoca', 'Maranguape', 'Iguatu', 'Quixadá'],
    'DF': ['Brasília', 'Taguatinga', 'Ceilândia', 'Samambaia', 'Planaltina', 'Sobradinho', 'Gama', 'Santa Maria', 'São Sebastião', 'Recanto das Emas'],
    'ES': ['Vitória', 'Vila Velha', 'Cariacica', 'Serra', 'Cachoeiro de Itapemirim', 'Linhares', 'São Mateus', 'Colatina', 'Guarapari', 'Viana'],
    'GO': ['Goiânia', 'Aparecida de Goiânia', 'Anápolis', 'Rio Verde', 'Luziânia', 'Águas Lindas de Goiás', 'Valparaíso de Goiás', 'Trindade', 'Formosa', 'Novo Gama'],
    'MA': ['São Luís', 'Imperatriz', 'Caxias', 'Timon', 'Codó', 'Paço do Lumiar', 'Açailândia', 'Bacabal', 'Balsas', 'Santa Inês'],
    'MT': ['Cuiabá', 'Várzea Grande', 'Rondonópolis', 'Sinop', 'Tangará da Serra', 'Cáceres', 'Sorriso', 'Barra do Garças', 'Primavera do Leste', 'Lucas do Rio Verde'],
    'MS': ['Campo Grande', 'Dourados', 'Três Lagoas', 'Corumbá', 'Ponta Porã', 'Naviraí', 'Nova Andradina', 'Paranaíba', 'Aquidauana', 'Sidrolândia'],
    'MG': ['Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora', 'Betim', 'Montes Claros', 'Ribeirão das Neves', 'Uberaba', 'Governador Valadares', 'Ipatinga'],
    'PA': ['Belém', 'Ananindeua', 'Marituba', 'Paragominas', 'Castanhal', 'Abaetetuba', 'Cametá', 'Altamira', 'Santarém', 'Bragança'],
    'PB': ['João Pessoa', 'Campina Grande', 'Santa Rita', 'Patos', 'Bayeux', 'Sousa', 'Cajazeiras', 'Guarabira', 'Mamanguape', 'Cabedelo'],
    'PR': ['Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa', 'Cascavel', 'São José dos Pinhais', 'Foz do Iguaçu', 'Colombo', 'Guarapuava', 'Paranaguá'],
    'PE': ['Recife', 'Jaboatão dos Guararapes', 'Olinda', 'Caruaru', 'Petrolina', 'Paulista', 'Cabo de Santo Agostinho', 'Camaragibe', 'Garanhuns', 'Vitória de Santo Antão'],
    'PI': ['Teresina', 'Parnaíba', 'Picos', 'Piripiri', 'Floriano', 'Campo Maior', 'Barras', 'União', 'Pedro II', 'Oeiras'],
    'RJ': ['Rio de Janeiro', 'São Gonçalo', 'Duque de Caxias', 'Nova Iguaçu', 'Niterói', 'Campos dos Goytacazes', 'Belford Roxo', 'São João de Meriti', 'Petrópolis', 'Volta Redonda'],
    'RN': ['Natal', 'Mossoró', 'Parnamirim', 'São Gonçalo do Amarante', 'Macaíba', 'Ceará-Mirim', 'Currais Novos', 'Caicó', 'Açu', 'Nova Cruz'],
    'RS': ['Porto Alegre', 'Caxias do Sul', 'Pelotas', 'Canoas', 'Santa Maria', 'Gravataí', 'Viamão', 'Novo Hamburgo', 'São Leopoldo', 'Rio Grande'],
    'RO': ['Porto Velho', 'Ji-Paraná', 'Ariquemes', 'Vilhena', 'Cacoal', 'Rolim de Moura', 'Guajará-Mirim', 'Ouro Preto do Oeste', 'Buritis', 'Jaru'],
    'RR': ['Boa Vista', 'Rorainópolis', 'Caracaraí', 'Alto Alegre', 'Pacaraima', 'Bonfim', 'Cantá', 'Normandia', 'Mucajaí', 'Iracema'],
    'SC': ['Florianópolis', 'Joinville', 'Blumenau', 'São José', 'Criciúma', 'Chapecó', 'Itajaí', 'Lages', 'Jaraguá do Sul', 'Palhoça'],
    'SP': ['São Paulo', 'Guarulhos', 'Campinas', 'São Bernardo do Campo', 'Santo André', 'Osasco', 'Ribeirão Preto', 'Sorocaba', 'Santos', 'Mauá'],
    'SE': ['Aracaju', 'Nossa Senhora do Socorro', 'Lagarto', 'Itabaiana', 'São Cristóvão', 'Estância', 'Propriá', 'Simão Dias', 'Tobias Barreto', 'Barra dos Coqueiros'],
    'TO': ['Palmas', 'Araguaína', 'Gurupi', 'Porto Nacional', 'Paraíso do Tocantins', 'Colinas do Tocantins', 'Guaraí', 'Formoso do Araguaia', 'Dianópolis', 'Taguatinga']
  }

  const availableCities = formData.state ? (citiesByState[formData.state] || []) : []

  // Manipula mudanças nos campos (simplificado) - preserva foco durante digitação
  const handleChange = (e) => {
    const { name, value } = e.target
    
    // Preserva posição do cursor antes da atualização
    const inputElement = e.target
    const cursorPosition = inputElement.selectionStart !== null ? inputElement.selectionStart : value.length
    
    if (name.startsWith('socialMedia.')) {
      const field = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        socialMedia: {
          ...prev.socialMedia,
          [field]: value
        }
      }))
    } else if (name.startsWith('platforms.')) {
      const field = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        platforms: {
          ...prev.platforms,
          [field]: value
        }
      }))
    } else {
      setFormData(prev => {
        // Se mudou o estado, limpa a cidade
        if (name === 'state') {
          return {
            ...prev,
            [name]: value,
            city: ''
          }
        }
        // Se mudou o pronome e não é "Outro", limpa o pronome customizado
        if (name === 'pronoun' && value !== 'Outro') {
          setCustomPronoun('')
        }
        return {
          ...prev,
          [name]: value
        }
      })
    }
    
    // Restaura foco e posição do cursor após atualização
    requestAnimationFrame(() => {
      if (inputElement && document.contains(inputElement)) {
        try {
          // Mantém foco no input
          if (document.activeElement !== inputElement) {
            inputElement.focus()
          }
          // Restaura posição do cursor
          if (inputElement.setSelectionRange) {
            const newCursorPos = Math.min(cursorPosition, inputElement.value.length)
            inputElement.setSelectionRange(newCursorPos, newCursorPos)
          }
        } catch (e) {
          // Ignora erros de foco/seleção
        }
      }
    })
  }

  // Manipula upload de foto
  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Valida tipo de arquivo
      if (!file.type.startsWith('image/')) {
        notifyError('Por favor, selecione uma imagem válida.')
        return
      }

      // Valida tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        notifyError('A imagem deve ter no máximo 5MB.')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result
        setAvatarPreview(result)
        setFormData(prev => ({
          ...prev,
          avatar: result
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  // Manipula seleção de jogos (simplificado) - preserva scroll e foco
  const handleGameToggle = (game) => {
    // Preserva scroll antes de atualizar
    const savedScroll = window.scrollY || document.documentElement.scrollTop
    const savedFocused = document.activeElement
    
    setFormData(prev => ({
      ...prev,
      games: prev.games.includes(game)
        ? prev.games.filter(g => g !== game)
        : [...prev.games, game]
    }))
    
    // Restaura scroll e foco após atualização
    requestAnimationFrame(() => {
      // Restaura scroll se mudou
      const currentScroll = window.scrollY || document.documentElement.scrollTop
      if (Math.abs(currentScroll - savedScroll) > 5) {
        window.scrollTo({ top: savedScroll, behavior: 'instant' })
      }
      
      // Restaura foco se ainda existe no DOM
      if (savedFocused && document.contains(savedFocused) && savedFocused !== document.body) {
        try {
          savedFocused.focus()
        } catch (e) {
          // Ignora erros de foco
        }
      }
    })
  }

  // Adiciona jogo customizado (simplificado) - preserva scroll e foco
  const handleAddCustomGame = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Preserva scroll antes de atualizar
    const savedScroll = window.scrollY || document.documentElement.scrollTop
    const activeElement = e.target.closest('.custom-game-input-group')?.querySelector('input') || document.activeElement
    
    const gameName = customGame.trim()
    if (gameName && !formData.games.includes(gameName)) {
      setFormData(prev => ({
        ...prev,
        games: [...prev.games, gameName]
      }))
      setCustomGame('')
      
      // Restaura scroll e foco no input customizado após atualização
      requestAnimationFrame(() => {
        // Restaura scroll se mudou
        const currentScroll = window.scrollY || document.documentElement.scrollTop
        if (Math.abs(currentScroll - savedScroll) > 5) {
          window.scrollTo({ top: savedScroll, behavior: 'instant' })
        }
        
        // Restaura foco no input customizado
        if (activeElement && document.contains(activeElement)) {
          try {
            activeElement.focus()
          } catch (e) {
            // Ignora erros de foco
          }
        }
      })
    }
  }

  // Remove jogo (simplificado) - preserva scroll e foco
  const handleRemoveGame = (gameToRemove) => {
    // Preserva scroll antes de atualizar
    const savedScroll = window.scrollY || document.documentElement.scrollTop
    const savedFocused = document.activeElement
    
    setFormData(prev => ({
      ...prev,
      games: prev.games.filter(g => g !== gameToRemove)
    }))
    
    // Restaura scroll e foco após atualização
    requestAnimationFrame(() => {
      // Restaura scroll se mudou
      const currentScroll = window.scrollY || document.documentElement.scrollTop
      if (Math.abs(currentScroll - savedScroll) > 5) {
        window.scrollTo({ top: savedScroll, behavior: 'instant' })
      }
      
      // Restaura foco se ainda existe no DOM
      if (savedFocused && document.contains(savedFocused) && savedFocused !== document.body) {
        try {
          savedFocused.focus()
        } catch (e) {
          // Ignora erros de foco
        }
      }
    })
  }

  // Salva as alterações
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setLastErrorSection(null) // Limpa erro anterior

    try {
      // Valida nome
      if (!formData.name || !formData.name.trim()) {
        notifyError('Por favor, informe seu nome.')
        setLastErrorSection('public-info')
        setOpenSection('public-info')
        setLoading(false)
        return
      }

      // Valida email
      if (!formData.email || !formData.email.trim()) {
        notifyError('Por favor, informe seu e-mail.')
        setLastErrorSection('account-data')
        setOpenSection('account-data')
        setLoading(false)
        return
      }

      if (!formData.email.includes('@')) {
        notifyError('Por favor, informe um e-mail válido.')
        setLastErrorSection('account-data')
        setOpenSection('account-data')
        setLoading(false)
        return
      }

      // Verifica se o e-mail já está cadastrado (apenas se mudou)
      if (formData.email.toLowerCase().trim() !== safeUser.email?.toLowerCase().trim()) {
        const savedUsers = JSON.parse(localStorage.getItem('inclusivchat_users') || '[]')
        const emailExists = savedUsers.some(u => 
          (safeUser.id && u.id !== safeUser.id && u.email !== safeUser.email) && 
          u.email && u.email.toLowerCase().trim() === formData.email.toLowerCase().trim()
        )
        
        if (emailExists) {
          notifyError('Este e-mail já está cadastrado. Use outro e-mail.')
          setLastErrorSection('account-data')
          setOpenSection('account-data')
          setLoading(false)
          return
        }
      }

      // Valida pronome personalizado se "Outro" foi selecionado
      if (formData.pronoun === 'Outro' && !customPronoun.trim()) {
        notifyError('Por favor, informe seu pronome personalizado.')
        setLastErrorSection('public-info')
        setOpenSection('public-info')
        setLoading(false)
        return
      }

      // Valida senha se foi fornecida
      if (formData.password && formData.password.trim()) {
        if (formData.password.length < 6) {
          notifyError('A senha deve ter pelo menos 6 caracteres.')
          setLastErrorSection('account-data')
          setOpenSection('account-data')
          setLoading(false)
          return
        }
        if (formData.password !== formData.confirmPassword) {
          notifyError('As senhas não coincidem.')
          setLastErrorSection('account-data')
          setOpenSection('account-data')
          setLoading(false)
          return
        }
      }

      // Simula delay de requisição
      await new Promise(resolve => setTimeout(resolve, 500))

      let updatedUser = {
        ...safeCurrentUser, // Usa currentUser para incluir recompensas já selecionadas
        ...formData,
        pronoun: formData.pronoun === 'Outro' ? customPronoun.trim() : formData.pronoun,
        picture: formData.avatar, // Garante que picture também seja salvo
        updatedAt: new Date().toISOString()
      }
      
      // Remove campos de senha do objeto (não devem ser salvos no user object)
      delete updatedUser.password
      delete updatedUser.confirmPassword

      // Verifica se perfil foi completado (pronome + bio) para conceder Essência Revelada
      const hadPronoun = safeUser.pronoun
      const hadBio = safeUser.bio && safeUser.bio.trim().length > 0
      const nowHasPronoun = formData.pronoun
      const nowHasBio = formData.bio && formData.bio.trim().length > 0
      
      // Se completou o perfil agora (não tinha antes)
      if ((!hadPronoun && nowHasPronoun) || (!hadBio && nowHasBio)) {
        if (nowHasPronoun && nowHasBio) {
          // Adiciona Essência por completar perfil
          updatedUser = addEssence(updatedUser, ESSENCE.COMPLETE_PROFILE)
          
          // Notifica sobre essências ganhas
          notifyEssenceGained(ESSENCE.COMPLETE_PROFILE, 'Completar perfil')
          
          // Verifica se deve conceder selo Essência Revelada
          const posts = getPosts()
          const groups = getGroups()
          const messages = {}
          const newBadges = checkBadges(updatedUser, posts, groups, messages)
          const userBadges = updatedUser.badges || []
          const trulyNewBadges = newBadges.filter(badge => !userBadges.includes(badge.id))
          
          if (trulyNewBadges.length > 0) {
            updatedUser = {
              ...updatedUser,
              badges: [...userBadges, ...trulyNewBadges.map(b => b.id)]
            }
          }
        }
      }

      // Busca a senha atual do usuário no localStorage antes de atualizar
      const savedUsers = JSON.parse(localStorage.getItem('inclusivchat_users') || '[]')
      const currentUserData = savedUsers.find(u => (safeUser.id && u.id === safeUser.id) || (safeUser.email && u.email === safeUser.email))
      const currentPassword = currentUserData?.password || ''
      
      // Salva no localStorage para persistir
      localStorage.setItem('inclusivchat_user', JSON.stringify(updatedUser))
      
      // Atualiza também na lista de usuários se existir
      const userIndex = savedUsers.findIndex(u => (safeUser.id && u.id === safeUser.id) || (safeUser.email && u.email === safeUser.email))
      if (userIndex !== -1) {
        savedUsers[userIndex] = { ...savedUsers[userIndex], ...updatedUser }
        // Se uma nova senha foi fornecida, atualiza a senha
        if (formData.password && formData.password.trim()) {
          savedUsers[userIndex].password = formData.password
        } else {
          // Mantém a senha original
          savedUsers[userIndex].password = currentPassword
        }
        localStorage.setItem('inclusivchat_users', JSON.stringify(savedUsers))
      }

      // Mostra o modal de sucesso primeiro
      setShowSuccessModal(true)
      
      // Atualiza o usuário após mostrar o modal
      onSave(updatedUser)
    } catch (error) {
      console.error('Erro ao salvar perfil:', error)
      notifyError('Erro ao salvar perfil. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false)
    // Fecha o EditProfile após o modal ser fechado
    onCancel()
  }

  // Handlers para recompensas (temas, molduras, títulos) - simplificado - preserva scroll e foco
  const handleThemeSelect = (themeId, updatedUser) => {
    if (!updatedUser) return
    
    // Preserva scroll antes de atualizar
    const savedScroll = window.scrollY || document.documentElement.scrollTop
    const savedFocused = document.activeElement
    
    // Aplica o tema ao usuário atualizado
    const userWithTheme = applyTheme(updatedUser, themeId)
    setCurrentUser(userWithTheme)
    
    // Atualiza também o localStorage para persistir
    try {
      localStorage.setItem('inclusivchat_user', JSON.stringify(userWithTheme))
      const savedUsers = JSON.parse(localStorage.getItem('inclusivchat_users') || '[]')
      const userIndex = savedUsers.findIndex(u => (safeUser.id && u.id === safeUser.id) || (safeUser.email && u.email === safeUser.email))
      if (userIndex !== -1) {
        savedUsers[userIndex] = { ...savedUsers[userIndex], ...userWithTheme }
        localStorage.setItem('inclusivchat_users', JSON.stringify(savedUsers))
      }
    } catch (error) {
      console.error('Erro ao salvar tema:', error)
    }
    
    // Restaura scroll e foco após atualização (sem forçar scroll automático)
    requestAnimationFrame(() => {
      // Restaura scroll se mudou
      const currentScroll = window.scrollY || document.documentElement.scrollTop
      if (Math.abs(currentScroll - savedScroll) > 5) {
        window.scrollTo({ top: savedScroll, behavior: 'instant' })
      }
      
      // Restaura foco se ainda existe no DOM
      if (savedFocused && document.contains(savedFocused) && savedFocused !== document.body) {
        try {
          savedFocused.focus()
        } catch (e) {
          // Ignora erros de foco
        }
      }
    })
  }

  const handleFrameSelect = (frameId, updatedUser) => {
    if (!updatedUser) return
    
    // Preserva scroll antes de atualizar
    const savedScroll = window.scrollY || document.documentElement.scrollTop
    const savedFocused = document.activeElement
    
    setCurrentUser(updatedUser)
    
    // Atualiza também o localStorage para persistir
    try {
      localStorage.setItem('inclusivchat_user', JSON.stringify(updatedUser))
      const savedUsers = JSON.parse(localStorage.getItem('inclusivchat_users') || '[]')
      const userIndex = savedUsers.findIndex(u => (safeUser.id && u.id === safeUser.id) || (safeUser.email && u.email === safeUser.email))
      if (userIndex !== -1) {
        savedUsers[userIndex] = { ...savedUsers[userIndex], ...updatedUser }
        localStorage.setItem('inclusivchat_users', JSON.stringify(savedUsers))
      }
    } catch (error) {
      console.error('Erro ao salvar moldura:', error)
    }
    
    // Restaura scroll e foco após atualização (sem forçar scroll automático)
    requestAnimationFrame(() => {
      // Restaura scroll se mudou
      const currentScroll = window.scrollY || document.documentElement.scrollTop
      if (Math.abs(currentScroll - savedScroll) > 5) {
        window.scrollTo({ top: savedScroll, behavior: 'instant' })
      }
      
      // Restaura foco se ainda existe no DOM
      if (savedFocused && document.contains(savedFocused) && savedFocused !== document.body) {
        try {
          savedFocused.focus()
        } catch (e) {
          // Ignora erros de foco
        }
      }
    })
  }

  const handleTitleSelect = (titleId, updatedUser) => {
    if (!updatedUser) return
    
    // Preserva scroll antes de atualizar
    const savedScroll = window.scrollY || document.documentElement.scrollTop
    const savedFocused = document.activeElement
    
    setCurrentUser(updatedUser)
    
    // Atualiza também o localStorage para persistir
    try {
      localStorage.setItem('inclusivchat_user', JSON.stringify(updatedUser))
      const savedUsers = JSON.parse(localStorage.getItem('inclusivchat_users') || '[]')
      const userIndex = savedUsers.findIndex(u => (safeUser.id && u.id === safeUser.id) || (safeUser.email && u.email === safeUser.email))
      if (userIndex !== -1) {
        savedUsers[userIndex] = { ...savedUsers[userIndex], ...updatedUser }
        localStorage.setItem('inclusivchat_users', JSON.stringify(savedUsers))
      }
    } catch (error) {
      console.error('Erro ao salvar título:', error)
    }
    
    // Restaura scroll e foco após atualização (sem forçar scroll automático)
    requestAnimationFrame(() => {
      // Restaura scroll se mudou
      const currentScroll = window.scrollY || document.documentElement.scrollTop
      if (Math.abs(currentScroll - savedScroll) > 5) {
        window.scrollTo({ top: savedScroll, behavior: 'instant' })
      }
      
      // Restaura foco se ainda existe no DOM
      if (savedFocused && document.contains(savedFocused) && savedFocused !== document.body) {
        try {
          savedFocused.focus()
        } catch (e) {
          // Ignora erros de foco
        }
      }
    })
  }

  // Componente AccordionSection (simplificado, sem memo)
  const AccordionSection = ({ id, icon, title, children, hasError = false, warning = false }) => {
    const isOpen = openSection === id
    const shouldBeOpen = isOpen || (hasError && lastErrorSection === id)

    return (
      <div className={`accordion-section ${shouldBeOpen ? 'open' : ''} ${hasError ? 'has-error' : ''} ${warning ? 'has-warning' : ''}`}>
        <button
          type="button"
          className="accordion-header"
          onClick={() => toggleSection(id)}
          aria-expanded={shouldBeOpen}
          aria-controls={`accordion-content-${id}`}
          id={`accordion-header-${id}`}
        >
          <div className="accordion-header-content">
            <span className="accordion-icon">{icon || ''}</span>
            <span className="accordion-title">{title || ''}</span>
          </div>
          <span className={`accordion-arrow ${shouldBeOpen ? 'open' : ''}`}>▼</span>
        </button>
        {shouldBeOpen && (
          <div 
            id={`accordion-content-${id}`}
            className="accordion-content"
            role="region"
            aria-labelledby={`accordion-header-${id}`}
          >
            {children}
          </div>
        )}
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className={`edit-profile ${activeTheme ? `theme-${activeTheme.id}` : ''}`}
      style={themeStyles}
    >
      {/* Modal de Sucesso */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleCloseSuccessModal}
        message="Dados salvos com sucesso!"
      />
      <div className="edit-profile-header">
        <h2>Editar Perfil</h2>
        <button
          type="button"
          onClick={onCancel}
          className="cancel-button"
          disabled={loading}
        >
          ✕
        </button>
      </div>

      <form 
        id="edit-profile-form" 
        onSubmit={handleSubmit} 
        className="edit-profile-form"
      >
        {/* Foto de Perfil */}
        <AccordionSection id="avatar" icon="📸" title="Foto de Perfil">
          <div className="avatar-upload-container">
            <div className="avatar-preview-wrapper">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Preview"
                  className="avatar-preview"
                />
              ) : (
                <div className="avatar-placeholder">
                  {(formData.name && formData.name.length > 0) ? formData.name.charAt(0).toUpperCase() : '?'}
                </div>
              )}
              <label htmlFor="avatar-upload" className="avatar-upload-button">
                📷 Alterar Foto
              </label>
              <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                onChange={handleAvatarChange}
                className="avatar-input"
                disabled={loading}
              />
            </div>
            <p className="avatar-hint">Formatos aceitos: JPG, PNG, GIF (máx. 5MB)</p>
          </div>
        </AccordionSection>

        {/* Dados da Conta */}
        <AccordionSection 
          id="account-data" 
          icon="🔐" 
          title="Dados da Conta"
          hasError={lastErrorSection === 'account-data'}
          warning={true}
        >
          <div className="account-data-warning" style={{ 
            background: 'rgba(255, 193, 7, 0.1)', 
            border: '1px solid rgba(255, 193, 7, 0.3)', 
            borderRadius: 'var(--radius-md)', 
            padding: 'var(--spacing-md)', 
            marginBottom: 'var(--spacing-md)',
            fontSize: '0.9rem',
            color: 'var(--text-secondary)'
          }}>
            ⚠️ Informações sensíveis - altere com cuidado
          </div>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              E-mail <span className="required-asterisk">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={(e) => !loading && validateEmail(e)}
              className="form-input"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Nova Senha
            </label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={(e) => !loading && formData.password && validatePassword(e, 6)}
                className="form-input password-input"
                placeholder="Deixe em branco para manter a senha atual"
                disabled={loading}
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                tabIndex={0}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
            {formData.password && (
              <div className="form-group" style={{ marginTop: 'var(--spacing-sm)' }}>
                <label htmlFor="confirmPassword" className="form-label">
                  Confirmar Nova Senha
                </label>
                <div className="password-input-wrapper">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={(e) => !loading && formData.confirmPassword && validateConfirmPassword(e, formData.password)}
                    className="form-input password-input"
                    placeholder="Confirme a nova senha"
                    disabled={loading}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="password-toggle"
                    aria-label={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    tabIndex={0}
                  >
                    {showConfirmPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </AccordionSection>

        {/* Informações Públicas */}
        <AccordionSection 
          id="public-info" 
          icon="🧾" 
          title="Informações Públicas"
          hasError={lastErrorSection === 'public-info'}
        >
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Nome <span className="required-asterisk">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={(e) => !loading && validateRequiredField(e, 'Nome')}
              className="form-input"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="pronoun" className="form-label">
              Pronome <span className="required-asterisk">*</span>
            </label>
            <select
              id="pronoun"
              name="pronoun"
              value={formData.pronoun}
              onChange={handleChange}
              onBlur={(e) => !loading && validateSelect(e, 'Pronome')}
              className="form-select"
              required
              disabled={loading}
            >
              <option value="">Selecione seu pronome</option>
              {pronouns.map(pronoun => (
                <option key={pronoun} value={pronoun}>
                  {pronoun}
                </option>
              ))}
            </select>
            {formData.pronoun === 'Outro' && (
              <input
                type="text"
                id="customPronoun"
                name="customPronoun"
                value={customPronoun}
                onChange={(e) => {
                  setCustomPronoun(e.target.value)
                }}
                onBlur={(e) => {
                  if (formData.pronoun === 'Outro' && !loading) {
                    validateRequiredField(e, 'Pronome personalizado')
                  }
                }}
                placeholder="Digite seu pronome"
                className="form-input"
                style={{ marginTop: '0.5rem' }}
                required={formData.pronoun === 'Outro'}
                disabled={loading}
                aria-required={formData.pronoun === 'Outro'}
              />
            )}
          </div>

          <div className="form-group">
            <label htmlFor="bio" className="form-label">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              className="form-textarea"
              placeholder="Conte um pouco sobre você..."
              rows={4}
              maxLength={500}
              disabled={loading}
            />
            <span className="char-count">{formData.bio.length}/500</span>
          </div>

          <div className="form-group">
            <label htmlFor="state" className="form-label">
              Estado
            </label>
            <select
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="form-select"
              disabled={loading}
            >
              <option value="">Selecione seu estado</option>
              {states.map(state => (
                <option key={state.value} value={state.value}>
                  {state.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="city" className="form-label">
              Cidade
            </label>
            <select
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="form-select"
              disabled={loading || !formData.state || availableCities.length === 0}
            >
              <option value="">
                {!formData.state 
                  ? 'Selecione primeiro o estado' 
                  : availableCities.length === 0 
                    ? 'Nenhuma cidade disponível para este estado'
                    : 'Selecione sua cidade'
                }
              </option>
              {availableCities.length > 0 && availableCities.map(city => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            {formData.state && availableCities.length === 0 && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                ⚠️ Este estado não possui cidades cadastradas. Por favor, selecione outro estado.
              </p>
            )}
          </div>

          {/* Jogos de Interesse - dentro de Informações Públicas */}
          <div className="form-group" style={{ marginTop: 'var(--spacing-lg)' }}>
            <label className="form-label">Jogos de Interesse</label>
            <div className="games-grid">
              {availableGames.map(game => (
                <button
                  key={game}
                  type="button"
                  onClick={() => handleGameToggle(game)}
                  className={`game-chip ${formData.games.includes(game) ? 'active' : ''}`}
                  disabled={loading}
                >
                  {game}
                </button>
              ))}
            </div>
            
            {/* Campo para adicionar jogos customizados */}
            <div className="custom-game-input-group" style={{ marginTop: 'var(--spacing-md)' }}>
              <input
                type="text"
                value={customGame}
                onChange={(e) => {
                  setCustomGame(e.target.value)
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddCustomGame(e)
                  }
                }}
                placeholder="Digite o nome de outro jogo..."
                className="form-input custom-game-input"
                disabled={loading}
              />
              <button
                type="button"
                onClick={handleAddCustomGame}
                className="add-custom-game-button"
                disabled={loading || !customGame.trim()}
                aria-label="Adicionar jogo customizado"
              >
                Adicionar
              </button>
            </div>
            
            {/* Lista de jogos selecionados */}
            {formData.games.length > 0 && (
              <div className="selected-games-list" style={{ marginTop: 'var(--spacing-md)' }}>
                <p className="games-selected-info">
                  {formData.games.length} jogo(s) selecionado(s):
                </p>
                <div className="selected-games-tags">
                  {formData.games.map(game => (
                    <span key={game} className="game-tag-removable">
                      {game}
                      <button
                        type="button"
                        onClick={() => handleRemoveGame(game)}
                        className="remove-game-button"
                        disabled={loading}
                        aria-label={`Remover ${game}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </AccordionSection>

        {/* Redes Sociais */}
        <AccordionSection id="social-media" icon="🌐" title="Redes Sociais">
          <div className="form-group">
            <label htmlFor="instagram" className="form-label">
              Instagram
            </label>
            <input
              type="text"
              id="instagram"
              name="socialMedia.instagram"
              value={formData.socialMedia.instagram}
              onChange={handleChange}
              className="form-input"
              placeholder="@seu_usuario"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="twitter" className="form-label">
              Twitter/X
            </label>
            <input
              type="text"
              id="twitter"
              name="socialMedia.twitter"
              value={formData.socialMedia.twitter}
              onChange={handleChange}
              className="form-input"
              placeholder="@seu_usuario"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="discord" className="form-label">
              Discord
            </label>
            <input
              type="text"
              id="discord"
              name="socialMedia.discord"
              value={formData.socialMedia.discord}
              onChange={handleChange}
              className="form-input"
              placeholder="usuario#1234"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="twitch" className="form-label">
              Twitch
            </label>
            <input
              type="text"
              id="twitch"
              name="socialMedia.twitch"
              value={formData.socialMedia.twitch}
              onChange={handleChange}
              className="form-input"
              placeholder="seu_canal"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="youtube" className="form-label">
              YouTube
            </label>
            <input
              type="text"
              id="youtube"
              name="socialMedia.youtube"
              value={formData.socialMedia.youtube}
              onChange={handleChange}
              className="form-input"
              placeholder="seu_canal"
              disabled={loading}
            />
          </div>
        </AccordionSection>

        {/* Plataformas de Jogo - dentro de Redes Sociais */}
        <AccordionSection id="platforms" icon="🎮" title="Plataformas de Jogo">
          <div className="form-group">
            <label htmlFor="steam" className="form-label">
              Steam
            </label>
            <input
              type="text"
              id="steam"
              name="platforms.steam"
              value={formData.platforms.steam}
              onChange={handleChange}
              className="form-input"
              placeholder="ID ou URL do perfil"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="epic" className="form-label">
              Epic Games
            </label>
            <input
              type="text"
              id="epic"
              name="platforms.epic"
              value={formData.platforms.epic}
              onChange={handleChange}
              className="form-input"
              placeholder="Nome de usuário"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="xbox" className="form-label">
              Xbox Live
            </label>
            <input
              type="text"
              id="xbox"
              name="platforms.xbox"
              value={formData.platforms.xbox}
              onChange={handleChange}
              className="form-input"
              placeholder="Gamertag"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="playstation" className="form-label">
              PlayStation Network
            </label>
            <input
              type="text"
              id="playstation"
              name="platforms.playstation"
              value={formData.platforms.playstation}
              onChange={handleChange}
              className="form-input"
              placeholder="ID Online"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="nintendo" className="form-label">
              Nintendo Switch
            </label>
            <input
              type="text"
              id="nintendo"
              name="platforms.nintendo"
              value={formData.platforms.nintendo}
              onChange={handleChange}
              className="form-input"
              placeholder="Friend Code"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="riot" className="form-label">
              Riot Games
            </label>
            <input
              type="text"
              id="riot"
              name="platforms.riot"
              value={formData.platforms.riot}
              onChange={handleChange}
              className="form-input"
              placeholder="usuario#tag"
              disabled={loading}
            />
          </div>
        </AccordionSection>

        {/* Recompensas */}
        <AccordionSection id="rewards" icon="🎨" title="Recompensas">
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: 'var(--spacing-md)' }}>
            Personalize seu perfil com temas, molduras e títulos desbloqueados com Essências
          </p>
          
          <ThemeSelector 
            user={safeCurrentUser} 
            onThemeSelect={handleThemeSelect}
          />
          
          <AvatarFrameSelector 
            user={safeCurrentUser} 
            onFrameSelect={handleFrameSelect}
          />
          
          <MysticTitleSelector 
            user={safeCurrentUser} 
            onTitleSelect={handleTitleSelect}
          />
        </AccordionSection>
      </form>

      {/* Botões de Ação - Sticky */}
      <div className="form-actions-sticky">
        <button
          type="button"
          onClick={onCancel}
          className="cancel-btn"
          disabled={loading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          form="edit-profile-form"
          className="save-btn"
          disabled={loading || !hasChanges}
        >
          {loading ? (
            <LoadingSpinner size="small" text="" />
          ) : (
            '💾 Salvar Alterações'
          )}
        </button>
      </div>
    </div>
  )
}

export default EditProfile
