# Scaffolding do Projeto Frontend — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bootstrap the frontend development environment with working dev server, test infrastructure, ESLint, Prettier, and a passing smoke test.

**Architecture:** The project is already scaffolded with Vite 7 + React 19 + TanStack Router. This plan installs dependencies, adds Vitest with jsdom and React Testing Library, configures ESLint and Prettier, verifies the `@/` path alias works, and confirms both `npm run dev` and `npm run build` succeed without errors.

**Tech Stack:** Vite 7, Vitest, @testing-library/react, @testing-library/user-event, jsdom, eslint-plugin-react-hooks, typescript-eslint, Prettier

---

### Task 1: Install Dependencies

**Files:**
- Modify: `frontend/package.json` (devDependencies section will be updated by npm)

- [ ] **Step 1: Install all dependencies**
```bash
cd conecta-tcc/frontend && npm install
```
Expected: `npm install` completes with no errors and creates/updates `bun.lockb`.

- [ ] **Step 2: Install test devDependencies**
```bash
cd conecta-tcc/frontend && npm install --save-dev vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom typescript-eslint
```
Expected: packages added to `devDependencies` in `package.json`.

- [ ] **Step 3: Verify node_modules are present**
```bash
ls conecta-tcc/frontend/node_modules/.bin/vitest
```
Expected: path printed (file exists).

- [ ] **Step 4: Commit**
```bash
cd conecta-tcc/frontend && git add package.json bun.lockb && git commit -m "chore: install dev dependencies (vitest, RTL, typescript-eslint)"
```

---

### Task 2: Configure Vitest

**Files:**
- Modify: `frontend/vite.config.ts`
- Create: `frontend/src/test/setup.ts`

- [ ] **Step 1: Update `vite.config.ts` to add Vitest config**

Replace the entire contents of `frontend/vite.config.ts` with:

```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
```

- [ ] **Step 2: Create `src/test/setup.ts`**

```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 3: Add test scripts to `package.json`**

In the `"scripts"` block of `frontend/package.json`, add:
```json
"test": "vitest run",
"test:watch": "vitest",
"test:ui": "vitest --ui"
```
The full scripts block becomes:
```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview",
  "lint": "eslint .",
  "format": "prettier --write src",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:ui": "vitest --ui"
}
```

- [ ] **Step 4: Update `tsconfig.json` to include test files and jest-dom types**

Add `"types": ["@testing-library/jest-dom"]` under `compilerOptions` and ensure the `include` array covers test files:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "types": ["@testing-library/jest-dom"],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

- [ ] **Step 5: Commit**
```bash
cd conecta-tcc/frontend && git add vite.config.ts src/test/setup.ts package.json tsconfig.json && git commit -m "chore: configure vitest with jsdom and React Testing Library"
```

---

### Task 3: Write and Run the Smoke Test

**Files:**
- Create: `frontend/src/test/smoke.test.tsx`

- [ ] **Step 1: Create the smoke test file**

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

function HelloWorld() {
  return <h1>Conecta TCC</h1>
}

describe('Smoke test', () => {
  it('renders a simple component', () => {
    render(<HelloWorld />)
    expect(screen.getByRole('heading', { name: 'Conecta TCC' })).toBeInTheDocument()
  })

  it('verifies @/ alias resolves utils', async () => {
    const { cn } = await import('@/lib/utils')
    expect(typeof cn).toBe('function')
    expect(cn('foo', 'bar')).toBe('foo bar')
  })
})
```

- [ ] **Step 2: Run the smoke test and confirm it FAILS before setup is correct (expected: it should pass)**
```bash
cd conecta-tcc/frontend && npm test
```
Expected output contains:
```
✓ src/test/smoke.test.tsx (2)
  ✓ Smoke test > renders a simple component
  ✓ Smoke test > verifies @/ alias resolves utils
Test Files  1 passed (1)
```

- [ ] **Step 3: Commit**
```bash
cd conecta-tcc/frontend && git add src/test/smoke.test.tsx && git commit -m "test: add smoke test for component rendering and path alias"
```

---

### Task 4: Configure ESLint

**Files:**
- Create: `frontend/eslint.config.js`

- [ ] **Step 1: Create `eslint.config.js`**

```javascript
import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'

export default tseslint.config(
  { ignores: ['dist', 'node_modules'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
)
```

- [ ] **Step 2: Install `globals` package (needed by eslint.config.js)**
```bash
cd conecta-tcc/frontend && npm install --save-dev globals
```
Expected: `globals` added to `devDependencies`.

- [ ] **Step 3: Run lint to verify config is valid**
```bash
cd conecta-tcc/frontend && npm run lint
```
Expected: exits with code 0 (no output or warnings only — no errors).

- [ ] **Step 4: Commit**
```bash
cd conecta-tcc/frontend && git add eslint.config.js package.json bun.lockb && git commit -m "chore: add eslint config with react-hooks and typescript-eslint rules"
```

---

### Task 5: Configure Prettier

**Files:**
- Create: `frontend/.prettierrc`

- [ ] **Step 1: Create `.prettierrc`**

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

- [ ] **Step 2: Run Prettier to verify it works**
```bash
cd conecta-tcc/frontend && npm run format
```
Expected: formats files in `src/` with no errors.

- [ ] **Step 3: Create `.prettierignore`**

```
dist
node_modules
bun.lockb
```

- [ ] **Step 4: Commit**
```bash
cd conecta-tcc/frontend && git add .prettierrc .prettierignore && git commit -m "chore: add prettier config with project code style"
```

---

### Task 6: Create Favicon

**Files:**
- Create: `frontend/public/favicon.svg`

- [ ] **Step 1: Create `public/favicon.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
  <rect width="32" height="32" rx="8" fill="hsl(221.2, 83.2%, 53.3%)"/>
  <text x="50%" y="55%" font-family="system-ui, sans-serif" font-size="18" font-weight="700"
        fill="white" text-anchor="middle" dominant-baseline="middle">C</text>
</svg>
```

- [ ] **Step 2: Verify `index.html` references the favicon**

Check that `frontend/index.html` contains:
```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
```
If not, add it inside the `<head>` tag.

- [ ] **Step 3: Commit**
```bash
cd conecta-tcc/frontend && git add public/favicon.svg && git commit -m "chore: add Conecta TCC favicon SVG"
```

---

### Task 7: Final Verification

**Files:** (none new)

- [ ] **Step 1: Run all tests**
```bash
cd conecta-tcc/frontend && npm test
```
Expected:
```
Test Files  1 passed (1)
Tests       2 passed (2)
```

- [ ] **Step 2: Run lint**
```bash
cd conecta-tcc/frontend && npm run lint
```
Expected: exits with code 0.

- [ ] **Step 3: Run build**
```bash
cd conecta-tcc/frontend && npm run build
```
Expected: ends with `✓ built in` and creates `dist/` folder without TypeScript errors.

- [ ] **Step 4: Verify dev server starts**
```bash
cd conecta-tcc/frontend && timeout 10 npm run dev || true
```
Expected: output contains `Local: http://localhost:5173/` before timeout.

- [ ] **Step 5: Commit final state**
```bash
cd conecta-tcc/frontend && git add -A && git commit -m "chore: scaffolding complete — dev/build/lint/test all passing"
```
