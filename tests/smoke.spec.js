import { test, expect } from '@playwright/test'

/**
 * Smoke tests E2E para o InclusivChat.
 *
 * Cobre as superfícies públicas (login, cadastro, esqueci a senha) e valida
 * que o app sobe sem erros de console nem de rede. Os fluxos autenticados
 * (notificações, edição/exclusão de comentários, formulário de feedback,
 * cooldown de essências, seletor de temas) dependem de credenciais e ficam
 * fora deste smoke — ver TODO no fim do arquivo.
 */

const APP_URL = 'http://localhost:5173'

// Coletor compartilhado de erros de console — populado em cada teste via
// `page.on('console')` e validado ao final.
function attachConsoleCollector(page) {
  const errors = []
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return
    const text = msg.text()
    // Ignora 404s de assets opcionais (favicon, source maps) — não quebram o app
    if (/Failed to load resource.*404/i.test(text)) return
    errors.push(text)
  })
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`))
  return errors
}

test.describe('InclusivChat — smoke', () => {
  test('app carrega sem erros de console', async ({ page }) => {
    const errors = attachConsoleCollector(page)
    await page.goto(APP_URL)

    // Logo e subtítulo da tela de login
    await expect(page.getByText('Plataforma gamer inclusiva e segura')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible()

    // Sem erros JS no carregamento
    expect(errors, `Erros de console: ${errors.join('\n')}`).toEqual([])
  })

  test('formulário de login valida e-mail vazio', async ({ page }) => {
    await page.goto(APP_URL)
    // Submeter sem preencher dispara a validação HTML (campo required)
    const emailInput = page.locator('#email')
    const passwordInput = page.locator('#password')
    await expect(emailInput).toBeVisible()
    await expect(passwordInput).toBeVisible()
    await expect(emailInput).toHaveAttribute('required', '')
    await expect(passwordInput).toHaveAttribute('required', '')
  })

  test('navegação para cadastro funciona', async ({ page }) => {
    await page.goto(APP_URL)
    await page.getByRole('button', { name: 'Criar conta' }).click()

    // SignUp tem 3 etapas — verifica que a etapa 1 renderiza
    await expect(page.getByText(/cadastro|criar conta/i).first()).toBeVisible()
    // Botão de voltar para login deve existir
    await expect(page.getByRole('button', { name: /voltar|login/i }).first()).toBeVisible()
  })

  test('navegação para esqueci minha senha funciona', async ({ page }) => {
    await page.goto(APP_URL)
    await page.getByRole('button', { name: 'Esqueci minha senha' }).click()

    // Campo de e-mail para recuperação deve renderizar
    await expect(page.locator('input[type="email"]')).toBeVisible()
  })

  test('login com credenciais inválidas mostra erro', async ({ page }) => {
    await page.goto(APP_URL)
    await page.locator('#email').fill('naoexiste@inclusivchat.test')
    await page.locator('#password').fill('senhaerrada123')
    await page.getByRole('button', { name: 'Entrar' }).click()

    // Toast de erro deve aparecer
    await expect(page.getByText(/incorret|erro/i).first()).toBeVisible({ timeout: 10000 })
    // Continua na tela de login (não navegou para o dashboard)
    await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible()
  })
})

/*
 * TODO: Fluxos autenticados a serem cobertos quando houver credenciais de teste:
 *  - NotificationBell renderiza no header e abre dropdown
 *  - FeedbackForm abre, valida e submete
 *  - Comentário próprio mostra ✏️ / 🗑️ e fluxo de edição inline funciona
 *  - 2º comentário em sequência não concede essências (cooldown 10 min)
 *  - ThemeSelector: nome do tema visível em cards bloqueados
 *  - Barra de essências do header tem contraste suficiente sobre o gradiente
 */
