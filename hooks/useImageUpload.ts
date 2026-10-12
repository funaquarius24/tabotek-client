'use client';

import { useState, useCallback } from 'react';
import { fileProvider } from '@/lib/providers/file';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024;

export interface UploadState {
  status: 'idle' | 'validating' | 'requesting_url' | 'uploading' | 'success' | 'error';
  progress: number;
  previewUrl: string | null;
  error: string | null;
  resultUrl: string | null;
}

export interface UseImageUploadReturn {
  uploadState: UploadState;
  uploadFile: (file: File) => Promise<string | null>;
  reset: () => void;
}

export function useImageUpload(): UseImageUploadReturn {
  const [uploadState, setUploadState] = useState<UploadState>({
    status: 'idle',
    progress: 0,
    previewUrl: null,
    error: null,
    resultUrl: null,
  });

  const reset = useCallback(() => {
    setUploadState({
      status: 'idle',
      progress: 0,
      previewUrl: null,
      error: null,
      resultUrl: null,
    });
  }, []);

  const uploadFile = useCallback(async (file: File): Promise<string | null> => {
    console.log('[useImageUpload] start', {
      name: file.name,
      type: file.type,
      size: file.size,
    });
    setUploadState({
      status: 'validating',
      progress: 0,
      previewUrl: null,
      error: null,
      resultUrl: null,
    });

    if (!ALLOWED_TYPES.includes(file.type)) {
      const err = `Invalid file type. Allowed: JPEG, PNG, WebP. Got: ${file.type}`;
      console.log('[useImageUpload] rejected file type', { type: file.type, err });
      setUploadState(s => ({ ...s, status: 'error', error: err }));
      return null;
    }

    if (file.size > MAX_SIZE) {
      const err = `File too large (max 5MB). Got: ${(file.size / 1024 / 1024).toFixed(1)}MB`;
      console.log('[useImageUpload] rejected file size', { size: file.size, err });
      setUploadState(s => ({ ...s, status: 'error', error: err }));
      return null;
    }

    const objectUrl = URL.createObjectURL(file);
    setUploadState(s => ({ ...s, previewUrl: objectUrl, status: 'requesting_url', progress: 15 }));

    try {
      setUploadState(s => ({ ...s, status: 'uploading', progress: 60 }));

      const result = await fileProvider.uploadFile(file, 0);
      console.log('[useImageUpload] request succeeded', result);

      setUploadState({
        status: 'success',
        progress: 100,
        previewUrl: null,
        error: null,
        resultUrl: result.url,
      });

      return result.url;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      console.error('[useImageUpload] request failed', err);
      setUploadState(s => ({ ...s, status: 'error', error: message }));
      return null;
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }, []);

  return { uploadState, uploadFile, reset };
}
