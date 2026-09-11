# Submission

This is the first file to open. Everything you need to evaluate the project is below.

## Links

- **GitHub repository:** https://github.com/Suvanshsehgal/BusyAssignment
- **Live application:** https://busy-assignment-bice.vercel.app/
- **Backend API:** https://busyassignment.onrender.com

## Notes for the reviewer

> The backend is hosted on Render's free tier and **sleeps after 15 minutes of inactivity**. The very first request (including the login) can take **30–60 seconds** while the container cold-starts. Subsequent requests are fast. Please be patient on the first load — if the login spinner hangs, wait a moment and it will resolve once the server wakes up. In a real deployment I'd fix this with either a scheduled keep-alive ping or a paid always-on tier — the free-tier sleep is a hosting-cost tradeoff, not an application bug.

> The database is pre-seeded with 6 users, 4 job openings, and 10 candidates across every pipeline stage and edge case (stalled alerts, rejected-from-stage tracking, dismissed alerts, full Applied→Hired lifecycle). You can explore immediately without creating anything.

## Demo credentials

All seeded accounts share the password **`PipelineHQ2026!`**

| Role | Email | Password |
|------|-------|----------|
| Recruiter | sarah.connor@pipelinehq.com | PipelineHQ2026! |
| Recruiter | marcus.vance@pipelinehq.com | PipelineHQ2026! |
| Interviewer | alex.rivera@pipelinehq.com | PipelineHQ2026! |
| Interviewer | priya.patel@pipelinehq.com | PipelineHQ2026! |
| Interviewer | david.kim@pipelinehq.com | PipelineHQ2026! |
| Interviewer | elena.rostova@pipelinehq.com | PipelineHQ2026! |

> ⚠️ **Security note:** These are demo/seed credentials only, provided for reviewer convenience. In a real production deployment, each user would have a unique, randomly generated password and would be forced to reset it on first login — a shared plaintext password across all accounts is a demo-only shortcut, not a pattern I'd ship.

**Recommended walkthrough:** Log in as **Sarah Connor** (recruiter) first to see the full pipeline, then switch to **Alex Rivera** (interviewer) to see the scoped-down review portal, then visit `/careers` logged out to see the public careers page.

## Stack

| Layer | What I used | Why |
|-------|-------------|-----|
| Frontend | React 19 + Vite 8, Tailwind CSS v4, React Router v7, TanStack Query v5, Recharts, Lucide icons | React 19 with the React Compiler (via Babel plugin) gives automatic memoisation. Vite 8's Rolldown bundler is fast. Tailwind v4's CSS-first config removes the need for a config file. TanStack Query handles server state, caching, and background refetching out of the box — no Redux needed. Recharts for the analytics charts. |
| Backend | Express 5, Node.js (ES Modules), Prisma ORM, bcryptjs, jsonwebtoken, Helmet | Express 5 has native async error handling (no wrapper needed). Prisma gives type-safe queries and auto-generated migrations. JWT for stateless auth. Helmet for security headers. |
| Database | PostgreSQL via Supabase (managed) | Relational data (jobs → applications → panels → feedback) maps naturally to SQL with foreign keys and constraints. Supabase provides a free managed Postgres instance with connection pooling. |
| Hosting | Render (backend + API), Vercel (frontend SPA) | Render's free tier runs the Express server with automatic deploys from GitHub. Vercel's edge network serves the React SPA globally with instant deploys. Both connect via environment variables — secrets (DB connection string, JWT signing key) are read from `.env` at runtime, which is listed in `.gitignore` and not committed to the repo. |

## Goal checklist

Mark each honestly. Partial is fine — say what is partial.

| # | Goal | Status | Notes |
|---|------|--------|-------|
| 1 | **Accounts and roles** | Done | Email/password auth with JWT. Two roles: `recruiter` and `interviewer`. Role enforcement is on the server via `requireRole()` middleware — interviewers get 403 on recruiter endpoints, not just hidden UI. `requireApplicationAccess` middleware additionally checks that interviewers are on the interview panel before accessing any candidate data. **Known gap:** rate limiting is currently only applied to the public careers application endpoint (see Stretch goals). The `/login` endpoint does not yet have brute-force protection — this would be a priority fix before any real deployment. |
| 2 | **Job openings** | Done | Full CRUD: create, edit title/department/description, change status. Archive hides from default views (preserved with all applications). Restore brings them back. Status transitions: Open ↔ Closed, Open → Archived, Archived → Open. |
| 3 | **Applications inside job openings** | Done | Every application belongs to one job opening. Carries candidate name, email, source (LinkedIn, Referral, Careers Page, etc.), and notes. Can be created and edited. Opening a job shows its applications via `/jobs/:jobId/applications`. |
| 4 | **Pipeline with rules** | Done | Strict sequential advancement: Applied → Screening → Interview → Offer → Hired. Server rejects any attempt to skip stages (returns 400 with explanation). Rejection from any stage stores `rejectedFromStage`. Reinstatement returns to the exact stage they were rejected from — not reset to Applied. All enforced server-side. |
| 5 | **Interview panel** | Done | Any number of interviewers can be assigned to any application. Server validates the target user actually has the `interviewer` role before assignment (prevents assigning recruiters). Prevents duplicate assignments. Interviewers see all their assignments in a single "My Reviews" list. Each interviewer can submit one scorecard (1–5 rating + text feedback) per application. |
| 6 | **Finding candidates** | Done | Unified applications list across all openings. Server-side text search over candidate name and email (`LIKE` query). Filters: job opening, stage, source. Sorting: applied date, stage, last update, candidate name (asc/desc). Server-side pagination with total count. Autocomplete search with debounced server queries. |
| 7 | **Bulk actions + CSV export** | Done | Bulk advance and bulk reject process each candidate individually within the batch — eligible candidates succeed, ineligible ones report the specific failure reason (e.g., "Already at Hired stage"). The response lists per-candidate success/failure. CSV export generates RFC 4180 compliant output with all pipeline columns; downloads as a file. |
| 8 | **Dashboard** | Done | Landing view with 4 headline KPIs: Open Positions, Active Applications, Interviews Scheduled This Week, Hires This Month. Stage breakdown funnel with counts and percentages. Per-job-opening breakdown table. 12-week applications-received-per-week area chart. All data from dedicated analytics API endpoints. |
| 9 | **Immutable timeline** | Done | Every application has an audit timeline recording: creation, every stage change (old → new stage + actor), rejections (with reason), reinstatements, panel assignments/removals, and feedback submissions. Timeline entries are append-only — no update or delete endpoints exist. Displayed chronologically in the UI. |
| 10 | **Stalled-application alerts** | Done | Any application sitting in the same non-terminal stage for >10 days on an active (non-archived) job appears in the alerts area. Navigation badge shows live count (polled via `/alerts/count`). Recruiters can dismiss alerts per-application. Dismissal is stage-specific: if the candidate later advances and stalls again in a new stage, the alert reappears. Implemented via `AlertDismissal` table keyed on `(applicationId, stage)`. |

### Stretch goals implemented

| Stretch | Status | Notes |
|---------|--------|-------|
| Public careers page | Done | `/careers` lists open positions. `/careers/:jobId` shows details. `/careers/:jobId/apply` is a public application form. Rate-limited (10 requests / 15 min per IP). Handles duplicate email detection (409). |
| Structured interview scorecards | Done | 1–5 star rating per interviewer per candidate, with text feedback. Visible to recruiters and fellow panel members. |

## How much time did you actually spend?

About 14 hours across 5 days. Roughly 4.5 hours on backend, 3 on schema/seed, 5 on frontend, 1.5 on deployment and docs.

## What would you do next, with another 12 hours?

- **Automated testing (~4h)** — The backend has a test runner set up (`node --test`) but test coverage is minimal. The first priority would be integration tests for every pipeline rule: rejecting a skip-stage attempt (Screening → Offer should return 400), verifying reinstatement lands on the exact `rejectedFromStage` and not Applied, and confirming bulk actions report per-candidate success/failure rather than failing the whole batch. I'd also add auth boundary tests proving an interviewer gets 403 on every recruiter-only endpoint, not just the ones I remembered to check manually.
- **Frontend code-splitting and performance (~2h)** — The JS bundle is ~1MB (294KB gzipped), mostly from Recharts. I'd lazy-load the Analytics, Alerts, and Careers pages behind `React.lazy()` + `Suspense` so the initial login-to-dashboard path only loads what it needs. I'd also add `<link rel="preconnect">` for the Render API to cut the cold-start latency perception.
- **Real-time updates with WebSockets (~3h)** — Right now the frontend polls `/alerts/count` on an interval and relies on TanStack Query's `refetchOnWindowFocus`. I'd add Socket.IO so that when a recruiter advances a candidate, the interviewer's "My Reviews" list updates instantly, and alert badges update across all open tabs without polling.
- **Drag-and-drop Kanban board (~2h)** — An alternative pipeline view where candidates appear as cards in stage columns and can be dragged forward one stage at a time. The same server-side sequential validation applies — dropping a card from Screening into Offer would be rejected with an explanation, keeping the UI honest.
- **Email notifications (~1h)** — Use a transactional email service (Resend or SendGrid free tier) to notify interviewers when they're assigned to a panel, notify recruiters when feedback is submitted, and send a weekly digest of stalled candidates to the recruiting team.

## What are you least happy with in this codebase, and why?

- **No automated tests committed** — The seed data covers edge cases manually (stalled alerts, rejected-from-stage, reinstatement, full Applied→Hired lifecycle), but there are no committed integration or unit tests. That said, I manually verified all core flows before submission: stage-skip rejection (Screening → Offer returns 400), reinstatement landing on the exact `rejectedFromStage` rather than resetting to Applied, bulk action partial-failure reporting, role-based 403s on every recruiter-only endpoint when accessed from an interviewer account, and the full CSV export output. The pipeline rules — no stage skipping, reinstatement to exact stage, bulk partial failure reporting — are exactly the kind of logic that breaks silently when refactored, and they deserve regression tests. Manual verification confirms today's behavior is correct, but it doesn't protect against tomorrow's regressions — which is exactly why automated coverage is still the top priority with more time. I chose to prioritise getting all 10 goals working end-to-end over writing tests, which is a trade-off I'd reverse with more time.
- **Frontend bundle size** — The production JS bundle is ~1MB gzipped to ~294KB. Recharts is the primary contributor since it pulls in D3 under the hood. I'd code-split the Analytics and Dashboard chart components behind `React.lazy()` since the login → applications pipeline path doesn't need charting at all, and that's the most common user journey.