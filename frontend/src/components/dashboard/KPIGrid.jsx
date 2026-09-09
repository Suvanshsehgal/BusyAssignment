import { Briefcase, Users, CalendarCheck, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { useOverviewKPIs } from '../../hooks/useAnalytics.js';

export const KPIGrid = () => {
  const { data, isLoading, isError, error, refetch, isFetching } = useOverviewKPIs();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 rounded-[10px] bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] animate-pulse"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded w-28" />
              <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700" />
            </div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-36" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-5 rounded-[10px] bg-[#C0392B]/10 border border-[#C0392B]/20 text-[#C0392B] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div>
            <p className="text-xs font-semibold">Failed to load overview KPIs</p>
            <p className="text-[11px] opacity-80">{error?.message || 'Server error occurred'}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="rounded-full px-3 py-1.5 bg-[#C0392B] text-white text-xs font-medium hover:bg-[#A93226] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${isFetching ? 'animate-spin' : ''}`} />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  const kpis = [
    {
      id: 'open-positions',
      label: 'Open Positions',
      value: data?.open_positions ?? data?.openPositions ?? 0,
      context: 'Active openings accepting candidates',
      icon: Briefcase,
      color: '#1E6FF0',
      bgLight: '#EDF3FE',
      bgDark: '#1E293B',
    },
    {
      id: 'candidates-pipeline',
      label: 'Candidates in Pipeline',
      value: data?.active_applications ?? data?.activeApplications ?? 0,
      context: 'Active in Applied, Screening, Interview & Offer',
      icon: Users,
      color: '#8B5CF6',
      bgLight: '#F3E8FF',
      bgDark: '#2E1065',
    },
    {
      id: 'interviews-week',
      label: 'Interviews Scheduled',
      value: data?.interviews_scheduled_this_week ?? data?.interviewsScheduledThisWeek ?? 0,
      context: 'Scheduled for the current calendar week',
      icon: CalendarCheck,
      color: '#BA7517',
      bgLight: '#FEF3C7',
      bgDark: '#451A03',
    },
    {
      id: 'hires-month',
      label: 'Hires This Month',
      value: data?.hires_this_month ?? data?.hiresThisMonth ?? 0,
      context: 'Successfully hired candidates this month',
      icon: CheckCircle2,
      color: '#1D9E75',
      bgLight: '#D1FAE5',
      bgDark: '#064E3B',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <div
            key={kpi.id}
            className="p-5 rounded-[10px] bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] shadow-[0_2px_12px_rgba(0,0,0,0.02)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.2)] transition-colors duration-200 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[#6B7280] dark:text-[#7E8494] tracking-wide">
                {kpi.label}
              </span>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: kpi.bgLight,
                  color: kpi.color,
                }}
              >
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="mb-2">
              <p className="font-heading font-bold text-2xl sm:text-3xl text-[#111111] dark:text-[#F2F3F5] tracking-tight">
                {kpi.value}
              </p>
            </div>

            <p className="text-[11px] text-[#6B7280] dark:text-[#7E8494] leading-normal truncate" title={kpi.context}>
              {kpi.context}
            </p>
          </div>
        );
      })}
    </div>
  );
};
