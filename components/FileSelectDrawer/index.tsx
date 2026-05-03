'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { fileProvider } from '@/lib/providers/file';
import type { FileRecord } from '@/lib/types';
import styles from './FileSelectDrawer.module.css';

interface FileSelectDrawerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  filterType?: 'image' | 'video' | 'document';
}

type TabType = 'all' | 'image' | 'video' | 'document';

export default function FileSelectDrawer({ open, onClose, onSelect, filterType }: FileSelectDrawerProps) {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<TabType>(filterType ?? 'all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = useCallback(async (p: number = 1, t: TabType = tab) => {
    setLoading(true);
    try {
      const typeParam = t === 'all' ? undefined : t;
      const result = await fileProvider.getFiles({ page: p, limit: 20, type: typeParam });
      setFiles(result.files);
      setTotal(result.pagination.total);
      setPage(result.pagination.page);
      setTotalPages(result.pagination.totalPages);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    if (open) {
      setPage(1);
      setSelectedId(null);
      fetchFiles(1, tab);
    }
  }, [open, tab, fetchFiles]);

  const handleTabChange = useCallback((t: TabType) => {
    setTab(t);
    setPage(1);
    setSelectedId(null);
  }, []);

  const handleFileSelect = useCallback((file: FileRecord) => {
    setSelectedId(file._id);
    onSelect(file.url);
    onClose();
  }, [onSelect, onClose]);

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await fileProvider.uploadFile(file);
      fetchFiles(1, tab);
    } catch {
      // silent
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  }, [tab, fetchFiles]);

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (type: string): string => {
    if (type.startsWith('image/')) return '🖼️';
    if (type.startsWith('video/')) return '🎬';
    if (type.startsWith('application/pdf')) return '📄';
    return '📎';
  };

  if (!open) return null;

  return (
    <>
      <div
        className={`${styles.overlay} ${open ? styles.overlayOpen : ''}`}
        onClick={onClose}
      />
      <div className={`${styles.drawer} ${open ? styles.drawerOpen : ''}`}>
        <div className={styles.header}>
          <h2 className={styles.headerTitle}>File Library</h2>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <div className={styles.body}>
          <div className={styles.uploadArea} onClick={() => inputRef.current?.click()}>
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              onChange={handleUpload}
              accept="image/*,video/*,.pdf,.zip,.gz"
            />
            <div className={styles.uploadAreaIcon}>{uploading ? '⏳' : '📤'}</div>
            <div className={styles.uploadAreaText}>
              {uploading ? 'Uploading...' : 'Click to upload a new file'}
            </div>
          </div>

          <div className={styles.tabs}>
            {(['all', 'image', 'video', 'document'] as TabType[]).map(t => (
              <button
                key={t}
                className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
                onClick={() => handleTabChange(t)}
              >
                {t === 'all' ? 'All' : t === 'image' ? 'Images' : t === 'video' ? 'Videos' : 'Documents'}
              </button>
            ))}
          </div>

          {loading ? (
            <div className={styles.loading}>Loading files...</div>
          ) : files.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>📁</div>
              <div>No files found</div>
            </div>
          ) : (
            <>
              <div className={styles.grid}>
                {files.map(f => (
                  <div
                    key={f._id}
                    className={`${styles.fileItem} ${selectedId === f._id ? styles.fileItemSelected : ''}`}
                    onClick={() => handleFileSelect(f)}
                  >
                    {f.type.startsWith('image/') ? (
                      <img className={styles.filePreview} src={f.url} alt={f.originalname} />
                    ) : (
                      <div className={styles.fileIcon}>{getFileIcon(f.type)}</div>
                    )}
                    <div className={styles.fileOverlay}>
                      <div className={styles.fileOverlayName}>{f.originalname}</div>
                      <div className={styles.fileOverlaySize}>{formatSize(f.size)}</div>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <button
                    className={styles.pageBtn}
                    disabled={page <= 1}
                    onClick={() => fetchFiles(page - 1)}
                  >
                    Previous
                  </button>
                  <span className={styles.pageInfo}>{page} / {totalPages}</span>
                  <button
                    className={styles.pageBtn}
                    disabled={page >= totalPages}
                    onClick={() => fetchFiles(page + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <div className={styles.footer}>
          <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}
