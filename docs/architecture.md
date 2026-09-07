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

---

## 5. What did you decide *not* to build, and why?

1. **Stateful Session Store in Redis / Database**:
   - *Decision*: Adopted stateless signed JWTs instead of Redis sessions.
   - *Why*: Eliminates session store infrastructure overhead while keeping horizontal scaling straightforward.
2. **Client-Trusted Role Claims & Stage Overrides**:
   - *Decision*: Never trust client-provided roles, user IDs, or arbitrary target stages.
   - *Why*: The candidate progression engine is strictly server-enforced (`Applied → Screening → Interview → Offer → Hired`). The server deterministically calculates the single valid next stage, preventing clients or rogue scripts from jumping stages.
3. **Premature Implementation of Future Phase APIs**:
   - *Decision*: Intentionally omitted Interview Panel assignment APIs, reviewer scorecards (`/my-reviews`), standalone Timeline query APIs, bulk candidate actions, CSV exports, SLA stall alerts, and analytics dashboards during Phase 5.
   - *Why*: Maintaining strict phase boundaries guarantees isolated, verifiable, and regression-free development of the core pipeline state machine before layering interview workflows and alerting engines.