# Architecture & Design Decisions

This document logs architectural and engineering decisions that shaped the PipelineHQ ATS codebase.

---

## Decision 1: Server-Side InterviewPanel Access Enforcement

- **Chose**: Enforcing candidate application access on the server through a dedicated `requireApplicationAccess` middleware that queries the `InterviewPanel` join table using the cryptographically verified `req.user.id`.
- **Rejected**: Embedding assigned application IDs into the JWT payload, or relying on frontend UI filtering to hide unassigned applications.
- **Why**: 
  - JWT payloads are immutable until token expiration; if an interviewer is unassigned or newly assigned to a candidate, a token containing assignment lists would become stale immediately.
  - Client-side filtering provides zero security; any user could call `GET /api/v1/applications/:id` directly.
  - Querying `InterviewPanel` with `[applicationId, req.user.id]` at the resource authorization layer guarantees immediate consistency and prevents IDOR (Insecure Direct Object Reference) vulnerabilities.

---

## Decision 2: Self-Selected User Roles on Registration for Reviewer/Demo Utility

- **Chose**: Allowing `POST /api/v1/auth/register` to accept an optional `role` parameter (`recruiter` or `interviewer`), defaulting to `interviewer` if omitted, and strictly validating against allowed roles.
- **Rejected**: Restricting registration strictly to `interviewer` and requiring seed scripts or administrative DB scripts to create recruiter accounts.
- **Why**: 
  - For assignment reviewers and demo evaluators, requiring direct database CLI manipulation to test recruiter-specific features (creating jobs, advancing stages, dismissing alerts) adds friction.
  - Permitting role selection on signup allows seamless end-to-end evaluation of both personas while maintaining strict server-side validation against unauthorized roles (e.g., rejecting `admin` or arbitrary strings with HTTP 400).

---

## Decision 3: Stage-Specific `AlertDismissal` Table Instead of a Boolean Flag

- **Chose**: A dedicated `AlertDismissal` model with a composite unique constraint on `(applicationId, stage)`.
- **Rejected**: A simple `is_dismissed` boolean column on the `Application` table.
- **Why**: 
  - If a recruiter dismisses an alert for a candidate stalled in `Screening` for 12 days, and that candidate later advances to `Interview` where they stall for another 11 days, the system must trigger a new alert.
  - A boolean flag on `Application` would permanently silence alerts for the remainder of the candidate's lifecycle or require complex reset triggers on every stage move.
  - Stage-scoped dismissal records ensure that dismissals are granular, auditable, and cannot accidentally suppress legitimate future alerts.

---

## Decision 4: Relational Foreign Key Protection (`onDelete: Restrict`) for Job Openings

- **Chose**: Configuring `onDelete: Restrict` on the foreign key relation from `Application` to `JobOpening`.
- **Rejected**: Using `onDelete: Cascade` or relying solely on application-level checks.
- **Why**: 
  - Requirement 2 mandates: *"Archiving an opening hides an opening from the default views without destroying its applications."*
  - Cascading deletes would cause catastrophic data loss if a job opening was accidentally deleted.
  - Enforcing `Restrict` at the database level guarantees that a job opening with historical candidates cannot be dropped, forcing historical integrity.

---

## Decision 5: Database Technology Selection & Connection Strategy

- **Chose**: Supabase PostgreSQL with Prisma ORM, connected via Supabase Transaction Connection Pooler on port 6543 (`?pgbouncer=true`) over IPv4.
- **Rejected**: Direct IPv6 PostgreSQL connection strings (`db.<ref>.supabase.co:5432`) and port 5432 session poolers experiencing intermittent TCP handshake timeouts.
- **Why**: Direct Supabase database domains only resolve to IPv6 `AAAA` records on the free tier. Development and local testing environments lacking native IPv6 routing fail to connect (Prisma `P1001` error). Furthermore, session pooling on port 5432 experiences intermittent connection timeouts on restricted networks. Routing connections through the Supabase transaction pooler on port 6543 (`?pgbouncer=true`) provides fast, stable IPv4 routing and consistent sub-second connection establishment across local and CI environments.
- **Later reversed**: During initial project setup, MongoDB / Mongoose was briefly initialized as a placeholder MERN setup. We subsequently reversed this decision and purged all MongoDB/Mongoose dependencies in favor of Prisma ORM + PostgreSQL on Supabase. An ATS requires relational integrity, composite foreign key constraints, explicit many-to-many join tables, and strict transaction consistency, which PostgreSQL models with vastly superior guarantees.

---

## Decision 6: Soft Archival and Default Filtering for Job Openings

- **Chose**: Implementing a dedicated `Archived` state in `JobStatus` enum and soft-archival endpoints (`PATCH /api/v1/jobs/:id/archive` and `PATCH /api/v1/jobs/:id/restore`). By default, `GET /api/v1/jobs` filters out archived jobs (`status != 'Archived'`), unless explicitly requested with `?includeArchived=true`. Additionally, applications cannot be submitted against archived jobs.
- **Rejected**: Hard deleting job openings or leaving archived jobs mixed in with active recruitment feeds without explicit filters.
- **Why**:
  - In a production ATS, deleting a job opening destroys historical context for candidates who applied to that role, violating compliance, audit, and reporting requirements.
  - Foreign key constraints (`onDelete: Restrict`) already prevent database deletion when applications exist; soft archival provides recruiters with clean, uncluttered views of active roles while keeping all historical applicant relationships fully intact.
  - Enabling restoration ensures accidental archival can be quickly undone without data recovery operations.

---

## Decision 7: Safe Application Deletion with Audit & Feedback Safeguards

- **Chose**: Enforcing multi-level business guards at the application layer before permitting application deletion (`DELETE /api/v1/applications/:id`). An application can only be deleted if it is in the initial `Applied` stage, has zero interview feedback scorecards, and has no assigned interview panel members.
- **Rejected**: Blindly cascading deletion of candidates regardless of their stage, or allowing deletion of candidates with recorded interview feedback or assignments.
- **Why**:
  - While Prisma schema defines `onDelete: Cascade` on candidate child records (to support complete sandbox/test resets), business domain rules demand that candidate evaluations, interviewer scorecards, and historical progression audit trails must never be silently wiped out.
  - Candidates who have moved through screening or interviews, received scorecards, or been scheduled with interviewers represent active or past legal/compliance interactions.
  - If an errant candidate profile is created by mistake in `Applied` stage without evaluations or assignments, it may be safely purged. Once evaluation begins, deletion is rejected with HTTP 400, directing users to follow standard rejection/archival lifecycles instead.

---

## Decision 8: Server-Enforced Sequential State Machine & Stage Reinstatement

- **Chose**: Enforcing a strict, centralized server-side state machine (`Applied` → `Screening` → `Interview` → `Offer` → `Hired`) where the backend deterministically dictates the next valid stage on `PATCH /api/v1/applications/:id/advance`. Rejections (`PATCH /.../reject`) preserve the candidate's exact prior stage in `rejectedFromStage`, enabling deterministic reinstatement (`PATCH /.../reinstate`) back to that exact stage rather than resetting to `Applied`.
- **Rejected**: Accepting arbitrary target stages from client request bodies (e.g. `PATCH /api/v1/applications/:id` with `{ stage: 'Hired' }`), or resetting reinstated candidates to `Applied`.
- **Why**:
  - Allowing clients to pass target stages permits skipping interview evaluation steps (e.g. `Applied` straight to `Offer`), creating compliance, bias, and operational vulnerabilities.
  - Hardcoding sequential validation in a dedicated `pipeline.rules.js` module guarantees that no API consumer or script can bypass hiring protocols.
  - Storing `rejectedFromStage` at rejection time preserves candidate pipeline progress: if an offer fell through or headcount freezes lifted, the candidate is reinstated to the interview or offer stage where they left off, without destroying their interview evaluations or SLA history.
  - Every forward transition and reinstatement updates `stageEnteredAt: new Date()`, establishing an accurate baseline for SLA stalled-application calculations (>10 days) in subsequent phases.

---

## Decision 9: InterviewPanel Join Table as Single Source of Truth for Reviewer Access & Feedback

- **Chose**: Enforcing interviewer access to candidate details, panel memberships, review portals (`/my-reviews`), and feedback submissions strictly through the relational `InterviewPanel` join table keyed on the cryptographically validated `req.user.id`.
- **Rejected**: Accepting interviewer IDs from request query parameters, request bodies, or JWT custom claims, and rejected allowing recruiters to submit interviewer scorecards without panel relationship validation.
- **Why**:
  - In a compliant hiring system, candidate reviews and interview scorecards must be legally defensible. Storing interviewer identities directly from `req.user.id` eliminates impersonation and user-ID spoofing.
  - Allowing clients to pass a user ID in query strings (e.g. `GET /api/v1/my-reviews?userId=...`) would introduce severe IDOR vulnerabilities where any authenticated interviewer could view unassigned candidates and confidential evaluations.
  - Checking `InterviewPanel` at the resource-authorization layer (`requireApplicationAccess`) guarantees immediate consistency: if a recruiter removes an interviewer from a panel (`DELETE /api/v1/applications/:id/panel/:userId`), the interviewer's access to view details or submit feedback is revoked instantly without waiting for JWT token expiration.