# Testes E2E com Playwright

Este projeto utiliza Playwright para testes end-to-end automatizados, incluindo gravação de vídeo para demonstração dos resultados.

## Instalação

As dependências do Playwright já estão instaladas. Se necessário, execute:

```bash
npm install
npx playwright install chromium
```

## Executar Testes

### Teste de Demonstração (com vídeo)

```bash
npm run test:e2e:video
```

Este comando:
- Inicia o servidor de desenvolvimento automaticamente
- Executa o teste de demonstração completo
- Gera um vídeo da execução
- Salva o vídeo em `test-results/`

### Todos os Testes

```bash
npm run test:e2e
```

### Interface Gráfica

```bash
npm run test:e2e:ui
```

## Usuário de Teste

O teste utiliza automaticamente o usuário de teste criado pelo sistema:
- **E-mail**: teste@teste.com.br
- **Senha**: 123456

Este usuário é criado automaticamente quando o app inicia em modo de desenvolvimento.

## Estrutura dos Testes

```
tests/
  └── video_demonstracao_resultados.spec.js  # Teste de demonstração com vídeo
```

## Vídeo Gerado

O vídeo é salvo automaticamente em:
```
test-results/video_demonstracao_resultados-Navegar-pelas-principais-funcionalidades-do-app/video.webm
```

## Configuração

A configuração do Playwright está em `playwright.config.js`:

- **Modo headful**: O navegador é visível durante a execução
- **Gravação de vídeo**: Ativada para todos os testes
- **Slow motion**: 300ms de delay entre ações para melhor visualização
- **Viewport**: 1280x720 (formato de vídeo)

## Fluxo do Teste

O teste `video_demonstracao_resultados.spec.js` navega por:

1. Tela de login
2. Feed de postagens (criar postagem)
3. Interações positivas (curtir, comentar)
4. Grupos (entrar em grupo)
5. Perfil do usuário
6. Recompensas (molduras e temas)
7. Temas visuais (aplicar tema)
8. Encerramento

## Observações

- O teste é projetado para ser visual, com pausas intencionais para melhor visualização no vídeo
- O servidor de desenvolvimento é iniciado automaticamente pelo Playwright
- O vídeo gerado pode ser usado diretamente para demonstração no TCC
