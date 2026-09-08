-- AlterTable
ALTER TABLE "InterviewPanel" ADD COLUMN "scheduledAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "InterviewPanel_scheduledAt_idx" ON "InterviewPanel"("scheduledAt");
