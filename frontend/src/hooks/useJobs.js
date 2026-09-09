import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getJobsApi,
  getJobByIdApi,
  createJobApi,
  updateJobApi,
  archiveJobApi,
  restoreJobApi,
} from '../api/jobs.js';

/**
 * Hook to fetch jobs with optional filters (status, includeArchived).
 * @param {Object} [params]
 */
export const useJobs = (params = {}) => {
  return useQuery({
    queryKey: ['jobs', params],
    queryFn: () => getJobsApi(params),
    staleTime: 60 * 1000,
  });
};

/**
 * Hook to fetch a single job opening by ID.
 * @param {string} id
 */
export const useJob = (id) => {
  return useQuery({
    queryKey: ['jobs', id],
    queryFn: () => getJobByIdApi(id),
    enabled: Boolean(id),
    staleTime: 60 * 1000,
  });
};

/**
 * Hook to create a new job opening.
 */
export const useCreateJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => createJobApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
};

/**
 * Hook to update an existing job opening.
 */
export const useUpdateJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateJobApi(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['jobs', id] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
};

/**
 * Hook to archive a job opening.
 */
export const useArchiveJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => archiveJobApi(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['jobs', id] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
};

/**
 * Hook to restore an archived job opening to Open.
 */
export const useRestoreJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => restoreJobApi(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['jobs', id] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
};
