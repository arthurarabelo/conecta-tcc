# [UI] Página inicial (Landing/Home)

## Contexto

Reproduzir a landing page do Lovable (`/`): hero, como funciona, propostas em destaque (dados reais da API) e footer.

## Dependência

**Depende de:** #08 — Componentes compartilhados, #10 — Service de propostas

## Seções da página

### Hero
- Headline: "Conecte sua pesquisa ao seu futuro"
- Subtítulo
- Dois CTAs: "Explorar mural" (`/propostas`) e "Entrar como professor" (`/entrar`)

### Como funciona
- 3 cards explicativos com ícones Lucide:
  1. Professor publica proposta
  2. Aluno se candidata
  3. Professor aprova e orienta

### Propostas em destaque
- Buscar as 3 primeiras propostas abertas via `useProposals({ status: 'open', page: 1 })`
- Renderizar com `<ProposalCard>`
- Skeleton loader enquanto carrega

### Footer
- Nome do projeto, integrantes, link para repositório

## Tarefas

- [ ] Implementar `src/pages/home/index.tsx` com as 4 seções
- [ ] Usar `useProposals` para buscar propostas em destaque
- [ ] Adicionar `<Skeleton>` durante o carregamento das propostas
- [ ] Tornar a página responsiva (mobile-first)
- [ ] Integrar `<SiteHeader>` no layout

## Critério de aceite

- Propostas em destaque mostram dados reais do banco (não mock)
- Skeletons aparecem enquanto a requisição está pendente
- Todos os links funcionam
- Layout adapta para mobile
