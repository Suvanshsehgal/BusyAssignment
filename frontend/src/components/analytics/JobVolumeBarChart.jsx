import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { BarChart3, AlertCircle, RefreshCw } from 'lucide-react';
import { useAnalyticsByJob } from '../../hooks/useAnalytics.js';
import { useTheme } from '../../context/useTheme.js';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] rounded-xl p-3 shadow-lg text-xs space-y-1">
        <p className="font-semibold text-[#111111] dark:text-[#F2F3F5] truncate max-w-[200px]">
          {data.fullName}
        </p>
        <p className="text-[11px] text-[#6B7280] dark:text-[#7E8494]">
          Dept: {data.department}
        </p>
        <div className="pt-1 border-t border-[#E7E9EE] dark:border-[#262B35] flex items-center justify-between gap-4">
          <span className="text-[#6B7280] dark:text-[#7E8494]">Active Candidates:</span>
          <strong className="text-[#1E6FF0] font-bold">{data.active}</strong>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-[#6B7280] dark:text-[#7E8494]">Total Inbound:</span>
          <strong className="text-[#111111] dark:text-[#F2F3F5] font-bold">{data.total}</strong>
        </div>
      </div>
    );
  }
  return null;
};

export const JobVolumeBarChart = () => {
  const { data, isLoading, isError, error, refetch, isFetching } = useAnalyticsByJob();
  const { isDark } = useTheme();

  if (isLoading) {
    return (
      <div className="p-5 sm:p-6 rounded-[10px] bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2 animate-pulse" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-6 animate-pulse" />
        <div className="h-64 bg-gray-100 dark:bg-[#15181E] rounded animate-pulse" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 rounded-[10px] bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col items-center justify-center text-center h-80">
        <AlertCircle className="w-8 h-8 text-[#C0392B] mb-2" />
        <p className="text-xs font-semibold text-[#111111] dark:text-[#F2F3F5] mb-1">
          Unable to load job volume comparison
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
          <span>Retry</span>
        </button>
      </div>
    );
  }

  const rawJobs = Array.isArray(data) ? data : [];
  // Take top 6 jobs by total applicants for a clean horizontal bar comparison
  const chartData = [...rawJobs]
    .sort((a, b) => (b.total_applications || 0) - (a.total_applications || 0))
    .slice(0, 6)
    .map((job) => {
      // Compact title for axis (first 18 chars)
      const shortTitle =
        job.title.length > 20 ? `${job.title.slice(0, 18)}...` : job.title;
      return {
        name: shortTitle,
        fullName: job.title,
        department: job.department || 'Engineering',
        active: job.active_applications ?? job.activeApplications ?? 0,
        total: job.total_applications ?? job.totalApplications ?? 0,
      };
    });

  if (chartData.length === 0) {
    return null;
  }

  return (
    <div className="p-5 sm:p-6 rounded-[10px] bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] shadow-[0_2px_12px_rgba(0,0,0,0.02)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.2)] transition-colors duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-heading font-semibold text-base text-[#111111] dark:text-[#F2F3F5]">
              Top Roles by Candidate Volume
            </h2>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EDF3FE] dark:bg-[#212836] text-[#1E6FF0]">
              <BarChart3 className="w-3 h-3" />
              <span>Bar Chart</span>
            </span>
          </div>
          <p className="text-xs text-[#6B7280] dark:text-[#7E8494] mt-0.5">
            Active vs total application depth across highest-volume roles
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#1E6FF0]" />
            <span className="text-[#6B7280] dark:text-[#7E8494]">Active</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#8B5CF6]" />
            <span className="text-[#6B7280] dark:text-[#7E8494]">Total</span>
          </div>
        </div>
      </div>

      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? '#262B35' : '#E7E9EE'}
              vertical={false}
            />
            <XAxis
              dataKey="name"
              angle={-20}
              textAnchor="end"
              interval={0}
              tick={{ fill: isDark ? '#7E8494' : '#6B7280', fontSize: 10 }}
              axisLine={{ stroke: isDark ? '#262B35' : '#E7E9EE' }}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: isDark ? '#7E8494' : '#6B7280', fontSize: 11 }}
              axisLine={{ stroke: isDark ? '#262B35' : '#E7E9EE' }}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="active" fill="#1E6FF0" radius={[4, 4, 0, 0]} maxBarSize={32} />
            <Bar dataKey="total" fill="#8B5CF6" radius={[4, 4, 0, 0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
