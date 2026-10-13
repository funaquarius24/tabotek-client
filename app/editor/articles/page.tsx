'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useArticles, useDeleteArticle, useUpdateArticle } from '@/lib/hooks/useArticles';
import type { ArticleResponse } from '@/lib/types';
import ArticleTable from '@/components/ArticleTable';
import ArticleFilterBar from '@/components/ArticleFilterBar';
import Pagination from '@/components/admin/Pagination';
import { useToast } from '@/components/Toast';

export default function EditorArticlesPage() {
  const { addToast } = useToast();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState('draft');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<string>('publishedAt');
  const [sortOrder, setSortOrder] = useState<string>('-1');

  const params: any = { limit: pageSize, page };
  if (statusFilter) params.status = statusFilter;
  if (search) params.search = search;

  const { data, isLoading, error } = useArticles(params);
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
          <h1 className="text-3xl font-bold text-gray-900">Articles</h1>
          <p className="text-gray-600 mt-2">Review, edit, and publish articles across the site.</p>
        </div>
        <Link href="/editor/articles/new" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg">+ New Article</Link>
      </div>

      <ArticleFilterBar
        statusFilter={statusFilter}
        onStatusFilterChange={(s) => { setStatusFilter(s); setPage(1); }}
        search={search}
        onSearchChange={(s) => { setSearch(s); setPage(1); }}
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
        ) : sorted.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📝</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">No articles found</h3>
            <p className="text-gray-500">Try adjusting your search or filter.</p>
          </div>
        ) : (
          <>
            <ArticleTable
              articles={sorted}
              showCategory
              showAuthor
              showCreated
              actions={(article) => (
                <>
                  {article.status !== 'published' && (
                    <button
                      onClick={() => handlePublish(article.slug)}
                      className="px-3 py-1 bg-green-100 text-green-800 hover:bg-green-200 rounded text-sm font-medium"
                    >
                      Publish
                    </button>
                  )}
                  <Link
                    href={`/editor/articles/edit/${article._id}`}
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
