import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyReviewsApi, submitFeedbackApi } from '../api/reviews.js';

/**
 * Hook to fetch all reviews assigned to the authenticated interviewer.
 */
export const useMyReviews = () => {
  return useQuery({
    queryKey: ['my-reviews'],
    queryFn: getMyReviewsApi,
    staleTime: 60 * 1000,
  });
};

/**
 * Hook to submit feedback scorecard for an assigned candidate.
 */
export const useSubmitFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ applicationId, payload }) => submitFeedbackApi(applicationId, payload),
    onSuccess: (_, { applicationId }) => {
      queryClient.invalidateQueries({ queryKey: ['my-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['applications', applicationId] });
      queryClient.invalidateQueries({ queryKey: ['feedback', applicationId] });
      queryClient.invalidateQueries({ queryKey: ['timeline', applicationId] });
    },
  });
};
