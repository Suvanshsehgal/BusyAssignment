import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
import { PieChart as PieIcon, AlertCircle, RefreshCw } from 'lucide-react';
import { useAnalyticsByStage } from '../../hooks/useAnalytics.js';
import { useTheme } from '../../context/useTheme.js';

const STAGE_COLOR_MAP = {
  Applied: '#1E6FF0',
  Screening: '#8B5CF6',
  Interview: '#BA7517',
  Offer: '#0284C7',
  Hired: '#1D9E75',
  Rejected: '#6B7280',
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    const percentage = item.payload?.percentage ?? 0;
    return (
      <div className="bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] rounded-xl p-3 shadow-lg text-xs">
        <p className="font-semibold text-[#111111] dark:text-[#F2F3F5] mb-1">
          {item.name}
        </p>
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: item.payload?.fill || '#1E6FF0' }}
          />
          <span className="text-[#6B7280] dark:text-[#7E8494]">Candidates:</span>
          <strong className="text-[#111111] dark:text-[#F2F3F5] font-bold">
            {item.value} ({percentage}%)
          </strong>
        </div>
      </div>
    );
  }
  return null;
};

export const PipelineDistributionPieChart = () => {
  const { data, isLoading, isError, error, refetch, isFetching } = useAnalyticsByStage();
  const { isDark } = useTheme();

  if (isLoading) {
    return (
      <div className="p-5 sm:p-6 rounded-[10px] bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2 animate-pulse" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-6 animate-pulse" />
        <div className="h-64 bg-gray-100 dark:bg-[#15181E] rounded-full mx-auto w-64 animate-pulse" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 rounded-[10px] bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col items-center justify-center text-center h-80">
        <AlertCircle className="w-8 h-8 text-[#C0392B] mb-2" />
        <p className="text-xs font-semibold text-[#111111] dark:text-[#F2F3F5] mb-1">
          Unable to load distribution chart
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
          <span>Retry</span>
        </button>
      </div>
    );
  }

  const rawBreakdown = data?.breakdown || [];
  // Filter out stages with 0 candidates so the pie chart doesn't render empty slices
  const chartData = rawBreakdown
    .filter((item) => item.count > 0)
    .map((item) => ({
      name: item.stage,
      value: item.count,
      percentage: item.percentage,
      color: STAGE_COLOR_MAP[item.stage] || '#6B7280',
    }));

  const totalApplications = data?.total_applications || 0;

  if (chartData.length === 0) {
    return (
      <div className="p-6 rounded-[10px] bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col items-center justify-center text-center h-80">
        <PieIcon className="w-8 h-8 text-[#6B7280] dark:text-[#7E8494] mb-2" />
        <p className="text-xs font-semibold text-[#111111] dark:text-[#F2F3F5] mb-1">
          No Stage Data Recorded
        </p>
        <p className="text-[11px] text-[#6B7280] dark:text-[#7E8494]">
          Stage distribution will appear once candidate applications are recorded.
        </p>
      </div>
    );
  }

  return (
    <div className="p-5 sm:p-6 rounded-[10px] bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] shadow-[0_2px_12px_rgba(0,0,0,0.02)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.2)] transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-heading font-semibold text-base text-[#111111] dark:text-[#F2F3F5]">
              Stage Share Distribution
            </h2>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EDF3FE] dark:bg-[#212836] text-[#1E6FF0]">
              <PieIcon className="w-3 h-3" />
              <span>Pie Chart</span>
            </span>
          </div>
          <p className="text-xs text-[#6B7280] dark:text-[#7E8494] mt-0.5">
            Proportional breakdown of candidates across all stages
          </p>
        </div>

        <span className="text-xs text-[#6B7280] dark:text-[#7E8494]">
          Total Candidates: <strong className="text-[#111111] dark:text-[#F2F3F5] font-semibold">{totalApplications}</strong>
        </span>
      </div>

      {/* Pie Chart */}
      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{
                fontSize: '11px',
                color: isDark ? '#AEB2BB' : '#4A4A4A',
                paddingTop: '8px',
              }}
            />
            <Pie
              data={chartData}
              cx="50%"
              cy="48%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
            >
              {chartData.map((entry) => (
                <Cell key={`cell-${entry.name}`} fill={entry.color} stroke={isDark ? '#1A1D24' : '#FFFFFF'} strokeWidth={2} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
