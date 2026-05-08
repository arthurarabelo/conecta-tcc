# Environment Variables & Deployment — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Configure environment files for development and production, fix CORS in the Laravel backend, verify the production build, and document step-by-step deployment instructions for Vercel (frontend) and a PHP host (backend).

**Architecture:** No new UI components. Frontend reads `VITE_API_BASE_URL` at build time via `import.meta.env`; the value is already wired into `src/constants/api.ts`. The backend already uses Laravel's built-in `HandleCors` middleware (available in Laravel 13 via `Illuminate\Http\Middleware\HandleCors`); we create a `cors.php` config file and register the middleware. Authentication is stateless Bearer token — no cookie/session CORS setup needed.

**Tech Stack:** Vite 7, Laravel 13 + Sanctum 4, Bun, Vercel CLI (for deploy), PHP 8.3.

---

### Task 1: Create frontend environment files

**Files:**
- Create: `frontend/.env.local`
- Create: `frontend/.env.production`
- Modify: `frontend/.gitignore` (ensure `.env.local` is ignored)

- [ ] **Step 1: Create .env.local for development**

Create `frontend/.env.local`:

```
VITE_API_BASE_URL=http://localhost:8000
```

This file is already covered by Vite's default gitignore rules (`.env.local` is ignored by Vite's scaffolded `.gitignore`). Verify:

```bash
grep -n "env.local" /home/supertgo/programas/conecta-tcc/frontend/.gitignore 2>/dev/null || echo "not found — add manually"
```

If not found, open `frontend/.gitignore` and add:

```
.env.local
```

- [ ] **Step 2: Create .env.production**

Create `frontend/.env.production`:

```
VITE_API_BASE_URL=https://your-api-domain.com
```

Replace `https://your-api-domain.com` with the actual production backend URL before deploying (e.g., `https://api.conecta-tcc.onrender.com`).

> `.env.production` **is** committed to git because it contains no secrets — only the public API URL. Secrets (DB passwords, APP_KEY) live only in the hosting platform's environment variables.

- [ ] **Step 3: Verify VITE_API_BASE_URL is read correctly in dev**

```bash
cd /home/supertgo/programas/conecta-tcc/frontend
bun run dev &
# wait ~3 seconds, then:
curl -s http://localhost:5173 | head -5
kill %1
```

Expected: HTML page returned without errors. The `API_BASE_URL` constant in `src/constants/api.ts` will resolve to `http://localhost:8000` in dev because `import.meta.env.VITE_API_BASE_URL` is set in `.env.local`.

- [ ] **Step 4: Commit**

```bash
cd /home/supertgo/programas/conecta-tcc/frontend
git add .env.production
git commit -m "chore: add frontend environment files for dev and production"
```

---

### Task 2: Configure CORS in the Laravel backend

**Files:**
- Create: `backend/config/cors.php`
- Modify: `backend/bootstrap/app.php`

> Laravel 13 ships with `Illuminate\Http\Middleware\HandleCors` built-in. It reads its config from `config/cors.php`. We just need to create that config file and register the middleware globally.

- [ ] **Step 1: Create backend/config/cors.php**

Create `backend/config/cors.php`:

```php
<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | allowed_origins accepts exact origins or wildcard patterns.
    | Add your Vercel preview domain pattern once you have it.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie', '*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:5173',           // Vite dev server
        'http://localhost:4173',           // Vite preview
        'https://your-app.vercel.app',     // Production — replace with real domain
    ],

    'allowed_origins_patterns' => [
        '#^https://conecta-tcc-.*\.vercel\.app$#', // Vercel preview branches
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];
```

- [ ] **Step 2: Register HandleCors middleware in bootstrap/app.php**

Open `backend/bootstrap/app.php`. The current content is:

```php
<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias(['admin' => \App\Http\Middleware\AdminMiddleware::class]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
```

Replace the `->withMiddleware(...)` closure with:

```php
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->prepend(\Illuminate\Http\Middleware\HandleCors::class);
        $middleware->alias(['admin' => \App\Http\Middleware\AdminMiddleware::class]);
    })
```

The full updated `bootstrap/app.php` becomes:

```php
<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->prepend(\Illuminate\Http\Middleware\HandleCors::class);
        $middleware->alias(['admin' => \App\Http\Middleware\AdminMiddleware::class]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
```

- [ ] **Step 3: Clear config cache and verify CORS headers**

```bash
cd /home/supertgo/programas/conecta-tcc/backend
php artisan config:clear
php artisan serve --port=8000 &
sleep 2
curl -s -I -H "Origin: http://localhost:5173" -X OPTIONS http://localhost:8000/api/proposals | grep -i "access-control"
kill %1
```

Expected output contains:
```
access-control-allow-origin: http://localhost:5173
access-control-allow-methods: *
```

- [ ] **Step 4: Commit**

```bash
cd /home/supertgo/programas/conecta-tcc/backend
git add config/cors.php bootstrap/app.php
git commit -m "chore: configure CORS middleware to allow localhost:5173 and Vercel domains"
```

---

### Task 3: Verify production build

**Files:**
- No file changes — verification only.

- [ ] **Step 1: Run the TypeScript type check**

```bash
cd /home/supertgo/programas/conecta-tcc/frontend
bunx tsc --noEmit
```

Expected: exits with code 0 and no output. If there are errors, fix them in the relevant source files before continuing.

- [ ] **Step 2: Run the production build**

```bash
cd /home/supertgo/programas/conecta-tcc/frontend
bun run build
```

Expected output (last lines):
```
✓ built in X.XXs
dist/index.html                   X.XX kB
dist/assets/index-XXXXXXXX.js    XXX.XX kB │ gzip: XX.XX kB
dist/assets/index-XXXXXXXX.css    XX.XX kB │ gzip:  X.XX kB
```

Exit code: 0. The `dist/` directory is created.

- [ ] **Step 3: Verify the built app serves correctly with bun preview**

```bash
cd /home/supertgo/programas/conecta-tcc/frontend
bun run preview &
sleep 2
curl -s -o /dev/null -w "%{http_code}" http://localhost:4173
kill %1
```

Expected: `200` — the preview server returns the built HTML page at port 4173.

---

### Task 4: Create vercel.json for SPA routing

**Files:**
- Create: `frontend/vercel.json`

> Vercel needs to redirect all routes back to `index.html` so that TanStack Router handles client-side navigation. Without this, a direct visit to `/dashboard` returns a 404.

- [ ] **Step 1: Create vercel.json**

Create `frontend/vercel.json`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

- [ ] **Step 2: Verify the file is valid JSON**

```bash
cd /home/supertgo/programas/conecta-tcc/frontend
node -e "JSON.parse(require('fs').readFileSync('vercel.json', 'utf8')); console.log('valid')"
```

Expected: `valid`

- [ ] **Step 3: Commit**

```bash
cd /home/supertgo/programas/conecta-tcc/frontend
git add vercel.json
git commit -m "chore: add vercel.json for SPA client-side routing rewrites"
```

---

### Task 5: Deploy frontend to Vercel

> Prerequisite: Vercel CLI installed globally (`npm i -g vercel` or `bun add -g vercel`) and you are logged in (`vercel login`).

- [ ] **Step 1: Install Vercel CLI (if not present)**

```bash
bun add -g vercel
vercel --version
```

Expected: prints Vercel CLI version, e.g. `Vercel CLI 37.x.x`.

- [ ] **Step 2: Deploy from the frontend directory**

```bash
cd /home/supertgo/programas/conecta-tcc/frontend
vercel --prod
```

When prompted:
- **Set up and deploy**: `Y`
- **Which scope**: select your personal/team account
- **Link to existing project?**: `N` (first deploy)
- **Project name**: `conecta-tcc-frontend`
- **In which directory is your code located?**: `.` (current dir)
- **Auto-detected framework**: Vite — confirm with `Y`
- **Override build settings?**: `N`

Vercel will ask about environment variables. Add:

```
VITE_API_BASE_URL = https://your-api-domain.com
```

Replace `https://your-api-domain.com` with the actual backend URL.

- [ ] **Step 3: Set production environment variable via CLI**

```bash
vercel env add VITE_API_BASE_URL production
```

When prompted, enter: `https://your-api-domain.com`

Then redeploy to pick up the new variable:

```bash
cd /home/supertgo/programas/conecta-tcc/frontend
vercel --prod
```

- [ ] **Step 4: Verify deployment**

```bash
curl -s -o /dev/null -w "%{http_code}" https://conecta-tcc-frontend.vercel.app
```

Expected: `200`.

---

### Task 6: Deploy backend to a PHP host (Render / Railway / Forge)

> This task documents the steps for deploying the Laravel backend. The instructions use Render as an example (free tier web service with PHP). Adjust for your provider.

- [ ] **Step 1: Set production environment variables on your hosting provider**

These must be set in your hosting platform's "Environment Variables" or `.env` settings — never commit secrets to git:

```
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-api-domain.com
APP_KEY=                          ← generate with: php artisan key:generate --show

DB_CONNECTION=mysql               ← or pgsql, depending on your host
DB_HOST=your-db-host
DB_PORT=3306
DB_DATABASE=conecta_tcc
DB_USERNAME=your-db-user
DB_PASSWORD=your-db-password

SANCTUM_STATEFUL_DOMAINS=         ← leave empty for stateless token auth

LOG_CHANNEL=stderr
LOG_LEVEL=error
```

Generate `APP_KEY` locally:
```bash
cd /home/supertgo/programas/conecta-tcc/backend
php artisan key:generate --show
```

Copy the output (e.g., `base64:abc...`) into your host's `APP_KEY` env var.

- [ ] **Step 2: Update allowed_origins in cors.php with the real Vercel domain**

After the Vercel deployment in Task 5 gives you the final URL, open `backend/config/cors.php` and replace:

```php
'https://your-app.vercel.app',     // Production — replace with real domain
```

with:

```php
'https://conecta-tcc-frontend.vercel.app',
```

- [ ] **Step 3: Commit the cors.php update**

```bash
cd /home/supertgo/programas/conecta-tcc/backend
git add config/cors.php
git commit -m "chore: set production Vercel domain in CORS allowed_origins"
```

- [ ] **Step 4: Run database migrations on production**

SSH into your server or use your host's console:

```bash
php artisan migrate --force
```

Expected output ends with:
```
INFO  Running migrations.
... migration files listed ...
```

- [ ] **Step 5: Verify the backend API is reachable**

```bash
curl -s -o /dev/null -w "%{http_code}" https://your-api-domain.com/up
```

Expected: `200` (Laravel's health check endpoint).

---

### Task 7: End-to-end smoke test

> Performs a manual walkthrough to confirm the full stack works in production. No automated test — this is a checklist.

- [ ] **Step 1: Register a new user**

1. Open `https://conecta-tcc-frontend.vercel.app/entrar` in a browser.
2. Click the "Cadastrar" tab.
3. Fill in name, email, password, and role (student or professor).
4. Submit the form.

Expected: redirect to the home page; user is logged in (name visible in header or no redirect to `/entrar`).

- [ ] **Step 2: Browse the proposals list**

1. Navigate to `https://conecta-tcc-frontend.vercel.app/propostas`.

Expected: list of proposals loads (or empty state if no proposals exist yet).

- [ ] **Step 3: As a student — apply to a proposal**

1. Log in as a student account.
2. Click any open proposal.
3. Click "Candidatar-se".

Expected: success toast; the proposal detail page shows the application as pending.

- [ ] **Step 4: As a professor — approve the application from the dashboard**

1. Log out, then log in as the professor who owns the proposal.
2. Navigate to `/dashboard`.
3. In "Candidaturas para revisar", click "Aprovar" next to the student's application.

Expected: success toast; the application disappears from the pending list; KPI "Vagas preenchidas" increases by 1.

- [ ] **Step 5: As a student — confirm the status update**

1. Log out, log back in as the student.
2. Navigate to `/minhas-candidaturas`.

Expected: the application shows status "Aprovada".

- [ ] **Step 6: Log out**

1. Click the logout button in the site header.

Expected: redirect to the home or login page; user is no longer authenticated (navigating to `/dashboard` redirects to `/entrar`).
