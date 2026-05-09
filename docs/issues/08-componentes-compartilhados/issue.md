# [UI] Componentes compartilhados

## Contexto

Componentes reutilizáveis que aparecem em múltiplas páginas: barra de navegação, card de proposta, badge de status e boundary de erro.

## Dependência

**Depende de:** #02 — Shadcn/ui

## Componentes a criar

### `SiteHeader`
Barra de navegação fixa no topo.
- Logo "Conecta TCC" (texto + ícone)
- Links: Home, Mural, Minhas Candidaturas, Dashboard
- Botão "Entrar" (quando não autenticado) ou Avatar + dropdown de logout (quando autenticado)
- Responsivo: menu hamburger em mobile

```
src/components/shared/SiteHeader/
├── index.tsx
└── NavLink.tsx   (item de navegação com estado ativo)
```

### `ProposalCard`
Card reutilizável para listar propostas no mural e na home.
- Badge de área do conhecimento
- Badge de status (aberta = verde, fechada = cinza)
- Título (truncado)
- Trecho da descrição (3 linhas)
- Avatar + nome do professor, departamento
- Vagas restantes: `{n} de {max} vagas`
- Link para `/propostas/:id`

```
src/components/shared/ProposalCard/
└── index.tsx
```

### `StatusBadge`
Badge colorido por status de candidatura.
- `pending` → amarelo "Em análise"
- `approved` → verde "Aprovado"
- `rejected` → vermelho "Rejeitado"

```
src/components/shared/StatusBadge/
└── index.tsx
```

### `ErrorBoundary`
Boundary de erro global para capturar exceções de renderização.

```
src/components/shared/ErrorBoundary/
└── index.tsx
```

## Tarefas

- [ ] Criar `SiteHeader` com navegação responsiva e estado de auth
- [ ] Criar `ProposalCard` tipado com interface `Proposal` de `@/types/models`
- [ ] Criar `StatusBadge` com mapeamento de status → cor + texto
- [ ] Criar `ErrorBoundary` como class component com fallback UI
- [ ] Integrar `SiteHeader` no layout raiz do router
- [ ] Integrar `ErrorBoundary` envolvendo o `RouterProvider` no `main.tsx`

## Critério de aceite

- `<ProposalCard proposal={proposal} />` renderiza sem precisar de props adicionais
- `<StatusBadge status="pending" />` exibe "Em análise" com fundo amarelo
- `SiteHeader` exibe o menu correto para usuário não autenticado, aluno e professor
