# [APPLICATIONS] Página Minhas Candidaturas (visão do aluno)

## Contexto

Reproduzir a tela `/minhas-candidaturas` do Lovable: lista das candidaturas do aluno logado com status e feedback do professor.

## Dependência

**Depende de:** #07 — Proteção de rotas, #08 — Componentes compartilhados, #14 — Service de candidaturas

## Layout

```
[Header]

# Minhas Candidaturas

[3] Em análise   [1] Aprovadas   [0] Rejeitadas

┌──────────────────────────────────────────────────┐
│ [Badge área]                    [Badge status]    │
│ Título da proposta                               │
│ Prof. Nome do professor                          │
│ Candidatado em 10 de maio de 2025               │
│ Feedback: "..."  (se status = rejected)          │
│                                    [Ver proposta →]│
└──────────────────────────────────────────────────┘
```

## Tarefas

- [ ] Implementar `src/pages/my-applications/index.tsx`
- [ ] Criar `src/features/applications/components/ApplicationCard.tsx`
- [ ] Usar `useApplications()` para buscar candidaturas do aluno
- [ ] Calcular contadores por status com `useMemo`
- [ ] Exibir feedback do professor quando `status === 'rejected'`
- [ ] Link "Ver proposta" deve ir para `/propostas/:id`
- [ ] Exibir skeleton enquanto carregando
- [ ] Exibir "Você ainda não se candidatou a nenhuma proposta" quando lista vazia

## Critério de aceite

- Rota protegida: professor redirecionado para `/`
- Contadores por status corretos
- Feedback exibido apenas quando status é `rejected`
- Link para proposta funciona
- Lista atualiza após candidatura feita na tela de detalhe
