import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCategories, getCategoryBySlug, createCategory, updateCategory, deleteCategory } from '@/lib/api';
import { CreateCategoryRequest, UpdateCategoryRequest } from '@/lib/types';

export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (params?: any) => [...categoryKeys.lists(), params] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (slugOrId: string) => [...categoryKeys.details(), slugOrId] as const,
};

export function useCategories(params?: { featured?: boolean; parent?: string }) {
  return useQuery({
    queryKey: categoryKeys.list(params),
    queryFn: () => getCategories(params),
  });
}

export function useCategory(slugOrId: string) {
  return useQuery({
    queryKey: categoryKeys.detail(slugOrId),
    queryFn: () => getCategoryBySlug(slugOrId),
    enabled: !!slugOrId,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryRequest }) => updateCategory(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.detail(variables.id) });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
}