import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import * as api from '@/lib/api';

export function useUsers() {
  return useQuery({
    queryKey: queryKeys.users.list(),
    queryFn: api.getUsers,
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => api.getUserById(id),
    enabled: !!id,
  });
}

export function useAdminStats() {
  return useQuery({
    queryKey: queryKeys.admin.stats,
    queryFn: api.getAdminStats,
  });
}