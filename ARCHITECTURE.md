# Architecture

## Boundaries

`src/lib/game.ts` is the pure transition/scoring engine. `src/lib/words.ts` owns Zod schemas, normalization, imports and balanced selection. `src/data/seed.ts` is authored static data. `src/lib/i18n.ts` contains core translations and English fallback. Components are route-oriented. Zustand holds the active offline round only in memory; IndexedDB stores custom/published packs, preferences, recently used word IDs and final scores. Hidden roles are never persisted. Reloading ends a local round. Local rounds render inside the preloaded home shell so offline startup requires no route fetch.

`src/lib/server/rooms.ts` is authoritative. Clients submit actions, never assignments or full state. Session-derived player index overrides any forged player field. `project()` explicitly constructs the public view and own-card payload. Tokens are 256-bit random values, stored hashed server-side, carried by room-scoped HttpOnly cookies. A six-character room code is an invitation, not an identity credential.

## Persistence and synchronization

PostgreSQL `StateDocument` stores aggregate JSON for rooms and content. Each mutation (including timer settlement) locks the key with a transaction-scoped advisory lock, reads, validates, mutates and writes atomically. Requests poll every 1.5 seconds; deadlines originate on the server, and projections include server time. Actions are serialized and duplicate votes/reveals/guesses are rejected. Scored-round ID prevents duplicate score settlement. Local development uses a serialized atomic file adapter; it is not multi-process safe. Production refuses online storage without DATABASE_URL unless explicitly set to unsafe local-test mode.

The Prisma schema also models categories with parent relations, translations, aliases, sources, reviews, packs, memberships, reports, audits, participants, rounds, roles, votes and scores. The Prisma seed populates normalized content and the runtime aggregate. Admin edits currently update the aggregate; a million-entry release needs the indexed normalized content repository, pagination and lazy category packs, not a giant JSON object or bundle.

## Selection

Family-friendly starter entries and locally supplied/published words form the pool. Filter by category and difficulty, exclude recently played IDs if alternatives exist, select a category uniformly, then weight words inversely by play count. Roles use Fisher–Yates with Web Crypto. Individual role odds are equal each round; no exposure of prior role assignments is used for balancing.

## Offline lifecycle

Production-only service worker pre-caches the shell routes and discovers their static script/style assets. API responses are never cached. IndexedDB uses version 1; pack replacement occurs in a single write after validation. Existing service workers finish naturally before a new cache activates. Online secrets are never added to browser storage. Offline mode needs a successful first install on localhost or HTTPS. Test airplane mode after installing and loading the app.

## Extension

Add categories in `categoryNames` and Prisma Category rows. Add translations by extending Language and every dictionary; `translate` falls back to English. Add mode logic in the engine, add projection fields explicitly, then test authorization and UI flows. Change branding through the environment plus metadata/manifest/artwork for a complete rebrand.
