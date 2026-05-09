# [DASHBOARD] Dashboard do Professor

## Contexto

Reproduzir a tela `/dashboard` do Lovable: visão geral das propostas do professor, vagas e candidaturas pendentes com ações de aprovar/rejeitar.

## Dependência

**Depende de:** #07 — Proteção de rotas, #08 — Componentes compartilhados, #13 — Form de proposta, #14 — Service de candidaturas

## Layout

```
[Header]

# Dashboard  [+ Nova proposta]

┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ Propostas│ │ Vagas    │ │ Vagas    │ │Candidatos│
│ ativas   │ │ totais   │ │ preench. │ │pendentes │
│    3     │ │   12     │ │    7     │ │    4     │
└──────────┘ └──────────┘ └──────────┘ └──────────┘

## Minhas Propostas
┌────────────────────────────────────────────────────┐
│ Título          │ Área │ Vagas │ Candidatos│ Status│
├────────────────────────────────────────────────────┤
│ ML em Biomed.   │ IA   │ 2/4   │    6      │Aberta │
│ ...             │ ...  │ ...   │   ...     │ ...   │
└────────────────────────────────────────────────────┘

## Candidaturas para revisar
┌────────────────────────────────────────────────────┐
│ [Avatar] João Silva                                │
│ joao@email.com  •  [Portfólio ↗]                  │
│ Proposta: ML em Biomedicina                        │
│                         [Aprovar] [Rejeitar]       │
└────────────────────────────────────────────────────┘
```

## Tarefas

- [ ] Implementar `src/pages/dashboard/index.tsx`
- [ ] Usar `useProposals()` filtrado pelo professor logado para o KPI e a tabela
- [ ] Usar `useApplications({ status: 'pending' })` para a seção de revisão
- [ ] Botão "Nova proposta" → `/propostas/nova`
- [ ] Botão "Aprovar" → `useApproveApplication(id)` com toast de confirmação
- [ ] Botão "Rejeitar" → abrir `<Dialog>` para digitar feedback → `useRejectApplication({ id, payload })`
- [ ] Calcular KPIs: propostas ativas, total de vagas, vagas preenchidas, pendentes
- [ ] Atualizar KPIs automaticamente após aprovar/rejeitar (cache invalidado pelos hooks)
- [ ] Mostrar `<Skeleton>` enquanto carregando

## Critério de aceite

- Rota protegida: aluno redirecionado para `/`
- KPIs refletem o estado real do banco
- Aprovar/rejeitar atualiza a lista sem recarregar
- Dialog de rejeição valida que o feedback foi digitado (opcional, mas informar usuário)
- Tabela de propostas com link para `/propostas/:id/editar`
