# Guia de Inicialização — Conecta TCC

## Pré-requisitos

| Ferramenta | Versão mínima | Instalação |
|---|---|---|
| Docker | 24+ | https://docs.docker.com/get-docker/ |
| Docker Compose | 2.x | incluso no Docker Desktop |
| Node.js | 20+ | https://nodejs.org |
| npm | 10+ | incluso com Node.js |
| Git | qualquer | pré-instalado na maioria dos sistemas |

---

## Backend (Laravel via Docker)

### 1. Subir os containers

Na raiz do projeto (ou dentro de `backend/`), execute:

```bash
cd backend
docker compose up -d
```

O `docker-compose.yml` sobe três serviços:
- **app** — PHP 8.2 + Laravel (porta 8000)
- **db** — MySQL 8.0 (porta 3306)
- **nginx** — proxy reverso (porta 8080, opcional)

> Se o projeto ainda não tem `docker-compose.yml`, crie-o conforme abaixo:

```yaml
# backend/docker-compose.yml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    volumes:
      - .:/var/www/html
    depends_on:
      - db
    environment:
      - DB_HOST=db
      - DB_PORT=3306
      - DB_DATABASE=conecta_tcc
      - DB_USERNAME=laravel
      - DB_PASSWORD=secret

  db:
    image: mysql:8.0
    ports:
      - "3306:3306"
    environment:
      MYSQL_DATABASE: conecta_tcc
      MYSQL_USER: laravel
      MYSQL_PASSWORD: secret
      MYSQL_ROOT_PASSWORD: root
    volumes:
      - db_data:/var/lib/mysql

volumes:
  db_data:
```

```dockerfile
# backend/Dockerfile
FROM php:8.2-cli

RUN apt-get update && apt-get install -y \
    libzip-dev unzip curl \
    && docker-php-ext-install pdo pdo_mysql zip

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY . .

RUN composer install --no-dev --optimize-autoloader

EXPOSE 8000

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
docker compose exec app php artisan key:generate
```

O `.env` já deve apontar para o serviço `db` do Docker. Verifique:

```dotenv
DB_CONNECTION=mysql
DB_HOST=db
DB_PORT=3306
DB_DATABASE=conecta_tcc
DB_USERNAME=laravel
DB_PASSWORD=secret
```

### 3. Criar tabelas

```bash
docker compose exec app php artisan migrate
docker compose exec app php artisan db:seed   # se existirem seeders
```

### 4. Verificar que a API está no ar

```bash
curl http://localhost:8000/api/proposals
# Deve retornar um JSON paginado: { "data": [...], "meta": {...}, "links": {...} }
```

### Comandos úteis do Docker

```bash
# Ver logs do container Laravel
docker compose logs -f app

# Acessar o shell do container
docker compose exec app bash

# Parar os containers
docker compose down

# Parar e remover volumes (apaga o banco)
docker compose down -v

# Recriar containers após mudanças no Dockerfile
docker compose up -d --build
```

---

## Frontend (React + Vite)

### 1. Instalar dependências

```bash
cd frontend
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env.local
```

Edite o `.env.local`:

```dotenv
VITE_API_BASE_URL=http://localhost:8000
```

### 3. Iniciar o servidor de desenvolvimento

```bash
npm run dev
# Rodando em http://localhost:5173
```

### 4. Build para produção

```bash
npm run build
# Gera os arquivos em frontend/dist/
```

Para visualizar o build localmente:

```bash
npm run preview
# Rodando em http://localhost:4173
```

---

## Instalando componentes Shadcn/ui

Após `npm install`, adicione os componentes UI:

```bash
cd frontend

npx shadcn@latest add button input label card badge dialog \
  select separator avatar toast skeleton checkbox \
  dropdown-menu textarea form
```

Os componentes serão gerados em `src/components/ui/`.

---

## Estrutura do projeto

```
conecta-tcc/
├── backend/          ← API Laravel (PHP) + Docker
│   ├── docker-compose.yml
│   ├── Dockerfile
│   └── ...
├── frontend/         ← SPA React (TypeScript)
│   ├── src/
│   │   ├── components/     ← componentes UI e compartilhados
│   │   ├── constants/      ← endpoints, rotas, query keys
│   │   ├── features/       ← lógica por domínio (auth, proposals, applications)
│   │   │   ├── auth/
│   │   │   │   ├── components/   ← LoginForm, RegisterForm
│   │   │   │   ├── hooks/        ← useLogin, useRegister, useLogout
│   │   │   │   └── schemas/      ← Zod schemas
│   │   │   ├── proposals/
│   │   │   │   ├── components/   ← ProposalFilters, ProposalForm
│   │   │   │   ├── hooks/        ← useProposals, useCreateProposal...
│   │   │   │   └── schemas/
│   │   │   └── applications/
│   │   │       ├── components/   ← ApplicationCard
│   │   │       └── hooks/        ← useApplications, useApproveApplication...
│   │   ├── hooks/          ← hooks globais (use-auth, use-mobile)
│   │   ├── lib/            ← utilitários (cn, formatDate, error classes, queryClient)
│   │   ├── pages/          ← páginas da aplicação
│   │   ├── services/       ← funções de API (api-client, auth, proposals, applications)
│   │   ├── store/          ← estado global Zustand (auth)
│   │   ├── types/          ← interfaces TypeScript (models, api)
│   │   ├── main.tsx        ← entrada da aplicação
│   │   ├── router.tsx      ← definição de rotas TanStack Router
│   │   └── styles.css      ← Tailwind v4 + variáveis de tema
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
└── docs/
    ├── GETTING-STARTED.md  ← este arquivo
    └── issues/             ← histórias de usuário e planos de implementação
```

---

## Rotas da aplicação

| URL | Página | Acesso |
|---|---|---|
| `/` | Home / Landing | Público |
| `/entrar` | Login e Cadastro | Público (redireciona se autenticado) |
| `/propostas` | Mural de Propostas | Público |
| `/propostas/:id` | Detalhe da Proposta | Público (candidatura requer auth) |
| `/minhas-candidaturas` | Candidaturas do Aluno | Aluno autenticado |
| `/dashboard` | Dashboard do Professor | Professor autenticado |
| `/propostas/nova` | Criar Proposta | Professor autenticado |
| `/propostas/:id/editar` | Editar Proposta | Professor dono |

---

## Variáveis de ambiente

### Backend (`backend/.env`)

| Variável | Descrição |
|---|---|
| `APP_KEY` | Chave de criptografia (gerada por `artisan key:generate`) |
| `DB_CONNECTION` | Driver do banco (`mysql`) |
| `DB_HOST` | Host do banco — use `db` dentro do Docker |
| `DB_DATABASE` | Nome do banco de dados |
| `DB_USERNAME` | Usuário do banco |
| `DB_PASSWORD` | Senha do banco |
| `SANCTUM_STATEFUL_DOMAINS` | Domínios permitidos para Sanctum (ex: `localhost:5173`) |

### Frontend (`frontend/.env.local`)

| Variável | Descrição | Padrão |
|---|---|---|
| `VITE_API_BASE_URL` | URL base da API Laravel | `http://localhost:8000` |

---

## Resolução de problemas comuns

### "CORS error" ao chamar a API

Adicione o domínio do frontend no backend:

```php
// backend/config/cors.php
'allowed_origins' => ['http://localhost:5173'],
```

Ou no `.env` do backend:

```dotenv
SANCTUM_STATEFUL_DOMAINS=localhost:5173
```

Reinicie o container após a mudança:

```bash
docker compose restart app
```

### Container não sobe / porta já em uso

```bash
# Verificar o que está usando a porta 8000
sudo lsof -i :8000

# Trocar a porta no docker-compose.yml
ports:
  - "8001:8000"   # acesso em localhost:8001
```

### "Token not found" após recarregar a página

O Zustand persiste o estado no `localStorage`. Verifique se `conecta-tcc-auth` existe no Storage do DevTools (F12 → Application → Local Storage).

### Erro 419 (CSRF) nas requisições

Certifique-se de que as rotas estão em `routes/api.php` (não `routes/web.php`). O frontend usa autenticação por token Bearer (stateless) e não depende de cookies de sessão.

### Migrations falham com "Access denied"

Verifique se o serviço `db` do Docker está de pé antes de rodar o migrate:

```bash
docker compose ps          # db deve estar "running"
docker compose exec app php artisan migrate
```
