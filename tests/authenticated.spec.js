import { test, expect } from '@playwright/test'

/**
 * Testes E2E autenticados — cobrem as alterações desta branch:
 *   - Sino de notificações no header
 *   - Botão de Feedback abre modal
 *   - Barra de essências com contraste sobre o gradiente roxo
 *   - Nome do tema visível em cards bloqueados (ThemeSelector)
 *
 * Credenciais via env vars (TEST_EMAIL / TEST_PASSWORD) com fallback para a
 * conta de teste fornecida.
 */

const APP_URL = 'http://localhost:5173'
const EMAIL = process.env.TEST_EMAIL || 'teste@producao.com'
const PASSWORD = process.env.TEST_PASSWORD || '123456'

async function login(page) {
  await page.goto(APP_URL)
  await page.locator('#email').fill(EMAIL)
  await page.locator('#password').fill(PASSWORD)
  await page.getByRole('button', { name: 'Entrar' }).click()
  // Espera o dashboard carregar (header com botão de logout)
  await expect(page.getByRole('button', { name: /sair/i })).toBeVisible({ timeout: 15000 })
}

test.describe('InclusivChat — autenticado', () => {
  test('login com credenciais válidas leva ao dashboard', async ({ page }) => {
    await login(page)
    // Nav do dashboard renderiza (nav-buttons, não outros botões com texto similar)
    await expect(page.locator('.nav-button', { hasText: 'Feed' })).toBeVisible()
    await expect(page.locator('.nav-button', { hasText: 'Grupos' })).toBeVisible()
    await expect(page.locator('.nav-button', { hasText: 'Perfil' })).toBeVisible()
  })

  test('sino de notificações renderiza e abre dropdown', async ({ page }) => {
    await login(page)
    const bell = page.getByRole('button', { name: 'Notificações' })
    await expect(bell).toBeVisible()
    await bell.click()
    // Dropdown abre — header "Notificações" ou estado vazio
    await expect(page.locator('.notification-dropdown')).toBeVisible()
  })

  test('botão de feedback abre o modal com formulário', async ({ page }) => {
    await login(page)
    await page.getByRole('button', { name: 'Enviar Feedback' }).click()

    await expect(page.getByRole('heading', { name: 'Enviar Feedback' })).toBeVisible()
    // Estrelas de avaliação
    await expect(page.getByRole('button', { name: '5 estrelas' })).toBeVisible()
    // Categorias
    await expect(page.getByText('💬 Geral')).toBeVisible()
    await expect(page.getByText('🐛 Reportar Bug')).toBeVisible()
    // Fechar modal
    await page.locator('.feedback-close').click()
    await expect(page.getByRole('heading', { name: 'Enviar Feedback' })).not.toBeVisible()
  })

  test('barra de essências do header tem contraste sobre o gradiente', async ({ page }) => {
    await login(page)

    const bar = page.locator('.daily-essence-text').first()
    const badge = page.locator('.daily-essence-complete-badge').first()

    if (await bar.isVisible().catch(() => false)) {
      // Variante "barra" (limite NÃO atingido) — texto deve ser claro (white-ish)
      // sobre o gradiente roxo do header. Antes da fix era roxo invisível.
      const color = await bar.evaluate(el => getComputedStyle(el).color)
      const m = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
      expect(m, `cor inesperada: ${color}`).not.toBeNull()
      const [r, g, b] = [Number(m[1]), Number(m[2]), Number(m[3])]
      expect(r, `R baixo: ${color}`).toBeGreaterThan(200)
      expect(g, `G baixo: ${color}`).toBeGreaterThan(200)
      expect(b, `B baixo: ${color}`).toBeGreaterThan(200)
    } else {
      // Variante "badge dourado" (limite atingido) — tem contraste próprio
      // (texto escuro sobre gradiente dourado). Só validamos que está visível
      // e tem o texto esperado.
      await expect(badge).toBeVisible()
      await expect(badge).toContainText(/\d+\/\d+/)
    }
  })

  test('nome do tema é visível em cards bloqueados do ThemeSelector', async ({ page }) => {
    await login(page)
    // Ir para Perfil (nav-button)
    await page.locator('.nav-button', { hasText: 'Perfil' }).click()
    // Abrir Editar Perfil
    await page.getByRole('button', { name: 'Editar perfil' }).click()
    // Expandir seção de Recompensas
    await page.getByRole('button', { name: /Recompensas/i }).click()

    // Aguarda os cards de tema renderizarem
    const lockedCards = page.locator('.theme-card.locked')
    await expect(lockedCards.first()).toBeVisible({ timeout: 10000 })

    // Para cada card bloqueado, o .theme-name deve estar visível
    // (não pode ficar coberto pelo .theme-lock-overlay)
    const count = await lockedCards.count()
    expect(count).toBeGreaterThan(0)

    for (let i = 0; i < count; i++) {
      const card = lockedCards.nth(i)
      const name = card.locator('.theme-name')
      await expect(name).toBeVisible()
      // Confirma que o texto do nome tem conteúdo
      const txt = (await name.textContent())?.trim() || ''
      expect(txt.length, `card ${i} sem nome`).toBeGreaterThan(0)
      // Bounding box deve ter altura > 0 (não está colapsado)
      const box = await name.boundingBox()
      expect(box, `card ${i} sem bbox`).not.toBeNull()
      expect(box.height, `card ${i} altura zero`).toBeGreaterThan(0)
    }
  })
})
