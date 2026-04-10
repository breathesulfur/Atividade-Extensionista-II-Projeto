import React, { useState } from 'react'
import LoadingSpinner from './LoadingSpinner'
import Logo from './Logo'
import SuccessModal from './SuccessModal'
import { notifyError, notifySuccess } from '../utils/notifications'
import { validateRequiredField, validateEmail, validatePassword, validateConfirmPassword, validateSelect } from '../utils/validation'
import './SignUp.css'

function SignUp({ onSignUp, onBackToLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    pronoun: '',
    games: [],
    city: '',
    state: ''
  })
  const [loading, setLoading] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [customGame, setCustomGame] = useState('')
  const [customPronoun, setCustomPronoun] = useState('')

  // Calcula etapa atual com base nos campos preenchidos
  const currentStep = (() => {
    if (formData.games.length > 0) return 3
    if (formData.pronoun && formData.state && formData.city) return 3
    if (formData.name && formData.email && formData.password && formData.confirmPassword) return 2
    return 1
  })()

  // Lista de jogos populares para seleção
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

  // Lista de pronomes comuns
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

  // Manipula mudanças nos campos do formulário
  const handleChange = (e) => {
    const { name, value } = e.target
    
    // Limpa validação customizada do e-mail quando o usuário começar a digitar
    if (name === 'email') {
      e.target.setCustomValidity('')
    }
    
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

  // Manipula seleção de jogos
  const handleGameToggle = (game) => {
    setFormData(prev => ({
      ...prev,
      games: prev.games.includes(game)
        ? prev.games.filter(g => g !== game)
        : [...prev.games, game]
    }))
  }

  // Adiciona jogo customizado
  const handleAddCustomGame = (e) => {
    e.preventDefault()
    const gameName = customGame.trim()
    if (gameName && !formData.games.includes(gameName)) {
      setFormData(prev => ({
        ...prev,
        games: [...prev.games, gameName]
      }))
      setCustomGame('')
    } else if (formData.games.includes(gameName)) {
      notifyError('Este jogo já foi adicionado.')
    }
  }

  // Remove jogo
  const handleRemoveGame = (gameToRemove) => {
    setFormData(prev => ({
      ...prev,
      games: prev.games.filter(game => game !== gameToRemove)
    }))
  }

  // Valida e submete o formulário
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      notifyError('Por favor, insira seu nome.')
      return
    }

    if (!formData.email.trim()) {
      notifyError('Por favor, insira seu e-mail.')
      return
    }

    if (!formData.email.includes('@')) {
      notifyError('Por favor, insira um e-mail válido.')
      return
    }

    // Verifica se o e-mail já está cadastrado
    const savedUsers = JSON.parse(localStorage.getItem('inclusivchat_users') || '[]')
    const emailExists = savedUsers.some(u => u.email.toLowerCase() === formData.email.trim().toLowerCase())
    
    if (emailExists) {
      notifyError('Este e-mail já está cadastrado. Tente fazer login ou use outro e-mail.')
      return
    }

    if (!formData.password) {
      notifyError('Por favor, insira uma senha.')
      return
    }

    if (formData.password.length < 6) {
      notifyError('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      notifyError('As senhas não coincidem.')
      return
    }

    if (!formData.pronoun) {
      notifyError('Por favor, selecione seu pronome.')
      return
    }

    // Se selecionou "Outro", valida o campo personalizado
    if (formData.pronoun === 'Outro' && !customPronoun.trim()) {
      notifyError('Por favor, informe seu pronome personalizado.')
      return
    }

    if (formData.games.length === 0) {
      notifyError('Por favor, selecione ou adicione pelo menos um jogo de interesse.')
      return
    }

    if (!formData.state) {
      notifyError('Por favor, selecione seu estado.')
      return
    }

    if (!formData.city) {
      if (formData.state) {
        const citiesForState = citiesByState[formData.state] || []
        if (citiesForState.length === 0) {
          notifyError('Não há cidades disponíveis para este estado. Por favor, selecione outro estado.')
          return
        }
      }
      notifyError('Por favor, selecione sua cidade.')
      return
    }

    setLoading(true)

    try {
      // Simula delay de requisição
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Cria objeto de usuário com dados iniciais
      const userData = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password, // Em produção, isso seria hash
        pronoun: formData.pronoun === 'Outro' ? customPronoun.trim() : formData.pronoun,
        games: formData.games,
        city: formData.city,
        state: formData.state,
        points: 0,
        badges: [],
        joinedGroups: [],
        createdAt: new Date().toISOString()
      }

      // Mostra modal de sucesso
      setShowSuccessModal(true)
      
      // Após 2 segundos, mostra loading e redireciona
      setTimeout(() => {
        setShowSuccessModal(false)
        setIsRedirecting(true)
        
        // Após mais 1.5 segundos, faz o signup (que redireciona automaticamente)
        setTimeout(() => {
          onSignUp(userData)
        }, 1500)
      }, 2000)
    } catch (error) {
      console.error('Erro ao criar conta:', error)
      notifyError('Erro ao criar conta. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="signup-container">
      {/* Modal de Sucesso */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => {}}
        message="Conta criada com sucesso!"
      />

      {/* Overlay de Loading ao redirecionar */}
      {isRedirecting && (
        <div className="signup-loading-overlay">
          <LoadingSpinner size="large" text="Entrando..." />
        </div>
      )}

      <div className="signup-card">
        <div className="signup-header">
          <Logo size="large" showText={true} variant="dark" />
          <h1 className="signup-title">Criar Conta</h1>
          <p className="signup-subtitle">
            Junte-se ao InclusivChat
          </p>
        </div>

        {/* Stepper de progresso */}
        <div className="signup-stepper" aria-label="Progresso do cadastro">
          {[
            { n: 1, label: 'Conta' },
            { n: 2, label: 'Perfil' },
            { n: 3, label: 'Jogos' },
          ].map(({ n, label }, idx) => (
            <React.Fragment key={n}>
              <div className={`stepper-step ${currentStep >= n ? 'done' : ''} ${currentStep === n ? 'active' : ''}`}>
                <div className="stepper-circle">{currentStep > n ? '✓' : n}</div>
                <span className="stepper-label">{label}</span>
              </div>
              {idx < 2 && <div className={`stepper-line ${currentStep > n ? 'done' : ''}`} />}
            </React.Fragment>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="signup-form">
          {/* Campo de Nome */}
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
              onBlur={(e) => validateRequiredField(e, 'Nome')}
              className="form-input"
              placeholder="Digite seu nome"
              required
              aria-required="true"
            />
          </div>

          {/* Campo de E-mail */}
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
              onBlur={(e) => validateEmail(e, true)}
              className="form-input"
              placeholder="Digite seu e-mail"
              required
              aria-required="true"
            />
          </div>

          {/* Campo de Senha */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Senha <span className="required-asterisk">*</span>
            </label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={(e) => validatePassword(e, 6)}
                className="form-input password-input"
                placeholder="Digite sua senha (mín. 6 caracteres)"
                required
                aria-required="true"
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
          </div>

          {/* Campo de Confirmar Senha */}
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirmar Senha <span className="required-asterisk">*</span>
            </label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={(e) => validateConfirmPassword(e, formData.password)}
                className="form-input password-input"
                placeholder="Confirme sua senha"
                required
                aria-required="true"
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

          {/* Divisor - Etapa 2: Perfil */}
          <div className="form-section-divider">
            <span className="form-section-badge">2</span>
            <span className="form-section-title">Seu Perfil</span>
          </div>

          {/* Campo de Pronome */}
          <div className="form-group">
            <label htmlFor="pronoun" className="form-label">
              Pronome <span className="required-asterisk">*</span>
            </label>
            <select
              id="pronoun"
              name="pronoun"
              value={formData.pronoun}
              onChange={handleChange}
              onBlur={(e) => validateSelect(e, 'Pronome')}
              className="form-select"
              required
              aria-required="true"
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
                onChange={(e) => setCustomPronoun(e.target.value)}
                onBlur={(e) => {
                  if (formData.pronoun === 'Outro') {
                    validateRequiredField(e, 'Pronome personalizado')
                  }
                }}
                placeholder="Digite seu pronome"
                className="form-input"
                style={{ marginTop: '0.5rem' }}
                required={formData.pronoun === 'Outro'}
                aria-required={formData.pronoun === 'Outro'}
              />
            )}
          </div>

          {/* Campo de Estado */}
          <div className="form-group">
            <label htmlFor="state" className="form-label">
              Estado <span className="required-asterisk">*</span>
            </label>
            <select
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              onBlur={(e) => validateSelect(e, 'Estado')}
              className="form-select"
              required
              aria-required="true"
            >
              <option value="">Selecione seu estado</option>
              {states.map(state => (
                <option key={state.value} value={state.value}>
                  {state.label}
                </option>
              ))}
            </select>
          </div>

          {/* Campo de Cidade */}
          <div className="form-group">
            <label htmlFor="city" className="form-label">
              Cidade <span className="required-asterisk">*</span>
            </label>
            <select
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              onBlur={(e) => {
                if (formData.state && availableCities.length > 0) {
                  validateSelect(e, 'Cidade')
                }
              }}
              className="form-select"
              required={formData.state && availableCities.length > 0}
              aria-required={formData.state && availableCities.length > 0}
              disabled={!formData.state || availableCities.length === 0}
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

          {/* Divisor - Etapa 3: Jogos */}
          <div className="form-section-divider">
            <span className="form-section-badge">3</span>
            <span className="form-section-title">Jogos Favoritos</span>
          </div>

          {/* Seleção de Jogos */}
          <div className="form-group">
            <label className="form-label">
              Jogos de Interesse * (selecione pelo menos um)
            </label>
            <div className="games-grid">
              {availableGames.map(game => (
                <button
                  key={game}
                  type="button"
                  onClick={() => handleGameToggle(game)}
                  className={`game-chip ${formData.games.includes(game) ? 'active' : ''}`}
                  aria-pressed={formData.games.includes(game)}
                  disabled={loading || isRedirecting}
                >
                  {game}
                </button>
              ))}
            </div>
            
            {/* Campo para adicionar jogos customizados */}
            <div className="custom-game-input-group">
              <input
                type="text"
                value={customGame}
                onChange={(e) => setCustomGame(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddCustomGame(e)
                  }
                }}
                placeholder="Digite o nome de outro jogo..."
                className="form-input custom-game-input"
                disabled={loading || isRedirecting}
              />
              <button
                type="button"
                onClick={handleAddCustomGame}
                className="add-custom-game-button"
                disabled={loading || isRedirecting || !customGame.trim()}
                aria-label="Adicionar jogo customizado"
              >
                Adicionar
              </button>
            </div>
            
            {/* Lista de jogos selecionados */}
            {formData.games.length > 0 && (
              <div className="selected-games-list">
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
                        disabled={loading || isRedirecting}
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

          {/* Botão de Submit */}
          <button 
            type="submit" 
            className="signup-button"
            disabled={loading}
          >
            {loading ? (
              <LoadingSpinner size="small" text="" />
            ) : (
              'Criar Conta'
            )}
          </button>
        </form>

        {/* Link para voltar ao Login */}
        <div className="signup-footer">
          <p>
            Já tem uma conta?{' '}
            <button
              type="button"
              onClick={onBackToLogin}
              className="link-button"
            >
              Fazer login
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default SignUp
