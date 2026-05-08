# [SETUP] API Client — Axios com interceptors e tratamento de erros

## Contexto

A camada de serviço já foi estruturada em `src/services/`. Esta issue cobre a **validação e testes manuais** do API client e das classes de erro, garantindo que os interceptors funcionam corretamente com o backend Laravel.

## Dependência

**Depende de:** #01 — Scaffolding do projeto

## Arquivos já criados

```
src/
├── services/
│   ├── api-client.ts          ← instância Axios com interceptors
│   ├── auth.service.ts        ← funções de autenticação
│   ├── proposals.service.ts   ← funções de propostas (CRUD)
│   └── applications.service.ts ← funções de candidaturas
├── lib/
│   └── error.ts               ← classes AppError, ValidationError, AuthError...
└── constants/
    └── api.ts                 ← base URL e endpoints
```

## Tarefas

- [ ] Criar `frontend/.env.local` com `VITE_API_BASE_URL=http://localhost:8000`
- [ ] Testar manualmente que `POST /login` retorna token e é armazenado no `localStorage`
- [ ] Testar que requisições autenticadas enviam o header `Authorization: Bearer <token>`
- [ ] Testar que erros 401 limpam o token e redirecionam para `/entrar`
- [ ] Testar que erros 422 são convertidos em `ValidationError` com o campo `errors`
- [ ] Ajustar a URL base do interceptor de 401 se necessário (atualmente hardcoded `/entrar`)
- [ ] Verificar que `parseAxiosError` trata todos os casos: 401, 403, 404, 422, 500

## Critério de aceite

- Uma chamada com credenciais inválidas retorna `ValidationError` com `errors.email` preenchido
- Uma chamada autenticada com token expirado redireciona para a tela de login
- O `api-client.ts` lê a URL base de `VITE_API_BASE_URL`

## Observações

O backend roda em `http://localhost:8000` por padrão (`php artisan serve`). O Vite proxy no `vite.config.ts` redireciona `/api` → `localhost:8000`, mas os serviços chamam a URL diretamente.
