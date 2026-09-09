import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Users,
  Edit3,
  Archive,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import {
  useJob,
  useUpdateJob,
  useArchiveJob,
  useRestoreJob,
} from '../../hooks/useJobs.js';
import { JobStatusBadge } from '../../components/jobs/JobStatusBadge.jsx';
import { JobFormModal } from '../../components/jobs/JobFormModal.jsx';
import { ConfirmActionModal } from '../../components/jobs/ConfirmActionModal.jsx';

export const JobDetailPage = () => {
  const { id } = useParams();

  const { data: job, isLoading, isError, error, refetch, isFetching } = useJob(id);

  const updateJobMutation = useUpdateJob();
  const archiveJobMutation = useArchiveJob();
  const restoreJobMutation = useRestoreJob();

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    action: null, // 'archive' | 'restore' | 'close' | 'reopen'
  });

  const applicantCount = job?._count?.applications ?? 0;

  const handleConfirmAction = async () => {
    if (!job?.id || !confirmModal.action) return;

    try {
      if (confirmModal.action === 'archive') {
        await archiveJobMutation.mutateAsync(job.id);
      } else if (confirmModal.action === 'restore') {
        await restoreJobMutation.mutateAsync(job.id);
      } else if (confirmModal.action === 'close') {
        await updateJobMutation.mutateAsync({ id: job.id, data: { status: 'Closed' } });
      } else if (confirmModal.action === 'reopen') {
        await updateJobMutation.mutateAsync({ id: job.id, data: { status: 'Open' } });
      }
      setConfirmModal({ isOpen: false, action: null });
    } catch (err) {
      // Alert handled via mutation error state or modal
      console.error('Failed to execute job action:', err);
    }
  };

  const isActionLoading =
    archiveJobMutation.isPending ||
    restoreJobMutation.isPending ||
    updateJobMutation.isPending;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse pb-12">
        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-8 w-1/2 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-white dark:bg-[#1A1D24] rounded-2xl border border-[#E7E9EE] dark:border-[#262B35]" />
          <div className="h-72 bg-white dark:bg-[#1A1D24] rounded-2xl border border-[#E7E9EE] dark:border-[#262B35]" />
        </div>
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="rounded-2xl bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] p-10 sm:p-14 text-center max-w-lg mx-auto shadow-sm my-12">
        <div className="w-12 h-12 rounded-2xl bg-[#FDF2F1] dark:bg-[rgba(192,57,43,0.15)] text-[#C0392B] flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="font-heading font-semibold text-lg text-[#111111] dark:text-[#F2F3F5] mb-2">
          Job Opening Not Found
        </h2>
        <p className="text-xs text-[#4A4A4A] dark:text-[#AEB2BB] mb-6 leading-relaxed">
          {error?.message ||
            'The requested job opening does not exist or you do not have permission to view it.'}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-2 rounded-xl border border-[#E7E9EE] dark:border-[#262B35] text-xs font-semibold text-[#111111] dark:text-[#F2F3F5] hover:bg-[#F5F7FB] dark:hover:bg-[#262B35] transition-colors"
          >
            Retry
          </button>
          <Link
            to="/jobs"
            className="px-4 py-2 rounded-xl bg-[#1E6FF0] hover:bg-[#1656C2] text-white text-xs font-semibold transition-colors"
          >
            Back to Job Openings
          </Link>
        </div>
      </div>
    );
  }

  const createdDate = job.createdAt
    ? new Date(job.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  const updatedDate = job.updatedAt
    ? new Date(job.updatedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  const isArchived = job.status === 'Archived';
  const isOpen = job.status === 'Open';
  const isClosed = job.status === 'Closed';

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Back navigation & Refresh */}
      <div className="flex items-center justify-between">
        <Link
          to="/jobs"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B7280] dark:text-[#7E8494] hover:text-[#1E6FF0] dark:hover:text-[#1E6FF0] transition-colors focus:outline-none focus:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Job Openings</span>
        </Link>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          title="Refresh job details"
          className="p-1.5 rounded-lg border border-[#E7E9EE] dark:border-[#262B35] bg-white dark:bg-[#1A1D24] text-[#6B7280] dark:text-[#7E8494] hover:text-[#111111] dark:hover:text-[#F2F3F5] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1E6FF0] disabled:opacity-50 cursor-pointer"
          aria-label="Refresh job details"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Archived Notice Banner */}
      {isArchived && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FDF2F1] dark:bg-[rgba(192,57,43,0.12)] border border-[#FECACA] dark:border-[#7F1D1D] flex items-start gap-3 text-xs">
          <AlertTriangle className="w-5 h-5 text-[#C0392B] dark:text-[#F87171] flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-[#C0392B] dark:text-[#F87171]">
              This Job Opening is Archived
            </h4>
            <p className="text-[#7F1D1D] dark:text-[#FECACA] mt-0.5 leading-relaxed">
              Archiving hides this job from normal active job views. All {applicantCount}{' '}
              historical candidate application records, notes, and timelines are fully preserved.
              You can restore this job to active status at any time using the button below.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setConfirmModal({ isOpen: true, action: 'restore' })}
            disabled={isActionLoading}
            className="px-3.5 py-1.5 rounded-xl bg-[#1E6FF0] text-white text-xs font-semibold hover:bg-[#1656C2] transition-colors flex-shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restore Job</span>
          </button>
        </div>
      )}

      {/* Main Header */}
      <div className="rounded-2xl bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-[#F5F7FB] dark:bg-[#15181E] text-[#4A4A4A] dark:text-[#AEB2BB] border border-[#E7E9EE] dark:border-[#262B35]">
                <Building2 className="w-3.5 h-3.5 text-[#6B7280] dark:text-[#7E8494]" />
                <span>{job.department}</span>
              </span>

              <JobStatusBadge status={job.status} />

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-[#EDF3FE] dark:bg-[#212836] text-[#1E6FF0]">
                <Users className="w-3.5 h-3.5" />
                <span>
                  {applicantCount} {applicantCount === 1 ? 'Applicant' : 'Applicants'}
                </span>
              </span>
            </div>

            <h1 className="font-heading font-bold text-xl sm:text-2xl lg:text-3xl text-[#111111] dark:text-[#F2F3F5] tracking-tight">
              {job.title}
            </h1>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5 pt-4 lg:pt-0 border-t lg:border-t-0 border-[#E7E9EE] dark:border-[#262B35]">
            {/* Edit Button */}
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="px-4 py-2.5 rounded-xl border border-[#E7E9EE] dark:border-[#262B35] bg-white dark:bg-[#15181E] text-xs font-semibold text-[#111111] dark:text-[#F2F3F5] hover:bg-[#F5F7FB] dark:hover:bg-[#262B35] transition-colors flex items-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1E6FF0]"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#6B7280] dark:text-[#7E8494]" />
              <span>Edit Details</span>
            </button>

            {/* If Open: can Close or Archive */}
            {isOpen && (
              <>
                <button
                  type="button"
                  onClick={() => setConfirmModal({ isOpen: true, action: 'close' })}
                  disabled={isActionLoading}
                  className="px-4 py-2.5 rounded-xl border border-[#FDE68A] dark:border-[#92400E] bg-[#FEF7E6] dark:bg-[rgba(186,117,23,0.15)] text-xs font-semibold text-[#BA7517] dark:text-[#FBBF24] hover:bg-[#FDE68A]/60 dark:hover:bg-[rgba(186,117,23,0.25)] transition-colors flex items-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#BA7517]"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Close Opening</span>
                </button>

                <button
                  type="button"
                  onClick={() => setConfirmModal({ isOpen: true, action: 'archive' })}
                  disabled={isActionLoading}
                  className="px-4 py-2.5 rounded-xl border border-[#FECACA] dark:border-[#7F1D1D] bg-[#FDF2F1] dark:bg-[rgba(192,57,43,0.12)] text-xs font-semibold text-[#C0392B] dark:text-[#F87171] hover:bg-[#FECACA]/60 dark:hover:bg-[rgba(192,57,43,0.2)] transition-colors flex items-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C0392B]"
                >
                  <Archive className="w-3.5 h-3.5" />
                  <span>Archive Job</span>
                </button>
              </>
            )}

            {/* If Closed: can Reopen or Archive */}
            {isClosed && (
              <>
                <button
                  type="button"
                  onClick={() => setConfirmModal({ isOpen: true, action: 'reopen' })}
                  disabled={isActionLoading}
                  className="px-4 py-2.5 rounded-xl border border-[#A7F3D0] dark:border-[#065F46] bg-[#E8F8F2] dark:bg-[rgba(29,158,117,0.15)] text-xs font-semibold text-[#1D9E75] dark:text-[#34D399] hover:bg-[#A7F3D0]/60 dark:hover:bg-[rgba(29,158,117,0.25)] transition-colors flex items-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Reopen Role</span>
                </button>

                <button
                  type="button"
                  onClick={() => setConfirmModal({ isOpen: true, action: 'archive' })}
                  disabled={isActionLoading}
                  className="px-4 py-2.5 rounded-xl border border-[#FECACA] dark:border-[#7F1D1D] bg-[#FDF2F1] dark:bg-[rgba(192,57,43,0.12)] text-xs font-semibold text-[#C0392B] dark:text-[#F87171] hover:bg-[#FECACA]/60 dark:hover:bg-[rgba(192,57,43,0.2)] transition-colors flex items-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C0392B]"
                >
                  <Archive className="w-3.5 h-3.5" />
                  <span>Archive Job</span>
                </button>
              </>
            )}

            {/* If Archived: can Restore */}
            {isArchived && (
              <button
                type="button"
                onClick={() => setConfirmModal({ isOpen: true, action: 'restore' })}
                disabled={isActionLoading}
                className="px-4 py-2.5 rounded-xl bg-[#1E6FF0] hover:bg-[#1656C2] text-white text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1E6FF0] focus:ring-offset-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore to Open</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Two Column Layout: Description & Meta */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Job Description */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
            <h2 className="font-heading font-semibold text-base sm:text-lg text-[#111111] dark:text-[#F2F3F5] mb-4 pb-3 border-b border-[#E7E9EE] dark:border-[#262B35]">
              Role Description & Specifications
            </h2>

            <div className="text-xs sm:text-sm text-[#4A4A4A] dark:text-[#AEB2BB] leading-relaxed whitespace-pre-wrap font-sans">
              {job.description}
            </div>
          </div>

          {/* Applications Module Placeholder Notice */}
          <div className="rounded-2xl bg-[#F5F7FB] dark:bg-[#15181E] border border-[#E7E9EE] dark:border-[#262B35] p-5 flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-[#EDF3FE] dark:bg-[#212836] text-[#1E6FF0] flex-shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div className="text-xs">
              <h4 className="font-semibold text-[#111111] dark:text-[#F2F3F5]">
                Candidate Application Pipeline ({applicantCount})
              </h4>
              <p className="text-[#6B7280] dark:text-[#7E8494] mt-0.5 leading-relaxed">
                Reviewing candidate profiles, moving stages, scheduling interviews, and submitting feedback
                will be managed in the upcoming Applications module.
              </p>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Metadata Sidebar */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
            <h3 className="font-heading font-semibold text-sm text-[#111111] dark:text-[#F2F3F5] mb-4 pb-3 border-b border-[#E7E9EE] dark:border-[#262B35]">
              Job Overview
            </h3>

            <div className="space-y-4 text-xs">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-[#6B7280] dark:text-[#7E8494]">Current Status</span>
                <JobStatusBadge status={job.status} />
              </div>

              {/* Department */}
              <div className="flex items-center justify-between">
                <span className="text-[#6B7280] dark:text-[#7E8494]">Department</span>
                <span className="font-semibold text-[#111111] dark:text-[#F2F3F5]">
                  {job.department}
                </span>
              </div>

              {/* Applications Count */}
              <div className="flex items-center justify-between">
                <span className="text-[#6B7280] dark:text-[#7E8494]">Applications</span>
                <span className="font-semibold text-[#1E6FF0]">
                  {applicantCount} candidates
                </span>
              </div>

              {/* Created Date */}
              {createdDate && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[#6B7280] dark:text-[#7E8494]">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Date Posted</span>
                  </span>
                  <span className="font-medium text-[#111111] dark:text-[#F2F3F5]">
                    {createdDate}
                  </span>
                </div>
              )}

              {/* Updated Date */}
              {updatedDate && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[#6B7280] dark:text-[#7E8494]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Last Updated</span>
                  </span>
                  <span className="font-medium text-[#111111] dark:text-[#F2F3F5]">
                    {updatedDate}
                  </span>
                </div>
              )}

              {/* Job ID */}
              <div className="pt-3 border-t border-[#E7E9EE] dark:border-[#262B35]">
                <span className="text-[10px] text-[#9CA3AF] block uppercase tracking-wider mb-1">
                  Job Reference ID
                </span>
                <code className="text-[11px] font-mono text-[#6B7280] dark:text-[#7E8494] break-all select-all">
                  {job.id}
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Job Modal */}
      <JobFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialJob={job}
        onSuccess={() => {
          // Handled via TanStack Query invalidation
        }}
      />

      {/* Confirmation Dialogs */}
      {confirmModal.action === 'archive' && (
        <ConfirmActionModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ isOpen: false, action: null })}
          onConfirm={handleConfirmAction}
          title="Archive Job Opening?"
          message={`Archiving "${job.title}" hides it from active job listings. All ${applicantCount} existing candidate application records, notes, and timelines are fully preserved and will not be deleted. You can restore this job at any time.`}
          confirmLabel="Archive Job"
          variant="danger"
          isLoading={isActionLoading}
        />
      )}

      {confirmModal.action === 'restore' && (
        <ConfirmActionModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ isOpen: false, action: null })}
          onConfirm={handleConfirmAction}
          title="Restore Job Opening?"
          message={`This will reactivate "${job.title}" and restore its recruitment status back to Open. It will reappear in active job listings.`}
          confirmLabel="Restore to Open"
          variant="primary"
          isLoading={isActionLoading}
        />
      )}

      {confirmModal.action === 'close' && (
        <ConfirmActionModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ isOpen: false, action: null })}
          onConfirm={handleConfirmAction}
          title="Close Job Opening?"
          message={`Marking "${job.title}" as Closed indicates that no new applications are currently being accepted. You can reopen or archive it later.`}
          confirmLabel="Close Job"
          variant="warning"
          isLoading={isActionLoading}
        />
      )}

      {confirmModal.action === 'reopen' && (
        <ConfirmActionModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ isOpen: false, action: null })}
          onConfirm={handleConfirmAction}
          title="Reopen Job Opening?"
          message={`This will update the status of "${job.title}" back to Open.`}
          confirmLabel="Reopen Job"
          variant="primary"
          isLoading={isActionLoading}
        />
      )}
    </div>
  );
};
