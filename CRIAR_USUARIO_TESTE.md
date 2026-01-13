# Como criar usuário de teste com 1000 essências

## Método 1: Console do navegador (Recomendado)

1. Abra o aplicativo no navegador
2. Pressione F12 para abrir o console
3. Cole e execute o seguinte código:

```javascript
// Cria usuário de teste com 1000 essências
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

// Remove usuário de teste se já existir
const filteredUsers = savedUsers.filter(u => u.email !== testUser.email)

// Adiciona o novo usuário de teste
filteredUsers.push(testUser)

// Salva no localStorage
localStorage.setItem('inclusivchat_users', JSON.stringify(filteredUsers))

console.log('✅ Usuário de teste criado com sucesso!')
console.log('📧 Email: teste@teste.com.br')
console.log('🔑 Senha: 123456')
console.log('🔮 Essências: 1000')
console.log('\nVocê pode fazer login com essas credenciais.')
```

4. Faça login com:
   - **Email**: teste@teste.com.br
   - **Senha**: 123456

## Método 2: Função global

Depois de executar o código acima uma vez, você pode usar a função:

```javascript
// Executar apenas uma vez para criar a função
window.createTestUser = function() {
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

  const savedUsers = JSON.parse(localStorage.getItem('inclusivchat_users') || '[]')
  const filteredUsers = savedUsers.filter(u => u.email !== testUser.email)
  filteredUsers.push(testUser)
  localStorage.setItem('inclusivchat_users', JSON.stringify(filteredUsers))
  
  console.log('✅ Usuário de teste criado!')
  return testUser
}

// Depois, basta executar:
createTestUser()
```
