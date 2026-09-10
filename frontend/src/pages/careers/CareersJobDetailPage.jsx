import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Briefcase,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { usePublicJob } from '../../hooks/useCareers.js';

export const CareersJobDetailPage = () => {
  const { jobId } = useParams();
  const { data: job, isLoading, isError, error, refetch } = usePublicJob(jobId);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-6 animate-pulse">
        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-64 bg-white dark:bg-[#1A1D24] rounded-2xl border border-[#E7E9EE] dark:border-[#262B35]" />
        <div className="h-80 bg-white dark:bg-[#1A1D24] rounded-2xl border border-[#E7E9EE] dark:border-[#262B35]" />
      </div>
    );
  }

  // Job not found or closed
  if (isError || !job) {
    const is404 = error?.response?.status === 404;
    return (
      <div className="max-w-lg mx-auto my-12 p-8 sm:p-10 rounded-2xl bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] text-center shadow-sm space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#FDF2F1] dark:bg-[rgba(192,57,43,0.15)] text-[#C0392B] flex items-center justify-center mx-auto">
          {is404 ? <ShieldAlert className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
        </div>
        <h2 className="font-heading font-semibold text-lg text-[#111111] dark:text-[#F2F3F5]">
          {is404 ? 'Position No Longer Open' : 'Unable to Load Position Details'}
        </h2>
        <p className="text-xs text-[#6B7280] dark:text-[#7E8494] leading-relaxed">
          {is404
            ? 'This job opening has been filled, closed, or is no longer accepting public candidate applications.'
            : error?.response?.data?.message ||
              error?.message ||
              'A network error occurred while retrieving details for this position.'}
        </p>
        <div className="pt-2 flex items-center justify-center gap-3">
          {!is404 && (
            <button
              type="button"
              onClick={() => refetch()}
              className="px-4 py-2 rounded-xl border border-[#E7E9EE] dark:border-[#262B35] text-xs font-semibold text-[#111111] dark:text-[#F2F3F5] hover:bg-[#F5F7FB] dark:hover:bg-[#262B35]"
            >
              Retry
            </button>
          )}
          <Link
            to="/careers"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1E6FF0] hover:bg-[#1656C2] text-white text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Browse All Open Roles</span>
          </Link>
        </div>
      </div>
    );
  }

  const isClosed = job.status !== 'Open';
  const postedDate = job.createdAt
    ? new Date(job.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto py-6">
      {/* Back Link */}
      <div>
        <Link
          to="/careers"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B7280] dark:text-[#7E8494] hover:text-[#1E6FF0] dark:hover:text-[#1E6FF0] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Open Roles</span>
        </Link>
      </div>

      {/* Hero Header Card */}
      <div className="rounded-2xl bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#F5F7FB] dark:bg-[#15181E] text-[#4A4A4A] dark:text-[#AEB2BB] border border-[#E7E9EE] dark:border-[#262B35]">
                <Building2 className="w-3.5 h-3.5 text-[#6B7280] dark:text-[#7E8494]" />
                <span>{job.department || 'Engineering'}</span>
              </span>

              {isClosed ? (
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#FDF2F1] dark:bg-[rgba(192,57,43,0.15)] text-[#C0392B] dark:text-[#F87171] border border-[#FECACA] dark:border-[#7F1D1D]">
                  Closed / Not Open
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#E8F8F2] dark:bg-[rgba(29,158,117,0.15)] text-[#1D9E75] dark:text-[#34D399] border border-[#A7F3D0] dark:border-[#065F46]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75] animate-pulse" />
                  <span>Actively Accepting Applications</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-[#111111] dark:text-[#F2F3F5] tracking-tight">
              {job.title}
            </h1>
          </div>

          {/* Primary Apply Action in Header */}
          {!isClosed ? (
            <Link
              to={`/careers/${job.id}/apply`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#1E6FF0] hover:bg-[#1656C2] text-white font-semibold text-xs sm:text-sm shadow-sm transition-all self-start sm:self-auto shrink-0 focus:outline-none focus:ring-2 focus:ring-[#1E6FF0] focus:ring-offset-2"
            >
              <span>Apply Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <span className="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 text-xs font-semibold self-start sm:self-auto">
              Applications Closed
            </span>
          )}
        </div>

        {/* Metadata Strip */}
        <div className="pt-4 border-t border-[#E7E9EE] dark:border-[#262B35] flex flex-wrap items-center gap-6 text-xs text-[#6B7280] dark:text-[#7E8494]">
          {postedDate && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#1E6FF0]" />
              <span>Posted on {postedDate}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-[#1E6FF0]" />
            <span>Full-time Position</span>
          </div>
        </div>
      </div>

      {/* Job Description Card */}
      <div className="rounded-2xl bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-6">
        <div>
          <h2 className="text-base sm:text-lg font-heading font-semibold text-[#111111] dark:text-[#F2F3F5] mb-4 pb-3 border-b border-[#E7E9EE] dark:border-[#262B35]">
            About the Role & Qualifications
          </h2>
          <div className="text-xs sm:text-sm text-[#4A4A4A] dark:text-[#AEB2BB] leading-relaxed whitespace-pre-wrap">
            {job.description || 'No detailed description provided for this opening.'}
          </div>
        </div>
      </div>

      {/* Bottom Apply CTA Card */}
      {!isClosed ? (
        <div className="rounded-2xl bg-[#EDF3FE] dark:bg-[#1A2332] border border-[#BFDBFE] dark:border-[#1E3A8A] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="font-heading font-semibold text-base text-[#111111] dark:text-[#F2F3F5]">
              Ready to submit your application?
            </h3>
            <p className="text-xs text-[#6B7280] dark:text-[#93C5FD] mt-1">
              No account creation or registration needed. Our team reviews applications promptly.
            </p>
          </div>

          <Link
            to={`/careers/${job.id}/apply`}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#1E6FF0] hover:bg-[#1656C2] text-white font-semibold text-xs sm:text-sm shadow-sm transition-all shrink-0 focus:outline-none focus:ring-2 focus:ring-[#1E6FF0]"
          >
            <span>Apply for this Role</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl bg-[#F5F7FB] dark:bg-[#15181E] border border-[#E7E9EE] dark:border-[#262B35] p-6 text-center space-y-2">
          <p className="text-xs font-semibold text-[#111111] dark:text-[#F2F3F5]">
            This role is currently closed to new applications.
          </p>
          <p className="text-xs text-[#6B7280] dark:text-[#7E8494]">
            Please check our careers page for other available opportunities.
          </p>
          <div className="pt-2">
            <Link
              to="/careers"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1E6FF0] hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Careers Listings</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
