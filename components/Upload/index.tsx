'use client';

import { useState, useCallback, useRef, DragEvent, ChangeEvent } from 'react';
import { fileProvider } from '@/lib/providers/file';
import type { FileRecord } from '@/lib/types';
import styles from './Upload.module.css';

interface UploadProps {
  onSuccess?: (file: FileRecord) => void;
  onError?: (error: Error) => void;
  accept?: string;
  maxSize?: number;
  unique?: number;
}

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export default function Upload({ onSuccess, onError, accept = 'image/*,video/*,.pdf', maxSize = 10 * 1024 * 1024, unique = 0 }: UploadProps) {
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setStatus('idle');
    setPreview(null);
    setFileName('');
    setFileSize(0);
  }, []);

  const uploadFile = useCallback(async (file: File) => {
    if (file.size > maxSize) {
      setStatus('error');
      onError?.(new Error(`File too large (max ${Math.round(maxSize / 1024 / 1024)}MB)`));
      return;
    }

    setFileName(file.name);
    setFileSize(file.size);
    setStatus('uploading');

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }

    try {
      const result = await fileProvider.uploadFile(file, unique);
      setStatus('success');
      onSuccess?.(result);
    } catch (err) {
      setStatus('error');
      onError?.(err instanceof Error ? err : new Error('Upload failed'));
    }
  }, [maxSize, unique, onSuccess, onError]);

  const handleDrag = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer?.files;
    if (files?.[0]) {
      uploadFile(files[0]);
    }
  }, [uploadFile]);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.[0]) {
      uploadFile(files[0]);
    }
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [uploadFile]);

  const handleClick = useCallback(() => {
    if (status !== 'uploading') {
      inputRef.current?.click();
    }
  }, [status]);

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div
      className={`${styles.dropzone} ${dragActive ? styles.dropzoneActive : ''} ${status === 'uploading' ? styles.dropzoneDisabled : ''}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={inputRef}
        type="file"
        className={styles.fileInput}
        onChange={handleChange}
        accept={accept}
      />

      {status === 'idle' && (
        <>
          <div className={styles.icon}>📤</div>
          <div className={styles.text}>Drag & drop a file here</div>
          <div className={styles.hint}>or click to browse</div>
          <button className={styles.browseBtn} onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}>
            Select File
          </button>
        </>
      )}

      {status === 'uploading' && (
        <>
          <div className={styles.icon}>⏳</div>
          <div className={styles.text}>Uploading...</div>
          {fileName && <div className={styles.fileInfo}>{fileName} ({formatSize(fileSize)})</div>}
          <div className={styles.progress}>
            <div className={styles.progressBar} style={{ width: '60%' }} />
          </div>
          <div className={`${styles.statusText} ${styles.statusUploading}`}>Uploading file...</div>
        </>
      )}

      {status === 'success' && (
        <>
          <div className={styles.icon}>✅</div>
          <div className={styles.text}>Upload successful!</div>
          {fileName && <div className={styles.fileInfo}>{fileName}</div>}
          {preview && (
            <div className={styles.preview}>
              <img src={preview} alt="Preview" />
            </div>
          )}
          <button className={styles.browseBtn} onClick={(e) => { e.stopPropagation(); reset(); }}>
            Upload Another
          </button>
        </>
      )}

      {status === 'error' && (
        <>
          <div className={styles.icon}>❌</div>
          <div className={`${styles.statusText} ${styles.statusError}`}>Upload failed</div>
          <button className={styles.browseBtn} onClick={(e) => { e.stopPropagation(); reset(); }}>
            Try Again
          </button>
        </>
      )}
    </div>
  );
}
