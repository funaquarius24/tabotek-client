import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { fileProvider } from '@/lib/providers/file';

export function useFiles(params?: { page?: number; limit?: number; type?: string }) {
  return useQuery({
    queryKey: queryKeys.files.list(params),
    queryFn: () => fileProvider.getFiles(params),
  });
}

export function useUploadFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, unique }: { file: File; unique?: number }) =>
      fileProvider.uploadFile(file, unique),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.files.lists() });
    },
  });
}

export function useDeleteFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fileProvider.deleteFile(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.files.lists() });
    },
  });
}
