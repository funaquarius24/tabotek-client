import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTags, getTagBySlug, createTag, updateTag, deleteTag, mergeTags, cleanupUnusedTags, getTagSuggestions, recountTagCounts } from '@/lib/api';
import { CreateTagRequest, UpdateTagRequest } from '@/lib/types';

export const tagKeys = {
  all: ['tags'] as const,
  lists: () => [...tagKeys.all, 'list'] as const,
  list: (params?: any) => [...tagKeys.lists(), params] as const,
  details: () => [...tagKeys.all, 'detail'] as const,
  detail: (slugOrId: string) => [...tagKeys.details(), slugOrId] as const,
};

export function useTags(params?: any) {
  return useQuery({
    queryKey: tagKeys.list(params),
    queryFn: () => getTags(),
  });
}

export function useTag(slugOrId: string) {
  return useQuery({
    queryKey: tagKeys.detail(slugOrId),
    queryFn: () => getTagBySlug(slugOrId),
    enabled: !!slugOrId,
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
    },
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTagRequest }) => updateTag(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tagKeys.detail(variables.id) });
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
    },
  });
}

export function useMergeTags() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sourceId, targetId }: { sourceId: string; targetId: string }) => mergeTags(sourceId, targetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
  });
}

export function useCleanupUnusedTags() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cleanupUnusedTags,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
    },
  });
}

export function useTagSuggestions() {
  return useQuery({
    queryKey: [...tagKeys.all, 'suggestions'],
    queryFn: getTagSuggestions,
    staleTime: 5 * 60 * 1000,
  });
}

export function useRecountTagCounts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: recountTagCounts,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
    },
  });
}
