# Issues — Dependências e Ordem de Execução

## Mapa de dependências

```
#01 Scaffolding
 └─► #02 Shadcn/ui
 └─► #03 API Client & Erros
       └─► #04 Auth Store (Zustand)
             └─► #05 Tipos, Schemas & Service Auth
                   └─► #06 Página Login/Registro
                         └─► #07 Proteção de Rotas ◄─────────────┐
                                                                   │
#02 Shadcn/ui                                                      │
 └─► #08 Componentes Compartilhados (ProposalCard, SiteHeader...)  │
       └─► #09 Página Home/Landing ◄── #10 Service Propostas      │
       └─► #11 Mural de Propostas ◄─── #10 Service Propostas      │
       └─► #12 Detalhe da Proposta ◄── #10 + #14 Service Cand.    │
       └─► #15 Minhas Candidaturas ◄── #14 Service Candidaturas ──┘
       └─► #16 Dashboard Professor ◄── #13 Form Proposta
                                    ◄── #14 Service Candidaturas

#03 API Client
 └─► #10 Tipos, Schemas & Service Propostas
       └─► #11 Mural de Propostas
       └─► #12 Detalhe da Proposta
       └─► #13 Formulário Criar/Editar Proposta ◄── #07 Proteção de Rotas
 └─► #14 Tipos & Service Candidaturas
       └─► #12 Detalhe da Proposta
       └─► #15 Minhas Candidaturas
       └─► #16 Dashboard Professor

#01 Scaffolding
 └─► #17 Variáveis de Ambiente & Deploy
```

## Ordem de execução por rodada

| Rodada | Issues | Paralelo |
|--------|--------|----------|
| 1 | [#01 Scaffolding](01-scaffolding-do-projeto/issue.md) | — |
| 2 | [#02 Shadcn/ui](02-configurar-shadcn-ui/issue.md), [#03 API Client](03-api-client-e-tratamento-de-erros/issue.md) | sim |
| 3 | [#04 Auth Store](04-auth-store-zustand/issue.md), [#08 Componentes Compartilhados](08-componentes-compartilhados/issue.md) | sim |
| 4 | [#05 Schemas & Service Auth](05-tipos-schemas-service-auth/issue.md), [#10 Service Propostas](10-tipos-schemas-service-propostas/issue.md) | sim |
| 5 | [#06 Login/Registro](06-pagina-login-registro/issue.md), [#14 Service Candidaturas](14-tipos-service-candidaturas/issue.md) | sim |
| 6 | [#07 Proteção de Rotas](07-protecao-de-rotas/issue.md), [#09 Home](09-pagina-home-landing/issue.md), [#11 Mural](11-pagina-mural-propostas/issue.md) | sim |
| 7 | [#12 Detalhe Proposta](12-pagina-detalhe-proposta/issue.md), [#13 Form Proposta](13-formulario-criar-editar-proposta/issue.md), [#15 Minhas Candidaturas](15-pagina-minhas-candidaturas/issue.md) | sim |
| 8 | [#16 Dashboard](16-dashboard-professor/issue.md), [#17 Deploy](17-variaveis-ambiente-e-deploy/issue.md) | sim |

## Índice de issues

| # | Issue | Plano |
|---|-------|-------|
| 01 | [Scaffolding do projeto](01-scaffolding-do-projeto/issue.md) | [plan.md](01-scaffolding-do-projeto/plan.md) |
| 02 | [Configurar Shadcn/ui](02-configurar-shadcn-ui/issue.md) | [plan.md](02-configurar-shadcn-ui/plan.md) |
| 03 | [API Client & tratamento de erros](03-api-client-e-tratamento-de-erros/issue.md) | [plan.md](03-api-client-e-tratamento-de-erros/plan.md) |
| 04 | [Auth Store com Zustand](04-auth-store-zustand/issue.md) | [plan.md](04-auth-store-zustand/plan.md) |
| 05 | [Tipos, schemas & service de auth](05-tipos-schemas-service-auth/issue.md) | [plan.md](05-tipos-schemas-service-auth/plan.md) |
| 06 | [Página Login e Registro](06-pagina-login-registro/issue.md) | [plan.md](06-pagina-login-registro/plan.md) |
| 07 | [Proteção de rotas](07-protecao-de-rotas/issue.md) | [plan.md](07-protecao-de-rotas/plan.md) |
| 08 | [Componentes compartilhados](08-componentes-compartilhados/issue.md) | [plan.md](08-componentes-compartilhados/plan.md) |
| 09 | [Página Home / Landing](09-pagina-home-landing/issue.md) | [plan.md](09-pagina-home-landing/plan.md) |
| 10 | [Tipos, schemas & service de propostas](10-tipos-schemas-service-propostas/issue.md) | [plan.md](10-tipos-schemas-service-propostas/plan.md) |
| 11 | [Mural de propostas](11-pagina-mural-propostas/issue.md) | [plan.md](11-pagina-mural-propostas/plan.md) |
| 12 | [Detalhe da proposta](12-pagina-detalhe-proposta/issue.md) | [plan.md](12-pagina-detalhe-proposta/plan.md) |
| 13 | [Formulário criar/editar proposta](13-formulario-criar-editar-proposta/issue.md) | [plan.md](13-formulario-criar-editar-proposta/plan.md) |
| 14 | [Tipos & service de candidaturas](14-tipos-service-candidaturas/issue.md) | [plan.md](14-tipos-service-candidaturas/plan.md) |
| 15 | [Minhas candidaturas](15-pagina-minhas-candidaturas/issue.md) | [plan.md](15-pagina-minhas-candidaturas/plan.md) |
| 16 | [Dashboard do professor](16-dashboard-professor/issue.md) | [plan.md](16-dashboard-professor/plan.md) |
| 17 | [Variáveis de ambiente & deploy](17-variaveis-ambiente-e-deploy/issue.md) | [plan.md](17-variaveis-ambiente-e-deploy/plan.md) |
