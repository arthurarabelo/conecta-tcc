# E2E Testing Plan for Conecta TCC

## Context

The project currently has **zero e2e tests**. Testing coverage is split into:
- **Frontend**: unit/integration tests via Vitest + Testing Library + MSW (API mocking)
- **Backend**: PHPUnit feature tests for API endpoints

There is no test that exercises real user flows through a browser against the real backend. This plan adds Cypress e2e tests that talk to the actual Laravel API with a real MySQL database.

## Approach: Cypress + Real Backend (Docker Compose)

**Framework**: Cypress — runs in the same event loop as the app, direct access to DOM/localStorage, built-in video recording.

**Backend**: The real Laravel API served via Docker Compose (PHP + MySQL), with a seeded test database. No `cy.intercept()` stubs — every API call hits the real backend.

**Database**: MySQL 8.4 via Docker, migrated and seeded before each test run. A dedicated seeder creates deterministic test data (known users, proposals, departments, etc.).

## Architecture

```
Cypress (browser)
  ↓ page.goto('http://localhost:5173')
Vite dev server (React SPA)
  ↓ fetch('http://localhost:8000/api/...')
Laravel API (Docker Compose)
  ↓ PDO
MySQL 8.4 (Docker Compose)
```

## File Structure

```
frontend/cypress/
├── cypress.config.ts          — Cypress configuration
├── support/
│   ├── commands.ts            — Custom commands (loginByApi, resetDb, createProposalViaApi)
│   ├── e2e.ts                 — Global e2e hooks (beforeEach DB reset, etc.)
│   └── helpers/
│       └── api.ts             — Direct API calls for test setup (create proposal, approve application, etc.)
├── e2e/
│   ├── auth.cy.ts             — Login, register, logout flows
│   ├── proposals.cy.ts        — Browse proposals, filters, pagination, empty states
│   ├── proposal-detail.cy.ts  — View detail, apply to proposal, 404, closed proposal
│   ├── proposal-crud.cy.ts    — Create, edit, delete proposals as professor
│   └── navigation.cy.ts       — Public navigation, auth redirects, role-based access
```

## Test Scenarios

### `auth.cy.ts` — Authentication flows

| # | Test | Key assertions |
|---|------|----------------|
| 1 | Login with valid credentials | Visit `/entrar`, fill form, submit. Redirected to home. Header shows user name. Token stored in localStorage. |
| 2 | Login with invalid credentials | Fill wrong password. Error alert: "Credenciais inválidas." Still on login page. |
| 3 | Register as student | Switch to register tab, fill all fields (name, email, password, department, role), submit. Redirected to home. `GET /me` returns the new user. |
| 4 | Logout | Login first, then click user menu → logout. Redirected to home. Header shows "Entrar". `auth_token` removed from localStorage. |

### `proposals.cy.ts` — Browse proposals list

| # | Test | Key assertions |
|---|------|----------------|
| 1 | Proposals page loads with data | Visit `/propostas`. Loading skeleton appears, then proposal cards render with titles, professor names, area badges. |
| 2 | Search filter | Type in search input. Only matching proposals shown. URL updates with `?search=...`. |
| 3 | Status filter | Click status filter, select "Abertas". Only open proposals displayed. |
| 4 | Department filter | Select a department from dropdown. Results filtered. URL updates. |
| 5 | Area filter | Select a knowledge area from dropdown. Results filtered. URL updates. |
| 6 | Pagination | If more than 15 proposals exist, pagination controls appear. Clicking page 2 loads next batch. URL updates with `?page=2`. |
| 7 | Empty state when no proposals match | Apply filter with no results. "Nenhuma proposta encontrada" message visible. |
| 8 | Navigation from landing page | Visit `/`, scroll to "Propostas em destaque" section, click a proposal card. Lands on `/propostas/$id`. |

### `proposal-detail.cy.ts` — Detail page + apply

| # | Test | Key assertions |
|---|------|----------------|
| 1 | Detail page loads correctly | Visit `/propostas/1`. Title, description, professor name, area badge, department, slots all visible. |
| 2 | 404 page for non-existent proposal | Visit `/propostas/99999`. "Proposta não encontrada" or similar message visible. |
| 3 | Student can apply to proposal | Login as student, visit proposal detail, click "Candidatar-se". Success toast appears. Button changes to "Em análise". |
| 4 | Cannot apply twice | After applying via API, revisit detail page. Button shows "Em análise" instead of "Candidatar-se". |
| 5 | Closed proposal cannot be applied to | Visit a proposal with `status: closed`. Apply button is disabled or shows "Proposta encerrada". |
| 6 | Unauthenticated user sees login prompt | Visit proposal detail without auth. "Entrar para se candidatar" or similar message visible. |
| 7 | Professor sees edit button for own proposal | Login as proposal owner. "Editar" button visible on detail page. |
| 8 | Professor does NOT see edit for others' proposals | Login as different professor. "Editar" button absent. |

### `proposal-crud.cy.ts` — Create, edit, delete proposals

| # | Test | Key assertions |
|---|------|----------------|
| 1 | Create proposal form renders | Login as professor, visit `/propostas/nova`. All form fields visible (title, description, prerequisites, slots, department, area). |
| 2 | Create proposal with valid data | Fill all fields, submit. Redirected to detail page. Success toast. Proposal appears in `/propostas` list. |
| 3 | Form validation errors | Submit empty form. Error messages for required fields. Still on create page. |
| 4 | Student cannot access create page | Login as student, visit `/propostas/nova`. Redirected away (home or proposals list). |
| 5 | Edit proposal loads existing data | Login as professor (owner), visit `/propostas/1/editar`. Form fields pre-filled with current values. |
| 6 | Edit and save | Modify title, submit. Redirected to detail. Success toast. Title updated on detail page. |
| 7 | Delete proposal | Click "Excluir proposta", confirm dialog. Redirected to proposals list. Proposal no longer appears. |
| 8 | Cannot edit another professor's proposal | Login as different professor, visit `/propostas/1/editar`. Access denied or redirected. |

### `navigation.cy.ts` — Public routing + auth guard

| # | Test | Key assertions |
|---|------|----------------|
| 1 | Home page loads | Visit `/`. Hero section, "Como funciona", and featured proposals sections visible. |
| 2 | Header nav links work | Click "Mural de Propostas" in header. Lands on `/propostas`. |
| 3 | Protected routes redirect unauthenticated users | Visit `/propostas/nova` without auth. Redirected to `/entrar`. |
| 4 | Protected routes redirect wrong role | Student visits `/dashboard`. Redirected (home or proposals). |
| 5 | Dashboard loads for professor | Login as professor, visit `/dashboard`. Page content visible. |

## Test Data Seeder

A dedicated seeder (`backend/database/seeders/E2ETestSeeder.php`) creates deterministic test data:

### Users
| Email | Password | Role | Department |
|-------|----------|------|------------|
| student@test.com | password123 | student | Ciência da Computação |
| professor@test.com | password123 | professor | Ciência da Computação |
| professor2@test.com | password123 | professor | Sistemas de Informação |

### Departments
- Ciência da Computação (CC)
- Sistemas de Informação (SI)
- Engenharia de Software (ES)

### Knowledge Areas
- Inteligência Artificial (IA)
- Banco de Dados (BD)
- Redes de Computadores (RC)
- Engenharia de Software (ES)

### Proposals (created by professor@test.com)
| ID | Title | Status | Slots |
|----|-------|--------|-------|
| 1 | Redes Neurais para Reconhecimento de Imagens | open | 2 |
| 2 | Blockchain para Certificação Acadêmica | open | 1 |
| 3 | Proposta Finalizada de Teste | closed | 1 |

The seeder uses `truncate()` on affected tables before inserting, so it can be re-run safely between tests.

## Setup Tasks

### 1. Install Cypress

```bash
cd frontend
npm install -D cypress
```

### 2. Create test database seeder

`backend/database/seeders/E2ETestSeeder.php` — truncates and re-inserts deterministic data for users, departments, knowledge areas, and proposals.

### 3. Create Cypress config (`frontend/cypress.config.ts`)

```ts
import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    retries: { runMode: 1, openMode: 0 },
    env: {
      apiBaseUrl: 'http://localhost:8000/api',
    },
  },
})
```

### 4. Create custom commands (`cypress/support/commands.ts`)

```ts
// Fast auth via real API (skip login UI for tests that need auth but don't test login itself)
Cypress.Commands.add('loginByApi', (email: string, password: string) => {
  cy.request('POST', `${Cypress.env('apiBaseUrl')}/login`, { email, password }).then((res) => {
    const { user, token } = res.body;
    cy.window().then((win) => {
      win.localStorage.setItem('auth_token', token);
      win.localStorage.setItem('conecta-tcc-auth', JSON.stringify({
        state: { user, token, isAuthenticated: true },
        version: 0,
      }));
    });
  });
});

// Reset database to known state before each test
Cypress.Commands.add('resetDb', () => {
  cy.exec('docker compose -f ../backend/compose.yaml exec -T app php artisan db:seed --class=E2ETestSeeder --force');
});

// Create a proposal via API (for setup in CRUD tests)
Cypress.Commands.add('createProposalViaApi', (token: string, proposal: object) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiBaseUrl')}/proposals`,
    headers: { Authorization: `Bearer ${token}` },
    body: proposal,
  });
});
```

### 5. Global test setup (`cypress/support/e2e.ts`)

```ts
import './commands';

before(() => {
  // Verify backend is healthy before running any tests
  cy.request('GET', `${Cypress.env('apiBaseUrl')}/proposals`).its('status').should('eq', 200);
});

beforeEach(() => {
  // Each test starts with a clean database
  cy.resetDb();
  // Clear any leftover auth state
  cy.window().then((win) => {
    win.localStorage.removeItem('auth_token');
    win.localStorage.removeItem('conecta-tcc-auth');
  });
});
```

### 6. Update `package.json` scripts

```json
"test:e2e": "cypress run",
"test:e2e:open": "cypress open",
"db:seed:e2e": "docker compose -f ../backend/compose.yaml exec app php artisan db:seed --class=E2ETestSeeder --force"
```

### 7. CI workflow — `.github/workflows/e2e.yml`

```yaml
name: E2E Tests
on:
  push:
    paths: ["frontend/**", "backend/**"]
  pull_request:
    paths: ["frontend/**", "backend/**"]
jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Start backend services
        run: docker compose -f backend/compose.yaml up -d --wait

      - name: Run migrations & seed
        run: |
          docker compose -f backend/compose.yaml exec -T app php artisan migrate --force
          docker compose -f backend/compose.yaml exec -T app php artisan db:seed --class=E2ETestSeeder --force

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
          cache-dependency-path: frontend/package-lock.json

      - name: Install frontend dependencies
        run: npm ci
        working-directory: frontend

      - name: Run Cypress
        uses: cypress-io/github-action@v6
        with:
          working-directory: frontend
          start: npm run dev
          wait-on: 'http://localhost:5173'
        env:
          CYPRESS_apiBaseUrl: http://localhost:8000/api

      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: cypress-videos
          path: frontend/cypress/videos/

      - name: Tear down
        if: always()
        run: docker compose -f backend/compose.yaml down -v
```

## Implementation Order

1. **Install Cypress** — `npm install -D cypress`
2. **Create test seeder** — `backend/database/seeders/E2ETestSeeder.php` with deterministic test data
3. **Create Cypress config** — `frontend/cypress.config.ts`
4. **Create custom commands** — `cypress/support/commands.ts` with `loginByApi()`, `resetDb()`, `createProposalViaApi()`
5. **Create global hooks** — `cypress/support/e2e.ts` with health check + beforeEach DB reset
6. **Write `auth.cy.ts`** — 4 tests
7. **Write `proposals.cy.ts`** — 8 tests
8. **Write `proposal-detail.cy.ts`** — 8 tests
9. **Write `proposal-crud.cy.ts`** — 8 tests
10. **Write `navigation.cy.ts`** — 5 tests
11. **Update `package.json`** — add e2e scripts
12. **Create CI workflow** — `.github/workflows/e2e.yml`

## Test Isolation Strategy

Each test starts from a known database state:

- In `beforeEach()`, the E2ETestSeeder re-runs: truncates affected tables and re-inserts known data.
- Each spec also clears localStorage between tests.
- This means tests within a spec file are independent of each other.
- For mutations (creating proposals, applying), the test uses a unique email or relies on the DB reset after each test.
- Slight overhead (~1s per test for seeding), but guarantees clean state.

## Verification

```bash
# 1. Start the backend
cd backend
docker compose up -d
docker compose exec app php artisan migrate --force
docker compose exec app php artisan db:seed --class=E2ETestSeeder --force

# 2. Run e2e tests (in another terminal)
cd frontend
npx cypress open          # Interactive, pick specs to run
npm run test:e2e          # Headless, all specs
```

## Notes

- **Auth flow**: Login tests (`auth.cy.ts`) use real UI interaction (`cy.get('input[name=email]').type(...)`) so the full login pipeline is tested. Other specs that need auth use `cy.loginByApi()` for speed.
- **Auth store confirmed**: Uses Zustand persist key `conecta-tcc-auth` with `{ state: { user, token, isAuthenticated }, version: 0 }` format. API client reads `auth_token` from localStorage.
- **Backend must be running**: Cypress does NOT auto-start Docker Compose. The dev or CI workflow must start it before running tests. The `before()` hook verifies backend health.
- **Parallel tests**: With a real shared database, specs should NOT run in parallel. Set `testIsolation: true` in Cypress config or use `--parallel=false`.
- **Radix UI Select**: Radix portals its dropdowns. Use `cy.get('[role="combobox"]').click()` then `cy.get('[role="option"]').click()`.
- **React lazy loading**: Each page is loaded via `React.lazy`. Use `cy.contains('Carregando...').should('not.exist')` before assertions on page content.
- **Dashboard scope**: Currently a placeholder (title only). The dashboard test in `navigation.cy.ts` is minimal until more content is added.