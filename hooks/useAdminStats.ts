import { useQuery } from '@tanstack/react-query';
import { getAdminStats } from '@/lib/api';

export const adminStatsKeys = {
  all: ['admin', 'stats'] as const,
  details: () => [...adminStatsKeys.all, 'detail'] as const,
  detail: () => [...adminStatsKeys.details()] as const,
};

export function useAdminStats() {
  return useQuery({
    queryKey: adminStatsKeys.detail(),
    queryFn: getAdminStats,
  });
}