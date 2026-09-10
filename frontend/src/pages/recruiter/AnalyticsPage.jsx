import { useState } from 'react';
import { RotateCw, BarChart3 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { KPIGrid } from '../../components/dashboard/KPIGrid.jsx';
import { ApplicationsTrendChart } from '../../components/dashboard/ApplicationsTrendChart.jsx';
import { StageBreakdownChart } from '../../components/dashboard/StageBreakdownChart.jsx';
import { PipelineDistributionPieChart } from '../../components/analytics/PipelineDistributionPieChart.jsx';
import { JobVolumeBarChart } from '../../components/analytics/JobVolumeBarChart.jsx';
import { JobOverviewSection } from '../../components/dashboard/JobOverviewSection.jsx';
import { ANALYTICS_QUERY_KEYS } from '../../hooks/useAnalytics.js';

export const AnalyticsPage = () => {
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
    setTimeout(() => setIsRefreshing(false), 400);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E7E9EE] dark:border-[#262B35]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EDF3FE] dark:bg-[#212836] text-[#1E6FF0] mb-2 border border-[#BFDBFE] dark:border-[#1E3A8A]">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Executive Reporting & Pipeline Intelligence</span>
          </div>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#111111] dark:text-[#F2F3F5] tracking-tight">
            Recruitment Analytics & Insights
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#7E8494] mt-1">
            Real-time pipeline volume, 12-week applications trend, stage conversion breakdowns, and job opening health.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E7E9EE] dark:border-[#262B35] bg-white dark:bg-[#1A1D24] text-xs font-semibold text-[#111111] dark:text-[#F2F3F5] hover:bg-[#F5F7FB] dark:hover:bg-[#262B35] transition-colors shadow-xs self-start sm:self-auto disabled:opacity-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1E6FF0]"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#1E6FF0]' : ''}`} />
          <span>{isRefreshing ? 'Refreshing Data...' : 'Refresh Metrics'}</span>
        </button>
      </div>

      {/* 1. Primary Overview KPI Cards */}
      <section aria-label="Key Performance Indicators">
        <KPIGrid />
      </section>

      {/* 2. Primary Pipeline Visualizations: 12-Week Trend & Funnel Breakdown */}
      <section aria-label="Applications Volume & Stage Breakdown" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ApplicationsTrendChart />
        <StageBreakdownChart />
      </section>

      {/* 3. Deep Dive Distribution Analytics: Pie Chart & Job Volume Comparison */}
      <section aria-label="Stage Share & Top Job Comparisons" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PipelineDistributionPieChart />
        <JobVolumeBarChart />
      </section>

      {/* 4. Job-Level Application Breakdown Table */}
      <section aria-label="Job Openings Application Depth">
        <JobOverviewSection />
      </section>
    </div>
  );
};
