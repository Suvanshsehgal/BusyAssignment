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

