# BugForge — Candidate Engineering Report

## 1. Executive Summary

I investigated the BugForge project-management application across its full stack: the Express/TypeScript API, the Next.js/React frontend, MongoDB data access, Docker containerisation, and NGINX reverse-proxy configuration. I identified and resolved **16 distinct defects** spanning security, performance, correctness, and operational readiness. Additionally, I implemented **2 feature enhancements** (an interactive project task board and a dashboard activity feed) to demonstrate end-to-end capability.

The most critical findings were:

- **Plaintext password logging** in the authentication controller (data breach risk).
- **Stored XSS vulnerability** via `dangerouslySetInnerHTML` on project descriptions.
- **Infinite re-render loop** on the dashboard page, causing browser lock-up.
- **N+1 database query** on the dashboard controller, causing O(n) MongoDB round-trips.

All fixes preserve existing behaviour, pass TypeScript type-checking, ESLint linting (zero warnings), and the existing Vitest test suite.

---

## 2. Investigation Process

### Establishing a Baseline

1. Cloned the repository and inspected `package.json` scripts, Docker configuration, and CI workflows.
2. Attempted `docker-compose up --build` — build failed because Dockerfiles used `npm` while the project uses `pnpm` with a lockfile.
3. Ran `pnpm install && pnpm dev` locally — API crashed immediately with a Zod validation error because `.env` files were not placed in the app subdirectories.
4. After fixing environment configuration, the frontend loaded but the dashboard was unresponsive due to an infinite re-render loop.

### Systematic Code Review

Read every source file in:

- `apps/api/src/` — all controllers, middleware, routes, models, services, utils, validators, and config.
- `apps/web/` — all pages, components, contexts, services, and types.
- Root config — `docker-compose.yml`, `nginx/default.conf`, `.github/workflows/`, Dockerfiles.

---

## 3. Issues Found, Severity, Impact, and Root Cause

### Security Issues

| #   | Issue                                      | Severity    | File                 | Root Cause                                                                                                                                                      |
| --- | ------------------------------------------ | ----------- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Plaintext password logging**             | 🔴 Critical | `auth-controller.ts` | `req.log.info({ body: req.body })` serialised the entire request body, including the raw password, to application logs.                                         |
| 2   | **Stored XSS via dangerouslySetInnerHTML** | 🔴 Critical | `projects/page.tsx`  | Project descriptions were rendered with `dangerouslySetInnerHTML`, allowing injected `<script>` tags to execute in any user's browser.                          |
| 3   | **CORS allows all origins**                | 🟠 High     | `app.ts`             | `cors({ origin: true })` accepts requests from any domain, enabling cross-site request forgery and credential theft.                                            |
| 4   | **Mass assignment on task updates**        | 🟠 High     | `task-controller.ts` | `Task.findByIdAndUpdate(id, req.body)` passed the raw request body to MongoDB, allowing clients to overwrite protected fields like `project`, `createdBy`, etc. |
| 5   | **No rate limiting on auth routes**        | 🟡 Medium   | `routes/index.ts`    | Login, register, and password-reset endpoints had no rate limiting, enabling brute-force attacks.                                                               |

### Performance & Memory Issues

| #   | Issue                                   | Severity  | File                      | Root Cause                                                                                                                                                    |
| --- | --------------------------------------- | --------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 6   | **Dashboard infinite re-render loop**   | 🟠 High   | `dashboard/page.tsx`      | A `useEffect` hook incremented a `renderVersion` state variable on every render, creating an infinite loop that locked the browser tab.                       |
| 7   | **Memory leak from uncleared interval** | 🟠 High   | `app-shell.tsx`           | `setInterval` for notification polling was never cleared on component unmount, leaking timers and causing duplicate API calls.                                |
| 8   | **N+1 database query on dashboard**     | 🟡 Medium | `dashboard-controller.ts` | For each active project, a separate `TaskModel.countDocuments()` call was issued. With 100 projects, this would fire 100+ MongoDB queries per dashboard load. |

### Correctness & Best Practices

| #   | Issue                                      | Severity  | File                    | Root Cause                                                                                                                                                                                                                            |
| --- | ------------------------------------------ | --------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 9   | **Express error handler signature**        | 🟠 High   | `middleware/error.ts`   | The error handler had only 3 parameters `(error, req, res)`. Express requires exactly 4 parameters `(error, req, res, next)` to recognise it as an error-handling middleware; without this, unhandled errors would crash the process. |
| 10  | **Missing comment CRUD routes**            | 🟡 Medium | `routes/index.ts`       | `updateComment` and `deleteComment` controller methods existed but were never wired to router endpoints.                                                                                                                              |
| 11  | **Wrong HTTP status for comment creation** | 🟢 Low    | `comment-controller.ts` | `createComment` returned `200 OK` instead of `201 Created`.                                                                                                                                                                           |
| 12  | **Zod import hoisting**                    | 🟢 Low    | `auth-controller.ts`    | The `import { z } from 'zod'` statement was placed at the bottom of the file, after its usage. While this works due to ES module hoisting, it violates standard conventions and makes the code harder to read.                        |
| 13  | **Empty Swagger API docs**                 | 🟢 Low    | `app.ts`                | The Swagger docs route was configured but the `apis` array pointed to a non-existent pattern, resulting in empty API documentation.                                                                                                   |

### Operational Readiness (Docker/CI)

| #   | Issue                                   | Severity  | File                                         | Root Cause                                                                                                                                                              |
| --- | --------------------------------------- | --------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 14  | **Dockerfile uses npm instead of pnpm** | 🟡 Medium | `apps/api/Dockerfile`, `apps/web/Dockerfile` | Both Dockerfiles ran `npm ci` / `npm install`, ignoring the `pnpm-lock.yaml`. This caused dependency version drift between local development and production containers. |
| 15  | **Build-time env var not injected**     | 🟡 Medium | `apps/web/Dockerfile`, `docker-compose.yml`  | `NEXT_PUBLIC_API_URL` was only set as a runtime env var, but Next.js inlines `NEXT_PUBLIC_*` values at build time. The frontend bundled `undefined` as the API URL.     |
| 16  | **NGINX missing WebSocket upgrade**     | 🟢 Low    | `nginx/default.conf`                         | NGINX did not forward `Upgrade` and `Connection` headers, breaking Next.js Hot Module Replacement (HMR) during development.                                             |

---

## 4. Fixes Made and Alternatives Considered

### Security Fixes

| Fix                | Implementation                                                                                                                                      | Alternative Considered                                                                                            |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Password logging   | Destructured `password` out of `req.body` before logging; log only `email`.                                                                         | Disabling request body logging entirely — rejected because login attempt auditing is valuable.                    |
| XSS vulnerability  | Replaced `dangerouslySetInnerHTML` with standard React text interpolation `{project.description}`.                                                  | Adding a sanitisation library (DOMPurify) — rejected as unnecessary since descriptions are plain text.            |
| CORS configuration | Changed `origin: true` to `origin: env.CORS_ORIGIN` (configurable, defaults to `http://localhost:3000`). Added `CORS_ORIGIN` to the Zod env schema. | Hardcoding allowed origins — rejected for deployment flexibility.                                                 |
| Mass assignment    | Used `taskSchema.partial().parse(req.body)` to validate and whitelist only known task fields before passing to MongoDB.                             | Using `$set` with explicit field picks — Zod validation is more maintainable and already available.               |
| Rate limiting      | Added `express-rate-limit` middleware (100 requests per 15-minute window) on authentication routes.                                                 | Using Redis-backed rate limiting — overkill for this scope; in-memory is adequate for single-instance deployment. |

### Performance Fixes

| Fix                     | Implementation                                                                                                       | Alternative Considered                                                                             |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Dashboard infinite loop | Removed the `renderVersion` state and its `useEffect` entirely — it served no functional purpose.                    | Adding a dependency guard — rejected because the state itself was unnecessary.                     |
| Memory leak             | Added a cleanup function `return () => clearInterval(id)` to the `useEffect` in `app-shell.tsx`.                     | Switching to a WebSocket-based notification system — outside scope.                                |
| N+1 query               | Replaced N individual `countDocuments` calls with a single `TaskModel.aggregate([{ $match }, { $group }])` pipeline. | Adding a `completedCount` field to the Project model — rejected to avoid denormalisation overhead. |

### Infrastructure Fixes

| Fix                 | Implementation                                                                                         |
| ------------------- | ------------------------------------------------------------------------------------------------------ |
| Docker pnpm         | Changed Dockerfiles to use `corepack enable pnpm && pnpm install` and `pnpm run build`.                |
| Build-time env      | Added `ARG NEXT_PUBLIC_API_URL` to the web Dockerfile and `build.args` in `docker-compose.yml`.        |
| NGINX WebSocket     | Added `proxy_set_header Upgrade $http_upgrade` and `proxy_set_header Connection "upgrade"` directives. |
| Cross-platform lint | Added `cross-env` to web devDependencies to fix `ESLINT_USE_FLAT_CONFIG=false` on Windows.             |

### Feature Enhancements

| Feature                     | Description                                                                                                                                                                   |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Project Task Board**      | Created `/projects/[projectId]/page.tsx` — a Kanban-style board with columns for To Do, In Progress, and Done. Supports creating, updating status, and deleting tasks inline. |
| **Dashboard Activity Feed** | Added a "Recent activity" card to the dashboard that renders the activity log data already returned by the API but previously unused in the UI.                               |
| **Clickable Project Cards** | Wrapped project cards in `<Link>` components so users can navigate directly from the Projects list to the task board.                                                         |

---

## 5. Tests and Manual Verification

### Automated Checks

| Check                  | Command          | Result                                                            |
| ---------------------- | ---------------- | ----------------------------------------------------------------- |
| TypeScript compilation | `pnpm typecheck` | ✅ Both `@bugforge/api` and `@bugforge/web` pass with zero errors |
| ESLint linting         | `pnpm lint`      | ✅ Zero warnings, zero errors                                     |
| Unit tests (Vitest)    | `pnpm test`      | ✅ 2/2 tests pass (validator schema tests)                        |

### Manual Verification

| Verification Step                                | Outcome                                                                               |
| ------------------------------------------------ | ------------------------------------------------------------------------------------- |
| Start MongoDB via Docker, run API + Web natively | API starts on port 4000, Web on port 3000 — both healthy                              |
| Register a new user                              | Registration succeeds, token stored, redirected to dashboard                          |
| Verify no password in logs                       | Confirmed stdout only logs `{ email: "..." }`, not the password                       |
| Dashboard loads without browser freeze           | Confirmed — page renders in ~3 seconds, no infinite loop                              |
| Create a project and navigate to task board      | Project created, clicking card navigates to `/projects/:id`                           |
| Create, move, and delete tasks on board          | All CRUD operations work correctly with live UI updates                               |
| Verify CORS rejects unknown origins              | API returns proper CORS error for non-whitelisted origins                             |
| Docker build completes                           | `docker-compose up --build` succeeds with pnpm (requires network access for corepack) |

---

## 6. Remaining Risks and Recommended Follow-up Work

### High Priority

- **No CSRF protection**: The API relies on JWT in `localStorage` which mitigates traditional CSRF, but adding `SameSite` cookie-based tokens would be stronger.
- **JWT refresh token stored in localStorage**: Susceptible to XSS-based token theft. Consider `httpOnly` cookies.
- **No pagination**: `listTasks`, `listProjects`, and `listComments` return all documents. At scale (>1000 items), this will cause memory pressure and slow responses.

### Medium Priority

- **Missing database indexes**: No compound indexes for common query patterns (e.g., tasks by project + status). Should analyse with `explain()` and add indexes.
- **No integration/E2E tests**: Only schema validation tests exist. Recommend adding Supertest-based API tests and Playwright browser tests.
- **Deprecated Next.js version**: `next@15.1.1` has a known CVE. Should upgrade to the latest patched version.

### Low Priority

- **No structured logging format**: Pino logs are JSON but lack correlation IDs for request tracing across services.
- **Health check endpoint**: The API lacks a `/health` endpoint for container orchestration readiness probes.
- **CI pipeline**: The GitHub Actions workflow should be reviewed to ensure it runs lint, typecheck, and tests in CI.

---

## 7. Commands Used

```bash
# Install dependencies
pnpm install

# Run development servers
pnpm dev

# Type checking
pnpm typecheck

# Linting
pnpm lint

# Unit tests
pnpm test

# Docker build
docker-compose up --build -d

# Git bundle for submission
git bundle create bugforge.bundle --all
```
