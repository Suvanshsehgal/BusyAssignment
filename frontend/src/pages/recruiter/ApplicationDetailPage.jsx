import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Calendar,
  Briefcase,
  TrendingUp,
  XCircle,
  RotateCcw,
  Edit3,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  FileText,
  Users,
  History,
} from 'lucide-react';
import {
  useApplication,
  useAdvanceApplication,
  useRejectApplication,
  useReinstateApplication,
  useApplications,
} from '../../hooks/useApplications.js';
import { StageBadge } from '../../components/applications/StageBadge.jsx';
import { PipelineStepper } from '../../components/applications/PipelineStepper.jsx';
import { InterviewPanelSection } from '../../components/applications/InterviewPanelSection.jsx';
import { FeedbackSection } from '../../components/applications/FeedbackSection.jsx';
import { TimelineSection } from '../../components/applications/TimelineSection.jsx';
import { ApplicationFormModal } from '../../components/applications/ApplicationFormModal.jsx';

const NEXT_STAGE_MAP = {
  Applied: 'Screening',
  Screening: 'Interview',
  Interview: 'Offer',
  Offer: 'Hired',
};

export const ApplicationDetailPage = () => {
  const { id } = useParams();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'panel' | 'timeline'
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Modals for pipeline transitions
  const [actionModal, setActionModal] = useState({
    isOpen: false,
    action: null, // 'advance' | 'reject' | 'reinstate'
  });
  const [transitionNotes, setTransitionNotes] = useState('');
  const [actionError, setActionError] = useState('');

  const {
    data: application,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useApplication(id);

  // Query general applications to discover all interviewers for panel assignment
  const { data: allApplicationsData } = useApplications({ limit: 50 });
  const allApplications = allApplicationsData?.data || [];

  const advanceMutation = useAdvanceApplication();
  const rejectMutation = useRejectApplication();
  const reinstateMutation = useReinstateApplication();
  const isMutating =
    advanceMutation.isPending ||
    rejectMutation.isPending ||
    reinstateMutation.isPending;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse pb-16">
        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-32 bg-white dark:bg-[#1A1D24] rounded-2xl border border-[#E7E9EE] dark:border-[#262B35]" />
        <div className="h-28 bg-white dark:bg-[#1A1D24] rounded-2xl border border-[#E7E9EE] dark:border-[#262B35]" />
        <div className="h-96 bg-white dark:bg-[#1A1D24] rounded-2xl border border-[#E7E9EE] dark:border-[#262B35]" />
      </div>
    );
  }

  if (isError || !application) {
    return (
      <div className="rounded-2xl bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] p-10 sm:p-14 text-center max-w-lg mx-auto shadow-sm my-12">
        <div className="w-12 h-12 rounded-2xl bg-[#FDF2F1] dark:bg-[rgba(192,57,43,0.15)] text-[#C0392B] flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="font-heading font-semibold text-lg text-[#111111] dark:text-[#F2F3F5] mb-2">
          Application Not Found
        </h2>
        <p className="text-xs text-[#4A4A4A] dark:text-[#AEB2BB] mb-6 leading-relaxed">
          {error?.message ||
            'The requested candidate application does not exist or you do not have permission to view it.'}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-2 rounded-xl border border-[#E7E9EE] dark:border-[#262B35] text-xs font-semibold text-[#111111] dark:text-[#F2F3F5] hover:bg-[#F5F7FB] dark:hover:bg-[#262B35]"
          >
            Retry
          </button>
          <Link
            to="/applications"
            className="px-4 py-2 rounded-xl bg-[#1E6FF0] hover:bg-[#1656C2] text-white text-xs font-semibold"
          >
            Back to Applications
          </Link>
        </div>
      </div>
    );
  }

  const job = application.jobOpening || {};
  const panels = application.interviewPanels || [];
  const feedbacks = application.feedbacks || [];
  const timeline = application.timelineEvents || [];

  const currentStage = application.stage;
  const isRejected = currentStage === 'Rejected';
  const isHired = currentStage === 'Hired';
  const nextStage = NEXT_STAGE_MAP[currentStage];

  const appliedDate = application.appliedDate
    ? new Date(application.appliedDate).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '—';

  const lastUpdated = application.updatedAt
    ? new Date(application.updatedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '—';

  // Handle Pipeline Transition
  const handleExecuteAction = async (e) => {
    e.preventDefault();
    setActionError('');

    try {
      if (actionModal.action === 'advance') {
        await advanceMutation.mutateAsync({
          id: application.id,
          payload: { notes: transitionNotes.trim() || undefined },
        });
      } else if (actionModal.action === 'reject') {
        await rejectMutation.mutateAsync({
          id: application.id,
          payload: {
            reason: transitionNotes.trim() || undefined,
            notes: transitionNotes.trim() || undefined,
          },
        });
      } else if (actionModal.action === 'reinstate') {
        await reinstateMutation.mutateAsync({
          id: application.id,
          payload: { notes: transitionNotes.trim() || undefined },
        });
      }
      setActionModal({ isOpen: false, action: null });
      setTransitionNotes('');
    } catch (err) {
      setActionError(
        err.response?.data?.message ||
          err.message ||
          'Failed to execute pipeline transition.'
      );
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Back Navigation & Refresh */}
      <div className="flex items-center justify-between">
        <Link
          to="/applications"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B7280] dark:text-[#7E8494] hover:text-[#1E6FF0] dark:hover:text-[#1E6FF0] transition-colors focus:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Applications</span>
        </Link>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          title="Refresh application details"
          className="p-1.5 rounded-lg border border-[#E7E9EE] dark:border-[#262B35] bg-white dark:bg-[#1A1D24] text-[#6B7280] dark:text-[#7E8494] hover:text-[#111111] dark:hover:text-[#F2F3F5] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1E6FF0] disabled:opacity-50 cursor-pointer"
          aria-label="Refresh application"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Main Header Banner */}
      <div className="rounded-2xl bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          {/* Candidate Identity */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <StageBadge
                stage={application.stage}
                rejectedFromStage={application.rejectedFromStage}
              />

              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F5F7FB] dark:bg-[#15181E] text-[#4A4A4A] dark:text-[#AEB2BB] border border-[#E7E9EE] dark:border-[#262B35]">
                Source: {application.source}
              </span>

              <Link
                to={`/jobs/${job.id}`}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#EDF3FE] dark:bg-[#212836] text-[#1E6FF0] hover:underline"
              >
                <Briefcase className="w-3 h-3" />
                <span>{job.title}</span>
              </Link>
            </div>

            <h1 className="font-heading font-bold text-xl sm:text-2xl lg:text-3xl text-[#111111] dark:text-[#F2F3F5] tracking-tight">
              {application.candidateName}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-[#6B7280] dark:text-[#7E8494]">
              <a
                href={`mailto:${application.email}`}
                className="inline-flex items-center gap-1.5 text-[#1E6FF0] hover:underline"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{application.email}</span>
              </a>

              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Applied on {appliedDate}</span>
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5 pt-4 lg:pt-0 border-t lg:border-t-0 border-[#E7E9EE] dark:border-[#262B35]">
            {/* Edit Candidate Information */}
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="px-3.5 py-2 rounded-xl border border-[#E7E9EE] dark:border-[#262B35] bg-white dark:bg-[#15181E] text-xs font-semibold text-[#111111] dark:text-[#F2F3F5] hover:bg-[#F5F7FB] dark:hover:bg-[#262B35] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#6B7280]" />
              <span>Edit Details</span>
            </button>

            {/* If Non-Terminal Stage: Advance or Reject */}
            {!isRejected && !isHired && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setActionError('');
                    setTransitionNotes('');
                    setActionModal({ isOpen: true, action: 'advance' });
                  }}
                  disabled={isMutating}
                  className="px-4 py-2 rounded-xl bg-[#1E6FF0] hover:bg-[#1656C2] text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1E6FF0] focus:ring-offset-2 disabled:opacity-50"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Advance to {nextStage}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActionError('');
                    setTransitionNotes('');
                    setActionModal({ isOpen: true, action: 'reject' });
                  }}
                  disabled={isMutating}
                  className="px-4 py-2 rounded-xl border border-[#FECACA] dark:border-[#7F1D1D] bg-[#FDF2F1] dark:bg-[rgba(192,57,43,0.12)] text-xs font-semibold text-[#C0392B] dark:text-[#F87171] hover:bg-[#FECACA]/60 transition-colors flex items-center gap-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C0392B] disabled:opacity-50"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </button>
              </>
            )}

            {/* If Rejected: Reinstate back to rejectedFromStage */}
            {isRejected && (
              <button
                type="button"
                onClick={() => {
                  setActionError('');
                  setTransitionNotes('');
                  setActionModal({ isOpen: true, action: 'reinstate' });
                }}
                disabled={isMutating}
                className="px-4 py-2 rounded-xl bg-[#1D9E75] hover:bg-[#16815F] text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:ring-offset-2 disabled:opacity-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reinstate to {application.rejectedFromStage || 'Previous Stage'}</span>
              </button>
            )}

            {/* If Hired: Terminal indication */}
            {isHired && (
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E8F8F2] dark:bg-[rgba(29,158,117,0.15)] text-xs font-semibold text-[#1D9E75] dark:text-[#34D399] border border-[#A7F3D0] dark:border-[#065F46]">
                <CheckCircle2 className="w-4 h-4" />
                <span>Candidate Hired</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Pipeline Progress Stepper */}
      <PipelineStepper
        stage={application.stage}
        rejectedFromStage={application.rejectedFromStage}
      />

      {/* Navigation Tabs */}
      <div className="border-b border-[#E7E9EE] dark:border-[#262B35] flex items-center gap-4 text-xs sm:text-sm font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`pb-3 border-b-2 -mb-px transition-colors flex items-center gap-1.5 cursor-pointer focus:outline-none ${
            activeTab === 'overview'
              ? 'border-[#1E6FF0] text-[#1E6FF0]'
              : 'border-transparent text-[#6B7280] dark:text-[#7E8494] hover:text-[#111111] dark:hover:text-[#F2F3F5]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Profile & Notes</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('panel')}
          className={`pb-3 border-b-2 -mb-px transition-colors flex items-center gap-1.5 cursor-pointer focus:outline-none ${
            activeTab === 'panel'
              ? 'border-[#1E6FF0] text-[#1E6FF0]'
              : 'border-transparent text-[#6B7280] dark:text-[#7E8494] hover:text-[#111111] dark:hover:text-[#F2F3F5]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Panel & Feedback ({panels.length + feedbacks.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('timeline')}
          className={`pb-3 border-b-2 -mb-px transition-colors flex items-center gap-1.5 cursor-pointer focus:outline-none ${
            activeTab === 'timeline'
              ? 'border-[#1E6FF0] text-[#1E6FF0]'
              : 'border-transparent text-[#6B7280] dark:text-[#7E8494] hover:text-[#111111] dark:hover:text-[#F2F3F5]'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Audit Timeline ({timeline.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Notes & Summary */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-3">
              <h3 className="font-heading font-semibold text-base text-[#111111] dark:text-[#F2F3F5] pb-3 border-b border-[#E7E9EE] dark:border-[#262B35]">
                Recruiter Screening Notes
              </h3>

              <div className="text-xs sm:text-sm text-[#4A4A4A] dark:text-[#AEB2BB] leading-relaxed whitespace-pre-wrap">
                {application.notes || 'No recruiter notes recorded for this candidate.'}
              </div>
            </div>
          </div>

          {/* Metadata Sidebar */}
          <div className="space-y-6">
            <div className="rounded-2xl bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4 text-xs">
              <h4 className="font-heading font-semibold text-sm text-[#111111] dark:text-[#F2F3F5] pb-3 border-b border-[#E7E9EE] dark:border-[#262B35]">
                Candidate Overview
              </h4>

              <div className="flex items-center justify-between">
                <span className="text-[#6B7280] dark:text-[#7E8494]">Current Stage</span>
                <StageBadge
                  stage={application.stage}
                  rejectedFromStage={application.rejectedFromStage}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#6B7280] dark:text-[#7E8494]">Job Department</span>
                <span className="font-medium text-[#111111] dark:text-[#F2F3F5]">
                  {job.department || '—'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#6B7280] dark:text-[#7E8494]">Source</span>
                <span className="font-semibold text-[#1E6FF0]">{application.source}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#6B7280] dark:text-[#7E8494]">Applied Date</span>
                <span className="font-medium text-[#111111] dark:text-[#F2F3F5]">
                  {appliedDate}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#6B7280] dark:text-[#7E8494]">Last Updated</span>
                <span className="font-medium text-[#111111] dark:text-[#F2F3F5]">
                  {lastUpdated}
                </span>
              </div>

              <div className="pt-3 border-t border-[#E7E9EE] dark:border-[#262B35]">
                <span className="text-[10px] uppercase tracking-wider text-[#9CA3AF] block mb-1">
                  Application ID
                </span>
                <code className="text-[11px] font-mono text-[#6B7280] dark:text-[#7E8494] break-all select-all">
                  {application.id}
                </code>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'panel' && (
        <div className="space-y-6">
          <InterviewPanelSection
            applicationId={application.id}
            panel={panels}
            allApplications={allApplications}
          />

          <FeedbackSection feedbacks={feedbacks} />
        </div>
      )}

      {activeTab === 'timeline' && (
        <TimelineSection timeline={timeline} />
      )}

      {/* Edit Modal */}
      <ApplicationFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialApplication={application}
        onSuccess={() => {
          // TanStack Query invalidation updates data
        }}
      />

      {/* Pipeline Action Confirmation Modal */}
      {actionModal.isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="transition-modal-title"
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] shadow-2xl p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E9EE] dark:border-[#262B35]">
              <h3
                id="transition-modal-title"
                className="text-base font-heading font-semibold text-[#111111] dark:text-[#F2F3F5]"
              >
                {actionModal.action === 'advance' && `Advance to ${nextStage}`}
                {actionModal.action === 'reject' && 'Reject Candidate'}
                {actionModal.action === 'reinstate' &&
                  `Reinstate to ${application.rejectedFromStage || 'Previous Stage'}`}
              </h3>
              <button
                type="button"
                onClick={() => setActionModal({ isOpen: false, action: null })}
                disabled={isMutating}
                className="p-1 rounded-lg text-[#6B7280] hover:bg-[#F5F7FB] dark:hover:bg-[#262B35]"
              >
                ✕
              </button>
            </div>

            {actionError && (
              <div className="mt-3 p-3 rounded-xl bg-[#FDF2F1] dark:bg-[rgba(192,57,43,0.15)] border border-[#FECACA] dark:border-[#7F1D1D] text-[#C0392B] dark:text-[#F87171] text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{actionError}</span>
              </div>
            )}

            <form onSubmit={handleExecuteAction} className="mt-4 space-y-4 text-xs">
              <p className="text-[#4A4A4A] dark:text-[#AEB2BB] leading-relaxed">
                {actionModal.action === 'advance' &&
                  `This will progress ${application.candidateName} forward from ${currentStage} to ${nextStage} and log an immutable audit event.`}
                {actionModal.action === 'reject' &&
                  `This will mark ${application.candidateName} as Rejected while recording ${currentStage} as the stage rejected from. Candidate can be reinstated later.`}
                {actionModal.action === 'reinstate' &&
                  `This will reinstate ${application.candidateName} back to the ${
                    application.rejectedFromStage || 'previous'
                  } stage.`}
              </p>

              <div>
                <label
                  htmlFor="action-notes-input"
                  className="block font-semibold text-[#111111] dark:text-[#F2F3F5] mb-1.5"
                >
                  {actionModal.action === 'reject'
                    ? 'Rejection Reason / Notes (Optional)'
                    : 'Transition Notes (Optional)'}
                </label>
                <textarea
                  id="action-notes-input"
                  rows={3}
                  value={transitionNotes}
                  onChange={(e) => setTransitionNotes(e.target.value)}
                  placeholder="Add context or rationale for this pipeline movement..."
                  className="w-full px-3 py-2 rounded-xl border border-[#E7E9EE] dark:border-[#262B35] bg-white dark:bg-[#15181E] text-[#111111] dark:text-[#F2F3F5] focus:ring-2 focus:ring-[#1E6FF0] focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-[#E7E9EE] dark:border-[#262B35] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActionModal({ isOpen: false, action: null })}
                  disabled={isMutating}
                  className="px-4 py-2 rounded-xl border border-[#E7E9EE] dark:border-[#262B35] text-[#111111] dark:text-[#F2F3F5] font-semibold hover:bg-[#F5F7FB] dark:hover:bg-[#262B35]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isMutating}
                  className={`px-4 py-2 rounded-xl text-white font-semibold flex items-center gap-1.5 ${
                    actionModal.action === 'reject'
                      ? 'bg-[#C0392B] hover:bg-[#A93226]'
                      : actionModal.action === 'reinstate'
                      ? 'bg-[#1D9E75] hover:bg-[#16815F]'
                      : 'bg-[#1E6FF0] hover:bg-[#1656C2]'
                  }`}
                >
                  {isMutating && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>
                    {actionModal.action === 'advance' && 'Confirm Advance'}
                    {actionModal.action === 'reject' && 'Confirm Rejection'}
                    {actionModal.action === 'reinstate' && 'Confirm Reinstatement'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
