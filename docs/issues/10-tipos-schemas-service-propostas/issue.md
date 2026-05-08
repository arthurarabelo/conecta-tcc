# [PROPOSALS] Tipos, schemas Zod e service de propostas

## Contexto

Os tipos e serviço de propostas já foram criados. Esta issue cobre a validação da integração com o backend e testes dos hooks React Query.

## Dependência

**Depende de:** #03 — API Client

## Arquivos já criados

```
src/
├── types/models.ts                    ← Proposal, Department, KnowledgeArea
├── services/proposals.service.ts      ← list, show, create, update, remove, apply
├── features/proposals/
│   ├── schemas/index.ts               ← proposalSchema (Zod)
│   └── hooks/index.ts                 ← useProposals, useProposal, useMutateProposal...
└── constants/
    ├── api.ts                         ← API_ENDPOINTS.proposals
    └── query-keys.ts                  ← QUERY_KEYS.proposals
```

## Endpoints cobertos

| Função | Método | Endpoint |
|---|---|---|
| `proposalsService.list(filters)` | GET | `/proposals?area_id=&department_id=&status=` |
| `proposalsService.show(id)` | GET | `/proposals/:id` |
| `proposalsService.create(payload)` | POST | `/proposals` |
| `proposalsService.update(id, payload)` | PATCH | `/proposals/:id` |
| `proposalsService.remove(id)` | DELETE | `/proposals/:id` |
| `proposalsService.apply(proposalId)` | POST | `/proposals/:id/apply` |

## Tarefas

- [ ] Testar `useProposals()` — retorna lista paginada com `data` e `meta`
- [ ] Testar `useProposals({ status: 'open' })` — filtra apenas propostas abertas
- [ ] Testar `useProposal(id)` — retorna proposta com professor, departamento e área
- [ ] Testar `useCreateProposal()` — como professor, cria proposta e invalida cache
- [ ] Testar `useApplyToProposal()` — como aluno, cria candidatura
- [ ] Verificar que `proposalSchema` valida corretamente `max_slots` (int positivo)
- [ ] Adicionar tipo `Department[]` e `KnowledgeArea[]` para popular selects dos formulários

## Critério de aceite

- `useProposals()` funciona sem autenticação
- `useCreateProposal()` retorna 403 para alunos (tratado como `ForbiddenError`)
- `useApplyToProposal()` retorna erro adequado se proposta estiver fechada ou sem vagas
