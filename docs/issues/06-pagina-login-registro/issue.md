# [AUTH] Página de Login e Registro

## Contexto

Reproduzir a tela de login/registro do Lovable (`/entrar`) com dois modos: login e cadastro. O toggle alterna entre os dois formulários.

## Dependência

**Depende de:** #02 — Shadcn/ui, #05 — Auth schemas e hooks

## Referência visual

O design vem do Lovable (`tcc-connect-main/src/routes/login.tsx`):
- Painel esquerdo: logo e tagline da plataforma
- Painel direito: formulário com toggle Login ↔ Cadastro
- No modo Cadastro: selector de papel (Professor / Aluno), departamento
- Validação inline com mensagens em português

## Tarefas

- [ ] Criar `src/pages/login/index.tsx` com layout em dois painéis (desktop) / coluna única (mobile)
- [ ] Criar `src/features/auth/components/LoginForm.tsx` com React Hook Form + `loginSchema`
- [ ] Criar `src/features/auth/components/RegisterForm.tsx` com React Hook Form + `registerSchema`
- [ ] Exibir mensagens de erro de validação abaixo de cada campo (usar `<Form>` do Shadcn)
- [ ] Exibir erro de API (ex: "Credenciais inválidas") em um `<Toast>` ou alerta
- [ ] Redirecionar para `/` após login/registro bem-sucedido (já implementado nos hooks)
- [ ] Redirecionar para `/` se o usuário já estiver autenticado (guard no topo da página)

## Estrutura esperada

```
src/
├── pages/login/
│   └── index.tsx           ← layout da página
└── features/auth/
    └── components/
        ├── LoginForm.tsx
        └── RegisterForm.tsx
```

## Critério de aceite

- Formulários validam no lado cliente antes de enviar
- Erros da API são exibidos de forma clara ao usuário
- Usuário autenticado não consegue acessar `/entrar` (redireciona para home)
- Funciona em mobile (layout em coluna única)

## Campos do formulário de cadastro

| Campo | Tipo | Validação |
|---|---|---|
| Nome | text | min 2 chars |
| E-mail | email | formato válido |
| Senha | password | min 6 chars |
| Confirmar senha | password | igual à senha |
| Papel | select | professor \| student |
| Departamento | select | lista da API ou enum |
| Link perfil | text | URL válida (opcional) |
