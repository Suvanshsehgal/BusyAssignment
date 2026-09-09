import { useState, useMemo } from 'react';
import {
  ClipboardCheck,
  Search,
  CheckCircle2,
  Clock,
  RefreshCw,
  AlertCircle,
  Inbox,
} from 'lucide-react';
import { useMyReviews } from '../../hooks/useReviews.js';
import { ReviewCard } from '../../components/interviewer/ReviewCard.jsx';

export const MyReviewsPage = () => {
  const { data: reviews = [], isLoading, isError, error, refetch, isFetching } = useMyReviews();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'SUBMITTED'

  // Filter logic
  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      // 1. Status Filter
      const hasFeedback = (review.myFeedback || []).length > 0;
      if (statusFilter === 'PENDING' && hasFeedback) return false;
      if (statusFilter === 'SUBMITTED' && !hasFeedback) return false;

      // 2. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const candidateMatch = review.candidateName?.toLowerCase().includes(query);
        const emailMatch = review.email?.toLowerCase().includes(query);
        const roleMatch = review.jobOpening?.title?.toLowerCase().includes(query);
        const deptMatch = review.jobOpening?.department?.toLowerCase().includes(query);
        const stageMatch = review.stage?.toLowerCase().includes(query);
        if (!candidateMatch && !emailMatch && !roleMatch && !deptMatch && !stageMatch) {
          return false;
        }
      }

      return true;
    });
  }, [reviews, statusFilter, searchQuery]);

  // Counts for tabs
  const pendingCount = useMemo(
    () => reviews.filter((r) => (r.myFeedback || []).length === 0).length,
    [reviews]
  );
  const submittedCount = useMemo(
    () => reviews.filter((r) => (r.myFeedback || []).length > 0).length,
    [reviews]
  );

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EDF3FE] dark:bg-[#212836] text-[#1E6FF0] border border-[#BFDBFE] dark:border-[#1E3A8A]">
              <ClipboardCheck className="w-3.5 h-3.5" />
              Interviewer Portal
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-heading font-bold text-[#111111] dark:text-[#F2F3F5] tracking-tight">
            My Assigned Reviews
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#6B7280] dark:text-[#7E8494]">
            Evaluate candidates assigned to you, view role expectations, and submit structured feedback scorecards.
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E7E9EE] dark:border-[#262B35] bg-white dark:bg-[#1A1D24] text-xs font-semibold text-[#111111] dark:text-[#F2F3F5] hover:bg-[#F5F7FB] dark:hover:bg-[#262B35] transition-colors self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-[#1E6FF0]' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
              statusFilter === 'ALL'
                ? 'bg-[#1E6FF0] text-white shadow-sm'
                : 'bg-[#F5F7FB] dark:bg-[#15181E] text-[#6B7280] dark:text-[#AEB2BB] hover:bg-[#E7E9EE] dark:hover:bg-[#262B35]'
            }`}
          >
            All Assigned ({reviews.length})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('PENDING')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
              statusFilter === 'PENDING'
                ? 'bg-[#BA7517] text-white shadow-sm'
                : 'bg-[#F5F7FB] dark:bg-[#15181E] text-[#6B7280] dark:text-[#AEB2BB] hover:bg-[#E7E9EE] dark:hover:bg-[#262B35]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Feedback</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                statusFilter === 'PENDING'
                  ? 'bg-white/20 text-white'
                  : 'bg-[#FEF7E6] dark:bg-[rgba(186,117,23,0.15)] text-[#BA7517] dark:text-[#FBBF24]'
              }`}
            >
              {pendingCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('SUBMITTED')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
              statusFilter === 'SUBMITTED'
                ? 'bg-[#1D9E75] text-white shadow-sm'
                : 'bg-[#F5F7FB] dark:bg-[#15181E] text-[#6B7280] dark:text-[#AEB2BB] hover:bg-[#E7E9EE] dark:hover:bg-[#262B35]'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Completed</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                statusFilter === 'SUBMITTED'
                  ? 'bg-white/20 text-white'
                  : 'bg-[#E8F8F2] dark:bg-[rgba(29,158,117,0.15)] text-[#1D9E75] dark:text-[#34D399]'
              }`}
            >
              {submittedCount}
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidate or role..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#F5F7FB] dark:bg-[#15181E] border border-[#E7E9EE] dark:border-[#262B35] text-xs sm:text-sm text-[#111111] dark:text-[#F2F3F5] placeholder-[#9CA3AF] dark:placeholder-[#6B7280] focus:outline-none focus:border-[#1E6FF0] focus:ring-2 focus:ring-[#1E6FF0]/20 transition-all"
          />
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-64 rounded-2xl bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] p-6 animate-pulse space-y-4"
            >
              <div className="flex justify-between items-center">
                <div className="h-5 w-24 bg-[#E7E9EE] dark:bg-[#262B35] rounded-lg" />
                <div className="h-5 w-20 bg-[#E7E9EE] dark:bg-[#262B35] rounded-lg" />
              </div>
              <div className="h-6 w-3/4 bg-[#E7E9EE] dark:bg-[#262B35] rounded-lg mt-4" />
              <div className="h-4 w-1/2 bg-[#E7E9EE] dark:bg-[#262B35] rounded-lg" />
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
        <div className="p-6 rounded-2xl bg-[#FDF2F1] dark:bg-[rgba(192,57,43,0.12)] border border-[#FECACA] dark:border-[#7F1D1D] text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-[#C0392B] dark:text-[#F87171] mx-auto" />
          <h3 className="font-heading font-semibold text-sm text-[#C0392B] dark:text-[#F87171]">
            Failed to load assigned reviews
          </h3>
          <p className="text-xs text-[#4A4A4A] dark:text-[#AEB2BB] max-w-md mx-auto">
            {error?.response?.data?.message ||
              error?.message ||
              'A network or authorization error occurred while retrieving your reviews.'}
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
      {!isLoading && !isError && filteredReviews.length === 0 && (
        <div className="py-16 text-center rounded-2xl bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] p-8 space-y-3 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="w-12 h-12 rounded-2xl bg-[#EDF3FE] dark:bg-[#212836] text-[#1E6FF0] flex items-center justify-center mx-auto mb-2">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-semibold text-base text-[#111111] dark:text-[#F2F3F5]">
            No Assigned Reviews Found
          </h3>
          <p className="text-xs text-[#6B7280] dark:text-[#7E8494] max-w-sm mx-auto">
            {searchQuery || statusFilter !== 'ALL'
              ? 'No candidates match your current search criteria or status filter. Try clearing the filters.'
              : 'You do not have any candidate evaluations assigned to you right now. As recruiters assign you to interview panels, candidates will appear here.'}
          </p>
          {(searchQuery || statusFilter !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-[#1E6FF0] hover:bg-[#EDF3FE] dark:hover:bg-[#212836] transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      )}

      {/* Cards Grid */}
      {!isLoading && !isError && filteredReviews.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
};
