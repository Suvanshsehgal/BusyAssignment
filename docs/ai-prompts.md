# AI Prompts & Engineering Log

This document records the prompts used during development, what the AI generated, and how I reviewed, corrected, or refactored the output to maintain strict architectural and domain integrity.

---

## 1. Supabase PostgreSQL Connection Pooler Debugging (Phase 1 / 2)

### Prompt
> "I'm setting up Prisma ORM with Supabase PostgreSQL in Node.js. When running migrations or queries locally, Prisma hangs and fails with `P1001: Can't reach database server`. How do I resolve this connection issue?"

### What I got
The AI suggested increasing the connection timeout (`?connect_timeout=30`), disabling SSL verification (`sslmode=disable`), or using the direct PostgreSQL hostname `db.<ref>.supabase.co:5432`.

### What I corrected
- The AI's recommendation to use the direct hostname failed because free-tier Supabase projects only expose IPv6 `AAAA` records for direct endpoints, which fails on networks without native IPv6 routing. Disabling SSL was also unviable for cloud-hosted databases.
- I checked Supabase's documentation myself and configured the IPv4 Transaction Pooler connection string (`aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true`).
- I also configured Prisma connection limits to match transaction pooling requirements, which eliminated connection drops.

---

## 2. Safe Application Deletion & Audit Preservation (Phase 4)

### Prompt
> "Write a `deleteApplication` service function in Prisma that deletes an application by ID along with its associated records."

### What I got
The AI generated a standard cascading delete:
```javascript
export const deleteApplication = async (id) => {
  return await prisma.application.delete({ where: { id } });
};
```
It relied entirely on database-level `onDelete: Cascade` to wipe out the candidate along with all child interview feedback and timeline records.

### What I corrected
- In an enterprise ATS, silently purging interview scorecards, panel reviews, or historical pipeline moves violates audit compliance and recruiter workflows.
- I intervened and manually added strict multi-tier application-level guards:
  1. If any interviewer `Feedback` records exist, reject deletion with HTTP 400 Bad Request.
  2. If any interviewers are actively assigned in `InterviewPanel`, reject deletion with HTTP 400 Bad Request.
  3. If the candidate has progressed past `Applied` or has transition timeline events, reject deletion with HTTP 400 Bad Request.
- Only completely unreviewed, fresh candidate profiles in `Applied` stage may be purged; otherwise recruiters must follow standard rejection lifecycles.

---

## 3. Candidate Pipeline State Machine Architecture (Phase 5)

### Prompt
> "How should I structure the candidate stage advance route `PATCH /api/v1/applications/:id/advance` in Express using Prisma?"

### What I got
The AI provided a controller handler that read a `targetStage` from `req.body`:
```javascript
const { targetStage } = req.body;
if (!['Screening', 'Interview', 'Offer', 'Hired'].includes(targetStage)) {
  return res.status(400).json({ error: 'Invalid stage' });
}
await prisma.application.update({ where: { id }, data: { stage: targetStage } });
```

### What I corrected
- The AI's implementation completely broke the core sequential progression requirement: any client could send `{ targetStage: 'Offer' }` and jump directly from `Applied` to `Offer`, bypassing screening and interviews.
- I restructured the architecture:
  1. Extracted transition rules into a dedicated, pure rules file (`src/modules/pipeline/pipeline.rules.js`).
  2. The server now deterministically calculates the single valid next stage from the candidate's current stage (`Applied → Screening → Interview → Offer → Hired`).
  3. If a client attempts to pass a target stage that skips steps, the system rejects it with `400 Bad Request`.
  4. Wrapped both the candidate update and the `STAGE_CHANGED` timeline audit record in an atomic `prisma.$transaction`.

---

## 4. Rejection and Reinstatement State Preservation (Phase 5)

### Prompt
> "When a recruiter reinstates a rejected candidate, should I update their stage back to 'Applied' or use a previous stage column?"

### What I got
The AI suggested two options: either resetting the candidate back to `Applied`, or querying the `Timeline` table using `findFirst({ where: { eventType: 'STAGE_CHANGED' }, orderBy: { createdAt: 'desc' } })` to guess the previous stage.

### What I corrected
- Resetting a candidate back to `Applied` wipes out their interview progress (e.g., if a candidate was rejected after reaching `Offer` due to budget freezes, reinstating them to `Applied` forces them to repeat screening).
- Querying the unstructured `Timeline` table is fragile, slow, and prone to ordering ambiguities.
- I enforced our schema design decision: storing the exact prior stage in `rejectedFromStage` at the moment of rejection. On reinstatement (`PATCH /.../reinstate`), the candidate is deterministically restored to `rejectedFromStage`, `stageEnteredAt` is refreshed to `new Date()`, and `rejectedFromStage` is cleared back to `null`.

---

## 5. Debugging Undeclared Variable in Transaction Helper (Bug Correction)

### Prompt
> "Review this atomic transaction snippet for creating timeline entries during stage advancement."

### What I got
The AI generated a helper block that included:
```javascript
details: {
  previousStage: currentStage,
  newStage,
  notes: notes || 'Advanced'
}
```

### What I corrected
- When running automated integration tests, Node threw `ReferenceError: newStage is not defined`.
- The variable storing the calculated destination stage was named `nextStage`, but the AI's snippet used shorthand `{ newStage }`.
- I caught this immediately during test execution, traced the stack trace to `pipeline.service.js`, and corrected the identifier to `newStage: nextStage`. All 33 state machine tests passed immediately afterward.

---

## 6. Preventing Identity Spoofing on `/my-reviews` (Phase 6 IDOR Vulnerability)

### Prompt
> "How should I query assigned candidate applications for the interviewer review portal at `GET /api/v1/my-reviews`?"

### What I got
The AI suggested this query pattern:
```javascript
export const getMyReviews = async (req, res) => {
  const interviewerId = req.query.userId || req.user.id;
  const reviews = await prisma.interviewPanel.findMany({
    where: { userId: interviewerId },
    include: { application: true }
  });
  res.json(reviews);
};
```

### What I corrected
- Allowing `req.query.userId` to override `req.user.id` is an Insecure Direct Object Reference (IDOR) flaw. Any interviewer could change the URL parameter to view another interviewer's assigned candidates and evaluations.
- I corrected this by completely ignoring any client query parameters or request body values. The query strictly derives the interviewer ID from `req.user.id` verified by our JWT authentication middleware.
- I also enforced `requireRole('interviewer')`, rejecting recruiters with a 403 Forbidden response to maintain role separation.

---

## 7. Feedback Authorization & Input Validation (Phase 6)

### Prompt
> "How do I secure `POST /api/v1/applications/:id/feedback` so only interviewers can submit interview feedback?"

### What I got
The AI suggested placing `requireRole('interviewer')` on the route and letting any user with the interviewer role submit feedback for any application.

### What I corrected
- Merely checking `role === 'interviewer'` was insufficient. An interviewer should only be able to submit feedback for candidates **specifically assigned to their interview panel**.
- Instead of writing redundant database queries, I reused our candidate-level authorization middleware (`requireApplicationAccess`) combined with `requireRole('interviewer')`. This ensures:
  1. Recruiters cannot submit interview scorecards (403 Forbidden).
  2. Unassigned interviewers cannot submit feedback for candidates they aren't interviewing (403 Forbidden).
  3. Only assigned panel interviewers can submit scorecards.
- I also added strict schema validation for the feedback payload: checking that `content` is a non-empty string between 3 and 10,000 characters, and that optional `score` is an integer between 1 and 5.

---

## 8. Fixing Prisma Transaction Timeout Over Network Latency (Phase 6 Bug Correction)

### Prompt
> "Prisma throws `Transaction API error: Transaction already closed: A query cannot be executed on an expired transaction. The timeout for this transaction was 5000 ms, however 7059 ms passed`. Why is this happening and how do I fix it?"

### What I got
The AI suggested removing `prisma.$transaction` entirely and running the operations as separate, non-transactional `await` statements so timeouts wouldn't occur.

### What I corrected
- Removing transactions was a bad idea: if the application updates but the timeline audit log fails, the database ends up in a partially updated, inconsistent state.
- The root cause was that Supabase is hosted remotely (Singapore), and executing multiple sequential queries within a single interactive transaction over WAN exceeded Prisma's default 5000ms limit.
- Instead of sacrificing ACID atomicity, I kept the transactions intact and explicitly configured Prisma's interactive transaction options: `{ maxWait: 10000, timeout: 20000 }`. This gave the transaction sufficient buffer for network roundtrips and completely resolved the timeouts.

---

## 9. Designing the Append-Only Audit Timeline Architecture (Phase 7)

### Prompt
> "How should I design the timeline audit API so recruiters can manage and correct candidate history logs if an interviewer made a mistake or a stage was updated accidentally?"

### What I got
The AI suggested implementing standard RESTful CRUD endpoints (`POST /timeline`, `PUT /timeline/:id`, `DELETE /timeline/:id`), allowing recruiters with administrative access to edit or delete historical audit entries.

### What I corrected
- An audit trail must be legally defensible, tamper-evident, and strictly immutable. Permitting any API endpoint or UI control to mutate or delete historical timeline records destroys compliance integrity.
- I rejected exposing any mutation routes (POST, PUT, PATCH, DELETE) to clients. Even recruiters cannot modify or delete timeline events.
- Instead, timeline events are generated strictly internally within atomic database transactions by the underlying domain business services (`applications.service.js`, `pipeline.service.js`, `panels.service.js`, `feedback.service.js`).
- The client is only provided a read-only `GET /api/v1/applications/:id/timeline` endpoint sorted deterministically in ascending chronological order (`createdAt ASC, id ASC`).

---

## 10. Fixing Authorization & 404 Status for Non-Existent Applications (Phase 7 Edge Case Correction)

### Prompt
> "In `requireApplicationAccess`, what should happen if an interviewer requests an application ID that does not exist in the database?"

### What I got
The AI's middleware simply checked `isInterviewerAssignedToApplication(applicationId, req.user.id)`. Since no panel record existed for a non-existent application ID, it returned `403 Forbidden`.

### What I corrected
- In standard REST conventions, requesting a resource that doesn't exist should return `404 Not Found`, not `403 Forbidden`, regardless of whether a recruiter or interviewer makes the request.
- Having an interviewer receive a 403 on a non-existent UUID would cause inconsistent API behavior and mask invalid IDs as permission issues.
- I refactored `requireApplicationAccess` to query `prisma.application.findUnique` first; if missing, it immediately throws `404 Not Found`. If it exists, it then evaluates interviewer panel assignment and returns `403 Forbidden` only if the application exists but the user is unassigned.

---

## 11. Database-Level Filtering vs. In-Memory Array Slicing (Phase 8)

### Prompt
> "How do I implement multi-attribute search, filtering, and pagination for candidate applications in Express and Prisma?"

### What I got
The AI suggested querying all applications with `prisma.application.findMany()`, and then performing in-memory JavaScript filtering:
```javascript
const allApps = await prisma.application.findMany({ include: { jobOpening: true } });
const filtered = allApps.filter(app => app.candidateName.includes(search));
const paginated = filtered.slice((page - 1) * limit, page * limit);
res.json({ data: paginated, total: filtered.length });
```

### What I corrected
- In-memory pagination is an anti-pattern that destroys server performance once candidate counts scale into the thousands. Loading entire tables into Node.js heap memory causes memory pressure, high GC latency, and excessive WAN bandwidth usage.
- I refactored the query to push all search matching (`contains` with `mode: 'insensitive'`), stage filtering, source filtering, and windowing (`skip`, `take`) down to the PostgreSQL database level.
- I also structured the counting and data fetching to run in parallel using `Promise.all([prisma.application.count, prisma.application.findMany])` and enforced the response structure contract `{ data, total_count, page, total_pages }`.

---

## 12. Independent Per-Candidate Processing for Bulk Operations (Phase 8)

### Prompt
> "Write a `bulkAdvanceApplications` function that takes an array of application IDs and advances them."

### What I got
The AI wrapped the entire array in a single Prisma interactive transaction:
```javascript
await prisma.$transaction(async (tx) => {
  for (const id of applicationIds) {
    await advanceApplication(id);
  }
});
```

### What I corrected
- A single all-or-nothing transaction ruins recruiter workflows. If a recruiter selects 20 candidates on a dashboard and one candidate was already rejected or hired, the entire batch fails and rolls back, forcing the recruiter to manually hunt down the single offending candidate.
- I restructured the bulk handler to iterate through each candidate independently. Each candidate is processed in its own isolated transaction: valid candidates advance and write their Phase 7 timeline event, while invalid candidates are caught, rolled back, and recorded in a `failed` list with their specific reason.
- This ensures resilient, partial-success execution where valid candidates are never blocked by an edge case candidate.



