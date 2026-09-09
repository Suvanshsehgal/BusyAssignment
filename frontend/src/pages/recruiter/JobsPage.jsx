import { useState } from 'react';
import {
  Briefcase,
  Plus,
  RefreshCw,
  AlertCircle,
  FolderArchive,
  Layers,
} from 'lucide-react';
import { useJobs } from '../../hooks/useJobs.js';
import { JobCard } from '../../components/jobs/JobCard.jsx';
import { JobFormModal } from '../../components/jobs/JobFormModal.jsx';

const STATUS_TABS = [
  { id: 'active', label: 'Active Jobs', params: { includeArchived: 'false' } },
  { id: 'open', label: 'Open', params: { status: 'Open' } },
  { id: 'closed', label: 'Closed', params: { status: 'Closed' } },
  { id: 'archived', label: 'Archived', params: { status: 'Archived' } },
  { id: 'all', label: 'All Jobs', params: { includeArchived: 'true' } },
];

export const JobsPage = () => {
  const [activeTabId, setActiveTabId] = useState('active');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const currentTab =
    STATUS_TABS.find((t) => t.id === activeTabId) || STATUS_TABS[0];
  const { data: jobs, isLoading, isError, error, refetch, isFetching } = useJobs(
    currentTab.params
  );

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#EDF3FE] dark:bg-[#212836] text-[#1E6FF0]">
              <Briefcase className="w-5 h-5" />
            </div>
            <h1 className="font-heading font-bold text-xl sm:text-2xl text-[#111111] dark:text-[#F2F3F5] tracking-tight">
              Job Openings
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#4A4A4A] dark:text-[#AEB2BB] mt-1">
            Manage organizational job postings, statuses, and candidate application flow.
          </p>
        </div>

        {/* Primary Action Button */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Refresh job listings"
            className="p-2.5 rounded-xl border border-[#E7E9EE] dark:border-[#262B35] bg-white dark:bg-[#1A1D24] text-[#4A4A4A] dark:text-[#AEB2BB] hover:text-[#111111] dark:hover:text-[#F2F3F5] hover:bg-[#F5F7FB] dark:hover:bg-[#262B35] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1E6FF0] disabled:opacity-50 cursor-pointer"
            aria-label="Refresh job list"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#1E6FF0] hover:bg-[#1656C2] text-white text-xs sm:text-sm font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#1E6FF0] focus:ring-offset-2 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Post New Job</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-[#E7E9EE] dark:border-[#262B35] flex items-center gap-2 overflow-x-auto no-scrollbar">
        {STATUS_TABS.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTabId(tab.id)}
              className={`pb-3 px-3 text-xs sm:text-sm font-semibold transition-colors border-b-2 -mb-px whitespace-nowrap cursor-pointer focus:outline-none ${
                isActive
                  ? 'border-[#1E6FF0] text-[#1E6FF0]'
                  : 'border-transparent text-[#6B7280] dark:text-[#7E8494] hover:text-[#111111] dark:hover:text-[#F2F3F5]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      {isLoading ? (
        /* Loading Skeleton Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] p-5 sm:p-6 space-y-4 animate-pulse"
            >
              <div className="flex justify-between items-center">
                <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
              </div>
              <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              <div className="space-y-2">
                <div className="h-3.5 w-full bg-gray-100 dark:bg-gray-800 rounded" />
                <div className="h-3.5 w-4/5 bg-gray-100 dark:bg-gray-800 rounded" />
              </div>
              <div className="pt-4 border-t border-[#E7E9EE] dark:border-[#262B35] flex justify-between">
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        /* Error Card */
        <div className="rounded-2xl bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] p-8 sm:p-12 text-center max-w-lg mx-auto shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#FDF2F1] dark:bg-[rgba(192,57,43,0.15)] text-[#C0392B] flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-semibold text-base text-[#111111] dark:text-[#F2F3F5] mb-1">
            Unable to Load Jobs
          </h3>
          <p className="text-xs text-[#4A4A4A] dark:text-[#AEB2BB] mb-6 leading-relaxed">
            {error?.message || 'An unexpected error occurred while communicating with the jobs API.'}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-5 py-2.5 rounded-xl bg-[#1E6FF0] hover:bg-[#1656C2] text-white text-xs font-semibold transition-colors inline-flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      ) : Array.isArray(jobs) && jobs.length > 0 ? (
        /* Populated Jobs Grid */
        <div>
          <div className="mb-4 flex items-center justify-between text-xs text-[#6B7280] dark:text-[#7E8494]">
            <span>
              Showing <strong className="text-[#111111] dark:text-[#F2F3F5]">{jobs.length}</strong>{' '}
              {jobs.length === 1 ? 'opening' : 'openings'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-2xl bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] p-10 sm:p-14 text-center max-w-md mx-auto shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-[#EDF3FE] dark:bg-[#212836] text-[#1E6FF0] flex items-center justify-center mx-auto mb-4">
            {activeTabId === 'archived' ? (
              <FolderArchive className="w-7 h-7" />
            ) : (
              <Layers className="w-7 h-7" />
            )}
          </div>
          <h3 className="font-heading font-semibold text-base sm:text-lg text-[#111111] dark:text-[#F2F3F5] mb-1.5">
            {activeTabId === 'archived'
              ? 'No Archived Jobs'
              : `No ${currentTab.label} Found`}
          </h3>
          <p className="text-xs text-[#4A4A4A] dark:text-[#AEB2BB] mb-6 leading-relaxed">
            {activeTabId === 'archived'
              ? 'Archived jobs will appear here when closed roles are preserved.'
              : 'Get started by creating and publishing a new job opening for candidates.'}
          </p>
          {activeTabId !== 'archived' && (
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-[#1E6FF0] hover:bg-[#1656C2] text-white text-xs font-semibold shadow-sm transition-colors inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Post New Job</span>
            </button>
          )}
        </div>
      )}

      {/* Post Job Modal */}
      <JobFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          // TanStack Query invalidation automatically re-fetches
        }}
      />
    </div>
  );
};
