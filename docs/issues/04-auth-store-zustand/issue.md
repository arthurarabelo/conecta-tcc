# [SETUP] Auth Store com Zustand — estado de autenticação global

## Contexto

O estado de autenticação (usuário logado e token) é gerenciado com Zustand e persistido no `localStorage`. Os arquivos já foram criados, mas precisam ser integrados e validados.

## Dependência

**Depende de:** #03 — API Client

## Arquivos já criados

```
src/
├── store/
│   └── auth.store.ts    ← Zustand com persist middleware
└── hooks/
    └── use-auth.ts      ← hook de conveniência
```

## Interface do store

```ts
interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => void   // login bem-sucedido
  clearAuth: () => void                           // logout
}
```

## Tarefas

- [ ] Verificar que ao chamar `setAuth(user, token)` o token é salvo no `localStorage` como `auth_token`
- [ ] Verificar que ao recarregar a página o estado é restaurado do `localStorage` (persist)
- [ ] Verificar que `clearAuth()` limpa tanto o store quanto o `localStorage`
- [ ] Verificar que `useAuth().isProfessor` e `useAuth().isStudent` retornam os valores corretos
- [ ] Garantir que o `api-client.ts` lê o token de `localStorage.getItem('auth_token')`

## Critério de aceite

- Após login, recarregar a página mantém o usuário autenticado
- Após logout, `useAuth().isAuthenticated` retorna `false`
- Nenhum dado sensível além do token fica exposto no estado global

## Observações

O Zustand v5 mudou ligeiramente a API de `persist` — verificar a documentação se houver problemas de hidratação no strict mode do React.
