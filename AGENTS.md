# SIM-Alfida

Sebuah sistem informasi manajemen pegawai, karyawan serta tenaga penagar di lingkungan Yayasan Alfida

This file gives AI coding agents the context they need to work effectively in this repository. It is read by [Codex](https://openai.com/codex), [Cursor](https://cursor.com), [Sourcegraph Amp](https://ampcode.com), [Aider](https://aider.chat), [Jules](https://jules.google), and other agents that follow the [AGENTS.md spec](https://agents.md).

## Stack

- **Framework**: Next.js (React · App Router)
- **Database & Auth**: Supabase (PostgreSQL & Supabase Auth SSR)
- **ORM**: Prisma (Connected via Supabase Transaction Pooler)
- **Icons**: Material UI Icons (Google) — Never use emojis for icons.

## Setup

- **install**: `pnpm install`
- **dev**: `pnpm dev`
- **build**: `pnpm build`
- **lint**: `pnpm lint`
- **test**: `pnpm test`
- **typecheck**: `pnpm tsc --noEmit`

## Code Style

- **TypeScript everywhere** — Use TypeScript for new files. Avoid any — prefer unknown and narrow.
- **ESLint enforced** — Run pnpm lint --fix before committing. Never disable rules without a comment explaining why.
- **Prettier formatting** — Auto-format on save. Don't hand-format.
- **Tailwind CSS** — Use utility classes. Extract to a component when patterns repeat 3+ times.
- **Naming conventions** — kebab-case files, PascalCase components, camelCase variables, SCREAMING_SNAKE for env vars.
- **Sorted imports** — Group external → internal → relative. Path aliases over deep relative imports.

## Testing

- **Vitest for unit tests** — Co-locate *.test.ts with the source file. Cover the happy path and at least one edge case.
- **Playwright for e2e** — E2E specs in tests/e2e. Run pnpm test:e2e.
- **Accessibility checks** — Run automated a11y assertions on critical pages. Manual keyboard test before merging UI changes.

## Security

- **Never commit secrets** — No API keys, tokens, or credentials in code. Use .env.local (gitignored) and .env.example for templates.
- **Validate all external input** — Schema-validate request bodies, URL params, and untrusted JSON with Zod or Valibot.
- **Server-side auth checks** — Every API route must check authentication AND authorization on the server. Don't rely on client guards.

## Pull Requests & Commits

- **Conventional Commits** — Use feat:, fix:, chore:, etc. Imperative mood, lowercase, no period.
- **Small, focused PRs** — One logical change per PR. Aim for < 400 lines of diff. Split larger work into stacked PRs.
- **Tests with the change** — New behavior gets new tests in the same PR. Bug fixes include a regression test.
- **Run checks before pushing** — Run pnpm lint && pnpm test && pnpm build locally. Don't push red PRs.
