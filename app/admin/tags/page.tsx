'use client';

import React, { useState, useCallback } from 'react';
import { TagResponse, CreateTagRequest } from '@/lib/types';
import { useTags, useCreateTag, useUpdateTag, useDeleteTag, useMergeTags, useCleanupUnusedTags, useTagSuggestions, useRecountTagCounts } from '@/hooks/useTags';

export default function AdminTagsPage() {
  const { data, isLoading, error, refetch } = useTags();
  const createMutation = useCreateTag();
  const updateMutation = useUpdateTag();
  const deleteMutation = useDeleteTag();
  const mergeMutation = useMergeTags();
  const cleanupMutation = useCleanupUnusedTags();
  const recountMutation = useRecountTagCounts();
  const { data: suggestionsData, refetch: refetchSuggestions } = useTagSuggestions();

  const tags: TagResponse[] = data?.tags || [];
  const suggestions = suggestionsData?.suggestions || [];

  const [showForm, setShowForm] = useState(false);
  const [editingTag, setEditingTag] = useState<TagResponse | null>(null);
  const [form, setForm] = useState<CreateTagRequest>({ name: '', slug: '', description: '', relatedTags: [] });
  const [relatedInput, setRelatedInput] = useState('');
  const [tagSearch, setTagSearch] = useState('');

  // Merge dialog state
  const [mergeSource, setMergeSource] = useState<TagResponse | null>(null);
  const [mergeTargetId, setMergeTargetId] = useState('');

  const filteredTags = tagSearch
    ? tags.filter(t => t.name.toLowerCase().includes(tagSearch.toLowerCase()) || t.slug.toLowerCase().includes(tagSearch.toLowerCase()))
    : tags;

  const resetForm = useCallback(() => {
    setForm({ name: '', slug: '', description: '', relatedTags: [] });
    setRelatedInput('');
    setEditingTag(null);
    setShowForm(false);
  }, []);

  const openEdit = useCallback((tag: TagResponse) => {
    setEditingTag(tag);
    setForm({
      name: tag.name,
      slug: tag.slug,
      description: tag.description || '',
      relatedTags: tag.relatedTags || [],
    });
    setShowForm(true);
  }, []);

  const handleNameChange = useCallback((name: string) => {
    setForm(prev => ({
      ...prev,
      name,
      slug: editingTag ? prev.slug : name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    }));
  }, [editingTag]);

  const handleAddRelated = useCallback(() => {
    const trimmed = relatedInput.trim();
    if (trimmed && !form.relatedTags?.includes(trimmed)) {
      setForm(prev => ({ ...prev, relatedTags: [...(prev.relatedTags || []), trimmed] }));
    }
    setRelatedInput('');
  }, [relatedInput, form.relatedTags]);

  const handleRemoveRelated = useCallback((tag: string) => {
    setForm(prev => ({ ...prev, relatedTags: prev.relatedTags?.filter(t => t !== tag) || [] }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.slug) return;

    try {
      if (editingTag) {
        await updateMutation.mutateAsync({ id: editingTag._id, data: form });
      } else {
        await createMutation.mutateAsync(form);
      }
      refetch();
      resetForm();
    } catch (err: any) {
      alert(err.message || 'Failed to save tag');
    }
  }, [form, editingTag, updateMutation, createMutation, refetch, resetForm]);

  const handleDelete = useCallback((tag: TagResponse) => {
    if (!confirm(`Delete tag "${tag.name}"? This cannot be undone.`)) return;
    deleteMutation.mutate(tag._id, {
      onSuccess: () => refetch(),
      onError: (err: any) => alert(err.message || 'Failed to delete tag'),
    });
  }, [deleteMutation, refetch]);

  const handleMerge = useCallback(async () => {
    if (!mergeSource || !mergeTargetId) return;
    const targetTag = tags.find(t => t._id === mergeTargetId);
    if (!targetTag) return;

    if (!confirm(`Merge "${mergeSource.name}" into "${targetTag.name}"? This will update all articles referencing "${mergeSource.name}" to "${targetTag.name}" and delete the source tag.`)) return;

    mergeMutation.mutate({ sourceId: mergeSource._id, targetId: mergeTargetId }, {
      onSuccess: (data) => {
        refetch();
        setMergeSource(null);
        setMergeTargetId('');
        alert(`Merged "${data.sourceTag}" into "${data.targetTag}". Updated ${data.articlesUpdated} articles.`);
      },
      onError: (err: any) => alert(err.message || 'Failed to merge tags'),
    });
  }, [mergeSource, mergeTargetId, tags, mergeMutation, refetch]);

  const handleCleanup = useCallback(async () => {
    if (!confirm('Delete all unused tags that are older than 30 days? This will also recalculate article counts for all tags.')) return;
    cleanupMutation.mutate(undefined, {
      onSuccess: (data) => {
        refetch();
        alert(`Cleaned up ${data.deletedCount} unused tags: ${data.deletedTags.join(', ') || 'none'}`);
      },
      onError: (err: any) => alert(err.message || 'Failed to clean up tags'),
    });
  }, [cleanupMutation, refetch]);

  const handleRecount = useCallback(async () => {
    recountMutation.mutate(undefined, {
      onSuccess: (data) => {
        refetch();
        alert(`Recounted ${data.tagsUpdated} tags.`);
      },
      onError: (err: any) => alert(err.message || 'Failed to recount'),
    });
  }, [recountMutation, refetch]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tags</h1>
            <p className="text-gray-600 mt-2">Manage your content tags and keywords.</p>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading tags...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tags</h1>
            <p className="text-gray-600 mt-2">Manage your content tags and keywords.</p>
          </div>
          <button onClick={() => refetch()} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">Retry</button>
        </div>
        <div className="text-center py-12">
          <div className="text-4xl mb-4">❌</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Failed to load tags</h3>
          <p className="text-gray-500 mb-6">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tags</h1>
          <p className="text-gray-600 mt-2">Manage your content tags and keywords.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRecount}
            disabled={recountMutation.isPending}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors text-sm disabled:opacity-50"
          >
            {recountMutation.isPending ? 'Recounting...' : 'Recount'}
          </button>
          <button
            onClick={handleCleanup}
            disabled={cleanupMutation.isPending}
            className="px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-800 font-medium rounded-lg transition-colors text-sm disabled:opacity-50"
          >
            {cleanupMutation.isPending ? 'Cleaning...' : 'Cleanup Unused'}
          </button>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            + New Tag
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Tags</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{tags.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <span className="text-2xl">🏷️</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">With Articles</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {tags.filter(t => (t.articleCount || 0) > 0).length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Unused (&gt;30d)</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {tags.filter(t => (t.articleCount || 0) === 0).length}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <span className="text-2xl">📋</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Suggestions</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{suggestions.length}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <span className="text-2xl">💡</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tag Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full mx-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingTag ? 'Edit Tag' : 'Create New Tag'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => handleNameChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. React Hooks"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Slug *</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={e => setForm(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. react-hooks"
                  required
                  disabled={!!editingTag}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Brief description of this tag..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Related Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {form.relatedTags?.map(rt => (
                    <span key={rt} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {rt}
                      <button type="button" onClick={() => handleRemoveRelated(rt)} className="text-blue-600 hover:text-blue-800 font-bold">&times;</button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={relatedInput}
                    onChange={e => setRelatedInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddRelated(); } }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add related tag name..."
                  />
                  <button type="button" onClick={handleAddRelated} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium">Add</button>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editingTag ? 'Update Tag' : 'Create Tag'}
                </button>
                <button type="button" onClick={resetForm} className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Merge Dialog */}
      {mergeSource && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" onClick={() => { setMergeSource(null); setMergeTargetId(''); }}>
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Merge Tag</h2>
            <p className="text-gray-600 mb-6">
              Merge <strong>{mergeSource.name}</strong> into another tag. Articles using this tag will be updated.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Target Tag</label>
                <select
                  value={mergeTargetId}
                  onChange={e => setMergeTargetId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select target tag...</option>
                  {tags.filter(t => t._id !== mergeSource._id).map(t => (
                    <option key={t._id} value={t._id}>{t.name} ({t.articleCount || 0} articles)</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleMerge}
                  disabled={!mergeTargetId || mergeMutation.isPending}
                  className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {mergeMutation.isPending ? 'Merging...' : 'Merge Tags'}
                </button>
                <button onClick={() => { setMergeSource(null); setMergeTargetId(''); }} className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-4 border-b flex items-center gap-4">
          <input
            type="text"
            value={tagSearch}
            onChange={e => setTagSearch(e.target.value)}
            placeholder="Search tags by name or slug..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <span className="text-sm text-gray-500">{filteredTags.length} of {tags.length}</span>
        </div>

        {filteredTags.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🏷️</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {tagSearch ? 'No tags match your search' : 'No tags yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {tagSearch ? 'Try a different search term' : 'Create your first tag to organize content'}
            </p>
            {!tagSearch && (
              <button
                onClick={() => { resetForm(); setShowForm(true); }}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Create Your First Tag
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Articles</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Related Tags</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTags.map(tag => (
                  <tr key={tag._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{tag.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-sm text-gray-500">{tag.slug}</code>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${(tag.articleCount || 0) >= 3 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {tag.articleCount || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {tag.relatedTags?.length > 0 ? tag.relatedTags.slice(0, 3).map(rt => (
                          <span key={rt} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{rt}</span>
                        )) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                        {(tag.relatedTags?.length || 0) > 3 && (
                          <span className="text-xs text-gray-400">+{tag.relatedTags.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setMergeSource(tag); setMergeTargetId(''); }}
                          className="px-3 py-1 bg-purple-100 text-purple-800 hover:bg-purple-200 rounded text-sm font-medium"
                        >
                          Merge
                        </button>
                        <button
                          onClick={() => openEdit(tag)}
                          className="px-3 py-1 bg-blue-100 text-blue-800 hover:bg-blue-200 rounded text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(tag)}
                          disabled={deleteMutation.isPending}
                          className="px-3 py-1 bg-red-100 text-red-800 hover:bg-red-200 rounded text-sm font-medium disabled:opacity-50"
                        >
                          {deleteMutation.isPending ? '...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Tag Suggestions */}
      {suggestions.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-purple-900">💡 Tag Suggestions</h3>
              <p className="text-sm text-purple-700 mt-1">Based on article content analysis. Click to create a new tag.</p>
            </div>
            <button onClick={() => refetchSuggestions()} className="text-sm text-purple-600 hover:text-purple-800 font-medium">Refresh</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map(s => (
              <button
                key={s.slug}
                onClick={async () => {
                  try {
                    await createMutation.mutateAsync({
                      name: s.name,
                      slug: s.slug,
                      description: `Articles and tutorials about ${s.name}`,
                    });
                    refetch();
                    refetchSuggestions();
                  } catch { /* tag may already exist */ }
                }}
                disabled={createMutation.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-purple-200 hover:border-purple-400 rounded-full text-sm text-purple-800 hover:bg-purple-50 transition-colors disabled:opacity-50"
              >
                <span>{s.name}</span>
                <span className="text-xs text-purple-400">({s.articleCount} articles)</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">💡 Tag Management Tips</h3>
        <ul className="text-blue-800 space-y-2">
          <li className="flex items-start gap-2"><span className="mt-1">•</span><span>Use specific, descriptive tags that help readers find content</span></li>
          <li className="flex items-start gap-2"><span className="mt-1">•</span><span>Limit to 5-10 tags per article for best SEO results</span></li>
          <li className="flex items-start gap-2"><span className="mt-1">•</span><span>Use the "Merge" feature to consolidate duplicate tags (e.g. "reactjs" → "react")</span></li>
          <li className="flex items-start gap-2"><span className="mt-1">•</span><span>Tags with fewer than 3 articles get a yellow badge — consider merging or removing them</span></li>
          <li className="flex items-start gap-2"><span className="mt-1">•</span><span>Use "Cleanup Unused" to automatically remove unused tags older than 30 days</span></li>
          <li className="flex items-start gap-2"><span className="mt-1">•</span><span>Tag suggestions are generated by analyzing article titles for common keywords</span></li>
        </ul>
      </div>
    </div>
  );
}
