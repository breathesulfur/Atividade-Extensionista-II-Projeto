import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react'
import LoadingSpinner from './LoadingSpinner'
import SuccessModal from './SuccessModal'
import { notifyError, notifyEssenceGained } from '../utils/notifications'
import { addEssence, ESSENCE, checkBadges, BADGES, THEMES, applyTheme, getEssenceGained } from '../utils/gamification'
import { getPosts, getGroups } from '../utils/storage'
import { updateProfile } from '../lib/db'
import { validateRequiredField, validateEmail, validateSelect, validatePassword, validateConfirmPassword } from '../utils/validation'
/* FIX P2 (#9): seletores cosméticos foram movidos para Rewards.jsx
   (aba dedicada no Dashboard). Imports não são mais necessários aqui. */
import './EditProfile.css'

// Componente AccordionSection movido para fora para evitar recriação
// Mantém conteúdo sempre montado para evitar perda de foco
const AccordionSection = memo(({ id, icon, title, children, isOpen, hasError = false, warning = false, onToggle }) => {
  const handleToggle = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onToggle(id)
    // Remove o foco do botão após o clique para evitar outline visual indesejado
    if (e.currentTarget) {
      e.currentTarget.blur()
    }
  }
  
  return (
    <div className={`accordion-section ${isOpen ? 'open' : ''} ${hasError ? 'has-error' : ''} ${warning ? 'has-warning' : ''}`}>
      <button
        type="button"
        className="accordion-header"
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-controls={`accordion-content-${id}`}
        id={`accordion-header-${id}`}
      >
        <div className="accordion-header-content">
          <span className="accordion-icon">{icon || ''}</span>
          <span className="accordion-title">{title || ''}</span>
        </div>
        <span className={`accordion-arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </button>
      {/* Sempre renderiza o conteúdo, mas usa CSS para esconder/mostrar */}
      {/* Usa max-height e opacity para esconder, mantendo no DOM para evitar perda de foco */}
      <div 
        id={`accordion-content-${id}`}
        className="accordion-content"
        role="region"
        aria-labelledby={`accordion-header-${id}`}
        style={{ 
          maxHeight: isOpen ? '20000px' : '0',
          opacity: isOpen ? 1 : 0,
          overflow: 'hidden',
          paddingTop: isOpen ? '0' : '0',
          paddingBottom: isOpen ? 'var(--spacing-lg)' : '0',
          transition: 'max-height 0.3s ease, opacity 0.3s ease, padding 0.3s ease'
        }}
      >
        {children}
      </div>
    </div>
  )
})

AccordionSection.displayName = 'AccordionSection'

function EditProfile({ user, onSave, onCancel, onUserUpdate }) {
  // Snapshot imutável do usuário capturado na montagem inicial
  // Este snapshot NÃO muda durante a edição, garantindo estabilidade
  const userSnapshotRef = useRef(null)
  
  // Inicializa o snapshot apenas uma vez na montagem
  if (userSnapshotRef.current === null) {
    if (user) {
      // Cria uma cópia profunda imutável do usuário
      userSnapshotRef.current = JSON.parse(JSON.stringify(user))
    }
  }

  // Se não há snapshot e não há user, mostra loading
  // Mas NUNCA desmonta o componente se já foi montado
  const userSnapshot = userSnapshotRef.current || {}
  
  // Estado para rastrear o usuário atualizado em tempo real (apenas recompensas durante edição)
  // Inicializado com o snapshot, não com a prop user
  const [currentUser, setCurrentUser] = useState(() => {
    if (userSnapshotRef.current) {
      return JSON.parse(JSON.stringify(userSnapshotRef.current))
    }
    return {}
  })
  
  // Obtém tema ativo e suas cores baseado apenas no currentUser (recompensas locais)
  // NÃO depende mais da prop user
  const activeTheme = useMemo(() => {
    const themeId = currentUser?.activeTheme
    if (themeId && THEMES) {
      const themeKey = Object.keys(THEMES).find(key => THEMES[key] && THEMES[key].id === themeId)
      if (themeKey) {
        return THEMES[themeKey]
      }
    }
    return null
  }, [currentUser?.activeTheme])

  // Estilos do tema aplicados dinamicamente
  const themeStyles = useMemo(() => {
    if (!activeTheme) return {}
    return {
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
    }
  }, [activeTheme])
  
  // Usa apenas o snapshot para inicializar formData
  // NÃO depende mais da prop user
  const [formData, setFormData] = useState(() => {
    const snapshot = userSnapshotRef.current || {}
    return {
      name: snapshot.name || '',
      pronoun: snapshot.pronoun && !['Ela/Dela', 'Ele/Dele', 'Elu/Delu', 'Ela/Ele'].includes(snapshot.pronoun) ? 'Outro' : (snapshot.pronoun || ''),
      email: snapshot.email || '',
      password: '',
      confirmPassword: '',
      bio: snapshot.bio || '',
      games: snapshot.games ? [...snapshot.games] : [],
      city: snapshot.city || '',
      state: snapshot.state || '',
      socialMedia: {
        instagram: snapshot.socialMedia?.instagram || '',
        twitter: snapshot.socialMedia?.twitter || '',
        discord: snapshot.socialMedia?.discord || '',
        twitch: snapshot.socialMedia?.twitch || '',
        youtube: snapshot.socialMedia?.youtube || ''
      },
      platforms: {
        steam: snapshot.platforms?.steam || '',
        epic: snapshot.platforms?.epic || '',
        xbox: snapshot.platforms?.xbox || '',
        playstation: snapshot.platforms?.playstation || '',
        nintendo: snapshot.platforms?.nintendo || '',
        riot: snapshot.platforms?.riot || ''
      },
      avatar: snapshot.avatar || snapshot.picture || ''
    }
  })
  
  const [avatarPreview, setAvatarPreview] = useState(() => {
    const snapshot = userSnapshotRef.current || {}
    return snapshot.avatar || snapshot.picture || ''
  })
  const [loading, setLoading] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [customGame, setCustomGame] = useState('')
  const [customPronoun, setCustomPronoun] = useState(() => {
    const snapshot = userSnapshotRef.current || {}
    return snapshot.pronoun && !['Ela/Dela', 'Ele/Dele', 'Elu/Delu', 'Ela/Ele'].includes(snapshot.pronoun) ? snapshot.pronoun : ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // Estado para controlar accordion (apenas uma seção aberta por vez)
  // Foto de Perfil abre por padrão
  const [openSection, setOpenSection] = useState('avatar')
  const [lastErrorSection, setLastErrorSection] = useState(null)
  
  // Estado para rastrear se houve alterações
  const [hasChanges, setHasChanges] = useState(false)
  
  // Dados iniciais para comparação - baseado apenas no snapshot
  const initialFormData = useMemo(() => {
    const snapshot = userSnapshotRef.current || {}
    return {
      name: snapshot.name || '',
      pronoun: snapshot.pronoun && !['Ela/Dela', 'Ele/Dele', 'Elu/Delu', 'Ela/Ele'].includes(snapshot.pronoun) ? 'Outro' : (snapshot.pronoun || ''),
      email: snapshot.email || '',
      password: '',
      confirmPassword: '',
      bio: snapshot.bio || '',
      games: snapshot.games ? [...snapshot.games] : [],
      city: snapshot.city || '',
      state: snapshot.state || '',
      socialMedia: {
        instagram: snapshot.socialMedia?.instagram || '',
        twitter: snapshot.socialMedia?.twitter || '',
        discord: snapshot.socialMedia?.discord || '',
        twitch: snapshot.socialMedia?.twitch || '',
        youtube: snapshot.socialMedia?.youtube || ''
      },
      platforms: {
        steam: snapshot.platforms?.steam || '',
        epic: snapshot.platforms?.epic || '',
        xbox: snapshot.platforms?.xbox || '',
        playstation: snapshot.platforms?.playstation || '',
        nintendo: snapshot.platforms?.nintendo || '',
        riot: snapshot.platforms?.riot || ''
      },
      avatar: snapshot.avatar || snapshot.picture || ''
    }
  }, []) // Array vazio - calculado apenas uma vez na montagem
  
  // Detecta alterações comparando com dados iniciais
  // Usa apenas o snapshot inicial, não depende da prop user
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
    
    // Compara com o snapshot inicial, não com a prop user
    const snapshot = userSnapshotRef.current || {}
    const hasFormChanges = JSON.stringify(formDataToCompare) !== JSON.stringify(initialToCompare) ||
      JSON.stringify({
        activeTheme: currentUser?.activeTheme,
        activeAvatarFrame: currentUser?.activeAvatarFrame,
        activeMysticTitle: currentUser?.activeMysticTitle
      }) !== JSON.stringify({
        activeTheme: snapshot.activeTheme,
        activeAvatarFrame: snapshot.activeAvatarFrame,
        activeMysticTitle: snapshot.activeMysticTitle
      })
    setHasChanges(hasFormChanges)
  }, [formData, currentUser, initialFormData])

  // Ref para preservar posição de scroll ao abrir abas específicas
  const scrollPositionRef = useRef(null)
  const isRestoringScrollRef = useRef(false)
  
  // Função toggleSection estável usando useCallback
  // Preserva a posição de scroll ao abrir abas específicas
  const toggleSection = useCallback((sectionId) => {
    // Abas que devem preservar o scroll ao abrir
    const tabsToPreserveScroll = ['social-media', 'platforms']
    
    // Se está abrindo uma das abas especificadas, salva a posição de scroll
    const isOpening = openSection !== sectionId
    const shouldPreserveScroll = isOpening && tabsToPreserveScroll.includes(sectionId)
    
    if (shouldPreserveScroll) {
      // Salva a posição atual de scroll antes de atualizar o estado
      scrollPositionRef.current = window.pageYOffset || document.documentElement.scrollTop
      isRestoringScrollRef.current = true
    }
    
    // Atualiza o estado
    setOpenSection(prev => prev === sectionId ? null : sectionId)
  }, [openSection])
  
  // Efeito para restaurar a posição de scroll após abertura de abas específicas
  useEffect(() => {
    // Abas que devem preservar o scroll
    const tabsToPreserveScroll = ['social-media', 'platforms']
    
    // Verifica se uma das abas foi aberta e há uma posição de scroll salva
    if (isRestoringScrollRef.current && scrollPositionRef.current !== null && tabsToPreserveScroll.includes(openSection)) {
      // Usa requestAnimationFrame duplo para garantir que o DOM foi atualizado
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // Restaura a posição de scroll preservada
          if (scrollPositionRef.current !== null && isRestoringScrollRef.current) {
            const savedPosition = scrollPositionRef.current
            const currentPosition = window.pageYOffset || document.documentElement.scrollTop
            
            // Só restaura se a posição mudou significativamente (mais de 10px)
            if (Math.abs(currentPosition - savedPosition) > 10) {
              // IMPORTANTE: Usa scrollTo apenas para restaurar a posição salva do usuário,
              // NÃO para ir ao topo (0,0). Isso é diferente de window.scrollTo(0, 0) que foi proibido.
              // Estamos preservando a posição atual do scroll, não forçando uma nova posição.
              window.scrollTo({
                top: savedPosition,
                behavior: 'instant'
              })
            }
            
            // Limpa as refs após restaurar
            scrollPositionRef.current = null
            isRestoringScrollRef.current = false
          }
        })
      })
    }
  }, [openSection])

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

  // Memoiza availableCities para evitar recálculo desnecessário
  const availableCities = useMemo(() => {
    return formData.state ? (citiesByState[formData.state] || []) : []
  }, [formData.state])

  // Manipula mudanças nos campos (simplificado)
  const handleChange = (e) => {
    const { name, value } = e.target
    
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

  // Manipula seleção de jogos (simplificado)
  const handleGameToggle = (game) => {
    setFormData(prev => ({
      ...prev,
      games: prev.games.includes(game)
        ? prev.games.filter(g => g !== game)
        : [...prev.games, game]
    }))
  }

  // Adiciona jogo customizado (simplificado)
  const handleAddCustomGame = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    const gameName = customGame.trim()
    if (gameName && !formData.games.includes(gameName)) {
      setFormData(prev => ({
        ...prev,
        games: [...prev.games, gameName]
      }))
      setCustomGame('')
    }
  }

  // Remove jogo (simplificado)
  const handleRemoveGame = (gameToRemove) => {
    setFormData(prev => ({
      ...prev,
      games: prev.games.filter(g => g !== gameToRemove)
    }))
  }

  // Salva as alterações
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setLastErrorSection(null) // Limpa erro anterior

    // Obtém o snapshot uma única vez no início da função
    const snapshot = userSnapshotRef.current || {}

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

// Valida pronome personalizado se "Outro" foi selecionado
      if (formData.pronoun === 'Outro' && !customPronoun.trim()) {
        notifyError('Por favor, informe seu pronome personalizado.')
        setLastErrorSection('public-info')
        setOpenSection('public-info')
        setLoading(false)
        return
      }

      // FIX QA: só considera "trocar de senha" se o usuário preencheu
      // AMBOS os campos. Sem isto, autofill do navegador no campo
      // "Nova Senha" (sem mexer no confirm) disparava "senhas não
      // coincidem" mesmo o usuário não tendo intenção de mudar a senha.
      const senhaInformada = formData.password && formData.password.trim()
      const confirmacaoInformada = formData.confirmPassword && formData.confirmPassword.trim()
      const trocandoSenha = senhaInformada && confirmacaoInformada

      if (trocandoSenha) {
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
      } else if (senhaInformada && !confirmacaoInformada) {
        // Usuário começou a digitar uma senha mas não confirmou.
        // Pede a confirmação em vez de bloquear silenciosamente.
        notifyError('Confirme a nova senha para alterá-la.')
        setLastErrorSection('account-data')
        setOpenSection('account-data')
        setLoading(false)
        return
      }

      // Simula delay de requisição
      await new Promise(resolve => setTimeout(resolve, 500))

      // Usa currentUser (que inclui recompensas selecionadas durante edição) e o snapshot inicial
      let updatedUser = {
        ...snapshot, // Base no snapshot inicial
        ...currentUser, // Inclui recompensas selecionadas durante edição
        ...formData, // Inclui dados do formulário
        pronoun: formData.pronoun === 'Outro' ? customPronoun.trim() : formData.pronoun,
        picture: formData.avatar, // Garante que picture também seja salvo
        updatedAt: new Date().toISOString()
      }
      
      // Remove campos de senha do objeto (não devem ser salvos no user object)
      delete updatedUser.password
      delete updatedUser.confirmPassword

      // Verifica se perfil foi completado (pronome + bio) para conceder Essência Revelada
      // Compara com o snapshot inicial, não com a prop user
      const hadPronoun = snapshot.pronoun
      const hadBio = snapshot.bio && snapshot.bio.trim().length > 0
      const nowHasPronoun = formData.pronoun
      const nowHasBio = formData.bio && formData.bio.trim().length > 0
      
      // Se completou o perfil agora (não tinha antes)
      if ((!hadPronoun && nowHasPronoun) || (!hadBio && nowHasBio)) {
        if (nowHasPronoun && nowHasBio) {
          // Adiciona Essência por completar perfil (respeita limite diário)
          const beforeEssence = updatedUser
          updatedUser = addEssence(updatedUser, ESSENCE.COMPLETE_PROFILE)

          // FIX QA: só notifica se houve ganho real
          const gained = getEssenceGained(beforeEssence, updatedUser)
          if (gained > 0) notifyEssenceGained(gained, 'Completar perfil')
          
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

      await updateProfile(snapshot.id, updatedUser)

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

  /* FIX P2 (#9): handlers handleThemeSelect / handleFrameSelect /
     handleTitleSelect foram movidos para Rewards.jsx (aba dedicada).
     Esta tela agora trata apenas dos dados editáveis do perfil. */

  // Se não há snapshot ainda, mostra loading mas mantém o componente montado
  if (!userSnapshotRef.current) {
    return (
      <div className="edit-profile">
        <LoadingSpinner text="Carregando perfil..." />
      </div>
    )
  }

  return (
    <div 
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
        <AccordionSection 
          id="avatar" 
          icon="📸" 
          title="Foto de Perfil"
          isOpen={openSection === 'avatar'}
          onToggle={toggleSection}
        >
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
          isOpen={openSection === 'account-data' || (lastErrorSection === 'account-data')}
          hasError={lastErrorSection === 'account-data'}
          warning={true}
          onToggle={toggleSection}
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
                // FIX QA: sem isto, o Chrome/Firefox autofilla a senha
                // salva da conta no campo "Nova Senha" assim que o form
                // monta — o usuário não digitou nada, mas formData.password
                // já chega populado e a validação reclama "senhas não
                // coincidem" no submit.
                autoComplete="new-password"
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
                    autoComplete="new-password"
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
          isOpen={openSection === 'public-info' || (lastErrorSection === 'public-info')}
          hasError={lastErrorSection === 'public-info'}
          onToggle={toggleSection}
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
        <AccordionSection 
          id="social-media" 
          icon="🌐" 
          title="Redes Sociais"
          isOpen={openSection === 'social-media'}
          onToggle={toggleSection}
        >
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
        <AccordionSection 
          id="platforms" 
          icon="🎮" 
          title="Plataformas de Jogo"
          isOpen={openSection === 'platforms'}
          onToggle={toggleSection}
        >
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

        {/* FIX P2 (#9): seção de Recompensas movida para uma aba dedicada no Dashboard
            (Rewards.jsx). O accordion antigo aqui foi removido para evitar dois
            pontos de entrada com a mesma funcionalidade. */}
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
