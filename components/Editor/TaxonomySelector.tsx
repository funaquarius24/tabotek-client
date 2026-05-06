'use client';

import { useState, useCallback } from 'react';
import { useCategories } from '@/hooks/useCategories';
import { useTags } from '@/hooks/useTags';
import { CategoryResponse, TagResponse } from '@/lib/types';

interface TaxonomySelectorProps {
  selectedCategory: string;
  selectedTags: string[];
  onChange: (data: { category?: string; tags?: string[] }) => void;
}

export function TaxonomySelector({ selectedCategory, selectedTags, onChange }: TaxonomySelectorProps) {
  const { data: categoriesData } = useCategories();
  const { data: tagsData } = useTags();

  const categories: CategoryResponse[] = categoriesData?.categories || [];
  const tags: TagResponse[] = tagsData?.tags || [];

  const [tagInput, setTagInput] = useState('');
  const [tagSuggestions, setTagSuggestions] = useState<TagResponse[]>([]);

  const availableTags = tags.filter(t => !selectedTags.includes(t.name));
  const filteredSuggestions = tagInput
    ? availableTags.filter(t => t.name.toLowerCase().includes(tagInput.toLowerCase()))
    : [];

  const handleAddTag = useCallback((tagName: string) => {
    const trimmed = tagName.trim();
    if (trimmed && !selectedTags.includes(trimmed)) {
      onChange({ tags: [...selectedTags, trimmed] });
    }
    setTagInput('');
    setTagSuggestions([]);
  }, [selectedTags, onChange]);

  const handleRemoveTag = useCallback((tag: string) => {
    onChange({ tags: selectedTags.filter(t => t !== tag) });
  }, [selectedTags, onChange]);

  return (
    <div className="space-y-6">
      {/* Category: Single select, required */}
      <div>
        <label className="block font-medium text-gray-900 mb-2">Category *</label>
        <select
          value={selectedCategory}
          onChange={(e) => onChange({ category: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          required
        >
          <option value="">Select a category...</option>
          {categories.map(cat => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
        <p className="text-sm text-gray-500 mt-1">
          Choose the primary topic area for this article
        </p>
      </div>

      {/* Tags: Multi-select with search */}
      <div>
        <label className="block font-medium text-gray-900 mb-2">Tags</label>
        <div className="flex flex-wrap gap-2 mb-2 min-h-[2rem]">
          {selectedTags.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="text-blue-600 hover:text-blue-800 font-bold leading-none"
              >
                &times;
              </button>
            </span>
          ))}
        </div>
        <div className="relative">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (filteredSuggestions.length > 0) {
                  handleAddTag(filteredSuggestions[0].name);
                } else if (tagInput.trim()) {
                  handleAddTag(tagInput);
                }
              }
              if (e.key === 'Backspace' && !tagInput && selectedTags.length > 0) {
                handleRemoveTag(selectedTags[selectedTags.length - 1]);
              }
            }}
            placeholder={selectedTags.length === 0 ? 'Add tags like &apos;react-hooks&apos;, &apos;typescript&apos;, &apos;performance&apos;...' : 'Add more tags...'}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            maxLength={30}
          />
          {/* Autocomplete suggestions */}
          {tagInput && filteredSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {filteredSuggestions.slice(0, 8).map(suggestion => (
                <button
                  key={suggestion._id}
                  type="button"
                  onClick={() => handleAddTag(suggestion.name)}
                  className="w-full text-left px-4 py-2 hover:bg-blue-50 text-gray-700 text-sm transition-colors"
                >
                  <span className="font-medium">{suggestion.name}</span>
                  {suggestion.description && (
                    <span className="text-gray-400 ml-2 text-xs">{suggestion.description}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Add specific keywords to help readers discover this article
        </p>
      </div>
    </div>
  );
}
