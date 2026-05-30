'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Comment {
  _id: string;
  articleSlug: string;
  articleTitle: string;
  content: string;
  author: { name: string; email: string };
  createdAt: string;
}

export default function AuthorCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/author/comments?page=${page}&limit=20`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : { comments: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } })
      .then(d => {
        setComments(d.comments);
        setTotalPages(d.pagination.totalPages);
        setTotal(d.pagination.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Comments</h1>
        <p className="text-gray-600 mt-2">Comments on your articles.</p>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            <p className="mt-3 text-gray-600">Loading comments...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">💬</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">No comments yet</h3>
            <p className="text-gray-500">Comments from readers will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {comments.map(c => (
              <div key={c._id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-500 mb-1">
                      <span className="font-medium text-gray-700">{c.author?.name || 'Anonymous'}</span>
                      {' on '}
                      <Link href={`/article/${c.articleSlug}`} className="text-blue-600 hover:underline font-medium">
                        {c.articleTitle || c.articleSlug}
                      </Link>
                    </p>
                    <p className="text-gray-900 whitespace-pre-wrap break-words">{c.content}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}
                    </p>
                  </div>
                  <Link
                    href={`/article/${c.articleSlug}`}
                    target="_blank"
                    className="ml-4 shrink-0 px-3 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded text-sm font-medium"
                  >
                    View Article
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
            <span className="text-sm text-gray-600">Page {page} of {totalPages} ({total} total)</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 border rounded-lg text-sm bg-white hover:bg-gray-100 disabled:opacity-40">Previous</button>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 border rounded-lg text-sm bg-white hover:bg-gray-100 disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
