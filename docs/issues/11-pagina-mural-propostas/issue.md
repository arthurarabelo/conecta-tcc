# [PROPOSALS] Página Mural de Propostas — lista paginada com filtros

## Contexto

Reproduzir a tela `/propostas` do Lovable: grid de proposals com busca e filtros por área, departamento e status. Os dados vêm da API real (não mock).

## Dependência

**Depende de:** #08 — Componentes compartilhados, #10 — Service e hooks de propostas

## Layout

```
[Header]
[Busca: campo texto]  [Área: select]  [Departamento: select]  [Só abertas: checkbox]

[ProposalCard] [ProposalCard] [ProposalCard]
[ProposalCard] [ProposalCard] [ProposalCard]
...
[Paginação: Anterior | Página 1 de 5 | Próximo]
```

## Filtros disponíveis (via query params do backend)

| Filtro | Parâmetro API | Tipo |
|---|---|---|
| Área | `area_id` | number |
| Departamento | `department_id` | number |
| Status | `status` | 'open' \| 'closed' |
| Página | `page` | number |

> **Nota:** a busca por texto é client-side (o backend não tem endpoint de full-text search). Filtrar o array `data` com `useMemo`.

## Tarefas

- [ ] Implementar `src/pages/proposals/index.tsx` com o layout acima
- [ ] Criar `src/features/proposals/components/ProposalFilters.tsx` com os 3 filtros + busca
- [ ] Integrar `useProposals(filters)` passando os filtros ativos
- [ ] Adicionar skeleton grid (6 cards) enquanto carrega
- [ ] Implementar paginação com botões Anterior/Próximo usando `meta.current_page` e `meta.last_page`
- [ ] Sincronizar filtros com query params da URL (para compartilhamento de link)
- [ ] Exibir "Nenhuma proposta encontrada" quando `data` está vazio

## Critério de aceite

- Filtros atualizam a lista sem recarregar a página
- URL reflete os filtros ativos (ex: `/propostas?status=open&area_id=1`)
- Paginação funciona corretamente
- Skeletons aparecem durante carregamento
- Funciona em mobile (1 coluna)
