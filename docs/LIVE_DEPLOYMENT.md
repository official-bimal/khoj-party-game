# Live free preview — 21 October 2026

Public game: https://khoj-party-game.onrender.com
Source (public, explicitly approved by owner): https://github.com/official-bimal/khoj-party-game
Dashboard: https://dashboard.render.com/web/srv-dbc36uu1egvs739be0tg

## Confirmed deployment

- Provider: Render; plan: free; region: Singapore; one web instance.
- Workspace: My Workspace, explicitly selected by the owner.
- Service ID: srv-dbc36uu1egvs739be0tg.
- Final deployment ID: dep-dbc3e44s728c73ds0rlg, confirmed live.
- Application commit: 82a0fa4fa1cf9319f03ac5fd4faa4bc7ffe06199.
- Build: npm ci --include=dev && npm run build.
- Start: npm start -- --hostname 0.0.0.0 (Render PORT supplied automatically).
- Node: 24.19.0; APP_ORIGIN: https://khoj-party-game.onrender.com.
- ALLOW_EPHEMERAL_ROOMS=true and NEXT_PUBLIC_EPHEMERAL_ROOMS=true.
- No custom domain, paid upgrade, paid database, or DNS change.
- Existing Customer OS service and database were not changed.

## Live verification

HTTPS health endpoint responds with status ok and roomStorage temporary. Sitemap uses the public HTTPS origin. Render reports the final deploy as live.

Four browser checks passed on the public URL: three-player local game with rematch; offline reload and complete offline game; three independent browser contexts creating/joining a room, private cards, disconnect/reconnect, voting and rematch; unauthenticated admin access rejected. The remote multiplayer test passed in 15.3 seconds; the final two-test remote run passed in 16.6 seconds. Local unit/integration suite now has 26 passing tests, including serialized temporary storage and rollback on failed mutations. The prior complete local browser suite has 12 passing cases.

## Free-preview limitations

Render can sleep after 15 minutes without traffic. The next visitor may wait about a minute. Online rooms use server memory and reset on sleep, restart or redeployment. This is clearly disclosed on the online screen. Local packs, settings and completed local scores remain in the phone's IndexedDB. Persistent editorial management is disabled without PostgreSQL; ordinary gameplay works without it. No admin token was configured in the public preview, and the test-only admin token is not active there.

Render's free instance hours are shared with other free services in this workspace, including Customer OS. Free-plan usage limits still apply. No paid upgrade is authorized.

For persistent rooms and editorial data later, provision a separate user-approved database and set DATABASE_URL, migrate/seed it, remove ALLOW_EPHEMERAL_ROOMS, disable NEXT_PUBLIC_EPHEMERAL_ROOMS and rebuild. Never reuse Customer OS data or credentials without explicit authorization. The temporary mode was chosen because this workspace's single free database slot is already occupied.

## Repeat a live smoke test

```powershell
$env:KHOJ_TEST_URL='https://khoj-party-game.onrender.com'
npm run test:e2e -- e2e/online.spec.ts --grep 'three browsers|rejects unauthenticated'
```

Do not run the known local admin-token test against the live deployment. Documentation-only commits use [skip render] to avoid restarting temporary rooms unnecessarily.

## Visual refinement update — 21 October 2026

The owner requested a more natural, refined presentation and a linked footer credit. The live update uses warmer charcoal/peach/paper colors, self-hosted Manrope typography, less decorative label clutter, conversational Nepali copy and readable mobile instructions. The original mascot and game flows remain. Every page ends with “Designed and developed by Bimal Bhandari”, linking to https://www.instagram.com/bimalbhandari_/ in a new tab with noopener/noreferrer. The offline shell version is v2.

Validation: lint, TypeScript and production build pass; all 12 local browser tests pass, including game modes/offline/multiplayer and the credit target. Two additional checks passed against the live HTTPS site: desktop homepage/credit and every public screen at 360px plus language switching. Desktop and mobile screenshots were visually reviewed.

For this public-repository connection, pushing the commit did not automatically start a deploy despite the configured auto-deploy flag. After confirming no queued deployment, an explicit deploy released the verified commit. For future updates, inspect the deployment list and confirm the target commit becomes live. No paid plan, domain, database or unrelated service was changed.
