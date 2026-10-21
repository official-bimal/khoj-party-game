# Deployment readiness

The user authorized a free Render preview after implementation. See docs/LIVE_DEPLOYMENT.md for its status and configuration. No paid upgrade or custom domain is authorized.

1. Provision a PostgreSQL database you control. Set DATABASE_URL server-side, APP_ORIGIN to the exact HTTPS origin, NEXT_PUBLIC_APP_NAME as desired, and a long random ADMIN_TOKEN. Never prefix secrets with NEXT_PUBLIC_.
2. `npm ci`, `npm run db:generate`, `npm run db:migrate`, `npm run db:seed`. Export DATABASE_URL for the Prisma CLI. Review migration SQL before running it against real data.
3. `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm run test:e2e`. Browser tests use `start:test` file storage and are not production DB validation.
4. Start with `npm start` on a Node host; use a persistent database, TLS proxy, trusted forwarding headers and distributed rate limiting. Remove ALLOW_FILE_STORAGE. Add backups and retention cleanup for expired room documents. Do not host as a static export: online/admin need Node route handlers.
5. Independently test PostgreSQL room transactions across multiple instances, network failures, migration rollback, tablet/mobile touch UX, iOS/Android installation, screen-reader behavior and release content approvals. Update service-worker version for a new shell. Confirm cache lifecycle during updates.

Free-tier-compatible architecture: a Node-capable host and PostgreSQL provider (such as a user-selected Render/Neon/Supabase plan) can work. Pricing/limits must be verified when selecting a provider; no account or external service has been connected. Polling works without a paid realtime subscription but consumes requests. Use a pooled PostgreSQL URL where appropriate and tune max connections.

Known release blockers: independent editorial review, production database verification, broader localization, distributed abuse controls and retention job. See ROADMAP.md. Buildable and tested locally does not mean audited production readiness.
