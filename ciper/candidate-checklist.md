# Candidate Checklist

## Before submitting

- [x] I can explain how I investigated and verified every issue I claim to have fixed.
- [x] I kept my changes focused and avoided unnecessary rewrites.
- [x] I considered the impact of my changes on existing functionality.
- [x] I verified that the application behaves correctly after my changes.
- [x] I added or updated automated tests where they meaningfully improve confidence.
- [x] I ran the project's linting, type checking, tests, and production build (where applicable).
- [x] I documented my investigation, decisions, verification steps, and any remaining risks in `candidate-report.md`.
- [x] I completed `ai-usage-report-template.md` accurately.
- [x] I understand and can explain every change included in my submission.
- [x] My branch contains only intentional, relevant changes.

## Verification Summary

| Check          | Command                     | Result                 |
| -------------- | --------------------------- | ---------------------- |
| TypeScript     | `pnpm typecheck`            | ✅ Pass (0 errors)     |
| ESLint         | `pnpm lint`                 | ✅ Pass (0 warnings)   |
| Unit Tests     | `pnpm test`                 | ✅ 2/2 tests pass      |
| Docker Build   | `docker-compose up --build` | ✅ Builds successfully |
| Manual Testing | Browser at localhost:3000   | ✅ All features work   |

## Files Modified

### Security Fixes

- `apps/api/src/controllers/auth-controller.ts` — Removed password from logs, fixed import hoisting
- `apps/web/app/(dashboard)/projects/page.tsx` — Removed XSS via dangerouslySetInnerHTML
- `apps/api/src/app.ts` — Fixed CORS to use configurable origin
- `apps/api/src/config/env.ts` — Added CORS_ORIGIN env var
- `apps/api/src/controllers/task-controller.ts` — Fixed mass assignment vulnerability
- `apps/api/src/routes/index.ts` — Added rate limiting, missing comment routes

### Performance Fixes

- `apps/web/app/(dashboard)/dashboard/page.tsx` — Fixed infinite re-render loop, added activity feed
- `apps/web/components/app-shell.tsx` — Fixed setInterval memory leak
- `apps/api/src/controllers/dashboard-controller.ts` — Fixed N+1 query with aggregation

### Correctness Fixes

- `apps/api/src/middleware/error.ts` — Fixed Express error handler signature
- `apps/api/src/controllers/comment-controller.ts` — Fixed HTTP status 200→201

### Infrastructure Fixes

- `apps/api/Dockerfile` — Switched to pnpm, multi-stage build
- `apps/web/Dockerfile` — Switched to pnpm, build-time env injection
- `docker-compose.yml` — Added build args, exposed MongoDB port
- `nginx/default.conf` — Added WebSocket upgrade headers

### New Features

- `apps/web/app/(dashboard)/projects/[projectId]/page.tsx` — Interactive Kanban task board
- `apps/api/package.json` — Added express-rate-limit, typescript
- `apps/web/package.json` — Added cross-env for Windows compatibility
