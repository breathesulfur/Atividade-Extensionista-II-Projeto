import { test, expect } from '@playwright/test'

const APP_URL = 'http://localhost:5173'
const EMAIL = process.env.TEST_EMAIL || 'teste@producao.com'
const PASSWORD = process.env.TEST_PASSWORD || '123456'

async function login(page) {
  await page.goto(APP_URL)
  await page.locator('#email').fill(EMAIL)
  await page.locator('#password').fill(PASSWORD)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page.getByRole('button', { name: /sair/i })).toBeVisible({ timeout: 15000 })
}

test.describe('autenticado', () => {
  test('login leva ao dashboard', async ({ page }) => {
    await login(page)
    await expect(page.locator('.nav-button', { hasText: 'Feed' })).toBeVisible()
    await expect(page.locator('.nav-button', { hasText: 'Grupos' })).toBeVisible()
    await expect(page.locator('.nav-button', { hasText: 'Perfil' })).toBeVisible()
  })

  test('sino de notificações abre dropdown', async ({ page }) => {
    await login(page)
    await page.getByRole('button', { name: 'Notificações' }).click()
    await expect(page.locator('.notification-dropdown')).toBeVisible()
  })

  test('feedback abre modal com formulário', async ({ page }) => {
    await login(page)
    await page.getByRole('button', { name: 'Enviar Feedback' }).click()

    await expect(page.getByRole('heading', { name: 'Enviar Feedback' })).toBeVisible()
    await expect(page.getByRole('button', { name: '5 estrelas' })).toBeVisible()
    await expect(page.getByText('💬 Geral')).toBeVisible()
    await expect(page.getByText('🐛 Reportar Bug')).toBeVisible()

    await page.locator('.feedback-close').click()
    await expect(page.getByRole('heading', { name: 'Enviar Feedback' })).not.toBeVisible()
  })

  test('barra de essências tem contraste no header', async ({ page }) => {
    await login(page)

    const bar = page.locator('.daily-essence-text').first()
    const badge = page.locator('.daily-essence-complete-badge').first()

    if (await bar.isVisible().catch(() => false)) {
      const color = await bar.evaluate(el => getComputedStyle(el).color)
      const m = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
      expect(m).not.toBeNull()
      const [r, g, b] = [Number(m[1]), Number(m[2]), Number(m[3])]
      expect(r).toBeGreaterThan(200)
      expect(g).toBeGreaterThan(200)
      expect(b).toBeGreaterThan(200)
    } else {
      await expect(badge).toBeVisible()
      await expect(badge).toContainText(/\d+\/\d+/)
    }
  })

  test('nome do tema visível em cards bloqueados', async ({ page }) => {
    await login(page)
    await page.locator('.nav-button', { hasText: 'Perfil' }).click()
    await page.getByRole('button', { name: 'Editar perfil' }).click()
    await page.getByRole('button', { name: /Recompensas/i }).click()

    const lockedCards = page.locator('.theme-card.locked')
    await expect(lockedCards.first()).toBeVisible({ timeout: 10000 })

    const count = await lockedCards.count()
    expect(count).toBeGreaterThan(0)

    for (let i = 0; i < count; i++) {
      const name = lockedCards.nth(i).locator('.theme-name')
      await expect(name).toBeVisible()
      const txt = (await name.textContent())?.trim() || ''
      expect(txt.length).toBeGreaterThan(0)
      const box = await name.boundingBox()
      expect(box).not.toBeNull()
      expect(box.height).toBeGreaterThan(0)
    }
  })
})
