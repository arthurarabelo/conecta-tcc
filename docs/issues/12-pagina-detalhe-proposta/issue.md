# [PROPOSALS] Página de Detalhe de Proposta

## Contexto

Reproduzir a tela `/propostas/:id` do Lovable: detalhes completos da proposta, vagas disponíveis e botão de candidatura para alunos.

## Dependência

**Depende de:** #08 — Componentes compartilhados, #10 — Service de propostas, #14 — Service de candidaturas

## Layout

```
[Header]

[Badge área]  [Badge departamento]  [Badge status]

# Título da Proposta

[Avatar professor]  Prof. Nome  •  Departamento
[link Lattes ↗]

---

## Sobre o projeto
{description}

## Pré-requisitos
• Pré-req 1
• Pré-req 2

                          [ Card lateral ]
                          ┌──────────────────┐
                          │ Candidatura       │
                          │ 2 de 4 vagas      │
                          │ [████░░] 50%      │
                          │                  │
                          │ [Candidatar-se]   │
                          │ (ou status badge) │
                          └──────────────────┘
```

## Estados do card de candidatura

| Situação | Estado exibido |
|---|---|
| Não autenticado | Botão "Entrar para se candidatar" → `/entrar` |
| Autenticado aluno, sem candidatura | Botão "Candidatar-se" ativo |
| Autenticado aluno, candidatura pendente | Badge "Em análise" |
| Autenticado aluno, aprovado | Badge "Aprovado" + link para candidaturas |
| Autenticado aluno, rejeitado | Badge "Rejeitado" |
| Proposta fechada | Botão desabilitado "Proposta encerrada" |
| Sem vagas disponíveis | Botão desabilitado "Sem vagas" |
| Autenticado professor | Não exibe card de candidatura |

## Tarefas

- [ ] Implementar `src/pages/proposal-detail/index.tsx`
- [ ] Usar `useProposal(id)` para buscar dados da proposta
- [ ] Usar `useApplications()` para verificar se o aluno já tem candidatura nesta proposta
- [ ] Usar `useApplyToProposal()` ao clicar em "Candidatar-se"
- [ ] Exibir `<Skeleton>` enquanto carregando
- [ ] Exibir erro 404 com mensagem amigável se proposta não existir
- [ ] Exibir toast de sucesso após candidatura

## Critério de aceite

- Todos os estados do card de candidatura funcionam corretamente
- Candidatura bem-sucedida exibe toast e muda o card para "Em análise"
- Professor vê a proposta mas sem opção de candidatura
- Skeleton cobre todo o conteúdo durante carregamento
