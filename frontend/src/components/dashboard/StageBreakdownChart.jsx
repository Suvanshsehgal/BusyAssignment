import { Layers, AlertCircle, RefreshCw } from 'lucide-react';
import { useAnalyticsByStage } from '../../hooks/useAnalytics.js';

const STAGE_COLORS = {
  Applied: {
    bg: '#1E6FF0',
    lightBg: '#EDF3FE',
    darkBg: '#1E293B',
    text: '#1E6FF0',
  },
  Screening: {
    bg: '#8B5CF6',
    lightBg: '#F3E8FF',
    darkBg: '#2E1065',
    text: '#8B5CF6',
  },
  Interview: {
    bg: '#BA7517',
    lightBg: '#FEF3C7',
    darkBg: '#451A03',
    text: '#BA7517',
  },
  Offer: {
    bg: '#0284C7',
    lightBg: '#E0F2FE',
    darkBg: '#082F49',
    text: '#0284C7',
  },
  Hired: {
    bg: '#1D9E75',
    lightBg: '#D1FAE5',
    darkBg: '#064E3B',
    text: '#1D9E75',
  },
  Rejected: {
    bg: '#6B7280',
    lightBg: '#F3F4F6',
    darkBg: '#1F2937',
    text: '#6B7280',
  },
};

export const StageBreakdownChart = () => {
  const { data, isLoading, isError, error, refetch, isFetching } = useAnalyticsByStage();

  if (isLoading) {
    return (
      <div className="p-5 sm:p-6 rounded-[10px] bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-2 animate-pulse" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-52 mb-6 animate-pulse" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-1.5 animate-pulse">
              <div className="flex justify-between">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-10" />
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full" />
            </div>
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
          Unable to load stage breakdown
        </p>
        <p className="text-[11px] text-[#6B7280] dark:text-[#7E8494] max-w-sm mb-4">
          {error?.message || 'Server error occurred while fetching stage analytics.'}
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="rounded-full px-4 py-2 bg-[#1E6FF0] text-white text-xs font-medium hover:bg-[#1656C2] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          <span>Retry Stage Query</span>
        </button>
      </div>
    );
  }

  const breakdown = data?.breakdown || [];
  const totalApplications = data?.total_applications || 0;
  const activeApplications = data?.active_applications || 0;

  return (
    <div className="p-5 sm:p-6 rounded-[10px] bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] shadow-[0_2px_12px_rgba(0,0,0,0.02)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.2)] transition-colors duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-heading font-semibold text-base text-[#111111] dark:text-[#F2F3F5]">
              Pipeline by Stage
            </h2>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EDF3FE] dark:bg-[#212836] text-[#1E6FF0]">
              <Layers className="w-3 h-3" />
              <span>Full Funnel</span>
            </span>
          </div>
          <p className="text-xs text-[#6B7280] dark:text-[#7E8494] mt-0.5">
            Active candidate distribution and stage conversions
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#6B7280] dark:text-[#7E8494]">
            Active: <strong className="text-[#1E6FF0] font-semibold">{activeApplications}</strong>
          </span>
          <span className="text-[#E7E9EE] dark:text-[#262B35]">|</span>
          <span className="text-[#6B7280] dark:text-[#7E8494]">
            Total: <strong className="text-[#111111] dark:text-[#F2F3F5] font-semibold">{totalApplications}</strong>
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {breakdown.map((item) => {
          const colors = STAGE_COLORS[item.stage] || STAGE_COLORS.Rejected;
          return (
            <div key={item.stage} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: colors.bg }}
                  />
                  <span className="font-medium text-[#111111] dark:text-[#F2F3F5]">
                    {item.stage}
                  </span>
                  {!item.is_active && (
                    <span className="text-[10px] text-[#6B7280] dark:text-[#7E8494] px-1.5 py-0.2 rounded bg-gray-100 dark:bg-[#212836]">
                      terminal
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-right">
                  <span className="font-semibold text-[#111111] dark:text-[#F2F3F5]">
                    {item.count}
                  </span>
                  <span className="text-[11px] text-[#6B7280] dark:text-[#7E8494] w-12 text-right">
                    {item.percentage}%
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-[#F5F7FB] dark:bg-[#0F1115] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${Math.max(item.percentage, item.count > 0 ? 3 : 0)}%`,
                    backgroundColor: colors.bg,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
