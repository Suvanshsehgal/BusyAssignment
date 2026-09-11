import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getApplicationsApi,
  getApplicationByIdApi,
  createApplicationApi,
  updateApplicationApi,
  deleteApplicationApi,
  advanceApplicationApi,
  rejectApplicationApi,
  reinstateApplicationApi,
  getApplicationPanelApi,
  assignPanelMemberApi,
  removePanelMemberApi,
  getApplicationFeedbackApi,
  getApplicationTimelineApi,
  bulkAdvanceApplicationsApi,
  bulkRejectApplicationsApi,
} from '../api/applications.js';

export const useApplications = (params = {}) => {
  return useQuery({
    queryKey: ['applications', params],
    queryFn: () => getApplicationsApi(params),
    staleTime: 60 * 1000,
  });
};

export const useApplication = (id) => {
  return useQuery({
    queryKey: ['applications', id],
    queryFn: () => getApplicationByIdApi(id),
    enabled: Boolean(id),
    staleTime: 60 * 1000,
  });
};

export const useApplicationPanel = (id) => {
  return useQuery({
    queryKey: ['panel', id],
    queryFn: () => getApplicationPanelApi(id),
    enabled: Boolean(id),
    staleTime: 60 * 1000,
  });
};

export const useApplicationFeedback = (id) => {
  return useQuery({
    queryKey: ['feedback', id],
    queryFn: () => getApplicationFeedbackApi(id),
    enabled: Boolean(id),
    staleTime: 60 * 1000,
  });
};

export const useApplicationTimeline = (id) => {
  return useQuery({
    queryKey: ['timeline', id],
    queryFn: () => getApplicationTimelineApi(id),
    enabled: Boolean(id),
    staleTime: 60 * 1000,
  });
};

export const useCreateApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => createApplicationApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
};

export const useUpdateApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateApplicationApi(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['applications', id] });
    },
  });
};

export const useDeleteApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteApplicationApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
};

export const useAdvanceApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => advanceApplicationApi(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['applications', id] });
      queryClient.invalidateQueries({ queryKey: ['timeline', id] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
};

export const useRejectApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => rejectApplicationApi(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['applications', id] });
      queryClient.invalidateQueries({ queryKey: ['timeline', id] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
};

export const useReinstateApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => reinstateApplicationApi(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['applications', id] });
      queryClient.invalidateQueries({ queryKey: ['timeline', id] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
};

export const useAssignPanel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => assignPanelMemberApi(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['applications', id] });
      queryClient.invalidateQueries({ queryKey: ['panel', id] });
      queryClient.invalidateQueries({ queryKey: ['timeline', id] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
};

export const useRemovePanelMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userId }) => removePanelMemberApi(id, userId),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['applications', id] });
      queryClient.invalidateQueries({ queryKey: ['panel', id] });
      queryClient.invalidateQueries({ queryKey: ['timeline', id] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
};

export const useBulkAdvance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => bulkAdvanceApplicationsApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
};

export const useBulkReject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => bulkRejectApplicationsApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
};

export const useApplicationAutocomplete = (searchQuery) => {
  const trimmed = searchQuery?.trim() || '';
  return useQuery({
    queryKey: ['applications', 'autocomplete', trimmed],
    queryFn: () => getApplicationsApi({ search: trimmed, limit: 8 }),
    enabled: trimmed.length > 0,
    staleTime: 30 * 1000,
  });
};
