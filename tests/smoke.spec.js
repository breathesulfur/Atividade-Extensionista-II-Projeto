import { test, expect } from '@playwright/test'

const APP_URL = 'http://localhost:5173'

function collectErrors(page) {
  const errors = []
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return
    const text = msg.text()
    if (/Failed to load resource.*404/i.test(text)) return
    errors.push(text)
  })
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`))
  return errors
}

test.describe('smoke', () => {
  test('app carrega sem erros', async ({ page }) => {
    const errors = collectErrors(page)
    await page.goto(APP_URL)

    await expect(page.getByText('Plataforma gamer inclusiva e segura')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible()
    expect(errors).toEqual([])
  })

  test('login valida campos obrigatórios', async ({ page }) => {
    await page.goto(APP_URL)
    await expect(page.locator('#email')).toHaveAttribute('required', '')
    await expect(page.locator('#password')).toHaveAttribute('required', '')
  })

  test('navega para cadastro', async ({ page }) => {
    await page.goto(APP_URL)
    await page.getByRole('button', { name: 'Criar conta' }).click()
    await expect(page.getByText(/cadastro|criar conta/i).first()).toBeVisible()
  })

  test('navega para esqueci minha senha', async ({ page }) => {
    await page.goto(APP_URL)
    await page.getByRole('button', { name: 'Esqueci minha senha' }).click()
    await expect(page.locator('input[type="email"]')).toBeVisible()
  })

  test('login inválido mostra erro', async ({ page }) => {
    await page.goto(APP_URL)
    await page.locator('#email').fill('naoexiste@inclusivchat.test')
    await page.locator('#password').fill('senhaerrada123')
    await page.getByRole('button', { name: 'Entrar' }).click()
    await expect(page.getByText(/incorret|erro/i).first()).toBeVisible({ timeout: 10000 })
    await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible()
  })
})
