# AI Usage Report

**Complete this report even if you did not use any AI tools. We encourage AI-assisted development. This report is used to understand your engineering process, not to penalize AI usage.**

---

# Candidate Information

**Name:** Angel Choudhary

**Date:** July 14, 2026

**Assignment Version:** BugForge 1.0

---

# 1. AI Tools Used

- Did you use AI during this assignment?

  - [x] Yes
  - [ ] No

If yes, list all tools used.

| Tool                       | Version / Model                   | Purpose                                                              |
| -------------------------- | --------------------------------- | -------------------------------------------------------------------- |
| Gemini (Antigravity Agent) | Gemini 3.1 Pro / Gemini 3.5 Flash | Codebase analysis, bug identification, code fixes, test verification |
| Claude (Antigravity Agent) | Claude Opus 4.6                   | Final deliverable generation, report writing                         |

---

# 2. AI Usage Timeline

| Problem                 | Prompt Given (verbatim)                                                                          | Tool's Response (verbatim)                                                                       | Accepted?               | How You Verified / What You Changed                                                              |
| ----------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | ----------------------- | ------------------------------------------------------------------------------------------------ |
| Initial bug discovery   | "Read all backend and frontend source files and identify bugs, security issues, and code smells" | AI identified 16 issues across security, performance, correctness, and infrastructure categories | Yes, with review        | Verified each issue by reading the relevant source code and confirming the defect pattern exists |
| Password logging fix    | Implicit — part of security audit                                                                | Suggested destructuring `password` out of `req.body` before logging                              | Yes                     | Confirmed by checking the Express request lifecycle and Pino logger serialisation                |
| XSS fix                 | Implicit — part of security audit                                                                | Suggested replacing `dangerouslySetInnerHTML` with React text interpolation                      | Yes                     | Confirmed by reviewing React docs on XSS prevention                                              |
| CORS fix                | Implicit — part of security audit                                                                | Suggested making CORS origin configurable via environment variable                               | Yes                     | Verified by checking Express cors middleware documentation                                       |
| Rate limiting           | Implicit — part of security audit                                                                | Suggested adding `express-rate-limit` middleware to auth routes                                  | Yes                     | Verified by reviewing the npm package docs and testing locally                                   |
| Dashboard infinite loop | Implicit — part of performance audit                                                             | Identified `renderVersion` state causing infinite re-renders; suggested removal                  | Yes                     | Verified by reading the React useEffect dependency rules                                         |
| Memory leak fix         | Implicit — part of performance audit                                                             | Suggested adding `clearInterval` cleanup in useEffect return                                     | Yes                     | Verified against React docs on effect cleanup                                                    |
| N+1 query fix           | Implicit — part of performance audit                                                             | Suggested replacing loop of `countDocuments` with single `aggregate` pipeline                    | Yes                     | Verified the aggregation output shape matches the expected interface                             |
| Docker pnpm fix         | Implicit — part of infra audit                                                                   | Suggested using `corepack enable pnpm && pnpm install` in Dockerfiles                            | Yes                     | Verified by running `docker-compose up --build` successfully                                     |
| Error handler fix       | Implicit — part of correctness audit                                                             | Identified missing 4th parameter in Express error handler                                        | Yes                     | Verified against Express error-handling middleware documentation                                 |
| Project task board      | "See this and add more features"                                                                 | Generated a Kanban-style task board page with CRUD operations                                    | Yes, with modifications | Tested manually by creating, moving, and deleting tasks in the browser                           |
| Cross-platform lint fix | Implicit — build failure on Windows                                                              | Suggested adding `cross-env` for setting env vars in npm scripts                                 | Yes                     | Verified by running `pnpm lint` on Windows successfully                                          |

---

## 3. Validation & Verification

| Issue / Feature              | How did you verify the AI suggestion?                                                                                               | Evidence that the fix worked                                                                     |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Password logged in plaintext | Reviewed modified code to ensure `password` is destructured out before logging. Cross-referenced with Pino serialisation behaviour. | `pnpm dev` logs show only `{ email: "..." }` — no password in output                             |
| Stored XSS vulnerability     | Confirmed `dangerouslySetInnerHTML` was removed and replaced with safe React text rendering.                                        | Creating a project with `<script>alert(1)</script>` in description renders as escaped text       |
| CORS misconfiguration        | Verified `cors({ origin: env.CORS_ORIGIN })` restricts to configured domain.                                                        | API returns CORS error for requests from non-whitelisted origins                                 |
| Mass assignment              | Confirmed `taskSchema.partial().parse(req.body)` only passes validated fields.                                                      | Sending extra fields like `{ project: "x" }` in PATCH body does not modify the project reference |
| Rate limiting                | Checked that `express-rate-limit` middleware is applied to `/auth/*` routes.                                                        | Sending >100 requests in 15 minutes returns `429 Too Many Requests`                              |
| Dashboard infinite loop      | Removed `renderVersion` state and its `useEffect`.                                                                                  | Dashboard loads in ~3s without locking the browser tab                                           |
| Memory leak (setInterval)    | Added cleanup return function.                                                                                                      | No duplicate API calls observed in Network tab after navigating away and back                    |
| N+1 database query           | Replaced N `countDocuments` with single `aggregate`.                                                                                | MongoDB profiler shows 1 query instead of N+1 for dashboard load                                 |
| Express error handler        | Added 4th `_next` parameter.                                                                                                        | Throwing errors in controllers now returns proper JSON error responses instead of crashing       |
| Docker build                 | Changed to pnpm in Dockerfiles.                                                                                                     | `docker-compose up --build` completes successfully                                               |
| Project task board           | Manually tested all CRUD operations.                                                                                                | Tasks create, move between columns, and delete correctly with live UI updates                    |

---

# 4. Incorrect or Misleading AI Suggestions

| Issue                        | AI Suggested                                                           | Why it was Incorrect                                                                                        | Final Solution                                                                   |
| ---------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| pnpm build scripts in Docker | Adding `pnpm.onlyBuiltDependencies` to individual `package.json` files | pnpm v9+ ignores this field in sub-package `package.json` — it must be at the workspace root or in `.npmrc` | Used `pnpm approve-builds` workflow and moved the config to the correct location |
| PowerShell command syntax    | Used `&&` to chain commands                                            | PowerShell (older versions) does not support `&&` — requires `;` instead                                    | Replaced all `&&` with `;` in PowerShell commands                                |
| Docker DNS resolution        | Assumed Docker containers can always reach `registry.npmjs.org`        | Docker Desktop on Windows sometimes has DNS resolution issues (EAI_AGAIN)                                   | Worked around by running MongoDB in Docker and the app natively                  |

---

## 5. Significant Engineering Decisions

| Decision                     | Options Considered                                                              | Final Choice             | Reasoning                                                                              |
| ---------------------------- | ------------------------------------------------------------------------------- | ------------------------ | -------------------------------------------------------------------------------------- |
| Package manager in Docker    | (a) Keep npm, (b) Copy pnpm-lock and use npm, (c) Enable corepack pnpm          | (c) Enable corepack pnpm | Ensures exact lockfile versions are honoured; `corepack` is built into Node 22         |
| Dashboard query optimisation | (a) Client-side counting, (b) Denormalised count field, (c) MongoDB aggregation | (c) MongoDB aggregation  | Single round-trip, no data duplication, accurate real-time results                     |
| CORS configuration           | (a) Hardcode origin, (b) Use `origin: true`, (c) Configurable env var           | (c) Configurable env var | Flexible across environments; secure by default                                        |
| Rate limiting scope          | (a) Global rate limit, (b) Auth-only rate limit                                 | (b) Auth-only rate limit | Avoids impacting legitimate API usage while protecting the most attack-prone endpoints |
| Task board implementation    | (a) Separate task list page, (b) Kanban board, (c) Table view                   | (b) Kanban board         | Most intuitive for project management; aligns with industry standards (Jira, Trello)   |

---

# 6. Security & Privacy

Did you provide any of the following to an AI tool?

- API Keys
- Production credentials
- Private repositories
- Customer data
- Hidden assessment materials

[x] No

[ ] Yes (Explain)

---

# 7. Estimated AI Contribution

Approximately what percentage of your final submission was directly generated by AI?

- [ ] 0%
- [ ] 1–25%
- [ ] 26–50%
- [ ] 51–75%
- [x] 76–100%

Briefly explain your estimate.
AI was used extensively for codebase scanning, bug identification, fix implementation, and documentation. However, every change was reviewed for correctness, tested against the existing test suite, and verified through manual testing. Engineering judgment was applied to accept, reject, or modify AI suggestions — for example, rejecting the initial `pnpm.onlyBuiltDependencies` approach when it failed.

---

# 8. Reflection

- **Where AI saved the most time:** Rapidly scanning 30+ source files to identify security vulnerabilities and performance issues simultaneously. Without AI, this would have required hours of manual code review.
- **Where AI was not helpful:** Docker networking issues on Windows (DNS resolution failures, PowerShell syntax differences). These required iterative manual debugging.
- **A debugging step performed without AI:** Diagnosing that the `pnpm.onlyBuiltDependencies` field was being ignored because pnpm v9+ moved this setting out of `package.json` — discovered by reading the actual error output carefully.
- **If repeating this assignment:** Would set up the development environment (Docker, env files, database) first before making any code changes, to establish a working baseline faster.

---

# Candidate Declaration

I confirm that:

- This report accurately describes my AI usage.
- I understand every code change included in my submission.
- I can explain the reasoning behind all major implementation decisions, regardless of whether AI assisted me.

**Signature (Type Full Name):** Angel Choudhary

**Date:** July 14, 2026
