# SIM-Alfida

Sebuah sistem informasi manajemen pegawai, karyawan serta tenaga penagar di lingkungan Yayasan Alfida

This file gives AI coding agents the context they need to work effectively in this repository. It is read by [Codex](https://openai.com/codex), [Cursor](https://cursor.com), [Sourcegraph Amp](https://ampcode.com), [Aider](https://aider.chat), [Jules](https://jules.google), and other agents that follow the [AGENTS.md spec](https://agents.md).

## Stack

- **Monorepo**: Turborepo (pnpm workspaces)
- **Frontend**: Next.js (React · App Router) — `apps/web`
- **Backend**: NestJS (REST API) — `apps/api`
- **Auth**: Supabase Auth (SSR) — hanya untuk autentikasi
- **Database**: PostgreSQL (Docker lokal atau Supabase) — Prisma ORM di `packages/database`
- **Storage**: Cloudinary (Image & PDF storage)
- **Icons**: Material UI Icons (Google) — Never use emojis for icons.

## Setup

- **install**: `pnpm install` (root — installs all workspaces)
- **dev**: `pnpm dev` (starts both web & api concurrently via Turborepo)
- **dev:web**: `pnpm --filter web dev` (frontend only)
- **dev:api**: `pnpm --filter api start:dev` (backend only)
- **build**: `pnpm build` (builds all packages via Turborepo pipeline)
- **lint**: `pnpm lint`
- **test**: `pnpm test`
- **typecheck**: `pnpm --filter web tsc --noEmit && pnpm --filter api tsc --noEmit`

## Code Style

- **TypeScript everywhere** — Use TypeScript for new files. Avoid any — prefer unknown and narrow.
- **ESLint enforced** — Run pnpm lint --fix before committing. Never disable rules without a comment explaining why.
- **Prettier formatting** — Auto-format on save. Don't hand-format.
- **Tailwind CSS** — Use utility classes. Extract to a component when patterns repeat 3+ times.
- **Naming conventions** — kebab-case files, PascalCase components, camelCase variables, SCREAMING_SNAKE for env vars.
- **Sorted imports** — Group external → internal → relative. Path aliases over deep relative imports.

## Monorepo Workspace Rules

- **`apps/web/`** — Hanya berisi kode UI (React Components, Pages, Layouts). TIDAK BOLEH ada import Prisma atau logika bisnis.
- **`apps/api/`** — Hanya berisi kode Backend (NestJS Controllers, Services, Guards). TIDAK BOLEH ada komponen React.
- **`packages/database/`** — Prisma schema, generated client, dan seed scripts. Di-import oleh `apps/api`.
- **`packages/shared/`** — TypeScript interfaces, Zod schemas, dan utility functions. Di-import oleh kedua apps.
- **Komunikasi Frontend ↔ Backend**: Gunakan `fetch()` atau library HTTP client (axios/ky) untuk memanggil REST API NestJS. JANGAN gunakan Server Actions untuk operasi database.

## Testing

- **Vitest for unit tests** — Co-locate *.test.ts with the source file. Cover the happy path and at least one edge case.
- **Playwright for e2e** — E2E specs in tests/e2e. Run pnpm test:e2e.
- **Accessibility checks** — Run automated a11y assertions on critical pages. Manual keyboard test before merging UI changes.

## Security

- **Never commit secrets** — No API keys, tokens, or credentials in code. Use .env.local (gitignored) and .env.example for templates.
- **Validate all external input** — Schema-validate request bodies, URL params, and untrusted JSON with Zod or Valibot.
- **Server-side auth checks** — Every NestJS endpoint must use Guards for authentication AND authorization. Don't rely on client guards. Next.js middleware hanya untuk redirect unauthenticated users.

## Pull Requests & Commits

- **Conventional Commits** — Use feat:, fix:, chore:, etc. Imperative mood, lowercase, no period.
- **Small, focused PRs** — One logical change per PR. Aim for < 400 lines of diff. Split larger work into stacked PRs.
- **Tests with the change** — New behavior gets new tests in the same PR. Bug fixes include a regression test.
- **Run checks before pushing** — Run pnpm lint && pnpm test && pnpm build locally. Don't push red PRs.
