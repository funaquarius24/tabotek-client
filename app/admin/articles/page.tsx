'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useArticles } from '@/lib/hooks/useArticles';
import { ArticleResponse } from '@/lib/types';
import AdminArticlesTable from '@/components/admin/ArticlesTable';
import Pagination from '@/components/admin/Pagination';

export default function AdminArticlesPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch('/api/admin/stats').then(r => r.ok && r.json()).then(d => setStats(d)).catch(() => {});
  }, []);

  const params: any = { limit: pageSize, page };
  if (statusFilter) params.status = statusFilter;
  if (search) params.search = search;

  const { data, isLoading, error } = useArticles(params);
  const articles: ArticleResponse[] = data?.articles || [];
  const pagination = data?.pagination;

  const counts = {
    '': stats?.totalArticles || 0,
    published: stats?.publishedArticles || 0,
    draft: stats?.draftArticles || 0,
    archived: stats?.archivedArticles || 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Articles</h1>
          <p className="text-gray-600 mt-2">Manage all articles, create new content, and edit existing articles.</p>
        </div>
        <Link href="/admin/articles/new" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg">+ New Article</Link>
      </div>

      <div className="flex flex-wrap gap-4 p-4 bg-white rounded-xl shadow-sm items-center">
        {(['', 'published', 'draft', 'archived'] as const).map(s => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === s ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'} ({counts[s]})
          </button>
        ))}
        <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search articles..." className="ml-auto px-4 py-2 border border-gray-300 rounded-lg text-sm w-64" />
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading articles...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">❌</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Failed to load articles</h3>
            <p className="text-gray-500 mb-6">Please try again later</p>
          </div>
        ) : (
          <>
            <AdminArticlesTable articles={articles} />
            {pagination && (
              <Pagination page={page} totalPages={pagination.totalPages} total={pagination.total} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={s => { setPageSize(s); setPage(1); }} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
