-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('recruiter', 'interviewer');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('Open', 'Closed', 'Archived');

-- CreateEnum
CREATE TYPE "ApplicationStage" AS ENUM ('Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected');

-- CreateEnum
CREATE TYPE "TimelineEventType" AS ENUM ('APPLICATION_CREATED', 'STAGE_CHANGED', 'APPLICATION_REJECTED', 'APPLICATION_REINSTATED', 'INTERVIEWER_ASSIGNED', 'INTERVIEWER_UNASSIGNED', 'FEEDBACK_SUBMITTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobOpening" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'Open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobOpening_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "candidateName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "notes" TEXT,
    "jobOpeningId" TEXT NOT NULL,
    "stage" "ApplicationStage" NOT NULL DEFAULT 'Applied',
    "appliedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stageEnteredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rejectedFromStage" "ApplicationStage",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewPanel" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InterviewPanel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "interviewerId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "score" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Timeline" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "eventType" "TimelineEventType" NOT NULL,
    "oldStage" "ApplicationStage",
    "newStage" "ApplicationStage",
    "userId" TEXT,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Timeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlertDismissal" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "stage" "ApplicationStage" NOT NULL,
    "dismissedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dismissedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AlertDismissal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "Application_jobOpeningId_idx" ON "Application"("jobOpeningId");

-- CreateIndex
CREATE INDEX "Application_stage_idx" ON "Application"("stage");

-- CreateIndex
CREATE INDEX "Application_source_idx" ON "Application"("source");

-- CreateIndex
CREATE INDEX "Application_appliedDate_idx" ON "Application"("appliedDate");

-- CreateIndex
CREATE INDEX "Application_updatedAt_idx" ON "Application"("updatedAt");

-- CreateIndex
CREATE INDEX "Application_stageEnteredAt_idx" ON "Application"("stageEnteredAt");

-- CreateIndex
CREATE INDEX "Application_email_idx" ON "Application"("email");

-- CreateIndex
CREATE INDEX "Application_candidateName_idx" ON "Application"("candidateName");

-- CreateIndex
CREATE INDEX "InterviewPanel_applicationId_idx" ON "InterviewPanel"("applicationId");

-- CreateIndex
CREATE INDEX "InterviewPanel_userId_idx" ON "InterviewPanel"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "InterviewPanel_applicationId_userId_key" ON "InterviewPanel"("applicationId", "userId");

-- CreateIndex
CREATE INDEX "Feedback_applicationId_idx" ON "Feedback"("applicationId");

-- CreateIndex
CREATE INDEX "Feedback_interviewerId_idx" ON "Feedback"("interviewerId");

-- CreateIndex
CREATE INDEX "Timeline_applicationId_idx" ON "Timeline"("applicationId");

-- CreateIndex
CREATE INDEX "Timeline_createdAt_idx" ON "Timeline"("createdAt");

-- CreateIndex
CREATE INDEX "Timeline_eventType_idx" ON "Timeline"("eventType");

-- CreateIndex
CREATE INDEX "AlertDismissal_applicationId_stage_idx" ON "AlertDismissal"("applicationId", "stage");

-- CreateIndex
CREATE INDEX "AlertDismissal_dismissedAt_idx" ON "AlertDismissal"("dismissedAt");

-- CreateIndex
CREATE UNIQUE INDEX "AlertDismissal_applicationId_stage_key" ON "AlertDismissal"("applicationId", "stage");

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_jobOpeningId_fkey" FOREIGN KEY ("jobOpeningId") REFERENCES "JobOpening"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewPanel" ADD CONSTRAINT "InterviewPanel_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewPanel" ADD CONSTRAINT "InterviewPanel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_interviewerId_fkey" FOREIGN KEY ("interviewerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Timeline" ADD CONSTRAINT "Timeline_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Timeline" ADD CONSTRAINT "Timeline_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertDismissal" ADD CONSTRAINT "AlertDismissal_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertDismissal" ADD CONSTRAINT "AlertDismissal_dismissedById_fkey" FOREIGN KEY ("dismissedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
