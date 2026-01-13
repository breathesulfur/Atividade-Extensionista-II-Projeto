import { defineConfig, devices } from '@playwright/test'

/**
 * Configuração do Playwright para testes E2E
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  
  /* Tempo máximo de execução de um teste */
  timeout: 120000, // 2 minutos

  /* Máximo de falhas em paralelo */
  fullyParallel: false,
  
  /* Não executar testes em paralelo para gravação de vídeo */
  workers: 1,
  
  /* Reporter para gerar relatórios HTML */
  reporter: [
    ['html'],
    ['list']
  ],
  
  /* Configurações compartilhadas para todos os projetos */
  use: {
    /* Gravar vídeo de cada teste */
    video: 'on',
    
    /* Salvar screenshot quando falhar */
    screenshot: 'only-on-failure',
    
    /* Traces para debug */
    trace: 'on-first-retry',
    
    /* Viewport desktop padrão */
    viewport: { width: 1280, height: 720 },
    
    /* Executar em modo visível (headful) */
    headless: false,
    
    /* Timeout para ações (cliques, preenchimento, etc) */
    actionTimeout: 15000,
    
    /* Navegador lento para melhor visualização no vídeo */
    slowMo: 300,
  },

  /* Configurar projetos para diferentes navegadores */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Servidor de desenvolvimento do Vite */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
})
