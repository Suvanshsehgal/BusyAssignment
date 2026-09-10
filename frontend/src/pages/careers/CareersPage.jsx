import { useState, useMemo } from 'react';
import {
  Briefcase,
  Search,
  Building2,
  RefreshCw,
  AlertCircle,
  Inbox,
  Sparkles,
} from 'lucide-react';
import { usePublicJobs } from '../../hooks/useCareers.js';
import { PublicJobCard } from '../../components/careers/PublicJobCard.jsx';

export const CareersPage = () => {
  const { data: jobs = [], isLoading, isError, error, refetch, isFetching } = usePublicJobs();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');

  // Extract unique departments from the real backend jobs
  const departments = useMemo(() => {
    const depts = new Set();
    jobs.forEach((job) => {
      if (job.department) depts.add(job.department);
    });
    return Array.from(depts).sort();
  }, [jobs]);

  // Client-side search & department filtering
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      if (selectedDept !== 'ALL' && job.department !== selectedDept) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const titleMatch = job.title?.toLowerCase().includes(query);
        const deptMatch = job.department?.toLowerCase().includes(query);
        const descMatch = job.description?.toLowerCase().includes(query);
        if (!titleMatch && !deptMatch && !descMatch) {
          return false;
        }
      }
      return true;
    });
  }, [jobs, selectedDept, searchQuery]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Hero Banner */}
      <div className="rounded-3xl bg-gradient-to-b from-white to-[#F5F7FB] dark:from-[#1A1D24] dark:to-[#12141A] border border-[#E7E9EE] dark:border-[#262B35] p-8 sm:p-12 text-center shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#EDF3FE] dark:bg-[#212836] text-[#1E6FF0] border border-[#BFDBFE] dark:border-[#1E3A8A] mx-auto">
          <Sparkles className="w-3.5 h-3.5" />
          <span>We&apos;re Growing</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-[#111111] dark:text-[#F2F3F5] tracking-tight max-w-2xl mx-auto">
          Build the future of hiring infrastructure with us
        </h1>

        <p className="text-sm sm:text-base text-[#6B7280] dark:text-[#7E8494] max-w-xl mx-auto leading-relaxed">
          Explore current open positions at HireStream. Join our team of distributed engineers, architects, and product builders.
        </p>

        {/* Quick stat pill */}
        <div className="pt-2 flex items-center justify-center gap-6 text-xs text-[#6B7280] dark:text-[#7E8494]">
          <div className="flex items-center gap-1.5 font-medium">
            <Briefcase className="w-4 h-4 text-[#1E6FF0]" />
            <span>{jobs.length} Open Position{jobs.length === 1 ? '' : 's'}</span>
          </div>
          {departments.length > 0 && (
            <div className="flex items-center gap-1.5 font-medium">
              <Building2 className="w-4 h-4 text-[#1E6FF0]" />
              <span>Across {departments.length} Department{departments.length === 1 ? '' : 's'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by role title, keyword, or department..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#F5F7FB] dark:bg-[#15181E] border border-[#E7E9EE] dark:border-[#262B35] text-xs sm:text-sm text-[#111111] dark:text-[#F2F3F5] placeholder-[#9CA3AF] dark:placeholder-[#6B7280] focus:outline-none focus:border-[#1E6FF0] focus:ring-2 focus:ring-[#1E6FF0]/20 transition-all"
          />
        </div>

        {/* Department Filter */}
        {departments.length > 0 && (
          <div className="flex items-center gap-2">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-[#F5F7FB] dark:bg-[#15181E] border border-[#E7E9EE] dark:border-[#262B35] text-xs sm:text-sm font-medium text-[#111111] dark:text-[#F2F3F5] focus:outline-none focus:border-[#1E6FF0] transition-colors cursor-pointer"
            >
              <option value="ALL">All Departments ({jobs.length})</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Refresh button */}
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl border border-[#E7E9EE] dark:border-[#262B35] bg-white dark:bg-[#1A1D24] text-xs font-semibold text-[#111111] dark:text-[#F2F3F5] hover:bg-[#F5F7FB] dark:hover:bg-[#262B35] transition-colors disabled:opacity-50"
          title="Refresh jobs list"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-[#1E6FF0]' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-56 rounded-2xl bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] p-6 animate-pulse space-y-4"
            >
              <div className="flex justify-between items-center">
                <div className="h-5 w-24 bg-[#E7E9EE] dark:bg-[#262B35] rounded-lg" />
                <div className="h-4 w-14 bg-[#E7E9EE] dark:bg-[#262B35] rounded-full" />
              </div>
              <div className="h-6 w-3/4 bg-[#E7E9EE] dark:bg-[#262B35] rounded-lg mt-4" />
              <div className="h-4 w-full bg-[#E7E9EE] dark:bg-[#262B35] rounded-lg" />
              <div className="h-4 w-2/3 bg-[#E7E9EE] dark:bg-[#262B35] rounded-lg" />
              <div className="pt-4 border-t border-[#E7E9EE] dark:border-[#262B35] mt-6 flex justify-between">
                <div className="h-4 w-24 bg-[#E7E9EE] dark:bg-[#262B35] rounded-lg" />
                <div className="h-4 w-16 bg-[#E7E9EE] dark:bg-[#262B35] rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error Banner */}
      {isError && (
        <div className="p-8 rounded-2xl bg-[#FDF2F1] dark:bg-[rgba(192,57,43,0.12)] border border-[#FECACA] dark:border-[#7F1D1D] text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-[#C0392B] dark:text-[#F87171] mx-auto" />
          <h3 className="font-heading font-semibold text-base text-[#C0392B] dark:text-[#F87171]">
            Unable to load open career opportunities
          </h3>
          <p className="text-xs text-[#4A4A4A] dark:text-[#AEB2BB] max-w-md mx-auto">
            {error?.response?.data?.message ||
              error?.message ||
              'A network error occurred while retrieving active job openings. Please try again.'}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-2 rounded-xl bg-[#C0392B] text-white text-xs font-semibold hover:bg-[#a93226] transition-colors"
          >
            Retry Loading
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && filteredJobs.length === 0 && (
        <div className="py-16 text-center rounded-2xl bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] p-8 space-y-3 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="w-12 h-12 rounded-2xl bg-[#EDF3FE] dark:bg-[#212836] text-[#1E6FF0] flex items-center justify-center mx-auto mb-2">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-semibold text-base text-[#111111] dark:text-[#F2F3F5]">
            No Open Positions Found
          </h3>
          <p className="text-xs text-[#6B7280] dark:text-[#7E8494] max-w-sm mx-auto">
            {searchQuery || selectedDept !== 'ALL'
              ? 'No open roles match your current search or department filter. Try clearing your filters.'
              : 'We currently do not have any open positions listed. Check back soon as new opportunities are posted regularly.'}
          </p>
          {(searchQuery || selectedDept !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedDept('ALL');
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-[#1E6FF0] hover:bg-[#EDF3FE] dark:hover:bg-[#212836] transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      )}

      {/* Jobs Grid */}
      {!isLoading && !isError && filteredJobs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredJobs.map((job) => (
            <PublicJobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
};
