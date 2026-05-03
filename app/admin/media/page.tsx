'use client';

import { useState, useCallback } from 'react';
import Upload from '@/components/Upload';
import { useFiles, useDeleteFile } from '@/hooks/useFiles';
import type { FileRecord } from '@/lib/types';

type FilterType = 'all' | 'image' | 'video' | 'document';

export default function AdminMediaPage() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<FilterType>('all');
  const [showUpload, setShowUpload] = useState(false);

  const typeParam = filter === 'all' ? undefined : filter;
  const { data, isLoading, isError } = useFiles({ page, limit: 24, type: typeParam });
  const deleteFile = useDeleteFile();

  const files = data?.files ?? [];
  const pagination = data?.pagination;

  const handleDelete = useCallback(async (id: string) => {
    if (!window.confirm('Delete this file?')) return;
    deleteFile.mutate(id);
  }, [deleteFile]);

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (type: string, url: string): string => {
    if (type.startsWith('image/')) return `<img src="${url}" alt="" class="w-full h-full object-cover" />`;
    if (type.startsWith('video/')) return '🎬';
    if (type.startsWith('application/pdf')) return '📄';
    return '📎';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Media Library</h1>
          <p className="text-gray-600 mt-2">
            Upload and manage images, documents, and other media files.
          </p>
        </div>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          {showUpload ? 'Cancel' : '+ Upload Media'}
        </button>
      </div>

      {showUpload && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <Upload
            onSuccess={() => {
              setShowUpload(false);
              setPage(1);
            }}
            accept="image/*,video/*,.pdf,.zip,.gz,.csv,.txt"
            maxSize={10 * 1024 * 1024}
          />
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {filter === 'all' ? 'All Files' : filter === 'image' ? 'Images' : filter === 'video' ? 'Videos' : 'Documents'}
          </h2>
          <div className="flex gap-2">
            {(['all', 'image', 'video', 'document'] as FilterType[]).map(f => (
              <button
                key={f}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
                onClick={() => { setFilter(f); setPage(1); }}
              >
                {f === 'all' ? 'All' : f === 'image' ? 'Images' : f === 'video' ? 'Videos' : 'Documents'}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading files...</div>
        ) : isError ? (
          <div className="text-center py-12 text-red-500">Failed to load files</div>
        ) : files.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-4">📁</div>
            <p>No files uploaded yet. Click &quot;Upload Media&quot; to get started.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {files.map((file: FileRecord) => (
                <div key={file._id} className="group relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                  {file.type.startsWith('image/') ? (
                    <img
                      src={file.url}
                      alt={file.originalname}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                      {file.type.startsWith('video/') ? '🎬' : file.type.startsWith('application/pdf') ? '📄' : '📎'}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      <button
                        className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md"
                        onClick={() => navigator.clipboard.writeText(file.url)}
                        title="Copy URL"
                      >
                        📋
                      </button>
                      <button
                        className="p-2 bg-red-100 text-red-800 rounded-lg shadow-sm hover:shadow-md"
                        onClick={() => handleDelete(file._id)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-white text-sm">
                    <div className="truncate">{file.originalname}</div>
                    <div className="text-xs opacity-75">{formatSize(file.size)}</div>
                  </div>
                </div>
              ))}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-4">
                <button
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {page} of {pagination.totalPages} ({pagination.total} files)
                </span>
                <button
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
