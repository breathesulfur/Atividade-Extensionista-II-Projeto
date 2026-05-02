import { test, expect } from '@playwright/test'

const APP_URL = 'http://localhost:5173'
const EMAIL = process.env.TEST_EMAIL || 'teste@producao.com'
const PASSWORD = process.env.TEST_PASSWORD || '123456'

const RUN_TAG = `e2e-${Date.now()}`
const POST_CONTENT = `[${RUN_TAG}] postagem de teste`

async function readEssence(page) {
  const txt = (await page.locator('.user-points').textContent()) || ''
  const m = txt.match(/(\d+)/)
  return m ? Number(m[1]) : NaN
}

test('comentários: criar, editar, excluir e cooldown', async ({ page }) => {
  page.on('dialog', d => d.accept())

  await page.goto(APP_URL)
  await page.locator('#email').fill(EMAIL)
  await page.locator('#password').fill(PASSWORD)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page.getByRole('button', { name: /sair/i })).toBeVisible({ timeout: 15000 })

  const welcome = page.getByRole('button', { name: 'Começar a explorar' })
  if (await welcome.isVisible().catch(() => false)) await welcome.click()

  await page.getByRole('button', { name: /Nova Postagem/i }).click()
  await page.locator('#post-content').fill(POST_CONTENT)
  await page.getByRole('button', { name: 'Publicar' }).click()

  const card = page.locator('.post-card', { hasText: RUN_TAG })
  await expect(card).toBeVisible({ timeout: 10000 })

  try {
    await card.locator('.comment-button').click()

    const initial = `comentario inicial ${RUN_TAG}`
    await card.locator('.comment-input').fill(initial)
    await card.locator('button.comment-submit').click()

    const myComment = card.locator('.comment-item', { hasText: initial })
    await expect(myComment).toBeVisible({ timeout: 10000 })

    await page.waitForTimeout(2500)
    if (!(await card.locator('.comment-input').first().isVisible().catch(() => false))) {
      await card.locator('.comment-button').click()
    }

    await myComment.locator('.edit-comment-button').click()
    const edited = `comentario editado ${RUN_TAG}`
    const editInput = card.locator('.comment-edit-form .comment-input')
    await expect(editInput).toBeVisible({ timeout: 10000 })
    await editInput.fill(edited)
    await card.locator('.comment-edit-actions button', { hasText: 'Salvar' }).click()

    const editedComment = card.locator('.comment-item', { hasText: edited })
    await expect(editedComment).toBeVisible({ timeout: 10000 })
    await expect(editedComment).toContainText('(editado)')

    await editedComment.locator('.delete-comment-button').click()
    await expect(editedComment).toHaveCount(0, { timeout: 10000 })

    if (!(await card.locator('.comment-input').first().isVisible().catch(() => false))) {
      await card.locator('.comment-button').click()
    }

    const e0 = await readEssence(page)

    const c1 = `apoio total a comunidade ${RUN_TAG} 1`
    await card.locator('.comment-input').first().fill(c1)
    await card.locator('button.comment-submit').first().click()
    await expect(card.locator('.comment-item', { hasText: c1 })).toBeVisible({ timeout: 10000 })

    await page.waitForTimeout(1500)
    const e1 = await readEssence(page)
    const delta1 = e1 - e0

    const c2 = `mais um comentario de apoio ${RUN_TAG} 2`
    await card.locator('.comment-input').first().fill(c2)
    await card.locator('button.comment-submit').first().click()
    await expect(card.locator('.comment-item', { hasText: c2 })).toBeVisible({ timeout: 10000 })

    await page.waitForTimeout(1500)
    const e2 = await readEssence(page)
    const delta2 = e2 - e1

    expect(delta2).toBe(0)
    expect([0, 5]).toContain(delta1)

    for (const txt of [c1, c2]) {
      const c = card.locator('.comment-item', { hasText: txt })
      if (await c.isVisible().catch(() => false)) {
        await c.locator('.delete-comment-button').click()
        await expect(c).toHaveCount(0, { timeout: 10000 })
      }
    }
  } finally {
    if (await card.isVisible().catch(() => false)) {
      await card.locator('button[aria-label="Excluir postagem"]').click()
      await expect(card).toHaveCount(0, { timeout: 10000 })
    }
  }
})
