# [APPLICATIONS] Tipos e service de candidaturas

## Contexto

Os tipos e serviço de candidaturas já foram criados. Esta issue cobre a validação da integração com o backend.

## Dependência

**Depende de:** #03 — API Client, #10 — Service de propostas

## Arquivos já criados

```
src/
├── types/models.ts                        ← Application, ApplicationStatus
├── services/applications.service.ts       ← list, show, approve, reject
├── features/applications/
│   └── hooks/index.ts                     ← useApplications, useApproveApplication, useRejectApplication
└── constants/
    ├── api.ts                             ← API_ENDPOINTS.applications
    └── query-keys.ts                      ← QUERY_KEYS.applications
```

## Comportamento do backend

| Papel | `GET /applications` retorna |
|---|---|
| Aluno | Só suas próprias candidaturas |
| Professor | Candidaturas das suas propostas |

## Tarefas

- [ ] Testar `useApplications()` como aluno — retorna apenas as candidaturas do aluno logado
- [ ] Testar `useApplications()` como professor — retorna candidaturas das suas propostas
- [ ] Testar `useApproveApplication()` — como professor, aprova candidatura e invalida cache
- [ ] Testar `useRejectApplication({ id, payload: { feedback: '...' } })` — rejeita com feedback
- [ ] Verificar que aprovar candidatura que fecha as vagas retorna proposta com `status: 'closed'`
- [ ] Verificar que `ApplicationStatus` cobre os três estados: `pending`, `approved`, `rejected`

## Critério de aceite

- Aluno não consegue chamar `approve` ou `reject` (403 tratado corretamente)
- Professor não vê candidaturas de propostas de outros professores
- Após aprovar/rejeitar, a lista de candidaturas é atualizada automaticamente (cache invalidado)
