'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { useAuthorArticles, useDeleteArticle, useUpdateArticle } from '@/lib/hooks/useArticles';
import { useToast } from '@/components/Toast';
import type { ArticleResponse } from '@/lib/types';

const PAGE_SIZE = 15;

export default function AuthorArticlesPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<string>('publishedAt');
  const [sortOrder, setSortOrder] = useState<string>('-1');

  const params: any = { limit: PAGE_SIZE, page };
  if (statusFilter) params.status = statusFilter;
  if (search) params.search = search;

  const { data, isLoading, error } = useAuthorArticles(params);
  const articles: ArticleResponse[] = data?.articles || [];
  const pagination = data?.pagination;

  const deleteArticle = useDeleteArticle();
  const updateArticle = useUpdateArticle();

  const handleDelete = (slug: string) => {
    if (!confirm('Delete this article? This cannot be undone.')) return;
    deleteArticle.mutate(slug, {
      onSuccess: () => addToast('Article deleted', 'success'),
      onError: (err: any) => addToast(err?.message ?? 'Failed to delete', 'error'),
    });
  };

  const handlePublish = (slug: string) => {
    if (!confirm('Publish this article?')) return;
    updateArticle.mutate(
      { slug, data: { status: 'published' } as any },
      { onSuccess: () => addToast('Article published', 'success'), onError: (err: any) => addToast(err?.message ?? 'Failed to publish', 'error') }
    );
  };

  const sorted = [...articles].sort((a, b) => {
    const dir = parseInt(sortOrder);
    if (sortBy === 'title') return dir * a.title.localeCompare(b.title);
    if (sortBy === 'status') return dir * a.status.localeCompare(b.status);
    const da = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const db = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return dir * (da - db);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Articles</h1>
          <p className="text-gray-600 mt-2">Manage your articles — create, edit, publish, and delete.</p>
        </div>
        <Link href="/publish" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg">+ New Article</Link>
      </div>

      <div className="flex flex-wrap gap-3 p-4 bg-white rounded-xl shadow-sm items-center">
        {(['', 'draft', 'published', 'archived'] as const).map(s => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              statusFilter === s ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
          </button>
        ))}
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search articles..."
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-56"
        />
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="publishedAt">Date</option>
          <option value="title">Title</option>
          <option value="status">Status</option>
        </select>
        <button
          onClick={() => setSortOrder(o => o === '-1' ? '1' : '-1')}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-100"
          title="Toggle sort direction"
        >
          {sortOrder === '-1' ? '↓ Desc' : '↑ Asc'}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            <p className="mt-3 text-gray-600">Loading articles...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">❌</div>
            <h3 className="text-lg font-semibold text-gray-700">Failed to load articles</h3>
            <p className="text-gray-500 mt-2">{(error as Error)?.message || 'An unexpected error occurred.'}</p>
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">{search || statusFilter ? '🔍' : '📝'}</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">
              {search || statusFilter ? 'No articles found' : 'No articles yet'}
            </h3>
            <p className="text-gray-500 mb-5">
              {search || statusFilter
                ? 'Try adjusting your search or filter.'
                : 'Create your first article to get started.'}
            </p>
            {!search && !statusFilter && (
              <Link href="/publish" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">Write an Article</Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sorted.map(article => (
                  <tr key={article._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{article.title}</div>
                      <div className="text-sm text-gray-500">{article.slug}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        article.status === 'published' ? 'bg-green-100 text-green-800' :
                        article.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>{article.status}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{article.views || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        {article.status !== 'published' && (
                          <button
                            onClick={() => handlePublish(article.slug)}
                            className="px-3 py-1 bg-green-100 text-green-800 hover:bg-green-200 rounded text-sm font-medium"
                          >
                            Publish
                          </button>
                        )}
                        <Link
                          href={`/admin/articles/edit/${article._id}`}
                          className="px-3 py-1 bg-blue-100 text-blue-800 hover:bg-blue-200 rounded text-sm font-medium"
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/article/${article.slug}`}
                          target="_blank"
                          className="px-3 py-1 bg-gray-100 text-gray-800 hover:bg-gray-200 rounded text-sm font-medium"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleDelete(article.slug)}
                          className="px-3 py-1 bg-red-100 text-red-800 hover:bg-red-200 rounded text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
            <span className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
            </span>
            <div className="flex gap-2">
              <button disabled={pagination.page <= 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 border rounded-lg text-sm bg-white hover:bg-gray-100 disabled:opacity-40">Previous</button>
              <button disabled={pagination.page >= pagination.totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 border rounded-lg text-sm bg-white hover:bg-gray-100 disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
