'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useArticles } from '@/lib/hooks/useArticles';
import { ArticleResponse } from '@/lib/types';
import ArticleTable from '@/components/ArticleTable';
import ArticleFilterBar from '@/components/ArticleFilterBar';
import Pagination from '@/components/admin/Pagination';
import { useDeleteArticle } from '@/lib/hooks/useArticles';
import { useToast } from '@/components/Toast';

export default function AdminArticlesPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<string>('publishedAt');
  const [sortOrder, setSortOrder] = useState<string>('-1');
  const [stats, setStats] = useState<any>(null);
  const deleteArticle = useDeleteArticle();
  const { addToast } = useToast();

  useEffect(() => {
    fetch('/api/admin/stats').then(r => r.ok && r.json()).then(d => setStats(d)).catch(() => {});
  }, []);

  const params: any = { limit: pageSize, page };
  if (statusFilter) params.status = statusFilter;
  if (search) params.search = search;

  const { data, isLoading, error } = useArticles(params);
  const articles: ArticleResponse[] = data?.articles || [];
  const pagination = data?.pagination;

  const handleDelete = (slug: string) => {
    if (!confirm('Are you sure you want to delete this article? This action cannot be undone.')) return;
    deleteArticle.mutate(slug, {
      onSuccess: () => addToast('Article deleted successfully', 'success'),
      onError: (err: any) => addToast(err?.message ?? 'Failed to delete article', 'error'),
    });
  };

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

      <ArticleFilterBar
        statusFilter={statusFilter}
        onStatusFilterChange={(s) => { setStatusFilter(s); setPage(1); }}
        search={search}
        onSearchChange={(s) => { setSearch(s); setPage(1); }}
        counts={counts}
        showSort
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortByChange={setSortBy}
        onSortOrderChange={() => setSortOrder(o => o === '-1' ? '1' : '-1')}
      />

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
            <ArticleTable
              articles={articles}
              showCategory
              showAuthor
              actions={(article) => (
                <>
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
                    className="px-3 py-1 bg-red-100 text-red-800 hover:bg-red-200 rounded text-sm font-medium"
                    onClick={() => handleDelete(article.slug)}
                  >
                    Delete
                  </button>
                </>
              )}
            />
            {pagination && (
              <Pagination page={page} totalPages={pagination.totalPages} total={pagination.total} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={s => { setPageSize(s); setPage(1); }} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
