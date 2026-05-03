import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import * as api from '@/lib/api';
import type { CreateCategoryRequest, UpdateCategoryRequest } from '@/lib/types';

export function useCategories(params?: any) {
  return useQuery({
    queryKey: queryKeys.categories.list(params),
    queryFn: () => api.getCategories(params),
  });
}

export function useCategory(slug: string) {
  return useQuery({
    queryKey: queryKeys.categories.detail(slug),
    queryFn: () => api.getCategoryBySlug(slug),
    enabled: !!slug,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.lists() });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryRequest }) =>
      api.updateCategory(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.detail(variables.id) });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.lists() });
    },
  });
}