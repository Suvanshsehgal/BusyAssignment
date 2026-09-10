import { useQuery, useMutation } from '@tanstack/react-query';
import {
  getPublicJobsApi,
  getPublicJobByIdApi,
  submitPublicApplicationApi,
} from '../api/careers.js';

/**
 * Hook to fetch all open public job openings for the careers page.
 */
export const usePublicJobs = () => {
  return useQuery({
    queryKey: ['public-jobs'],
    queryFn: () => getPublicJobsApi(),
    staleTime: 60 * 1000,
  });
};

/**
 * Hook to fetch details of a single open public job opening.
 * @param {string} jobId
 */
export const usePublicJob = (jobId) => {
  return useQuery({
    queryKey: ['public-jobs', jobId],
    queryFn: () => getPublicJobByIdApi(jobId),
    enabled: Boolean(jobId),
    staleTime: 60 * 1000,
    retry: (failureCount, error) => {
      // Don't retry 404 (not found / not open)
      if (error?.response?.status === 404) return false;
      return failureCount < 2;
    },
  });
};

/**
 * Hook to submit a public candidate self-application.
 */
export const useSubmitPublicApplication = () => {
  return useMutation({
    mutationFn: (data) => submitPublicApplicationApi(data),
  });
};
