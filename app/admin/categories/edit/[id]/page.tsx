'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useCategories, useUpdateCategory } from '@/lib/hooks/useCategories';
import { CategoryResponse, UpdateCategoryRequest } from '@/lib/types';

export default function EditCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.id as string;
  const { data } = useCategories();
  const updateMutation = useUpdateCategory();

  const categories: CategoryResponse[] = data?.categories || [];
  const category = categories.find(c => c._id === categoryId);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [parentCategory, setParentCategory] = useState<string | null>(null);
  const [featured, setFeatured] = useState(false);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setSlug(category.slug);
      setDescription(category.description || '');
      setParentCategory(category.parentCategory || null);
      setFeatured(category.featured || false);
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) return;

    const data: UpdateCategoryRequest = { name, slug, description, parentCategory, featured };

    updateMutation.mutate(
      { id: categoryId, data },
      { onSuccess: () => router.push('/admin/categories') }
    );
  };

  if (!category) {
    return <div className="text-center py-12 text-gray-500">Loading category...</div>;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Category</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow-sm">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input value={name} onChange={e => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
          <input value={slug} onChange={e => setSlug(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
          <select value={parentCategory || ''} onChange={e => setParentCategory(e.target.value || null)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">None (top-level)</option>
            {categories.filter(c => c._id !== categoryId).map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-3">
          <input type="checkbox" id="featured" checked={featured} onChange={e => setFeatured(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded" />
          <label htmlFor="featured" className="text-sm font-medium text-gray-700">Featured</label>
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={updateMutation.isPending}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors">
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
          <button type="button" onClick={() => router.push('/admin/categories')}
            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
