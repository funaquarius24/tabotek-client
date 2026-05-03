'use client';

import { useState, useCallback, useRef } from 'react';

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
    setUploadState({
      status: 'validating',
      progress: 0,
      previewUrl: null,
      error: null,
      resultUrl: null,
    });

    if (!ALLOWED_TYPES.includes(file.type)) {
      const err = `Invalid file type. Allowed: JPEG, PNG, WebP. Got: ${file.type}`;
      setUploadState(s => ({ ...s, status: 'error', error: err }));
      return null;
    }

    if (file.size > MAX_SIZE) {
      const err = `File too large (max 5MB). Got: ${(file.size / 1024 / 1024).toFixed(1)}MB`;
      setUploadState(s => ({ ...s, status: 'error', error: err }));
      return null;
    }

    const objectUrl = URL.createObjectURL(file);
    setUploadState(s => ({ ...s, previewUrl: objectUrl }));

    setUploadState(s => ({ ...s, status: 'requesting_url', progress: 10 }));

    let uploadUrl: string;
    let publicUrl: string;
    let imageId: string;
    let imageExt: string;

    try {
      const ticketRes = await fetch('/api/oss/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });

      if (!ticketRes.ok) {
        const errData = await ticketRes.json().catch(() => ({ error: 'Failed to get upload URL' }));
        throw new Error(errData.error || `HTTP ${ticketRes.status}`);
      }

      const ticket = await ticketRes.json();
      uploadUrl = ticket.uploadUrl;
      publicUrl = ticket.publicUrl;
      imageId = ticket.imageId;
      imageExt = file.name.includes('.') ? file.name.substring(file.name.lastIndexOf('.')) : '';

      setUploadState(s => ({ ...s, status: 'uploading', progress: 20 }));
    } catch (err: any) {
      URL.revokeObjectURL(objectUrl);
      setUploadState(s => ({ ...s, status: 'error', error: err.message }));
      return null;
    }

    try {
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const pct = 20 + Math.round((e.loaded / e.total) * 70);
            setUploadState(s => ({ ...s, progress: pct }));
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed (HTTP ${xhr.status})`));
          }
        });

        xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
        xhr.addEventListener('abort', () => reject(new Error('Upload aborted')));

        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
      });

      fetch('/api/oss/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageId }),
      }).catch(() => {});

      const proxyUrl = `/api/oss/image-proxy?path=uploads/${imageId}${imageExt}`;

      setUploadState(s => ({
        ...s,
        status: 'success',
        progress: 100,
        resultUrl: proxyUrl,
      }));

      return proxyUrl;
    } catch (err: any) {
      URL.revokeObjectURL(objectUrl);
      setUploadState(s => ({ ...s, status: 'error', error: err.message }));
      return null;
    }
  }, []);

  return { uploadState, uploadFile, reset };
}
