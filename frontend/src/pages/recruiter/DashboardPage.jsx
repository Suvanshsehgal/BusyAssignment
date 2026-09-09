import { RotateCw, Sparkles } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { KPIGrid } from '../../components/dashboard/KPIGrid.jsx';
import { ApplicationsTrendChart } from '../../components/dashboard/ApplicationsTrendChart.jsx';
import { StageBreakdownChart } from '../../components/dashboard/StageBreakdownChart.jsx';
import { JobOverviewSection } from '../../components/dashboard/JobOverviewSection.jsx';
import { ANALYTICS_QUERY_KEYS } from '../../hooks/useAnalytics.js';

export const DashboardPage = () => {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ANALYTICS_QUERY_KEYS.overview }),
      queryClient.invalidateQueries({ queryKey: ANALYTICS_QUERY_KEYS.trend }),
      queryClient.invalidateQueries({ queryKey: ANALYTICS_QUERY_KEYS.byStage }),
      queryClient.invalidateQueries({ queryKey: ANALYTICS_QUERY_KEYS.byJob }),
    ]);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E7E9EE] dark:border-[#262B35]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#EDF3FE] dark:bg-[#212836] text-[#1E6FF0] mb-2 border border-[#1E6FF0]/20">
            <Sparkles className="w-3 h-3" />
            <span>Operational HR Overview</span>
          </div>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#111111] dark:text-[#F2F3F5] tracking-tight">
            Recruiter Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[#4A4A4A] dark:text-[#AEB2BB] mt-1 leading-relaxed">
            Real-time pipeline metrics, conversion distributions, and candidate application trends.
          </p>
        </div>

        {/* Global Refresh Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="rounded-full border border-[#E7E9EE] dark:border-[#262B35] bg-white dark:bg-[#1A1D24] text-[#4A4A4A] dark:text-[#AEB2BB] hover:text-[#111111] dark:hover:text-[#F2F3F5] hover:border-[#1E6FF0] dark:hover:border-[#1E6FF0] px-4 py-2 text-xs font-medium transition-colors shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#1E6FF0]"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#1E6FF0]' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh Data'}</span>
          </button>
        </div>
      </div>

      {/* 1. Primary Overview KPI Cards */}
      <section aria-label="Executive Overview KPIs">
        <KPIGrid />
      </section>

      {/* 2. Visual Analytics Section: Trends & Funnel Stage Breakdown */}
      <section aria-label="Visual Pipeline Trends" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ApplicationsTrendChart />
        <StageBreakdownChart />
      </section>

      {/* 3. Job-Level Application Breakdown */}
      <section aria-label="Job Level Applications Overview">
        <JobOverviewSection />
      </section>
    </div>
  );
};
