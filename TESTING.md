# Testing

Vitest covers role counts for 3–20 players, invalid counts/names, reveal order, transitions, locked/self/out-of-range voting, ties, multi-imposter cutoffs, abstentions, scoring, guesses, timeouts, Undercover, normalization, CSV parsing, category filtering, recent-word exhaustion, 30-category coverage, language fallback and server-side room authorization/projection/rematches.

Playwright uses the installed Microsoft Edge (Chromium), production build, fresh browser contexts and the local file adapter. Specs exercise 3/6 players, multiple imposters, rematches, language switching, custom packs, cancellation, 360px layout, hidden-card DOM, offline reload and play, and three-context online joins/reconnect/voting/rematches. API requests assert missing session/admin authorization and no complete role array/token hashes.

Run `npm run build` before `npm run test:e2e`; the suite starts the test server if port 3000 is unused. `npm run start:test` uses an explicitly test-only admin token and must not be deployed. Browser artifacts go into ignored test-results. Use `npx playwright install chromium` and remove the channel setting if Edge is unavailable.

Verification results are recorded in docs/VERIFICATION.md after execution. Not verified: real PostgreSQL migration/seed/concurrent process operation, Safari/iOS installation, Firefox, assistive technology/manual screen reader, 20-device load and production hardening. A schema validation is not proof that migrations ran against PostgreSQL.
