import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { TrendingUp, AlertCircle, RefreshCw, BarChart2 } from 'lucide-react';
import { useApplicationsTrend } from '../../hooks/useAnalytics.js';
import { useTheme } from '../../context/useTheme.js';

// Format tick labels compactly: e.g. "Aug 17"
const formatTickLabel = (label) => {
  if (!label) return '';
  const parts = label.split(' - ');
  return parts[0] || label;
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] rounded-lg p-3 shadow-md text-xs">
        <p className="font-semibold text-[#111111] dark:text-[#F2F3F5] mb-1">
          {item.label}
        </p>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#1E6FF0]" />
          <span className="text-[#6B7280] dark:text-[#7E8494]">Applications:</span>
          <strong className="text-[#1E6FF0] font-bold">{item.count}</strong>
        </div>
      </div>
    );
  }
  return null;
};

export const ApplicationsTrendChart = () => {
  const { data, isLoading, isError, error, refetch, isFetching } = useApplicationsTrend();
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
          Unable to load applications trend
        </p>
        <p className="text-[11px] text-[#6B7280] dark:text-[#7E8494] max-w-sm mb-4">
          {error?.message || 'Server error occurred while fetching 12-week trends.'}
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="rounded-full px-4 py-2 bg-[#1E6FF0] text-white text-xs font-medium hover:bg-[#1656C2] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          <span>Retry Trend Query</span>
        </button>
      </div>
    );
  }

  const trendData = Array.isArray(data) ? data : [];
  const totalInPeriod = trendData.reduce((acc, curr) => acc + (curr.count || 0), 0);

  if (trendData.length === 0) {
    return (
      <div className="p-6 rounded-[10px] bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col items-center justify-center text-center h-80">
        <BarChart2 className="w-8 h-8 text-[#6B7280] dark:text-[#7E8494] mb-2" />
        <p className="text-xs font-semibold text-[#111111] dark:text-[#F2F3F5] mb-1">
          No Trend Data Available
        </p>
        <p className="text-[11px] text-[#6B7280] dark:text-[#7E8494]">
          No applications have been recorded in the past 12 weeks.
        </p>
      </div>
    );
  }

  return (
    <div className="p-5 sm:p-6 rounded-[10px] bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] shadow-[0_2px_12px_rgba(0,0,0,0.02)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.2)] transition-colors duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-heading font-semibold text-base text-[#111111] dark:text-[#F2F3F5]">
              Applications Received
            </h2>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EDF3FE] dark:bg-[#212836] text-[#1E6FF0]">
              <TrendingUp className="w-3 h-3" />
              <span>12 Weeks</span>
            </span>
          </div>
          <p className="text-xs text-[#6B7280] dark:text-[#7E8494] mt-0.5">
            Weekly inbound candidate application volumes
          </p>
        </div>

        <div className="text-left sm:text-right">
          <p className="font-heading font-bold text-lg text-[#111111] dark:text-[#F2F3F5]">
            {totalInPeriod}{' '}
            <span className="text-xs font-normal text-[#6B7280] dark:text-[#7E8494]">total</span>
          </p>
        </div>
      </div>

      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="appTrendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1E6FF0" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#1E6FF0" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? '#262B35' : '#E7E9EE'}
              vertical={false}
            />

            <XAxis
              dataKey="label"
              tickFormatter={formatTickLabel}
              tick={{ fill: isDark ? '#7E8494' : '#6B7280', fontSize: 11 }}
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

            <Area
              type="monotone"
              dataKey="count"
              stroke="#1E6FF0"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#appTrendGrad)"
              activeDot={{ r: 5, fill: '#1E6FF0', stroke: '#FFFFFF', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
