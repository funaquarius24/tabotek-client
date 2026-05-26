'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CategoryResponse } from '@/lib/types';
import { useCategories, useDeleteCategory } from '@/lib/hooks/useCategories';
import Pagination from '@/components/admin/Pagination';

export default function AdminCategoriesPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');

  const params: any = { sort: 'name', order: 'asc' };
  if (search) { params.search = search; params.page = page; params.limit = pageSize; }

  const allParams = search ? params : undefined;
  const { data, isLoading, error, refetch } = useCategories(allParams);
  const deleteMutation = useDeleteCategory();

  const categories: CategoryResponse[] = data?.categories || [];
  const pagination = data?.pagination;

  const categoryTree = search ? null : buildCategoryTree(categories);

  function buildCategoryTree(cats: any[], parentId: string | null = null): any[] {
    return cats
      .filter(cat => cat.parentCategory === parentId)
      .map(cat => ({ ...cat, children: buildCategoryTree(cats, cat._id) }));
  }

  function handleDelete(category: CategoryResponse) {
    if (!confirm('Are you sure you want to delete this category?')) return;
    const childCount = categories.filter(c => c.parentCategory === category._id).length;
    if (childCount > 0) { alert('Cannot delete category with children'); return; }
    deleteMutation.mutate(category._id, {
      onSuccess: () => refetch(),
      onError: (err: any) => alert(err.message || 'Failed to delete category'),
    });
  }

  function renderTree(tree: any[], level = 0): React.ReactElement[] {
    return tree.map(cat => (
      <div key={cat._id}>
        <div className={`flex items-center justify-between p-4 ${level > 0 ? 'ml-8' : ''} border-b hover:bg-gray-50`}>
          <div className="flex items-center gap-4" style={{ marginLeft: `${level * 20}px` }}>
            <span className="text-gray-400">{cat.children.length > 0 ? '📁' : '📄'}</span>
            <div>
              <div className="font-medium text-gray-900">{cat.name}</div>
              <div className="text-sm text-gray-500">{cat.slug}</div>
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${cat.featured ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
              {cat.featured ? 'Featured' : 'Standard'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/admin/categories/edit/${cat._id}`} className="px-3 py-1 bg-blue-100 text-blue-800 hover:bg-blue-200 rounded text-sm font-medium">Edit</Link>
            <button onClick={() => handleDelete(cat)} disabled={deleteMutation.isPending} className="px-3 py-1 bg-red-100 text-red-800 hover:bg-red-200 rounded text-sm font-medium disabled:opacity-50">
              {deleteMutation.isPending ? '...' : 'Delete'}
            </button>
          </div>
        </div>
        {cat.children.length > 0 && <div className="border-l border-gray-200 ml-8">{renderTree(cat.children, level + 1)}</div>}
      </div>
    ));
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-3xl font-bold text-gray-900">Categories</h1><p className="text-gray-600 mt-2">Organize your content with categories and subcategories.</p></div>
          <div className="px-6 py-3 bg-gray-200 text-gray-500 font-medium rounded-lg">+ New Category</div>
        </div>
        <div className="text-center py-12"><div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div><p className="mt-4 text-gray-600">Loading categories...</p></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-3xl font-bold text-gray-900">Categories</h1><p className="text-gray-600 mt-2">Organize your content with categories and subcategories.</p></div>
          <Link href="/admin/categories/new" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg">+ New Category</Link>
        </div>
        <div className="text-center py-12"><div className="text-4xl mb-4">❌</div><h3 className="text-xl font-semibold text-gray-700 mb-2">Failed to load categories</h3><p className="text-gray-500 mb-6">Please try again later</p></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600 mt-2">Organize your content with categories and subcategories.</p>
        </div>
        <Link href="/admin/categories/new" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg">+ New Category</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-500">Total Categories</p><p className="text-3xl font-bold text-gray-900 mt-2">{categories.length}</p></div>
            <div className="p-3 bg-blue-100 rounded-lg"><span className="text-2xl">📂</span></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-500">Featured</p><p className="text-3xl font-bold text-gray-900 mt-2">{categories.filter(c => c.featured).length}</p></div>
            <div className="p-3 bg-yellow-100 rounded-lg"><span className="text-2xl">⭐</span></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-500">Top Level</p><p className="text-3xl font-bold text-gray-900 mt-2">{categories.filter(c => !c.parentCategory).length}</p></div>
            <div className="p-3 bg-green-100 rounded-lg"><span className="text-2xl">📁</span></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-4 border-b flex items-center gap-4">
          <h2 className="text-xl font-bold text-gray-900">{search ? 'Search Results' : 'Category Structure'}</h2>
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search categories..."
            className="ml-auto px-4 py-2 border border-gray-300 rounded-lg text-sm w-64"
          />
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📂</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">{search ? 'No categories match your search' : 'No categories yet'}</h3>
            <p className="text-gray-500 mb-6">{search ? 'Try a different search term' : 'Create your first category to organize content'}</p>
            {!search && <Link href="/admin/categories/new" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg">Create Your First Category</Link>}
          </div>
        ) : search ? (
          <>
            <div className="divide-y divide-gray-200">
              {categories.map(cat => (
                <div key={cat._id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400">📄</span>
                    <div>
                      <div className="font-medium text-gray-900">{cat.name}</div>
                      <div className="text-sm text-gray-500">{cat.slug} {cat.parentCategory ? `(subcategory)` : `(top level)`}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/categories/edit/${cat._id}`} className="px-3 py-1 bg-blue-100 text-blue-800 hover:bg-blue-200 rounded text-sm font-medium">Edit</Link>
                    <button onClick={() => handleDelete(cat)} disabled={deleteMutation.isPending} className="px-3 py-1 bg-red-100 text-red-800 hover:bg-red-200 rounded text-sm font-medium disabled:opacity-50">
                      {deleteMutation.isPending ? '...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {pagination && (
              <Pagination page={page} totalPages={pagination.totalPages} total={pagination.total} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={s => { setPageSize(s); setPage(1); }} />
            )}
          </>
        ) : (
          <div className="divide-y divide-gray-200">{renderTree(categoryTree || [])}</div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">💡 Category Tips</h3>
        <ul className="text-blue-800 space-y-2">
          <li className="flex items-start gap-2"><span className="mt-1">•</span><span>Create a clear hierarchy with parent and child categories</span></li>
          <li className="flex items-start gap-2"><span className="mt-1">•</span><span>Mark important categories as "Featured" to highlight them on the homepage</span></li>
          <li className="flex items-start gap-2"><span className="mt-1">•</span><span>Use slugs that are URL-friendly (lowercase, hyphens instead of spaces)</span></li>
          <li className="flex items-start gap-2"><span className="mt-1">•</span><span>You cannot delete categories that have child categories or articles</span></li>
        </ul>
      </div>
    </div>
  );
}
