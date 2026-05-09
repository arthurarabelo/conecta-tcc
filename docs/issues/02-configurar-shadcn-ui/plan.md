# Configurar Shadcn/ui — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Install all required Shadcn/ui components and verify they render correctly with the project's Tailwind v4 theme variables.

**Architecture:** Shadcn/ui components are added via the CLI which generates source files in `src/components/ui/`. The project already has `components.json` (New York style, `@/lib/utils` for `cn()`). Theme variables are split across three files: `src/styles/colors.css` (all `--color-*` tokens), `src/styles/typography.css` (fonts, sizes, weights), and `src/styles/theme.css` (radii, shadows, spacing) — all imported by `src/styles.css`. Tests verify components render using React Testing Library against the jsdom environment configured in issue 01.

**Tech Stack:** Shadcn/ui CLI (npx shadcn@latest), Tailwind CSS v4, Radix UI primitives (already in dependencies), Vitest + React Testing Library

---

### Task 1: Install Form and Input Components

**Files:**
- Create: `frontend/src/components/ui/button.tsx`
- Create: `frontend/src/components/ui/input.tsx`
- Create: `frontend/src/components/ui/label.tsx`
- Create: `frontend/src/components/ui/textarea.tsx`
- Create: `frontend/src/components/ui/checkbox.tsx`
- Create: `frontend/src/components/ui/form.tsx`

- [ ] **Step 1: Add button, input, label**
```bash
cd conecta-tcc/frontend && npx shadcn@latest add button input label --yes
```
Expected: files created at `src/components/ui/button.tsx`, `src/components/ui/input.tsx`, `src/components/ui/label.tsx`.

- [ ] **Step 2: Add textarea and checkbox**
```bash
cd conecta-tcc/frontend && npx shadcn@latest add textarea checkbox --yes
```
Expected: files created at `src/components/ui/textarea.tsx`, `src/components/ui/checkbox.tsx`.

- [ ] **Step 3: Add form (depends on label and input)**
```bash
cd conecta-tcc/frontend && npx shadcn@latest add form --yes
```
Expected: file created at `src/components/ui/form.tsx`.

- [ ] **Step 4: Verify files exist**
```bash
ls conecta-tcc/frontend/src/components/ui/
```
Expected: output includes `button.tsx`, `input.tsx`, `label.tsx`, `textarea.tsx`, `checkbox.tsx`, `form.tsx`.

- [ ] **Step 5: Commit**
```bash
cd conecta-tcc/frontend && git add src/components/ui/ && git commit -m "feat: add shadcn form and input components (button, input, label, textarea, checkbox, form)"
```

---

### Task 2: Install Display Components

**Files:**
- Create: `frontend/src/components/ui/card.tsx`
- Create: `frontend/src/components/ui/badge.tsx`
- Create: `frontend/src/components/ui/separator.tsx`
- Create: `frontend/src/components/ui/avatar.tsx`
- Create: `frontend/src/components/ui/skeleton.tsx`

- [ ] **Step 1: Add card, badge, separator**
```bash
cd conecta-tcc/frontend && npx shadcn@latest add card badge separator --yes
```
Expected: files created at `src/components/ui/card.tsx`, `src/components/ui/badge.tsx`, `src/components/ui/separator.tsx`.

- [ ] **Step 2: Add avatar and skeleton**
```bash
cd conecta-tcc/frontend && npx shadcn@latest add avatar skeleton --yes
```
Expected: files created at `src/components/ui/avatar.tsx`, `src/components/ui/skeleton.tsx`.

- [ ] **Step 3: Verify files exist**
```bash
ls conecta-tcc/frontend/src/components/ui/
```
Expected: output includes `card.tsx`, `badge.tsx`, `separator.tsx`, `avatar.tsx`, `skeleton.tsx`.

- [ ] **Step 4: Commit**
```bash
cd conecta-tcc/frontend && git add src/components/ui/ && git commit -m "feat: add shadcn display components (card, badge, separator, avatar, skeleton)"
```

---

### Task 3: Install Overlay and Navigation Components

**Files:**
- Create: `frontend/src/components/ui/dialog.tsx`
- Create: `frontend/src/components/ui/select.tsx`
- Create: `frontend/src/components/ui/toast.tsx`
- Create: `frontend/src/components/ui/toaster.tsx`
- Create: `frontend/src/components/ui/dropdown-menu.tsx`

- [ ] **Step 1: Add dialog and select**
```bash
cd conecta-tcc/frontend && npx shadcn@latest add dialog select --yes
```
Expected: files created at `src/components/ui/dialog.tsx`, `src/components/ui/select.tsx`.

- [ ] **Step 2: Add toast and dropdown-menu**
```bash
cd conecta-tcc/frontend && npx shadcn@latest add toast dropdown-menu --yes
```
Expected: files created at `src/components/ui/toast.tsx`, `src/components/ui/toaster.tsx` (shadcn toast adds both), `src/components/ui/dropdown-menu.tsx`.

- [ ] **Step 3: Verify all 15 component files are present**
```bash
ls conecta-tcc/frontend/src/components/ui/
```
Expected: output includes all of: `avatar.tsx`, `badge.tsx`, `button.tsx`, `card.tsx`, `checkbox.tsx`, `dialog.tsx`, `dropdown-menu.tsx`, `form.tsx`, `input.tsx`, `label.tsx`, `select.tsx`, `separator.tsx`, `skeleton.tsx`, `textarea.tsx`, `toast.tsx`.

- [ ] **Step 4: Commit**
```bash
cd conecta-tcc/frontend && git add src/components/ui/ && git commit -m "feat: add shadcn overlay and navigation components (dialog, select, toast, dropdown-menu)"
```

---

### Task 4: Write Failing Test — Button Component

**Files:**
- Create: `frontend/src/components/ui/button.test.tsx`

- [ ] **Step 1: Write the failing test first (TDD)**

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('renders with text content', () => {
    render(<Button>Teste</Button>)
    expect(screen.getByRole('button', { name: 'Teste' })).toBeInTheDocument()
  })

  it('applies the default variant class', () => {
    render(<Button>Click me</Button>)
    const btn = screen.getByRole('button', { name: 'Click me' })
    expect(btn).toHaveClass('bg-primary')
  })

  it('applies the destructive variant class', () => {
    render(<Button variant="destructive">Delete</Button>)
    const btn = screen.getByRole('button', { name: 'Delete' })
    expect(btn).toHaveClass('bg-destructive')
  })

  it('calls onClick handler when clicked', async () => {
    const user = userEvent.setup()
    let clicked = false
    render(<Button onClick={() => { clicked = true }}>Click</Button>)
    await user.click(screen.getByRole('button', { name: 'Click' }))
    expect(clicked).toBe(true)
  })

  it('is disabled when disabled prop is passed', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button', { name: 'Disabled' })).toBeDisabled()
  })
})
```

- [ ] **Step 2: Run tests — expect them to PASS (Button is already installed)**
```bash
cd conecta-tcc/frontend && npm test src/components/ui/button.test.tsx
```
Expected:
```
✓ src/components/ui/button.test.tsx (5)
  ✓ Button > renders with text content
  ✓ Button > applies the default variant class
  ✓ Button > applies the destructive variant class
  ✓ Button > calls onClick handler when clicked
  ✓ Button > is disabled when disabled prop is passed
Test Files  1 passed (1)
```

- [ ] **Step 3: Commit**
```bash
cd conecta-tcc/frontend && git add src/components/ui/button.test.tsx && git commit -m "test: add Button component unit tests"
```

---

### Task 5: Verify Theme Variables and cn() Usage

**Files:**
- Create: `frontend/src/components/ui/theme.test.tsx`

- [ ] **Step 1: Verify `cn()` is used inside generated components**
```bash
grep -l "cn(" conecta-tcc/frontend/src/components/ui/*.tsx
```
Expected: every `.tsx` file in `src/components/ui/` is listed (all components import and use `cn` from `@/lib/utils`).

- [ ] **Step 2: Verify `@/lib/utils` exports `cn` correctly**
```bash
grep "from '@/lib/utils'" conecta-tcc/frontend/src/components/ui/button.tsx
```
Expected: line like `import { cn } from '@/lib/utils'`.

- [ ] **Step 3: Write a test confirming Card component composes with theme classes**

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

describe('Theme and cn() integration', () => {
  it('renders Card with composed children', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Proposta de TCC</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Conteúdo da proposta</p>
        </CardContent>
      </Card>
    )
    expect(screen.getByText('Proposta de TCC')).toBeInTheDocument()
    expect(screen.getByText('Conteúdo da proposta')).toBeInTheDocument()
  })

  it('renders Badge with variant', () => {
    render(<Badge variant="secondary">Em aberto</Badge>)
    expect(screen.getByText('Em aberto')).toBeInTheDocument()
  })

  it('cn() merges conflicting tailwind classes correctly', () => {
    // tailwind-merge removes bg-red-500 when bg-blue-500 is later
    const result = cn('bg-red-500', 'bg-blue-500')
    expect(result).toBe('bg-blue-500')
  })

  it('cn() handles conditional classes', () => {
    const isActive = true
    const result = cn('base-class', isActive && 'active-class', !isActive && 'inactive-class')
    expect(result).toBe('base-class active-class')
  })
})
```

- [ ] **Step 4: Run theme integration tests**
```bash
cd conecta-tcc/frontend && npm test src/components/ui/theme.test.tsx
```
Expected:
```
✓ src/components/ui/theme.test.tsx (4)
  ✓ Theme and cn() integration > renders Card with composed children
  ✓ Theme and cn() integration > renders Badge with variant
  ✓ Theme and cn() integration > cn() merges conflicting tailwind classes correctly
  ✓ Theme and cn() integration > cn() handles conditional classes
Test Files  1 passed (1)
```

- [ ] **Step 5: Verify colors.css has required theme variables**
```bash
grep -c "color-primary\|color-destructive\|color-background\|color-foreground" conecta-tcc/frontend/src/styles/colors.css
```
Expected: number >= 4 (all four variables present in `src/styles/colors.css`).

- [ ] **Step 6: Commit**
```bash
cd conecta-tcc/frontend && git add src/components/ui/theme.test.tsx && git commit -m "test: add theme and cn() integration tests for shadcn components"
```

---

### Task 6: Final Verification

**Files:** (none new)

- [ ] **Step 1: Run all tests**
```bash
cd conecta-tcc/frontend && npm test
```
Expected:
```
Test Files  3 passed (3)
Tests       11 passed (11)
```

- [ ] **Step 2: Run build to confirm no TypeScript errors in generated components**
```bash
cd conecta-tcc/frontend && npm run build
```
Expected: ends with `✓ built in` — no TypeScript compilation errors.

- [ ] **Step 3: Count generated components**
```bash
ls conecta-tcc/frontend/src/components/ui/*.tsx | wc -l
```
Expected: number >= 15 (all required components present).
