# [AUTH] Tipos, schemas Zod e service de autenticação

## Contexto

Os schemas Zod e o service de autenticação já foram criados. Esta issue cobre a validação de que os schemas estão corretos e testá-los contra o backend real.

## Dependência

**Depende de:** #03 — API Client, #04 — Auth Store

## Arquivos já criados

```
src/
├── features/auth/
│   ├── schemas/index.ts   ← loginSchema, registerSchema (Zod)
│   └── hooks/index.ts     ← useLogin, useRegister, useLogout, useMe
├── services/
│   └── auth.service.ts    ← authService.login/register/logout/me
└── types/
    └── models.ts          ← interface User, UserRole
```

## Schemas disponíveis

**loginSchema**
```ts
{ email: string, password: string }
```

**registerSchema**
```ts
{
  name: string (min 2),
  email: string (email válido),
  password: string (min 6),
  password_confirmation: string (igual a password),
  role: 'professor' | 'student',
  department_id: number (positivo),
  profile_link?: string (URL válida ou vazio)
}
```

## Tarefas

- [ ] Testar `loginSchema` com e-mail inválido — deve retornar erro no campo `email`
- [ ] Testar `registerSchema` com senhas diferentes — deve retornar erro em `password_confirmation`
- [ ] Testar `useLogin` com credenciais corretas — usuário deve aparecer no store
- [ ] Testar `useRegister` com payload completo — deve criar usuário e autenticar
- [ ] Verificar que `useMe` só roda quando `isAuthenticated === true`
- [ ] Confirmar que o tipo `User` cobre todos os campos retornados pelo `GET /me`

## Critério de aceite

- `useLogin` com credenciais corretas define o user no store e redireciona para home
- `useLogin` com credenciais erradas retorna erro para exibição no formulário
- `useRegister` funciona para papel `professor` e `student`
