# Plan & Implementation Progress

### 1. How did you break the work into sessions?
The implementation is broken down into structured, isolated phases to maintain strict security boundaries and regression-free verification:
- **Phase 1 — Foundation & Express Architecture**: Health checks, error handling, CORS, Helmet security headers, environment validation.
- **Phase 2 — Relational Schema & Supabase Setup**: PostgreSQL schema modeling (Prisma ORM), enum types (`ApplicationStage`, `UserRole`, `TimelineEventType`), foreign key constraints (`onDelete: Restrict` for jobs, `onDelete: Cascade` for child records).
- **Phase 3 — Authentication, JWT & Server-Enforced RBAC**: User registration, bcrypt password hashing, login, JWT issuance, `authenticate` middleware, `requireRole` middleware, and resource-level `requireApplicationAccess` join verification.
- **Phase 4 — Job Openings & Candidate Applications**: Recruiter CRUD for job openings, soft archival/restoration, default exclusion of archived jobs, candidate application creation, and safe deletion guards.
- **Phase 5 — Pipeline State Machine**: Deterministic linear progression (`Applied` → `Screening` → `Interview` → `Offer` → `Hired`), stage skipping rejection, candidate rejection with `rejectedFromStage` preservation, stage reinstatement, `stageEnteredAt` timestamp updating, and atomic transaction integrity.
- **Phase 6 — Interview Panels, Reviewer Portal & Feedback**: Recruiter-controlled interview panel assignments (`POST/GET/DELETE .../panel`), interviewer role validation, `/api/v1/my-reviews` portal strictly isolated to assigned candidates, structured feedback scorecard submission and retrieval, and prevention of identity spoofing.
- **Phase 7 — Immutable Timeline and Audit Trail**: Internally generated append-only audit events (`APPLICATION_CREATED`, `STAGE_CHANGED`, `APPLICATION_REJECTED`, `APPLICATION_REINSTATED`, `INTERVIEWER_ASSIGNED`, `INTERVIEWER_UNASSIGNED`, `FEEDBACK_SUBMITTED`), atomic transaction rollback guarantees, anti-spoofing enforcement, read-only `GET /api/v1/applications/:id/timeline` sorted chronologically (`createdAt ASC, id ASC`), complete prohibition of timeline mutation endpoints, and 22 automated tests.
- **Phase 8+ (Upcoming)**: Stalled application SLA alerts (>10 days) and alert dismissals.

### 2. What order did you build in, and why that order?
1. **Data Model & Schema First**: Defining explicit enums and foreign key constraints prevents downstream data corruption.
2. **Security & RBAC Layer Second**: Establishing server-side authentication and role-based middleware ensures that every subsequent business endpoint is protected from inception rather than retrofitted with security later.
3. **Core Entities Third (Jobs & Applications)**: Creating openings and candidates provides the foundational database entities upon which state machines operate.
4. **State Machine Fourth**: Building the linear stage machine on top of authenticated recruiter endpoints ensures state transitions cannot bypass sequential hiring rules.
5. **Interview Panels & Feedback Fifth**: Layering reviewer access controls onto the existing candidate entities and enforcing candidate-level authorization (`requireApplicationAccess`) prevents unauthorized evaluations.
6. **Timeline & Audit Trail Sixth**: Recording immutable audit events directly within domain transactions ensures all state movements, evaluations, and assignments are permanently preserved without client tampering.

### 3. What did you estimate versus what it actually took?
- **Phase 1 & 2 (Architecture & Schema)**: Estimated 1 hour; took ~1 hour. Transitioned from initial MongoDB placeholder to PostgreSQL + Prisma for relational integrity.
- **Phase 3 (Auth & RBAC)**: Estimated 1.5 hours; took ~1.5 hours. Automated 23 unit and integration tests.
- **Phase 4 (Jobs & Applications)**: Estimated 1.5 hours; took ~1.5 hours. Automated 27 unit and integration tests.
- **Phase 5 (Pipeline State Machine)**: Estimated 1 hour; took ~45 minutes. Centralized transition logic in `pipeline.rules.js` and `pipeline.service.js` with atomic Prisma transactions and 33 automated tests.
- **Phase 6 (Panels, Reviews & Feedback)**: Estimated 1.5 hours; took ~1 hour. Implemented recruiter panel management, `/my-reviews` portal, scorecard submissions, and 32 automated tests.
- **Phase 7 (Timeline & Audit Trail)**: Estimated 1 hour; took ~45 minutes. Implemented timeline service & controller, `GET /timeline` route with application access authorization, anti-spoofing, immutability guarantees, and 22 automated tests.

### 4. What did you cut when you ran short?
- Intentionally deferred search/filter/pagination extensions, bulk CSV exports, and SLA stall alerts to their designated future phases.
- Preserved strict phase boundaries to ensure that each stage of the ATS is thoroughly tested and free of regressions.
