# KHOJ implementation report

Hosting update: the owner subsequently authorized a free public preview at https://khoj-party-game.onrender.com. See [LIVE_DEPLOYMENT.md](LIVE_DEPLOYMENT.md) for verified status and temporary-room limits. The implementation report below records the original local delivery.

## What is built

A functional Next.js application in `C:\Users\user\Desktop\khoj`. It is locally built and tested; no external hosting, paid infrastructure, DNS or deployment was used.

## Working features

- Pass-the-phone and quick play for 3–20 players, valid imposter counts, optional names, category/difficulty selection, deliberate private reveal/hide, blur hiding, timer, voting, abstentions, ties, caught-imposter guesses, configurable scoring, results and rematches.
- Undercover related-word rounds, Chaos prompts/order/timer variations/bonus, and separate local leaderboards by mode.
- Custom CSV/JSON words, Unicode/alias/ID deduplication, import/export, local persistence and mixing packs.
- Private online rooms, guest nicknames, six-character invite codes/links, lobby/readiness, host control/transfer/closure, private role delivery, server deadlines, secret votes, reconnect, scores and rematches. State is authoritative and synchronized by 1.5-second polling.
- Roman Nepali, Devanagari and English core controls, with separate word-language preference. Some secondary text remains English.
- Production-only installable PWA, offline shell/assets and bundled words, IndexedDB preferences/packs/scores. Verified offline reload followed by a complete round.
- Protected admin import/edit/export/search/review/audit/publish workflow, with separately published approved snapshots and client pack updates.

## Content and categories

**252 distinct starter entries. 0 independently editorially reviewed starter entries.** The target of 2,000 reliable reviewed words was not fabricated. Entries are labelled AI-authored drafts. Default play excludes alcohol-related vocabulary.

All 30 requested categories are represented: food; street food; drinks; celebrities; actors/actresses; singers; comedians; YouTubers/creators; movies; songs/music; cricket; football; sports personalities; cities; villages/districts; mountains; tourist destinations; temples/landmarks; festivals; traditions/culture; household objects; school/college; slang; Gen Z; memes/internet; relationships/family; transportation; animals/nature; brands/products; everyday global objects.

Coverage and actual easy/medium/hard distributions are recorded in `docs/content-audit.txt` and reproduced by `npm run content:audit`. Hard starter coverage is zero. Theme mixes use broad category presets rather than precise editorial pack memberships.

## Screens and routes

`/`: landing, modes, players, categories, difficulty and setup. Local gameplay runs in this already-loaded shell to preserve offline state. `/play`: standalone game route. `/online`: create/join, lobby, private cards, discussion, voting, guess, results/scoreboard. `/custom`: pack manager. `/library`: vocabulary and coverage. `/settings`: language, sound and mode-specific leaderboard. `/rules`: English and Nepali help. `/admin`: protected content tools. `/offline` and not-found/error screens provide fallbacks. Manifest, sitemap and robots routes are present.

## Technology

Next.js 16.4.2 App Router, React 19.3, TypeScript 6, Tailwind 4, Motion 14, Lucide, Zustand 5, Zod 4, idb/IndexedDB, PostgreSQL/pg, Prisma 7.10.1 schema/migrations/seed, Vitest 5 and Playwright 1.64 with Microsoft Edge. Original CSS components and code-drawn mascot; no copied reference assets. Webpack build is used because Turbopack's local CSS worker failed in this environment.

## Verification and security

See `docs/VERIFICATION.md` for the executed results and their limits. Private API projections omit other players' roles, tokens and votes before results; authority derives from HttpOnly room cookies, not submitted player IDs. Tests cover forged actions, cross-room access and duplicate votes. Runtime dependency audit found no known advisories. Five transitive high advisory entries remain in development lint tooling through the same unpatched `braces` advisory; this is documented, not presented as a clean full audit.

## Known limits

This is **not claimed as fully production-ready**. PostgreSQL schema/client/migration generation validate, but no live PostgreSQL service was available for migration, seed or multi-instance concurrency tests. Browser integration used the persistent single-process local file adapter. Content needs independent Nepali editorial review; full secondary-screen localization and public content-report workflows remain unfinished. Distributed abuse protection, expired-record retention, load tests, automatic host failover and iOS/Android installation validation remain release work. QR invitations, optional chat, richer audio/confetti, sophisticated Chaos events and million-entry content delivery are not implemented. Admin manages entries/translations in the JSON editor; dedicated category and report-management screens remain future work.

## Run locally

```powershell
npm ci
npm run dev
```

Open `http://localhost:3000`. Development requires no database for ordinary play. For the production PWA browser test environment, run `npm run build` then `npm run start:test`. That command uses an explicitly test-only admin token and must never be deployed. For a real production server, use `npm start` with your own `DATABASE_URL`, `ADMIN_TOKEN` and exact HTTPS `APP_ORIGIN`.

## Deployment requirements and next improvements

Read DEPLOYMENT.md before deployment. Apply the included migration with `npm run db:migrate`, populate content with `npm run db:seed`, and test against the actual PostgreSQL instance. Add trusted-proxy distributed rate limits, retention cleanup and backups. Obtain independent content review, complete localization and test native PWA installation. Move high-volume content reads/admin operations from aggregate JSON to normalized indexed Prisma tables and paginated versioned packs before growing beyond the starter collection. The schema provides that expansion target; the current app does not claim to serve a million-entry library.
