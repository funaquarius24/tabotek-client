'use client';

import Link from 'next/link';
import { useArticles } from '@/lib/hooks/useArticles';
import { ArticleResponse } from '@/lib/types';
import AdminArticlesTable from '@/components/admin/ArticlesTable';

export default function AdminArticlesPage() {
  const { data, isLoading, error } = useArticles({ limit: 50 });

  const articles: ArticleResponse[] = data?.articles || [];
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Articles</h1>
          <p className="text-gray-600 mt-2">
            Manage all articles, create new content, and edit existing articles.
          </p>
        </div>
        <Link
          href="/admin/articles/new"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          + New Article
        </Link>
      </div>
      
      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 bg-white rounded-xl shadow-sm">
        <button className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-medium">
          All ({articles.length})
        </button>
        <button className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200">
          Published ({articles.filter(a => a.status === 'published').length})
        </button>
        <button className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200">
          Draft ({articles.filter(a => a.status === 'draft').length})
        </button>
        <button className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200">
          Archived ({articles.filter(a => a.status === 'archived').length})
        </button>
      </div>
      
      {/* Articles Table */}
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
          <AdminArticlesTable articles={articles} />
        )}
      </div>
    </div>
  );
}