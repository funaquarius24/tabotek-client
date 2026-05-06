import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import * as api from '@/lib/api';

export function useUsers(enabled?: boolean) {
  return useQuery({
    queryKey: queryKeys.users.list(),
    queryFn: async () => {
      try {
        return await api.getUsers();
      } catch {
        return { users: [] };
      }
    },
    enabled,
    retry: false,
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => api.getUserById(id),
    enabled: !!id,
    retry: false,
  });
}

export function useAdminStats() {
  return useQuery({
    queryKey: queryKeys.admin.stats,
    queryFn: async () => {
      try {
        return await api.getAdminStats();
      } catch {
        return null;
      }
    },
    retry: false,
  });
}
