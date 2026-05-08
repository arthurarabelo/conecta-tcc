# [PROPOSALS] Formulário de criação e edição de proposta

## Contexto

Professores podem criar novas propostas e editar as existentes. O formulário deve usar React Hook Form + Zod para validação e exibir erros inline.

## Dependência

**Depende de:** #02 — Shadcn/ui, #07 — Proteção de rotas, #10 — Service e hooks de propostas

## Campos do formulário

| Campo | Tipo | Validação |
|---|---|---|
| Título | text | min 5, max 255 |
| Descrição | textarea | min 20 |
| Pré-requisitos | textarea | opcional |
| Nº de vagas | number | int, min 1 |
| Departamento | select | obrigatório (lista do banco) |
| Área do conhecimento | select | obrigatório (lista do banco) |

## Tarefas

- [ ] Criar `src/features/proposals/components/ProposalForm.tsx` com React Hook Form + `proposalSchema`
- [ ] Criar rota `/propostas/nova` (somente professor) com `<ProtectedRoute role="professor">`
- [ ] Criar rota `/propostas/:id/editar` (somente professor dono da proposta)
- [ ] O formulário de edição pré-popula os campos com `useProposal(id)`
- [ ] Ao submeter, chamar `useCreateProposal()` (nova) ou `useUpdateProposal(id)` (edição)
- [ ] Exibir erros de validação da API (ex: departamento inválido) nos campos corretos
- [ ] Após sucesso, redirecionar para `/propostas/:id` (nova) ou `/dashboard` (edição)
- [ ] Botão "Excluir proposta" no modo edição com confirmação via `<Dialog>`

## Critério de aceite

- Um aluno não consegue acessar `/propostas/nova`
- Campos obrigatórios em branco exibem erro inline
- Após criar, a proposta aparece no mural e no dashboard
- Após editar, os dados são atualizados sem recarregar a página (cache invalidado)
- Exclusão com confirmação funciona e remove a proposta do mural
