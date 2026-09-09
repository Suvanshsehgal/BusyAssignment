import { useQuery } from '@tanstack/react-query';
import {
  getOverviewKPIsApi,
  getApplicationsTrendApi,
  getAnalyticsByStageApi,
  getAnalyticsByJobApi,
} from '../api/analytics.js';

export const ANALYTICS_QUERY_KEYS = {
  overview: ['analytics', 'overview'],
  trend: ['analytics', 'trend'],
  byStage: ['analytics', 'by-stage'],
  byJob: ['analytics', 'by-job'],
};

/**
 * Hook to retrieve overview KPIs for recruiter dashboard
 */
export const useOverviewKPIs = (options = {}) => {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.overview,
    queryFn: getOverviewKPIsApi,
    staleTime: 1000 * 60 * 2, // 2 minutes
    ...options,
  });
};

/**
 * Hook to retrieve 12-week applications trend
 */
export const useApplicationsTrend = (options = {}) => {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.trend,
    queryFn: getApplicationsTrendApi,
    staleTime: 1000 * 60 * 2,
    ...options,
  });
};

/**
 * Hook to retrieve application counts by stage
 */
export const useAnalyticsByStage = (options = {}) => {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.byStage,
    queryFn: getAnalyticsByStageApi,
    staleTime: 1000 * 60 * 2,
    ...options,
  });
};

/**
 * Hook to retrieve job-level application breakdown
 */
export const useAnalyticsByJob = (options = {}) => {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.byJob,
    queryFn: getAnalyticsByJobApi,
    staleTime: 1000 * 60 * 2,
    ...options,
  });
};
