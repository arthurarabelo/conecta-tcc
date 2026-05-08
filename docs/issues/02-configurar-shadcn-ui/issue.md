# [SETUP] Configurar Shadcn/ui — componentes base

## Contexto

O projeto usa Tailwind CSS v4 + Shadcn/ui (New York style). O `components.json` já está configurado. Esta issue cobre a instalação dos componentes de UI primitivos que serão reutilizados em todo o projeto.

## Dependência

**Depende de:** #01 — Scaffolding do projeto

## Tarefas

Instalar os seguintes componentes via CLI do Shadcn:

```bash
# Dentro de frontend/
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add card
npx shadcn@latest add badge
npx shadcn@latest add dialog
npx shadcn@latest add select
npx shadcn@latest add separator
npx shadcn@latest add avatar
npx shadcn@latest add toast
npx shadcn@latest add skeleton
npx shadcn@latest add checkbox
npx shadcn@latest add dropdown-menu
npx shadcn@latest add textarea
npx shadcn@latest add form
```

- [ ] Confirmar que todos os componentes são gerados em `src/components/ui/`
- [ ] Verificar que o `styles.css` tem as variáveis de tema corretas (já definidas no arquivo)
- [ ] Confirmar que o `cn()` de `@/lib/utils` está sendo usado nos componentes gerados

## Critério de aceite

- Todos os componentes acima existem em `src/components/ui/`
- Um componente como `<Button>Teste</Button>` renderiza corretamente na tela

## Arquivos gerados

```
src/
└── components/
    └── ui/
        ├── button.tsx
        ├── input.tsx
        ├── label.tsx
        ├── card.tsx
        ├── badge.tsx
        ├── dialog.tsx
        ├── select.tsx
        ├── separator.tsx
        ├── avatar.tsx
        ├── toast.tsx
        ├── skeleton.tsx
        ├── checkbox.tsx
        ├── dropdown-menu.tsx
        ├── textarea.tsx
        └── form.tsx
```
