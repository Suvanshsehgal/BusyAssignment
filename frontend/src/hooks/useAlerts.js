import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAlertsApi, getAlertsCountApi, dismissAlertApi } from '../api/alerts.js';

export const ALERTS_QUERY_KEYS = {
  all: ['alerts'],
  count: ['alerts', 'count'],
};

/**
 * Hook to retrieve active stalled candidate alerts
 */
export const useAlerts = (options = {}) => {
  return useQuery({
    queryKey: ALERTS_QUERY_KEYS.all,
    queryFn: getAlertsApi,
    staleTime: 1000 * 60, // 1 minute
    ...options,
  });
};

/**
 * Hook to retrieve active alert count for navigation badge
 */
export const useAlertsCount = (options = {}) => {
  return useQuery({
    queryKey: ALERTS_QUERY_KEYS.count,
    queryFn: getAlertsCountApi,
    staleTime: 1000 * 60, // 1 minute
    ...options,
  });
};

/**
 * Hook to dismiss a stalled alert for a candidate's current stage
 */
export const useDismissAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (applicationId) => dismissAlertApi(applicationId),
    onSuccess: () => {
      // Invalidate and refetch alerts list and count badge simultaneously
      queryClient.invalidateQueries({ queryKey: ALERTS_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ALERTS_QUERY_KEYS.count });
    },
  });
};
