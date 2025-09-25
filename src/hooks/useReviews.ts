/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/lib/api';

export const useReviews = (params?: any, includeGoogle?: boolean) => {
  const queryParams = {
    ...params,
    includeGoogle: includeGoogle?.toString()
  };
  
  return useQuery({
    queryKey: ['reviews', queryParams],
    queryFn: () => apiService.getReviews(queryParams),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useReview = (id: number) => {
  return useQuery({
    queryKey: ['review', id],
    queryFn: () => apiService.getReviewById(id),
    enabled: !!id,
  });
};

// hooks/useReviews.ts
export const useUpdateReviewApproval = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, isApproved }: { id: number; isApproved: boolean }) =>
      apiService.updateReviewApproval(id, isApproved),
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['reviews'] });
      await queryClient.cancelQueries({ queryKey: ['reviewsSummary'] });
      
      // Snapshot the previous values
      const previousReviews = queryClient.getQueryData(['reviews']);
      const previousSummary = queryClient.getQueryData(['reviewsSummary']);
      
      // Optimistically update reviews
      queryClient.setQueryData(['reviews'], (old: any) => {
        if (!old?.data) return old;
        
        return {
          ...old,
          data: old.data.map((review: any) =>
            review.id === variables.id
              ? { ...review, isApproved: variables.isApproved }
              : review
          ),
        };
      });

      // Optimistically update summary
      queryClient.setQueryData(['reviewsSummary'], (old: any) => {
        if (!old?.data) return old;
        
        // Recalculate approved reviews count
        const reviews = queryClient.getQueryData(['reviews']) as any;
        if (reviews?.data) {
          const approvedCount = reviews.data.filter((r: any) => r.isApproved).length;
          return {
            ...old,
            data: {
              ...old.data,
              approvedReviews: approvedCount,
              approvalRate: reviews.data.length > 0 ? (approvedCount / reviews.data.length) * 100 : 0
            }
          };
        }
        return old;
      });
      
      return { previousReviews, previousSummary };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousReviews) {
        queryClient.setQueryData(['reviews'], context.previousReviews);
      }
      if (context?.previousSummary) {
        queryClient.setQueryData(['reviewsSummary'], context.previousSummary);
      }
    },
    onSuccess: () => {
      // Only invalidate after successful update to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['reviewsSummary'] });
    },
  });
};

export const useReviewsSummary = () => {
  return useQuery({
    queryKey: ['reviewsSummary'],
    queryFn: () => apiService.getReviewsSummary(),
    staleTime: 5 * 60 * 1000,
  });
};