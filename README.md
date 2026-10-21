# KHOJ — Sathi ho ki imposter?

A working mobile-first Nepali social deduction game. Includes a free Render launch configuration. Product name is configured with `NEXT_PUBLIC_APP_NAME` (metadata and artwork still use KHOJ).

## Start locally

Requires Node.js 22+ (tested with 24), npm, and Microsoft Edge for the configured E2E suite.

```powershell
npm ci
npm run dev
```

Open http://localhost:3000. Pass-the-phone needs no account, database, or API. Development online rooms and editorial content use atomic files under ignored `.data/`; one Node process only. Do not expose the development server publicly.

Production preview, including offline/PWA support:

```powershell
npm run build
npm run start:test
```

`start:test` enables development file storage and a **publicly known test-only admin token**. For real production use `npm start`, PostgreSQL, HTTPS and your own `ADMIN_TOKEN`. Never deploy `start:test`.

## Features

- 3–20 players; independent cryptographic role shuffles; private reveal/hide; discussion timer; locked voting; final guess; scoring and rematches.
- Classic, quick play, Chaos prompts, and related-word Undercover; custom CSV/JSON packs; local scores/settings in IndexedDB.
- Server-authoritative six-character private rooms, HttpOnly guest cookies, host controls, readiness, polling synchronization, reconnect, private voting and scoreboards.
- 252 distinct AI-authored starter entries, 30 categories, **0 independently editorially reviewed entries**. Alcohol vocabulary excluded from default gameplay. No 2,000-word or human-review claims.
- Roman Nepali, Devanagari and English for core game controls; word language can be changed separately. Some marketing, help, admin and multiplayer copy remains English (see ROADMAP).
- Installable production PWA with offline pages, bundled vocabulary and cached assets; safe versioned service-worker activation.
- Token-protected editorial workspace with search, editing, duplicate-checked import/export, approval/rejection, audit and published snapshots.

## Routes

`/` setup and mode selection · `/play` private game/discussion/voting/results · `/online` join/lobby/remote game · `/custom` local packs · `/library` searchable content/coverage · `/settings` languages/sound/scoreboard · `/rules` English/Nepali help · `/admin` content workspace · `/offline` fallback.

## Stack

Next.js 16 App Router, React 19, TypeScript, Tailwind 4 + original CSS design tokens, Motion, Lucide, Zustand, Zod, IndexedDB/idb, PostgreSQL/pg, Prisma 7 schema/migrations/seed tooling, Vitest and Playwright. No paid or AI runtime services. Polling was chosen over Supabase to work without a service account. No shadcn dependency was needed for these original components.

## Checks

```powershell
npm run db:generate
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
npm run content:audit
```

For another browser, change the Playwright project channel or install Chromium. See TESTING.md for results and verification limits.

## Production database

Copy `.env.example` to `.env` and fill secrets. Prisma tooling reads environment from the invoking shell (the Next app reads `.env`); export `DATABASE_URL` for CLI commands, or invoke Node with `--env-file=.env`.

```powershell
$env:DATABASE_URL='postgresql://postgres:postgres@localhost:5432/khoj'
npm run db:migrate
npm run db:seed
```

Do not run seed against an unrelated database. The seed is idempotent and never grants editorial approval. Runtime room/content aggregates use `StateDocument` with PostgreSQL transactional advisory locks; normalized tables provide the scalable expansion target and are populated by the seed. They are not yet a second live mirror of every online action.

Read ARCHITECTURE.md, GAME_RULES.md, WORD_LIBRARY.md, CONTENT_GUIDELINES.md, MULTIPLAYER_SECURITY.md, DEPLOYMENT.md, TESTING.md and ROADMAP.md before launch.

## Free Render preview

`render.yaml` configures a free Singapore web service using temporary, transactionally serialized in-memory rooms. Set ALLOW_EPHEMERAL_ROOMS=true and NEXT_PUBLIC_EPHEMERAL_ROOMS=true. No database, paid plan or custom domain is required. Rooms reset on server sleep/restart; editorial publishing needs a database and is disabled in this mode. Guest cookies remain Secure on HTTPS. Pass-the-phone, local scores and custom packs continue to use the device.

For a live smoke test, set KHOJ_TEST_URL to the hosted HTTPS URL and run `npm run test:e2e -- e2e/online.spec.ts --grep "three browsers"`. Do not run the known test-admin credential against public hosting.
