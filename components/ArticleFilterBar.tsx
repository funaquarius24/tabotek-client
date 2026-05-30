'use client';

interface ArticleFilterBarProps {
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  search: string;
  onSearchChange: (search: string) => void;
  counts?: Record<string, number>;
  showSort?: boolean;
  sortBy?: string;
  sortOrder?: string;
  onSortByChange?: (sortBy: string) => void;
  onSortOrderChange?: () => void;
}

const statuses = ['', 'published', 'draft', 'archived'] as const;

export default function ArticleFilterBar({
  statusFilter,
  onStatusFilterChange,
  search,
  onSearchChange,
  counts,
  showSort,
  sortBy = 'publishedAt',
  sortOrder = '-1',
  onSortByChange,
  onSortOrderChange,
}: ArticleFilterBarProps) {
  return (
    <div className="flex flex-wrap gap-4 p-4 bg-white rounded-xl shadow-sm items-center">
      {statuses.map((s) => (
        <button
          key={s}
          onClick={() => onStatusFilterChange(s)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            statusFilter === s ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
        >
          {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
          {counts !== undefined && ` (${counts[s]})`}
        </button>
      ))}
      <input
        type="text"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search articles..."
        className="px-4 py-2 border border-gray-300 rounded-lg text-sm w-64 ml-auto"
      />
      {showSort && (
        <>
          <select
            value={sortBy}
            onChange={(e) => onSortByChange?.(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="publishedAt">Date</option>
            <option value="title">Title</option>
            <option value="status">Status</option>
          </select>
          <button
            onClick={() => onSortOrderChange?.()}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-100"
            title="Toggle sort direction"
          >
            {sortOrder === '-1' ? '↓ Desc' : '↑ Asc'}
          </button>
        </>
      )}
    </div>
  );
}
