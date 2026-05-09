# [SETUP] Scaffolding do projeto frontend

## Contexto

O diretório `frontend/` já foi criado com a estrutura de pastas e arquivos de configuração base (package.json, vite.config.ts, tsconfig.json, tailwind, components.json).

Esta issue cobre a **inicialização do ambiente de desenvolvimento**: instalar dependências, verificar que o `vite dev` sobe corretamente e configurar o ESLint/Prettier.

## Tarefas

- [ ] Executar `bun install` (ou `npm install`) dentro de `frontend/`
- [ ] Confirmar que `bun dev` sobe sem erros em `http://localhost:5173`
- [ ] Verificar que o alias `@/` funciona corretamente (importar de `@/lib/utils`)
- [ ] Adicionar `eslint.config.js` com regras para React Hooks e TypeScript
- [ ] Adicionar `.prettierrc` com configuração padrão do projeto
- [ ] Criar `public/favicon.svg` com o ícone do Conecta TCC

## Critério de aceite

- `bun dev` sobe sem warnings ou erros de compilação
- `bun build` gera o dist sem erros
- ESLint e Prettier funcionam via `bun lint` e `bun format`

## Arquivos envolvidos

```
frontend/
├── package.json          ← já criado
├── vite.config.ts        ← já criado
├── tsconfig.json         ← já criado
├── .env.example          ← já criado
├── eslint.config.js      ← criar
├── .prettierrc           ← criar
└── public/
    └── favicon.svg       ← criar
```

## Não tem dependências anteriores
