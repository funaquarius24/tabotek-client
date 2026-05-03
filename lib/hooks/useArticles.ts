import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import * as api from '@/lib/api';
import type { CreateArticleRequest, UpdateArticleRequest, ArticleResponse } from '@/lib/types';

export function useArticles(params?: any) {
  return useQuery({
    queryKey: queryKeys.articles.list(params),
    queryFn: () => api.getArticles(params),
  });
}

export function useArticle(slug: string) {
  return useQuery({
    queryKey: queryKeys.articles.detail(slug),
    queryFn: () => api.getArticleBySlug(slug),
    enabled: !!slug,
  });
}

export function useSearchArticles(query: string, limit?: number) {
  return useQuery({
    queryKey: ['articles', 'search', query, limit],
    queryFn: () => api.searchArticles(query, limit),
    enabled: !!query,
  });
}

export function useCreateArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createArticle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.articles.lists() });
    },
  });
}

export function useUpdateArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: UpdateArticleRequest }) =>
      api.updateArticle(slug, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.articles.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.articles.detail(variables.slug) });
    },
  });
}

export function useDeleteArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteArticle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.articles.lists() });
    },
  });
}

export function useInfiniteArticles(params?: { category?: string; status?: string; search?: string }) {
  return useInfiniteQuery({
    queryKey: queryKeys.articles.list(params),
    queryFn: ({ pageParam = 1 }) => api.getArticles({ ...params, page: pageParam, limit: 10 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { pagination } = lastPage;
      return pagination.page < pagination.totalPages ? pagination.page + 1 : undefined;
    },
  });
}