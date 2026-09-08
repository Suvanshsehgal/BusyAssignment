# PipelineHQ — Architecture Documentation

This document describes the end-to-end system architecture of PipelineHQ, focusing on our security layers, modular structure, and clean separation between authentication, role-based access control (RBAC), and resource-level authorization.

---

## 1. What are the moving pieces, and how do they talk to each other?

The system consists of three primary layers communicating over strictly defined boundaries:

1. **Client Layer (React / Vite Frontend)**:
   - Single Page Application (SPA) consuming the REST API.
   - Attaches JWT bearer tokens (`Authorization: Bearer <token>`) to outbound HTTP requests.
   - UI views adjust to user roles for ergonomic navigation, but client-side logic is never treated as a security boundary.

2. **Server & Middleware Layer (Express.js on Node.js)**:
   - **App Configuration (`src/app.js`)**: Configures security headers via `helmet`, CORS policy, body parsers, and centralized routing under `/api/v1`.
   - **Authentication Middleware (`src/middleware/authenticate.js`)**: Validates cryptographically signed JWT tokens and resolves the database user onto `req.user`.
   - **Role Authorization Middleware (`src/middleware/requireRole.js`)**: Verifies macro permissions (`recruiter` vs. `interviewer`).
   - **Resource Authorization Middleware (`src/middleware/requireApplicationAccess.js`)**: Enforces granular data-level ownership, ensuring interviewers only access applications they are assigned to via `InterviewPanel`.
   - **Controllers & Services (`src/modules/*`)**: Stateless HTTP route handlers that delegate business logic to domain services.
   - **Centralized Error Handling (`src/middleware/errorHandler.js` & `src/utils/appError.js`)**: Uniform JSON responses for all operational errors (`400`, `401`, `403`, `404`, `409`, `500`).

3. **Data Layer (Prisma ORM & PostgreSQL on Supabase)**:
   - **Prisma Client (`src/config/prisma.js`)**: Type-safe query engine interfacing with PostgreSQL.
   - **Supabase PostgreSQL**: Relational database with foreign key constraints, indexes, unique constraints, and enum types.

---

## 2. Where does each piece run?

- **Frontend Client**: Runs in the user's browser environment.
- **Backend Application**: Node.js runtime process (Express server) listening on port 5000 in development / production containers.
- **PostgreSQL Database**: Cloud-hosted PostgreSQL instance managed by Supabase, connected through Supabase's Transaction Pooler (`port 6543`) with PgBouncer over TLS.

---

## 3. The End-to-End Request Pipeline

Every secured request passes through an explicit, sequential security and processing pipeline:

```text
Client Request
      │
      ▼
Express Router (JSON Parsing, CORS, Helmet Headers)
      │
      ▼
JWT Authentication (`authenticate`)
  ├─ Validates `Authorization: Bearer <token>`
  ├─ Verifies JWT signature and expiry
  └─ Resolves active user from DB → attaches to `req.user`
      │
      ▼
Role Authorization (`requireRole('recruiter' | 'interviewer')`)
  └─ Checks if `req.user.role` matches route requirements (403 if mismatch)
      │
      ▼
Resource Authorization (`requireApplicationAccess`)
  ├─ If Recruiter: full pipeline access granted
  └─ If Interviewer: checks `InterviewPanel` table for `[applicationId, req.user.id]`
      │
      ▼
Controller (`*.controller.js`)
  └─ Validates and parses HTTP request inputs
      │
      ▼
Service Layer (`*.service.js`)
  └─ Executes business domain logic and rules
      │
      ▼
Prisma ORM & PostgreSQL
  └─ Executes query / mutation and enforces database-level integrity
      │
      ▼
Response Formatting
  └─ Returns standardized JSON response (with error sanitization)
```

### Key Distinctions in Authorization:
1. **Authentication (`authenticate`)**: **"Who are you?"** Validates user identity through cryptographic tokens.
2. **Role-Based Authorization (`requireRole`)**: **"What is your role?"** Restricts broad categories of actions (e.g. only recruiters can open/close jobs; interviewers cannot change stages).
3. **Resource-Level Authorization (`requireApplicationAccess`)**: **"Are you assigned to this specific candidate?"** Restricts interviewers from viewing or grading candidates outside their assigned interview panel.

---

## 4. End-to-End Business Request Flows

### Flow A: Creating a Job Opening (`POST /api/v1/jobs`)
```text
Recruiter Client
      │
      ▼ (POST /api/v1/jobs with Bearer token)
1. authenticate Middleware
   ├─ Verifies JWT signature and expiry
   └─ Attaches req.user (User record)
      │
      ▼
2. requireRole('recruiter') Middleware
   └─ Confirms req.user.role === 'recruiter' (403 Forbidden if interviewer)
      │
      ▼
3. jobs.controller.js (createJobOpening)
   ├─ Validates required fields: title, department, description (400 if missing)
   └─ Passes data to jobs.service.js
      │
      ▼
4. jobs.service.js (createJobOpening)
   └─ Calls prisma.jobOpening.create({ data: { title, department, description, status: 'Open' } })
      │
      ▼
5. Response Handler
   └─ Returns HTTP 201 Created with { status: 'success', data: { job } }
```

### Flow B: Creating an Application (`POST /api/v1/applications`)
```text
Recruiter Client
      │
      ▼ (POST /api/v1/applications with Bearer token)
1. authenticate Middleware
   ├─ Verifies JWT signature and expiry
   └─ Attaches req.user (User record)
      │
      ▼
2. requireRole('recruiter') Middleware
   └─ Confirms req.user.role === 'recruiter' (403 Forbidden if interviewer)
      │
      ▼
3. applications.controller.js (createApplication)
   ├─ Validates candidateName, email, jobOpeningId (400 if missing or invalid email)
   └─ Passes payload to applications.service.js
      │
      ▼
4. applications.service.js (createApplication)
   ├─ Verifies JobOpening exists and is NOT 'Archived' (400 if archived, 404 if not found)
   └─ Executes atomic Prisma Transaction (`prisma.$transaction`):
       ├─ prisma.application.create():
       │   ├─ candidateName, email, source, notes, jobOpeningId
       │   ├─ stage: 'Applied' (initial pipeline stage)
       │   ├─ appliedDate: new Date()
       │   └─ stageEnteredAt: new Date()
       └─ prisma.timeline.create():
           ├─ applicationId: newly created application ID
           ├─ eventType: 'APPLICATION_CREATED'
           ├─ userId: req.user.id (actor)
           └─ details: { candidateName, email, jobOpeningId }
      │
      ▼
5. Response Handler
   └─ Returns HTTP 201 Created with { status: 'success', data: { application } } (including timeline)
```

### Flow C: Advancing a Candidate Application (`PATCH /api/v1/applications/:id/advance`)
```text
Recruiter Client
      │
      ▼ (PATCH /api/v1/applications/:id/advance with Bearer token)
1. authenticate & requireRole('recruiter')
   └─ 401 if missing/invalid token; 403 if interviewer
      │
      ▼
2. applications.controller.js (advanceApplication)
   └─ Extracts application ID and optional notes / requestedTargetStage
      │
      ▼
3. pipeline.service.js (advanceApplication)
   ├─ Queries Application by ID (404 Not Found if missing)
   ├─ Calls pipeline.rules.js (determineNextStage):
   │   ├─ Applied → Screening → Interview → Offer → Hired
   │   ├─ If stage === 'Hired': 400 Bad Request (cannot advance beyond final stage)
   │   ├─ If stage === 'Rejected': 400 Bad Request (must reinstate first)
   │   └─ If requestedTargetStage does not match next sequential stage: 400 Bad Request (rejects stage skipping)
   └─ Executes atomic Prisma Transaction (`prisma.$transaction`):
       ├─ prisma.application.update():
       │   ├─ stage: nextStage
       │   └─ stageEnteredAt: new Date() (resets SLA stall timer)
       └─ prisma.timeline.create():
           ├─ eventType: 'STAGE_CHANGED'
           ├─ oldStage: currentStage
           ├─ newStage: nextStage
           ├─ userId: req.user.id
           └─ details: { previousStage, newStage, notes }
      │
      ▼
4. Response Handler
   └─ Returns HTTP 200 OK with { status: 'success', data: { application } }
```

### Flow D: Rejecting & Reinstating a Candidate (`PATCH /.../reject` & `PATCH /.../reinstate`)
```text
Recruiter Client
      │
      ├───────────────────────────────┬───────────────────────────────┐
      ▼ (PATCH .../reject)            │                               ▼ (PATCH .../reinstate)
1. pipeline.service.js (reject)        │ 1. pipeline.service.js (reinstate)
   ├─ Verifies application exists      │    ├─ Verifies application exists
   ├─ If stage === 'Rejected': 400     │    ├─ If stage !== 'Rejected': 400 Bad Request
   └─ In atomic prisma.$transaction:   │    ├─ Reads prior stage from `rejectedFromStage`
       ├─ update Application:          │    └─ In atomic prisma.$transaction:
       │   ├─ stage: 'Rejected'        │        ├─ update Application:
       │   └─ rejectedFromStage: prior │        │   ├─ stage: rejectedFromStage
       │   (preserves stageEnteredAt)  │        │   ├─ stageEnteredAt: new Date() (resets SLA)
       └─ create Timeline:             │        │   └─ rejectedFromStage: null
           ├─ 'APPLICATION_REJECTED'   │        └─ create Timeline:
           ├─ oldStage: prior          │            ├─ 'APPLICATION_REINSTATED'
           └─ newStage: 'Rejected'     │            ├─ oldStage: 'Rejected'
                                       │            └─ newStage: prior stage
```

### Flow E: Panel Assignment & Removal (`POST .../panel` & `DELETE .../panel/:userId`)
```text
Recruiter Client
      │
      ▼ (POST /api/v1/applications/:id/panel with Bearer token)
1. authenticate & requireRole('recruiter')
   └─ Only authenticated recruiters can modify panel assignments (403 if interviewer)
      │
      ▼
2. panels.service.js (assignPanel)
   ├─ Validates Application exists (404 if missing)
   ├─ Queries target User records from database:
   │   ├─ 404 if user not found
   │   └─ 400 Bad Request if user.role !== 'interviewer' (never trusts client roles)
   ├─ Checks existing assignments in InterviewPanel (400 if duplicate)
   └─ In atomic prisma.$transaction:
       ├─ Creates InterviewPanel rows
       └─ Creates INTERVIEWER_ASSIGNED timeline events
```

### Flow F: Interviewer Portal & Feedback Submission
```text
Interviewer Client
      │
      ├───────────────────────────────┬───────────────────────────────┐
      ▼ (GET /api/v1/my-reviews)      │                               ▼ (POST /.../:id/feedback)
1. authenticate &                     │ 1. authenticate &
   requireRole('interviewer')         │    requireRole('interviewer')
      │                               │       │
      ▼                               │       ▼
2. reviews.service.js (getMyReviews)  │ 2. requireApplicationAccess
   ├─ Derives ID strictly from        │    └─ Queries InterviewPanel[id, req.user.id]
   │  req.user.id (never client body) │       (403 Forbidden if not assigned)
   └─ Queries InterviewPanel:         │       │
       └─ Returns ONLY candidates     │       ▼
          assigned to this user       │ 3. feedback.service.js (createFeedback)
                                      │    ├─ Validates content & score (1-5)
                                      │    └─ In atomic prisma.$transaction:
                                      │        ├─ Creates Feedback row
                                      │        └─ Appends FEEDBACK_SUBMITTED timeline
```

### Flow G: Candidate Audit Timeline Retrieval (`GET /api/v1/applications/:id/timeline`)
```text
Authenticated Client (Recruiter or Assigned Interviewer)
      │
      ▼ (GET /api/v1/applications/:id/timeline with Bearer token)
1. authenticate Middleware
   └─ Validates JWT signature and attaches req.user (401 if unauthenticated)
      │
      ▼
2. requireApplicationAccess Middleware
   ├─ Queries target Application: 404 Not Found if non-existent
   ├─ If Recruiter: full audit trail access granted
   └─ If Interviewer: checks InterviewPanel for [applicationId, req.user.id]
       (403 Forbidden if not assigned to candidate)
      │
      ▼
3. timeline.service.js (getApplicationTimeline)
   ├─ Queries Timeline records where applicationId = :id
   ├─ Eagerly includes actor user profile: { id, name, email, role }
   ├─ Enforces deterministic ascending chronological sort:
   │   ORDER BY createdAt ASC, id ASC
   └─ Returns immutable event history
```

### Flow H: Server-Side Search, Filter, Sort, and Paginated Listing (`GET /api/v1/applications`)
```text
Recruiter Client
      │
      ▼ (GET /api/v1/applications?search=...&stage=...&sortBy=...&page=...&limit=...)
1. authenticate & requireRole('recruiter')
   └─ Interviewers rejected with 403 Forbidden (maintains pipeline isolation)
      │
      ▼
2. applications.service.js (getApplications)
   ├─ Builds Prisma where clause at database level:
   │   ├─ Case-insensitive text search (candidateName OR email ILIKE)
   │   ├─ Filtering: jobOpeningId, stage, source
   ├─ Resolves sort direction & field: appliedDate, stage, updatedAt, candidateName
   │   (with deterministic secondary sort on id ASC)
   ├─ Computes pagination window: skip = (page - 1) * limit, take = limit
   ├─ Concurrently queries database via Promise.all([ prisma.application.count, prisma.application.findMany ])
   │   (zero in-memory filtering or array splicing)
   └─ Returns standardized response: { data, total_count, page, total_pages }
```

### Flow I: Bulk Pipeline Operations (`POST /api/v1/applications/bulk-advance` & `POST /.../bulk-reject`)
```text
Recruiter Client
      │
      ▼ (POST /bulk-advance or /bulk-reject with applicationIds: [...])
1. authenticate & requireRole('recruiter')
   └─ Strictly recruiter-only (403 Forbidden for interviewers)
      │
      ▼
2. applications.service.js (bulkAdvanceApplications / bulkRejectApplications)
   ├─ Validates non-empty array of application UUIDs (400 if empty/invalid)
   ├─ Iterates through applicationIds independently:
   │   ├─ Candidate 1 (Valid):
   │   │   └─ Executes atomic transaction → updates stage → writes Timeline event → added to `successful`
   │   ├─ Candidate 2 (Invalid - e.g. already Hired or Rejected):
   │   │   └─ Catches operational error → transaction rolled back → added to `failed` with clear reason
   │   │      (ONE FAILURE NEVER FAILS THE REST OF THE BATCH)
   │   └─ Candidate 3 (Valid):
   │       └─ Executes atomic transaction → updates stage → writes Timeline event → added to `successful`
   └─ Returns comprehensive results: { total, succeeded_count, failed_count, successful, failed }
```

#### Flow J: Server-Side RFC 4180 CSV Export (`GET /api/v1/applications/export-csv`)
```text
Recruiter Client
      │
      ▼ (GET /api/v1/applications/export-csv with optional filters)
1. authenticate & requireRole('recruiter')
   └─ Strictly recruiter-only (403 Forbidden for interviewers)
      │
      ▼
2. applications.service.js (exportApplicationsCsv)
   ├─ Queries applications (defaults to active pipeline stages, excluding Rejected and Hired)
   ├─ Eagerly loads associated JobOpening details (title, department)
   ├─ Formats rows according to RFC 4180:
   │   └─ Escapes double quotes (" -> "") and wraps fields containing commas, newlines, or quotes
   ├─ Sets HTTP response headers:
   │   ├─ Content-Type: text/csv; charset=utf-8
   │   └─ Content-Disposition: attachment; filename="applications.csv"
   └─ Streams/sends raw CSV string
```

### Flow K: Analytics and Reporting (`GET /api/v1/analytics/*`)
```text
Recruiter Client
      │
      ▼ (GET /api/v1/analytics/[overview | by-job | by-stage | applications-trend])
1. authenticate & requireRole('recruiter')
   ├─ 401 Unauthorized if missing or invalid JWT
   └─ 403 Forbidden if user role is interviewer
      │
      ▼
2. analytics.controller.js
   ├─ Parses optional referenceDate/date query parameters for historical or test boundary requests
   └─ Dispatches to analytics.service.js
      │
      ▼
3. analytics.service.js (Database-Level Aggregation Engine)
   ├─ getOverviewKPIs:
   │   ├─ prisma.jobOpening.count({ where: { status: 'Open' } })
   │   ├─ prisma.application.count({ where: { stage: { notIn: ['Rejected', 'Hired'] } } })
   │   ├─ prisma.interviewPanel.count({ where: { OR: [scheduledAt in week, stage=Interview and assigned in week] } })
   │   └─ prisma.application.count({ where: { stage: 'Hired', stageEnteredAt in month } })
   ├─ getAnalyticsByJob:
   │   ├─ prisma.jobOpening.findMany (active and closed openings)
   │   └─ prisma.application.groupBy({ by: ['jobOpeningId', 'stage'], _count: { id: true } })
   ├─ getAnalyticsByStage:
   │   └─ prisma.application.groupBy({ by: ['stage'], _count: { id: true } })
   └─ getApplicationsTrend:
       ├─ Generates exactly 12 weekly UTC intervals (oldest to current)
       └─ prisma.application.findMany({ where: { appliedDate: { gte: oldest12WeekWindow } }, select: { appliedDate: true } })
      │
      ▼
4. Response Handler
   └─ Returns HTTP 200 OK with { status: 'success', data }
```

### Flow L: Stalled Candidate SLA Alerts & Stage-Specific Dismissal (`GET /api/v1/alerts/*`, `POST /api/v1/alerts/:applicationId/dismiss`)
```text
Recruiter Client
      │
      ▼ (GET /api/v1/alerts, GET /api/v1/alerts/count, or POST /api/v1/alerts/:applicationId/dismiss)
1. authenticate & requireRole('recruiter')
   ├─ 401 Unauthorized if missing or invalid JWT
   └─ 403 Forbidden if role is interviewer (recruiters only)
      │
      ▼
2. alerts.controller.js
   ├─ Dispatches to alerts.service.js
   └─ Handles referenceDate parameter for boundary testing
      │
      ▼
3. alerts.service.js (SLA Engine & Stage-Scoped Dismissal)
   ├─ getStalledAlerts / getStalledAlertsCount:
   │   ├─ Computes cutoff = now - 10 days
   │   ├─ Queries applications where stageEnteredAt < cutoff AND stage NOT IN ('Rejected', 'Hired') AND jobOpening.status != 'Archived'
   │   └─ Filters out applications with an existing AlertDismissal for app.stage
   └─ dismissAlert:
       ├─ Validates application exists (404 if missing)
       ├─ Prohibits dismissal for terminal stages (400 if Rejected/Hired)
       ├─ Persists AlertDismissal record with (applicationId, stage, dismissedById, dismissedAt)
       └─ Guarantees zero writes to Phase 7 Timeline (timeline remains pure)
      │
      ▼
4. Response Handler
   └─ Returns HTTP 200 OK with active alerts list, badge count, or dismissal confirmation
```

### Flow M: Public Careers Page & Candidate Self-Application (`GET /api/v1/careers/*`, `POST /api/v1/careers/jobs/:id/apply`)
> **Prototype Workflow Rationale**: This public careers intake flow was introduced so candidates can seamlessly apply and register their interest, enabling a complete end-to-end prototype workflow—from public job discovery and candidate intake to recruiter pipeline screening, panel interview scheduling, scorecards, and final hiring.

```text
Public Candidate Browser
      │
      ▼ (Unauthenticated: GET /careers/jobs, GET /careers/jobs/:id, POST /careers/jobs/:id/apply)
1. publicApplicationRateLimiter Middleware
   ├─ In-memory sliding-window limiter (10 requests per 15 mins per IP)
   └─ Rejects abusive bursts with HTTP 429 Too Many Requests
      │
      ▼
2. careers.controller.js & careers.service.js
   ├─ GET /jobs: Queries prisma.jobOpening.findMany where status = 'Open' (Closed/Archived excluded)
   ├─ GET /jobs/:id: Queries job by ID; returns 404 if missing or status != 'Open'
   └─ POST /jobs/:id/apply:
       ├─ Validates candidateName and regex-checked email (400 Bad Request)
       ├─ Validates target job exists and status === 'Open' (400 if Closed or Archived)
       ├─ Duplicate Guard: Checks if (email, jobOpeningId) exists -> returns 409 Conflict
       ├─ Anti-Spoofing: Forces source = 'Careers Page', stage = 'Applied', userId = null
       └─ Atomic Prisma interactive transaction (prisma.$transaction):
           ├─ prisma.application.create():
           │   └─ candidateName, normalized email, notes, jobOpeningId, source, stage: 'Applied'
           └─ prisma.timeline.create():
               ├─ applicationId: application.id
               ├─ eventType: 'APPLICATION_CREATED'
               ├─ newStage: 'Applied'
               ├─ userId: null (no authenticated internal recruiter)
               └─ details: { source: 'Careers Page', jobTitle } (PII protected: name & email omitted)
      │
      ▼
3. Response Handler
   └─ Returns HTTP 201 Created with { status: 'success', message: 'Application submitted successfully.', data: { application } }
```

---

## 5. Append-Only Audit Architecture & Immutability Guarantees

Candidate timelines in PipelineHQ are designed around strict compliance and non-repudiation principles:

1. **Internally Generated, Never Client-Supplied**:
   - There are **no public timeline creation endpoints** (`POST /api/v1/timeline` or `POST /api/v1/applications/:id/timeline` do not exist).
   - Timeline events are generated **strictly internally** by domain business services (`applications.service.js`, `pipeline.service.js`, `panels.service.js`, `feedback.service.js`, `careers.service.js`) when legitimate state transitions or evaluations succeed.
   - Clients cannot supply event payloads, timestamps, previous stages, or new stages.

2. **Server-Enforced Actor Integrity**:
   - The actor (`userId`) attributed to each timeline event is derived strictly from the cryptographically verified `req.user.id` (or `null` for public candidate self-applications).
   - Any client-supplied parameters in request bodies attempting to spoof the actor (e.g. `{ userId: "other-user", actorId: "..." }`) are discarded.

3. **Atomic Transaction Guarantees**:
   - All state transitions and their corresponding timeline records are wrapped in Prisma interactive transactions (`prisma.$transaction`).
   - If the business operation fails (e.g. invalid stage skip, duplicate rejection), the entire transaction rolls back. A timeline event can **never** exist for a failed or aborted business operation.

4. **Absolute Immutability at Application Level**:
   - No `PUT`, `PATCH`, or `DELETE` routes exist for timeline records.
   - Even recruiters with administrative permissions cannot edit, overwrite, or delete historical timeline entries.
   - Deletion of an entire application record is blocked if the candidate has progressed past `Applied`, has received feedback, or has assigned interviewers, guaranteeing that completed hiring interactions cannot be erased.

---

## 6. What did you decide *not* to build, and why?

1. **Stateful Session Store in Redis / Database**:
   - *Decision*: Adopted stateless signed JWTs instead of Redis sessions.
   - *Why*: Eliminates session store infrastructure overhead while keeping horizontal scaling straightforward.
2. **Client-Trusted Role Claims & Stage Overrides**:
   - *Decision*: Never trust client-provided roles, user IDs, or arbitrary target stages.
   - *Why*: The candidate progression engine is strictly server-enforced (`Applied → Screening → Interview → Offer → Hired`). The server deterministically calculates the single valid next stage, preventing clients or rogue scripts from jumping stages.
3. **Client-Filtered Interviewer Candidates**:
   - *Decision*: Never accept user IDs or interviewer filters from the frontend in `/my-reviews` or feedback submissions.
   - *Why*: Interviewer identity is derived strictly from the verified `req.user.id` on the server, guaranteeing that interviewers cannot spoof identities or inspect evaluations for unassigned candidates.
4. **Timeline Modification & Deletion APIs**:
   - *Decision*: Never create client-facing POST, PUT, PATCH, or DELETE endpoints for timeline records, even for recruiters.
   - *Why*: Audit trails must be legally defensible, tamper-evident, and immutable. Exposing mutation endpoints would open the system to audit tampering or accidental history deletion.
5. **In-Memory Aggregation, Filtering & Pagination**:
   - *Decision*: Never fetch the entire application dataset into Node.js application memory to compute KPIs, group stages, or paginate results using JavaScript arrays.
   - *Why*: Utilizing database-level `GROUP BY`, native counts, and date boundary indexes guarantees $O(1)$ memory usage and microsecond query execution times regardless of whether the database holds ten or ten million candidate records.
6. **Global Boolean Dismissal Flag on Application Record**:
   - *Decision*: Adopted a stage-specific `AlertDismissal` relational model instead of a single `isDismissed` boolean flag on the Application table.
   - *Why*: A candidate whose alert is dismissed in 'Screening' may legitimately stall again in 'Interview'. A global flag would permanently silence future alerts or require complex reset triggers on every transition. Stage-scoped dismissal guarantees clean, isolated suppression without state leakage or timeline modification.
7. **Candidate User Accounts, Passwords, or Logins**:
   - *Decision*: Kept candidate application submission completely unauthenticated and stateless without candidate login, password hashing, or candidate dashboards.
   - *Why*: This public flow was introduced so candidates can easily apply and register their interest, enabling a complete, friction-free end-to-end workflow for the prototype. Forcing external job seekers to create passwords and verify accounts introduces unnecessary barrier-to-entry and high drop-off rates. Public endpoints are secured against spam using in-memory sliding-window rate limiting, duplicate email protection, and strict server-side validation.