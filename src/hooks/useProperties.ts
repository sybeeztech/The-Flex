import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/lib/api';

export const useProperties = () => {
  return useQuery({
    queryKey: ['properties'],
    queryFn: () => apiService.getProperties(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useProperty = (id: string) => {
  return useQuery({
    queryKey: ['property', id],
    queryFn: () => apiService.getPropertyById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
};

export const usePropertyMetrics = (id: string) => {
  return useQuery({
    queryKey: ['propertyMetrics', id],
    queryFn: () => apiService.getPropertyMetrics(id),
    enabled: !!id,
  });
};