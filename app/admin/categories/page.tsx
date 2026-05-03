'use client';

import React from 'react';
import Link from 'next/link';
import { CategoryResponse } from '@/lib/types';
import { useCategories, useDeleteCategory } from '@/lib/hooks/useCategories';

export default function AdminCategoriesPage() {
  const { data, isLoading, error, refetch } = useCategories();
  const deleteMutation = useDeleteCategory();
  
  const categories: CategoryResponse[] = data?.categories || [];
  
  // Build category tree
  const categoryTree = buildCategoryTree(categories);
  
  function buildCategoryTree(categories: any[], parentId: string | null = null): any[] {
    return categories
      .filter(cat => cat.parentCategory === parentId)
      .map(cat => ({
        ...cat,
        children: buildCategoryTree(categories, cat._id)
      }));
  }
  
  function handleDelete(category: CategoryResponse) {
    if (!confirm('Are you sure you want to delete this category?')) {
      return;
    }
    
    // Check if category has children (client-side check)
    const childCount = categories.filter(c => c.parentCategory === category._id).length;
    if (childCount > 0) {
      alert('Cannot delete category with children');
      return;
    }
    
    // Check if category has articles (client-side cannot know, we'll rely on server validation)
    deleteMutation.mutate(category._id, {
      onSuccess: () => refetch(),
      onError: (err: any) => alert(err.message || 'Failed to delete category'),
    });
  }
  
  function renderCategoryTree(categoryTree: any[], level = 0): React.ReactElement[] {
    return categoryTree.map((category) => (
      <div key={category._id}>
        <div className={`flex items-center justify-between p-4 ${level > 0 ? 'ml-8' : ''} border-b hover:bg-gray-50`}>
          <div className="flex items-center gap-4">
            <div style={{ marginLeft: `${level * 20}px` }} className="flex items-center gap-3">
              {category.children.length > 0 ? (
                <span className="text-gray-400">📁</span>
              ) : (
                <span className="text-gray-400">📄</span>
              )}
              <div>
                <div className="font-medium text-gray-900">{category.name}</div>
                <div className="text-sm text-gray-500">{category.slug}</div>
              </div>
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${category.featured ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
              {category.featured ? 'Featured' : 'Standard'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/categories/edit/${category._id}`}
              className="px-3 py-1 bg-blue-100 text-blue-800 hover:bg-blue-200 rounded text-sm font-medium"
            >
              Edit
            </Link>
            <button
              onClick={() => handleDelete(category)}
              disabled={deleteMutation.isPending}
              className="px-3 py-1 bg-red-100 text-red-800 hover:bg-red-200 rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
        {category.children.length > 0 && (
          <div className="border-l border-gray-200 ml-8">
            {renderCategoryTree(category.children, level + 1)}
          </div>
        )}
      </div>
    ));
  }
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
            <p className="text-gray-600 mt-2">
              Organize your content with categories and subcategories.
            </p>
          </div>
          <div className="px-6 py-3 bg-gray-200 text-gray-500 font-medium rounded-lg">
            + New Category
          </div>
        </div>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
            <p className="text-gray-600 mt-2">
              Organize your content with categories and subcategories.
            </p>
          </div>
          <Link
            href="/admin/categories/new"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            + New Category
          </Link>
        </div>
        <div className="text-center py-12">
          <div className="text-4xl mb-4">❌</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Failed to load categories</h3>
          <p className="text-gray-500 mb-6">Please try again later</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600 mt-2">
            Organize your content with categories and subcategories.
          </p>
        </div>
        <Link
          href="/admin/categories/new"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          + New Category
        </Link>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Categories</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{categories.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <span className="text-2xl">📂</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Featured</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {categories.filter(c => c.featured).length}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <span className="text-2xl">⭐</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Top Level</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {categories.filter(c => !c.parentCategory).length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <span className="text-2xl">📁</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Categories List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Category Structure</h2>
          <p className="text-gray-500 text-sm mt-1">
            Drag and drop to reorder categories (coming soon)
          </p>
        </div>
        
        {categories.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📂</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No categories yet</h3>
            <p className="text-gray-500 mb-6">Create your first category to organize content</p>
            <Link
              href="/admin/categories/new"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Create Your First Category
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {renderCategoryTree(categoryTree)}
          </div>
        )}
      </div>
      
      {/* Quick Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">💡 Category Tips</h3>
        <ul className="text-blue-800 space-y-2">
          <li className="flex items-start gap-2">
            <span className="mt-1">•</span>
            <span>Create a clear hierarchy with parent and child categories</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1">•</span>
            <span>Mark important categories as "Featured" to highlight them on the homepage</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1">•</span>
            <span>Use slugs that are URL-friendly (lowercase, hyphens instead of spaces)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1">•</span>
            <span>You cannot delete categories that have child categories or articles</span>
          </li>
        </ul>
      </div>
    </div>
  );
}