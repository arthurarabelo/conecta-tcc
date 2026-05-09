# [INFRA] Variáveis de ambiente e configuração de deploy

## Contexto

Configurar as variáveis de ambiente para produção e o processo de build/deploy do frontend.

## Dependência

**Depende de:** #01 — Scaffolding do projeto

## Variáveis de ambiente

| Variável | Descrição | Exemplo |
|---|---|---|
| `VITE_API_BASE_URL` | URL base do backend Laravel | `https://api.conecta-tcc.exemplo.br` |

## Tarefas

- [ ] Criar `frontend/.env.local` (ignorado no git) para desenvolvimento local
- [ ] Criar `frontend/.env.production` com a URL do backend em produção
- [ ] Verificar que `bun build` gera os assets corretamente em `frontend/dist/`
- [ ] Configurar CORS no backend Laravel para aceitar o domínio do frontend
  - Arquivo: `backend/config/cors.php`
  - Adicionar o domínio do frontend em `allowed_origins`
- [ ] Documentar o processo de deploy no `GETTING-STARTED.md`

## Configuração de CORS no backend

```php
// backend/config/cors.php
'allowed_origins' => [
    'http://localhost:5173',          // dev
    'https://seu-dominio.vercel.app', // produção
],
```

## Critério de aceite

- `VITE_API_BASE_URL` é lido corretamente em desenvolvimento e produção
- O frontend em produção consegue se comunicar com o backend (sem erros CORS)
- `bun build` não retorna erros de TypeScript

## Observações

O backend usa Laravel Sanctum para autenticação via token Bearer. Não é necessário configurar cookies/sessions para o frontend SPA, pois usamos o modelo de token stateless.
