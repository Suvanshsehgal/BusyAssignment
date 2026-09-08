# PipelineHQ — Database Schema Documentation

This document describes the complete relational database foundation for PipelineHQ ATS, implemented using PostgreSQL via Prisma ORM and hosted on Supabase.

---

## 1. Models & Important Columns

### `User`
Stores system actors with role-based access control.
- `id` (`String` / UUID, Primary Key): Unique identifier.
- `name` (`String`): Full name of the user.
- `email` (`String`, Unique): Work email used for login.
- `passwordHash` (`String`): Bcrypt salted password hash. Plaintext passwords are never stored.
- `role` (`UserRole` Enum: `recruiter`, `interviewer`): Defines operational permissions in the ATS.
- `createdAt` (`DateTime`): Account creation timestamp.
- `updatedAt` (`DateTime`): Last profile update timestamp.

### `JobOpening`
Represents an open, closed, or archived role within a department.
- `id` (`String` / UUID, Primary Key): Unique identifier.
- `title` (`String`): Job title (e.g., "Staff Backend Engineer").
- `department` (`String`): Department/team (e.g., "Engineering", "Sales").
- `description` (`String` / Text): Full role description and requirements.
- `status` (`JobStatus` Enum: `Open`, `Closed`, `Archived`): Lifecycle status of the job.
- `createdAt` (`DateTime`): Timestamp when position was opened.
- `updatedAt` (`DateTime`): Last modification timestamp.

### `Application`
The core entity tracking a candidate through the hiring pipeline.
- `id` (`String` / UUID, Primary Key): Unique identifier.
- `candidateName` (`String`): Full name of the candidate.
- `email` (`String`): Candidate contact email.
- `source` (`String`): Origin of candidate (e.g., "LinkedIn", "Referral", "Careers Page", "Inbound").
- `notes` (`String` / Text, Optional): Recruiter notes or application summary.
- `jobOpeningId` (`String` / UUID, Foreign Key): Reference to the parent `JobOpening`.
- `stage` (`ApplicationStage` Enum: `Applied`, `Screening`, `Interview`, `Offer`, `Hired`, `Rejected`): Current pipeline stage.
- `appliedDate` (`DateTime`): Initial application submission timestamp.
- `stageEnteredAt` (`DateTime`): Timestamp when candidate moved into current stage (used for stall detection).
- `rejectedFromStage` (`ApplicationStage` Enum, Optional): The stage from which candidate was rejected. Preserved for accurate reinstatement.
- `createdAt` (`DateTime`): Record creation timestamp.
- `updatedAt` (`DateTime`): Last updated timestamp.

### `InterviewPanel`
Explicit join model representing an interviewer assignment to a specific candidate application.
- `id` (`String` / UUID, Primary Key): Assignment identifier.
- `applicationId` (`String` / UUID, Foreign Key): Target application.
- `userId` (`String` / UUID, Foreign Key): Assigned interviewer (must possess `interviewer` role).
- `assignedAt` (`DateTime`): When the interviewer was assigned.
- `createdAt` (`DateTime`): Record creation timestamp.

### `Feedback`
Interviewer scorecards and qualitative notes for an application.
- `id` (`String` / UUID, Primary Key): Unique identifier.
- `applicationId` (`String` / UUID, Foreign Key): Associated application.
- `interviewerId` (`String` / UUID, Foreign Key): The interviewer submitting feedback.
- `content` (`String` / Text): Detailed interview notes and assessment.
- `score` (`Int`, Optional): Structured score / rating (1 to 5 scale).
- `createdAt` (`DateTime`): Timestamp when feedback was submitted.
- `updatedAt` (`DateTime`): Last edit timestamp.

### `Timeline`
Append-only audit trail capturing every state transition and interaction for an application.
- `id` (`String` / UUID, Primary Key): Event identifier.
- `applicationId` (`String` / UUID, Foreign Key): Associated application.
- `eventType` (`TimelineEventType` Enum: `APPLICATION_CREATED`, `STAGE_CHANGED`, `APPLICATION_REJECTED`, `APPLICATION_REINSTATED`, `INTERVIEWER_ASSIGNED`, `INTERVIEWER_UNASSIGNED`, `FEEDBACK_SUBMITTED`).
- `oldStage` (`ApplicationStage` Enum, Optional): Previous stage (for transition events).
- `newStage` (`ApplicationStage` Enum, Optional): New stage (for transition events).
- `userId` (`String` / UUID, Foreign Key, Optional): User who performed the action (nullable for system events).
- `details` (`Json` / JSONB, Optional): Flexible structured context (e.g., rejection reason, notes, metadata).
- `createdAt` (`DateTime`): Immutable event timestamp.

### `AlertDismissal`
Records stage-specific alert dismissals by recruiters for stalled applications (>10 days).
- `id` (`String` / UUID, Primary Key): Dismissal record identifier.
- `applicationId` (`String` / UUID, Foreign Key): Target application.
- `stage` (`ApplicationStage` Enum): The specific stage for which the alert was dismissed.
- `dismissedAt` (`DateTime`): Dismissal timestamp.
- `dismissedById` (`String` / UUID, Foreign Key, Optional): Recruiter who dismissed the alert.
- `createdAt` (`DateTime`): Record creation timestamp.

---

## 2. Relationships

### One-to-Many (1:N)
- `JobOpening (1) -> Application (N)`: A job opening can have many applications. An application belongs strictly to exactly one job opening (`onDelete: Restrict`).
- `User (1) -> Feedback (N)`: An interviewer can submit feedback across multiple applications.
- `Application (1) -> Feedback (N)`: An application can accumulate multiple feedback entries from different interviewers.
- `Application (1) -> Timeline (N)`: An application maintains an immutable chronological log of events.
- `User (1) -> Timeline (N)`: An audit event optionally attributes the user responsible.
- `Application (1) -> AlertDismissal (N)`: An application can have dismissal records across distinct stages.
- `User (1) -> AlertDismissal (N)`: Optional reference to the recruiter who dismissed the alert.

### Many-to-Many (N:N)
- `Application (N) <-> User (N)` via `InterviewPanel`:
  - Multiple interviewers can be assigned to a single application.
  - An interviewer can be assigned to multiple applications across different jobs.
  - Implemented as an explicit join table (`InterviewPanel`) with `applicationId` and `userId`.

---

## 3. Indexes & Purpose

| Model | Columns Indexed | Purpose |
|---|---|---|
| `User` | `email` (Unique) | Rapid user lookup during authentication. |
| `User` | `role` | Filtering users by role (e.g., fetching all eligible interviewers). |
| `Application` | `jobOpeningId` | Fast retrieval of all applications belonging to a specific opening. |
| `Application` | `stage` | Pipeline board grouping and filtering by stage. |
| `Application` | `source` | Source analytics and candidate filtering. |
| `Application` | `appliedDate` | Sorting candidates by application date; quarterly metrics. |
| `Application` | `updatedAt` | Sorting candidates by last activity. |
| `Application` | `stageEnteredAt` | Identifying stalled applications where `stageEnteredAt < NOW() - 10 days`. |
| `Application` | `email`, `candidateName` | Candidate search queries across name and email. |
| `InterviewPanel` | `applicationId` | Fetching assigned interviewers for a candidate scorecard. |
| `InterviewPanel` | `userId` | Fetching all applications assigned to an interviewer. |
| `InterviewPanel` | `[applicationId, userId]` (Unique) | Enforces unique assignment and fast joint lookup. |
| `Feedback` | `applicationId` | Fetching all interview scorecards for a candidate. |
| `Feedback` | `interviewerId` | Reviewing feedback submitted by a specific interviewer. |
| `Timeline` | `applicationId` | Chronological loading of an application's full history. |
| `Timeline` | `createdAt` | Time-series ordering and dashboard activity streams. |
| `AlertDismissal` | `[applicationId, stage]` (Unique) | Rapid check to determine if an alert in the current stage is dismissed. |

---

## 4. Database-Level vs. Application-Level Constraints

### Enforced by the Database:
- **Referential Integrity & Cascades**: Foreign keys with `onDelete: Cascade` for child records (InterviewPanel, Feedback, Timeline, AlertDismissal), ensuring orphaned records cannot exist if an application is deleted.
- **Job Preservation (`onDelete: Restrict`)**: Deleting a `JobOpening` with active applications is prohibited at the database level to protect historical records.
- **Uniqueness**:
  - `User.email` unique constraint prevents duplicate accounts.
  - `InterviewPanel(applicationId, userId)` unique constraint prevents duplicate interviewer assignments.
  - `AlertDismissal(applicationId, stage)` unique constraint prevents duplicate dismissals in the same stage.
- **Enums**: `UserRole`, `JobStatus`, `ApplicationStage`, and `TimelineEventType` are strict PostgreSQL enum types, preventing invalid state values.
- **Timestamps**: Default `NOW()` and automatic `updatedAt` triggers ensure accurate auditing.

### Enforced by Application Code:
- **Linear Stage Progression**: The business rule that an application must progress strictly *Applied -> Screening -> Interview -> Offer -> Hired* (no forward stage-skipping) is validated at the service layer.
- **Safe Application Deletion**: Deletion of candidate applications (`DELETE /api/v1/applications/:id`) is restricted to candidates remaining in the initial `Applied` stage who have zero interview feedback records and zero assigned interview panel members. Candidates with active review history cannot be deleted, preserving audit and compliance integrity.
- **Role Verification on Assignment**: Ensuring only users with `role === 'interviewer'` are assigned to `InterviewPanel` rows.
- **Timeline Immutability & Internal Generation**: The application layer exposes no public creation, update, or deletion endpoints for `Timeline` records. Timeline events are strictly append-only, created internally within atomic database transactions by domain services, and queried read-only via `GET /api/v1/applications/:id/timeline`.
- **Interviewer Access Boundaries**: Ensuring interviewers can only query and submit feedback for applications where their `userId` exists in `InterviewPanel`.

---

## 5. Architectural Deep Dives

### Why `rejected_from_stage` Exists
When a candidate is rejected, their `stage` is updated to `Rejected`. Without preserving their previous stage, reinstating a candidate would force the system to either reset them to `Applied` (losing interview progress) or rely on parsing unstructured timeline logs. `rejected_from_stage` stores the exact stage the candidate occupied before rejection, enabling a deterministic reinstatement back to that exact stage.

### Why `stage_entered_at` Exists
ATS systems require SLA monitoring to ensure candidates do not stall indefinitely. `stage_entered_at` records the exact timestamp when a candidate transitioned into their current stage. This allows efficient index-backed queries (`WHERE stageEnteredAt < NOW() - INTERVAL '10 days' AND stage NOT IN ('Hired', 'Rejected')`) to populate stalled alerts and count badges without aggregating historical timeline rows.

### Why `AlertDismissal` is Stage-Specific
A candidate might stall in `Screening` for 12 days, prompting a recruiter to review and dismiss the alert. If that candidate subsequently advances to `Interview` and stalls again for 11 days, the system must trigger a new alert. A boolean `is_dismissed` flag on `Application` would permanently silence alerts for the candidate's entire lifecycle. Storing dismissals as `(applicationId, stage)` ensures that dismissing an alert in `Screening` does not suppress valid alerts in `Interview` or `Offer`.

### Deliberate Denormalization
- **`stage_entered_at` on `Application`**: Instead of scanning `Timeline` to find the latest `STAGE_CHANGED` event timestamp for every candidate list render, storing `stage_entered_at` directly on the `Application` table permits $O(1)$ read performance and direct B-tree index filtering.
- **`rejected_from_stage` on `Application`**: Stored directly on the candidate application rather than requiring a traversal of the `Timeline` table on reinstatement.

### What Would Break First at 100x Scale?
1. **Full Table Scans on Timeline**: As millions of audit events accumulate, queries like `SELECT * FROM Timeline WHERE applicationId = ? ORDER BY createdAt DESC` will require table partitioning by `createdAt` or `applicationId` range/hash.
2. **Alert Filtering with Anti-Joins**: Calculating stalled alerts via `LEFT JOIN AlertDismissal ON ad.application_id = a.id AND ad.stage = a.stage WHERE ad.id IS NULL` across 500,000 active applications would benefit from an active alert materialized view or Redis cache.
3. **Text Search on Candidate Name & Email**: Simple B-tree indexes with `LIKE '%term%'` will degrade. At 100x scale, migrating to PostgreSQL `pg_trgm` GIN indexes or dedicated Elasticsearch/Typesense search is recommended.