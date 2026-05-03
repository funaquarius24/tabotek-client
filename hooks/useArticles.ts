import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getArticles, getArticleBySlug, searchArticles, createArticle, updateArticle, deleteArticle } from '@/lib/api';
import { CreateArticleRequest, UpdateArticleRequest } from '@/lib/types';

export const articleKeys = {
  all: ['articles'] as const,
  lists: () => [...articleKeys.all, 'list'] as const,
  list: (params?: any) => [...articleKeys.lists(), params] as const,
  details: () => [...articleKeys.all, 'detail'] as const,
  detail: (slug: string) => [...articleKeys.details(), slug] as const,
  search: (query: string) => [...articleKeys.all, 'search', query] as const,
};

export function useArticles(params?: { limit?: number; page?: number; category?: string; status?: string; search?: string }) {
  return useQuery({
    queryKey: articleKeys.list(params),
    queryFn: () => getArticles(params),
  });
}

export function useArticle(slug: string) {
  return useQuery({
    queryKey: articleKeys.detail(slug),
    queryFn: () => getArticleBySlug(slug),
    enabled: !!slug,
  });
}

export function useArticleSearch(query: string, limit?: number) {
  return useQuery({
    queryKey: articleKeys.search(query),
    queryFn: () => searchArticles(query, limit),
    enabled: !!query,
  });
}

export function useCreateArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createArticle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: articleKeys.lists() });
    },
  });
}

export function useUpdateArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: UpdateArticleRequest }) => updateArticle(slug, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: articleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: articleKeys.detail(variables.slug) });
    },
  });
}

export function useDeleteArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteArticle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: articleKeys.lists() });
    },
  });
}