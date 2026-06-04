# Frontend — Claude Code Instructions

## After every task

Always run both commands before committing:

```bash
npm test
npx tsc --noEmit
```

Both must pass (zero test failures, zero type errors) before any commit.

## Architecture rules

- **No hardcoded domain data** (lists, enums, reference values) — always fetch from the API.
- **SiteHeader is rendered once** by the root layout in `src/router.tsx`. Pages must NOT render `<SiteHeader />`.
- **Named exports** — `ProposalCard`, `SiteHeader`, `ProposalFilters`, etc. are named exports, not default exports. Import accordingly.
- **Toast** — use `toast()` from `sonner` (not `useToast`). `<Toaster />` lives in `main.tsx`.

## Testing conventions

- MSW handlers live in `src/test/handlers/` and are registered in `src/test/server.ts`.
- Use `mockProposalsList`, `mockProposalDetail`, etc. helper functions from `src/test/server.ts` to override handlers per-test.
- Mock `useDepartments` / `useKnowledgeAreas` in component tests (they make network calls).
- Do not render `<SiteHeader />` inside test setups — it is not part of the component under test.
