# Portal Conecta TCC

Trabalho Prático - Testes de Software

Alunos:

- Arthur Araujo Rabelo
- Clara Garcia Tavares
- Davi Porto Araujo
- Thiago Roberto Magalhães

## Sobre o Projeto

O **Portal Conecta TCC** é uma plataforma web desenvolvida para otimizar e centralizar o processo de alocação de Trabalhos de Conclusão de Curso (TCC). O sistema atua como uma ponte entre o corpo docente e os discentes, facilitando a descoberta de temas de pesquisa e a formação de parcerias acadêmicas.

Muitas vezes, o processo de encontrar um orientador ou um tema de TCC é descentralizado e dependente de contatos informais, o que pode gerar ruídos de comunicação e desigualdade no acesso às oportunidades. O nosso sistema resolve esse problema criando um ambiente transparente onde ideias e pesquisadores se encontram.

A dinâmica principal do sistema baseia-se na oferta e demanda de projetos:

- **Oferta**: Professores cadastram ideias ou linhas de pesquisa para TCCs, estipulando um limite máximo de vagas para orientandos naquele projeto específico.

- **Candidatura**: Alunos navegam por um mural de propostas, analisam os escopos e requisitos, e se candidatam às ideias que mais se alinham aos seus interesses e perfil técnico.

- **Match**: O professor avalia os perfis dos candidatos e aprova ou recusa as solicitações, formalizando a orientação.

## Principais Funcionalidades

### Para Professores (Orientadores)

- **Publicação de Propostas**: Criação de ideias de TCC com título, descrição, pré-requisitos e número de vagas disponíveis.

- **Gestão de Candidaturas**: Visualização dos alunos que aplicaram para suas ideias, com acesso aos perfis ou portfólios.

- **Aprovação/Recusa**: Ferramenta para aceitar os orientandos ideais e fechar as vagas, ou declinar candidaturas com feedback.

- **Dashboard de Projetos**: Visão geral de todas as orientações ativas e vagas restantes.

### Para Alunos (Orientandos)

- **Mural de Ideias**: Exploração de propostas de TCC ofertadas pelos professores, com filtros por área de conhecimento, professor ou departamento.

- **Sistema de Candidatura (Apply)**: Submissão de interesse em uma ou mais vagas de projeto.

- **Acompanhamento de Status**: Visualização em tempo real do andamento de suas candidaturas (Pendente, Aprovado, Recusado).

## Tecnologias Utilizadas

- **Frontend**: React / Vue / HTML, CSS e JS puro

- **Backend**:PHP/Laravel

- **Banco de Dados**:MySQL


# Portal Conecta TCC – Architecture Overview

## Architecture
A arquitetura adota o padrão MVC no backend (Laravel) e uma comunicação via API RESTful para o frontend SPA (Single Page Application). O fluxo principal é:

- Professores publicam propostas (ideias de TCC) com vagas limitadas.
- Alunos visualizam um mural de propostas, filtram e se candidatam.
- Professores gerenciam as candidaturas, aprovando ou recusando.
- O sistema controla as vagas restantes automaticamente.

A separação entre frontend e backend permite que o foco dos testes seja dividido entre a lógica de negócio (API/banco) e a interface.

## 2. Modelagem do Banco de Dados (MySQL)

### 2.1 `users`
- `id` (PK)
- `name`
- `email` (unique)
- `password`
- `role` (ENUM: 'professor', 'student')
- `department_id` (FK → departments, nullable)
- `lattes_link` ou `portfolio` (text)
- `created_at`, `updated_at`

### 2.2 `departments`
- `id` (PK)
- `name`
- `code`

### 2.3 `knowledge_areas` (áreas de conhecimento/pesquisa)
- `id` (PK)
- `name` (ex: "Inteligência Artificial", "Banco de Dados")

### 2.4 `proposals` (ideias de TCC ofertadas)
- `id` (PK)
- `professor_id` (FK → users.id, role='professor')
- `title`
- `description`
- `prerequisites` (texto)
- `max_slots` (int, limite de vagas)
- `department_id` (FK → departments, para filtro)
- `area_id` (FK → knowledge_areas, principal área)
- `status` (ENUM: 'open', 'closed' – uma proposta pode ser fechada manualmente ou quando as vagas esgotarem)
- `created_at`, `updated_at`

**Observação:** `max_slots` define o total de orientandos aceitos para aquela ideia.

### 2.5 `applications` (candidaturas)
- `id` (PK)
- `student_id` (FK → users.id, role='student')
- `proposal_id` (FK → proposals.id)
- `status` (ENUM: 'pending', 'approved', 'rejected')
- `feedback` (text, mensagem do professor opcional)
- `applied_at` (timestamp)
- `reviewed_at` (timestamp)
- `created_at`, `updated_at`

**Restrições importantes:**
- Um aluno não pode se candidatar mais de uma vez à mesma proposta (`UNIQUE(student_id, proposal_id)`).
- A aprovação (`status = 'approved'`) só é permitida se a contagem de `applications` aprovadas naquela proposta for **< max_slots**. Essa validação deve ser feita via código (regra de negócio).
- Opcional: tabela `orientations` para registrar o vínculo formal após aprovação, mas podemos usar a própria `applications` com status 'approved' como match.

### Diagrama simplificado (relacionamentos)
```text
departments 1──N users (professor/student)
knowledge_areas 1──N proposals
users (professor) 1──N proposals
proposals 1──N applications
users (student) 1──N applications


3. Estrutura de Rotas (API REST Laravel)

Considerando autenticação via Laravel Sanctum (tokens) para SPA, os endpoints são agrupados com prefixo /api e middleware de autenticação quando necessário.
3.1 Autenticação
text

POST   /api/register           - Registro de usuário (aluno/professor)
POST   /api/login              - Login, retorna token
POST   /api/logout             - Logout (auth)
GET    /api/user               - Dados do usuário logado (auth)

3.2 Propostas (Mural de Ideias)
text

GET    /api/proposals          - Lista pública/filtrada (auth opcional, mas necessário para ver detalhes)
GET    /api/proposals/{id}     - Detalhes de uma proposta (auth)
POST   /api/proposals          - Criar proposta (apenas professor) (auth)
PUT    /api/proposals/{id}     - Editar proposta (autor ou admin) (auth)
DELETE /api/proposals/{id}     - Excluir proposta (autor) (auth)

3.3 Candidaturas (Apply & Gestão)
text

POST   /api/proposals/{id}/apply   - Aluno se candidata (auth, estudante)
GET    /api/applications           - Lista as candidaturas do usuário logado
(para aluno: suas candidaturas; para professor: candidaturas das suas propostas)
(auth) com filtros: ?status=pending,approved
GET    /api/applications/{id}      - Detalhe de uma candidatura específica (auth)
PATCH  /api/applications/{id}/approve  - Professor aprova (auth, apenas dono da proposta)
PATCH  /api/applications/{id}/reject   - Professor recusa com feedback (auth)

```