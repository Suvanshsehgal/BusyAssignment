import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Mail,
  Building2,
  AlertCircle,
  FileText,
  Briefcase,
  CheckCircle2,
} from 'lucide-react';
import {
  useApplication,
  useApplicationPanel,
  useApplicationFeedback,
  useApplicationTimeline,
} from '../../hooks/useApplications.js';
import { StageBadge } from '../../components/applications/StageBadge.jsx';
import { FeedbackForm } from '../../components/interviewer/FeedbackForm.jsx';
import { InterviewerPanelReadOnly } from '../../components/interviewer/InterviewerPanelReadOnly.jsx';
import { FeedbackSection } from '../../components/applications/FeedbackSection.jsx';
import { TimelineSection } from '../../components/applications/TimelineSection.jsx';
import { useAuth } from '../../context/useAuth.js';

export const ReviewDetailPage = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();

  const {
    data: application,
    isLoading: isAppLoading,
    isError: isAppError,
    error: appError,
    refetch: refetchApp,
  } = useApplication(id);

  const {
    data: panel = [],
    isLoading: isPanelLoading,
  } = useApplicationPanel(id);

  const {
    data: feedbacks = [],
    isLoading: isFeedbacksLoading,
    refetch: refetchFeedbacks,
  } = useApplicationFeedback(id);

  const {
    data: timeline = [],
    isLoading: isTimelineLoading,
    refetch: refetchTimeline,
  } = useApplicationTimeline(id);

  const isLoading = isAppLoading || isPanelLoading || isFeedbacksLoading || isTimelineLoading;

  const handleFeedbackSubmitted = () => {
    refetchApp();
    refetchFeedbacks();
    refetchTimeline();
  };

  if (isLoading && !application) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-40 bg-white dark:bg-[#1A1D24] rounded-2xl border border-[#E7E9EE] dark:border-[#262B35]" />
        <div className="h-64 bg-white dark:bg-[#1A1D24] rounded-2xl border border-[#E7E9EE] dark:border-[#262B35]" />
        <div className="h-64 bg-white dark:bg-[#1A1D24] rounded-2xl border border-[#E7E9EE] dark:border-[#262B35]" />
      </div>
    );
  }

  if (isAppError || !application) {
    return (
      <div className="max-w-lg mx-auto my-12 p-8 sm:p-10 rounded-2xl bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] text-center shadow-sm space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#FDF2F1] dark:bg-[rgba(192,57,43,0.15)] text-[#C0392B] flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="font-heading font-semibold text-lg text-[#111111] dark:text-[#F2F3F5]">
          Review Assignment Not Found
        </h2>
        <p className="text-xs text-[#6B7280] dark:text-[#7E8494] leading-relaxed">
          {appError?.response?.data?.message ||
            appError?.message ||
            'The requested application either does not exist or you are not assigned to its interview panel.'}
        </p>
        <div className="pt-2">
          <Link
            to="/my-reviews"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1E6FF0] hover:bg-[#1656C2] text-white text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Reviews</span>
          </Link>
        </div>
      </div>
    );
  }

  const job = application.jobOpening || {};

  // Check if the current user has already submitted feedback
  const myFeedbacks = feedbacks.filter((f) => f.interviewer?.id === currentUser?.id);
  const hasMyFeedback = myFeedbacks.length > 0;

  const appliedDate = application.appliedDate
    ? new Date(application.appliedDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Top Navigation & Breadcrumb */}
      <div>
        <Link
          to="/my-reviews"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B7280] dark:text-[#7E8494] hover:text-[#1E6FF0] dark:hover:text-[#1E6FF0] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Assigned Reviews</span>
        </Link>
      </div>

      {/* Candidate Profile Header Card */}
      <div className="rounded-2xl bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#F5F7FB] dark:bg-[#15181E] text-[#4A4A4A] dark:text-[#AEB2BB] border border-[#E7E9EE] dark:border-[#262B35]">
                <Building2 className="w-3.5 h-3.5 text-[#6B7280] dark:text-[#7E8494]" />
                <span>{job.department || 'Engineering'}</span>
              </span>

              <StageBadge stage={application.stage} />

              {hasMyFeedback && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#E8F8F2] dark:bg-[rgba(29,158,117,0.15)] text-[#1D9E75] dark:text-[#34D399] border border-[#A7F3D0] dark:border-[#065F46]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>My Scorecard Logged</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[#111111] dark:text-[#F2F3F5] tracking-tight">
              {application.candidateName}
            </h1>

            <p className="text-sm font-semibold text-[#1E6FF0] flex items-center gap-1.5">
              <Briefcase className="w-4 h-4" />
              <span>{job.title || 'Role Not Specified'}</span>
            </p>
          </div>

          <div className="sm:text-right space-y-1 text-xs text-[#6B7280] dark:text-[#7E8494] shrink-0">
            {appliedDate && (
              <div className="flex items-center sm:justify-end gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Applied: {appliedDate}</span>
              </div>
            )}
            <div className="flex items-center sm:justify-end gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              <span>{application.email}</span>
            </div>
          </div>
        </div>

        {/* Candidate Notes & Overview if available */}
        {application.notes && (
          <div className="p-4 rounded-xl bg-[#F5F7FB] dark:bg-[#15181E] border border-[#E7E9EE] dark:border-[#262B35] space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#111111] dark:text-[#F2F3F5]">
              <FileText className="w-3.5 h-3.5 text-[#1E6FF0]" />
              <span>Candidate Information / Initial Notes</span>
            </div>
            <p className="text-xs text-[#4A4A4A] dark:text-[#AEB2BB] leading-relaxed whitespace-pre-wrap">
              {application.notes}
            </p>
          </div>
        )}
      </div>

      {/* Feedback Submission Form */}
      <FeedbackForm
        applicationId={id}
        onFeedbackSubmitted={handleFeedbackSubmitted}
      />

      {/* Evaluations & Recorded Scorecards Section */}
      <FeedbackSection feedbacks={feedbacks} />

      {/* Read-Only Assigned Interview Panel */}
      <InterviewerPanelReadOnly panel={panel} />

      {/* Read-Only Immutable Audit Timeline */}
      <TimelineSection timeline={timeline} />
    </div>
  );
};
