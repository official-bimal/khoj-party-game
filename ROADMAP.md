# Roadmap and honest limits

The shipped slice prioritizes a complete local game, private online room flow, transparent content, custom packs and editorial tools.

Before public launch:

- Independently review/correct the 252 starter entries; source a diverse, licensed collection toward 2,000 playable words. No human-reviewed claim until this happens.
- Verify migrations, seed, lock/concurrency semantics, failover and backups against real PostgreSQL. Add distributed rate limiting and expiration cleanup. Automatic host migration/kick remains absent.
- Finish localization of marketing, help, admin and all online copy; review natural Nepali with speakers. Core controls and separate word language work in three modes.
- Test PWA install/update on Android/iOS and screen-reader/keyboard flows. Browsers cannot enforce physical pass-phone privacy.
- Expand Chaos with optional double-imposter/sudden-death/extra-clue events; existing Chaos has prompts/order/timer/bonus. Base scoring is configurable and local leaderboards are separated by mode.
- Replace aggregate content storage and full starter bundle with normalized paginated repository and downloadable category packs before 100,000+ entries. Add public content reports, report moderation, category/translation management UI, precise themed pack memberships and per-word analytics.
- Add QR invitations, optional ephemeral moderated chat, richer muted-by-default sound/countdown/confetti, and repeat-streak statistics. These are not present in the current build.
- Keep independent fair role draws, or implement a documented long-term balance policy without exposing assignments. Current draws are independent, not guaranteed rotation.

The current release is not represented as fully production-ready. These gaps are explicit rather than hidden behind nonfunctional controls.
