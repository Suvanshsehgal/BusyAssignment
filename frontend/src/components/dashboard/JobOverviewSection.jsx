import { Briefcase, AlertCircle, RefreshCw, FolderX } from 'lucide-react';
import { useAnalyticsByJob } from '../../hooks/useAnalytics.js';

export const JobOverviewSection = () => {
  const { data, isLoading, isError, error, refetch, isFetching } = useAnalyticsByJob();

  if (isLoading) {
    return (
      <div className="p-5 sm:p-6 rounded-[10px] bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2 animate-pulse" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-6 animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 dark:bg-[#15181E] rounded-[10px] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 rounded-[10px] bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col items-center justify-center text-center h-80">
        <AlertCircle className="w-8 h-8 text-[#C0392B] mb-2" />
        <p className="text-xs font-semibold text-[#111111] dark:text-[#F2F3F5] mb-1">
          Unable to load job applications overview
        </p>
        <p className="text-[11px] text-[#6B7280] dark:text-[#7E8494] max-w-sm mb-4">
          {error?.message || 'Server error occurred while fetching job breakdowns.'}
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="rounded-full px-4 py-2 bg-[#1E6FF0] text-white text-xs font-medium hover:bg-[#1656C2] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          <span>Retry Job Query</span>
        </button>
      </div>
    );
  }

  const jobs = Array.isArray(data) ? data : [];

  if (jobs.length === 0) {
    return (
      <div className="p-8 rounded-[10px] bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col items-center justify-center text-center">
        <FolderX className="w-10 h-10 text-[#6B7280] dark:text-[#7E8494] mb-3" />
        <h3 className="font-heading font-semibold text-sm text-[#111111] dark:text-[#F2F3F5] mb-1">
          No Job Openings Recorded
        </h3>
        <p className="text-xs text-[#6B7280] dark:text-[#7E8494] max-w-sm">
          No job openings have been created yet in your organization.
        </p>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Open':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#D1FAE5] dark:bg-[#064E3B] text-[#1D9E75] dark:text-[#6EE7B7] border border-[#1D9E75]/20">
            Open
          </span>
        );
      case 'Closed':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#FEF3C7] dark:bg-[#451A03] text-[#BA7517] dark:text-[#FCD34D] border border-[#BA7517]/20">
            Closed
          </span>
        );
      case 'Archived':
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#F3F4F6] dark:bg-[#1F2937] text-[#6B7280] dark:text-[#9CA3AF] border border-[#6B7280]/20">
            Archived
          </span>
        );
    }
  };

  return (
    <div className="p-5 sm:p-6 rounded-[10px] bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] shadow-[0_2px_12px_rgba(0,0,0,0.02)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.2)] transition-colors duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-heading font-semibold text-base text-[#111111] dark:text-[#F2F3F5]">
              Applications by Job Opening
            </h2>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EDF3FE] dark:bg-[#212836] text-[#1E6FF0]">
              <Briefcase className="w-3 h-3" />
              <span>{jobs.length} Positions</span>
            </span>
          </div>
          <p className="text-xs text-[#6B7280] dark:text-[#7E8494] mt-0.5">
            Active pipeline depth and total candidate volume per opening
          </p>
        </div>
      </div>

      <div className="divide-y divide-[#E7E9EE] dark:divide-[#262B35]">
        {jobs.map((job) => {
          const total = job.total_applications ?? job.totalApplications ?? 0;
          const active = job.active_applications ?? job.activeApplications ?? 0;
          const stages = job.stages || {};

          return (
            <div
              key={job.job_id}
              className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Job Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5 flex-wrap mb-1">
                  <h3 className="font-heading font-semibold text-sm text-[#111111] dark:text-[#F2F3F5] truncate">
                    {job.title}
                  </h3>
                  {getStatusBadge(job.status)}
                </div>
                <p className="text-xs text-[#6B7280] dark:text-[#7E8494]">
                  {job.department || 'General'}
                </p>
              </div>

              {/* Stage breakdown chips */}
              <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                <span className="px-2 py-0.5 rounded bg-[#EDF3FE] dark:bg-[#1E293B] text-[#1E6FF0] font-medium" title="Applied">
                  App: {stages.Applied || 0}
                </span>
                <span className="px-2 py-0.5 rounded bg-[#F3E8FF] dark:bg-[#2E1065] text-[#8B5CF6] font-medium" title="Screening">
                  Scr: {stages.Screening || 0}
                </span>
                <span className="px-2 py-0.5 rounded bg-[#FEF3C7] dark:bg-[#451A03] text-[#BA7517] font-medium" title="Interview">
                  Int: {stages.Interview || 0}
                </span>
                <span className="px-2 py-0.5 rounded bg-[#E0F2FE] dark:bg-[#082F49] text-[#0284C7] font-medium" title="Offer">
                  Off: {stages.Offer || 0}
                </span>
                <span className="px-2 py-0.5 rounded bg-[#D1FAE5] dark:bg-[#064E3B] text-[#1D9E75] font-medium" title="Hired">
                  Hir: {stages.Hired || 0}
                </span>
              </div>

              {/* Total and Active Counts */}
              <div className="flex items-center gap-4 text-xs shrink-0 self-end md:self-center">
                <div className="text-right">
                  <p className="text-[10px] uppercase font-semibold text-[#6B7280] dark:text-[#7E8494]">
                    Active
                  </p>
                  <p className="font-heading font-bold text-sm text-[#1E6FF0]">
                    {active}
                  </p>
                </div>
                <div className="text-right pl-3 border-l border-[#E7E9EE] dark:border-[#262B35]">
                  <p className="text-[10px] uppercase font-semibold text-[#6B7280] dark:text-[#7E8494]">
                    Total
                  </p>
                  <p className="font-heading font-bold text-sm text-[#111111] dark:text-[#F2F3F5]">
                    {total}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
