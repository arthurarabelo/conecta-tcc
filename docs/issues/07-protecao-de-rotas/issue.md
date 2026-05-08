# [AUTH] Proteção de rotas por papel (professor / aluno)

## Contexto

Algumas rotas exigem autenticação e, em alguns casos, papel específico. Precisamos de um componente de guarda de rota e integração com o TanStack Router.

## Dependência

**Depende de:** #04 — Auth Store, #06 — Página de Login

## Regras de acesso

| Rota | Requer auth | Papel |
|---|---|---|
| `/` | Não | — |
| `/entrar` | Não (redireciona se autenticado) | — |
| `/propostas` | Não | — |
| `/propostas/:id` | Não (botão de candidatura requer) | — |
| `/minhas-candidaturas` | Sim | `student` |
| `/dashboard` | Sim | `professor` |

## Tarefas

- [ ] Criar `src/components/shared/ProtectedRoute.tsx` que:
  - Verifica `isAuthenticated`; se falso, redireciona para `/entrar`
  - Verifica papel (`role`) se fornecido; se errado, redireciona para `/`
- [ ] Envolver `/minhas-candidaturas` com `<ProtectedRoute role="student">`
- [ ] Envolver `/dashboard` com `<ProtectedRoute role="professor">`
- [ ] Implementar o redirecionamento para `/entrar` quando um aluno clica em "Candidatar" sem estar autenticado

## Implementação sugerida

```tsx
// src/components/shared/ProtectedRoute.tsx
interface Props {
  role?: 'professor' | 'student'
  children: React.ReactNode
}

export function ProtectedRoute({ role, children }: Props) {
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()

  if (!isAuthenticated) {
    navigate({ to: '/entrar' })
    return null
  }

  if (role && user?.role !== role) {
    navigate({ to: '/' })
    return null
  }

  return <>{children}</>
}
```

## Critério de aceite

- Acessar `/dashboard` sem estar logado redireciona para `/entrar`
- Acessar `/dashboard` como aluno redireciona para `/`
- Acessar `/minhas-candidaturas` como professor redireciona para `/`
- Um aluno autenticado consegue acessar `/minhas-candidaturas`
