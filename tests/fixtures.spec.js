import { test, expect } from '@playwright/test'

/**
 * Testes E2E com fixtures — cobrem os fluxos de comentário desta branch:
 *   - Edição inline de comentário próprio (✏️ + Salvar) com flag "(editado)"
 *   - Exclusão de comentário próprio (🗑️)
 *   - Cooldown de 10 min entre comentários (regressão do bug de essências)
 *
 * Tudo roda em uma única sessão para evitar throttle de auth do Supabase
 * em re-logins rápidos.
 */

const APP_URL = 'http://localhost:5173'
const EMAIL = process.env.TEST_EMAIL || 'teste@producao.com'
const PASSWORD = process.env.TEST_PASSWORD || '123456'

// Marcador único para localizar a postagem deste run sem colisões.
const RUN_TAG = `e2e-${Date.now()}`
const POST_CONTENT = `[${RUN_TAG}] Postagem de teste E2E - fluxo de comentários`

// Lê o total de essências do header — formato "🔮 N Essências"
async function readEssence(page) {
  const txt = (await page.locator('.user-points').textContent()) || ''
  const m = txt.match(/(\d+)/)
  return m ? Number(m[1]) : NaN
}

test('fluxo completo de comentários: criar postagem, editar, excluir e cooldown', async ({ page }) => {
  // Aceita o window.confirm de exclusão de postagem
  page.on('dialog', d => d.accept())

  // ---- LOGIN ----
  await page.goto(APP_URL)
  await page.locator('#email').fill(EMAIL)
  await page.locator('#password').fill(PASSWORD)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page.getByRole('button', { name: /sair/i })).toBeVisible({ timeout: 15000 })

  // Fecha modal de boas-vindas se aparecer
  const welcome = page.getByRole('button', { name: 'Começar a explorar' })
  if (await welcome.isVisible().catch(() => false)) await welcome.click()

  // ---- FIXTURE: cria postagem ----
  await page.getByRole('button', { name: /Nova Postagem/i }).click()
  await page.locator('#post-content').fill(POST_CONTENT)
  await page.getByRole('button', { name: 'Publicar' }).click()

  const card = page.locator('.post-card', { hasText: RUN_TAG })
  await expect(card).toBeVisible({ timeout: 10000 })

  try {
    // Abre comentários
    await card.locator('.comment-button').click()

    // ====== PARTE 1: edição e exclusão de comentário próprio ======
    const initial = `comentario inicial ${RUN_TAG}`
    await card.locator('.comment-input').fill(initial)
    await card.locator('button.comment-submit').click()

    const myComment = card.locator('.comment-item', { hasText: initial })
    await expect(myComment).toBeVisible({ timeout: 10000 })

    // Aguarda o realtime do Supabase estabilizar — caso contrário o
    // re-fetch do Feed pode reordenar/recriar o PostCard mid-edit.
    await page.waitForTimeout(2500)

    // Garante que a seção de comentários está aberta após o realtime
    if (!(await card.locator('.comment-input').first().isVisible().catch(() => false))) {
      await card.locator('.comment-button').click()
    }

    // Edita: ao clicar em ✏️, o texto vira input — myComment perde o match
    // por hasText. Usa-se o form de edição direto no card.
    await myComment.locator('.edit-comment-button').click()
    const edited = `comentario editado ${RUN_TAG}`
    const editInput = card.locator('.comment-edit-form .comment-input')
    await expect(editInput).toBeVisible({ timeout: 10000 })
    await editInput.fill(edited)
    // Botão pelo texto evita conflito com .comment-submit do form de novo comentário
    await card.locator('.comment-edit-actions button', { hasText: 'Salvar' }).click()

    const editedComment = card.locator('.comment-item', { hasText: edited })
    await expect(editedComment).toBeVisible({ timeout: 10000 })
    await expect(editedComment).toContainText('(editado)')

    // Exclui via 🗑️
    await editedComment.locator('.delete-comment-button').click()
    await expect(editedComment).toHaveCount(0, { timeout: 10000 })

    // ====== PARTE 2: cooldown de essências em comentários consecutivos ======
    // Garante que a seção de comentários ainda está aberta
    const newCommentInput = card.locator('.comment-input').first()
    if (!(await newCommentInput.isVisible().catch(() => false))) {
      await card.locator('.comment-button').click()
    }

    const e0 = await readEssence(page)

    // 1º comentário (>= 10 chars)
    const c1 = `apoio total a comunidade ${RUN_TAG} 1`
    await card.locator('.comment-input').first().fill(c1)
    await card.locator('button.comment-submit').first().click()
    await expect(card.locator('.comment-item', { hasText: c1 })).toBeVisible({ timeout: 10000 })

    await page.waitForTimeout(1500)
    const e1 = await readEssence(page)
    const delta1 = e1 - e0

    // 2º comentário imediatamente — deve cair no cooldown (10 min)
    const c2 = `mais um comentario de apoio ${RUN_TAG} 2`
    await card.locator('.comment-input').first().fill(c2)
    await card.locator('button.comment-submit').first().click()
    await expect(card.locator('.comment-item', { hasText: c2 })).toBeVisible({ timeout: 10000 })

    await page.waitForTimeout(1500)
    const e2 = await readEssence(page)
    const delta2 = e2 - e1

    console.log(`[cooldown] e0=${e0} e1=${e1} e2=${e2} delta1=${delta1} delta2=${delta2}`)

    // Núcleo da regressão: o 2º comentário NUNCA pode dar essências
    expect(delta2, `delta2=${delta2} (e1=${e1}, e2=${e2}) — cooldown não foi aplicado`).toBe(0)
    // Sanity: delta1 é 0 (cooldown da execução anterior) ou 5 (estado fresco)
    expect([0, 5]).toContain(delta1)

    // Cleanup dos comentários do cooldown
    for (const txt of [c1, c2]) {
      const c = card.locator('.comment-item', { hasText: txt })
      if (await c.isVisible().catch(() => false)) {
        await c.locator('.delete-comment-button').click()
        await expect(c).toHaveCount(0, { timeout: 10000 })
      }
    }
  } finally {
    // ---- TEARDOWN: remove a postagem (sempre, mesmo se algum assert falhar) ----
    if (await card.isVisible().catch(() => false)) {
      await card.locator('button[aria-label="Excluir postagem"]').click()
      await expect(card).toHaveCount(0, { timeout: 10000 })
    }
  }
})
