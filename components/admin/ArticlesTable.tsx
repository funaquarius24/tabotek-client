'use client';

import { useReactTable, getCoreRowModel, flexRender, ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { ArticleResponse } from '@/lib/types';

interface AdminArticlesTableProps {
  articles: ArticleResponse[];
}

const columns: ColumnDef<ArticleResponse>[] = [
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row }) => (
      <div>
        <div className="font-medium text-gray-900">{row.original.title}</div>
        <div className="text-sm text-gray-500">{row.original.slug}</div>
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status;
      let className = 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ';
      if (status === 'published') {
        className += 'bg-green-100 text-green-800';
      } else if (status === 'draft') {
        className += 'bg-yellow-100 text-yellow-800';
      } else {
        className += 'bg-gray-100 text-gray-800';
      }
      return <span className={className}>{status}</span>;
    },
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: () => (
      <span className="text-sm text-gray-500">Uncategorized</span>
    ),
  },
  {
    accessorKey: 'publishedAt',
    header: 'Published',
    cell: ({ row }) => (
      <span className="text-sm text-gray-500">
        {new Date(row.original.publishedAt).toLocaleDateString()}
      </span>
    ),
  },
  {
    accessorKey: 'views',
    header: 'Views',
    cell: ({ row }) => (
      <span className="text-sm text-gray-500">{row.original.views || 0}</span>
    ),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Link
          href={`/admin/articles/edit/${row.original._id}`}
          className="px-3 py-1 bg-blue-100 text-blue-800 hover:bg-blue-200 rounded text-sm font-medium"
        >
          Edit
        </Link>
        <Link
          href={`/article/${row.original.slug}`}
          target="_blank"
          className="px-3 py-1 bg-gray-100 text-gray-800 hover:bg-gray-200 rounded text-sm font-medium"
        >
          View
        </Link>
        <button
          className="px-3 py-1 bg-red-100 text-red-800 hover:bg-red-200 rounded text-sm font-medium"
          onClick={() => {
            if (confirm('Are you sure you want to delete this article?')) {
              // TODO: Implement delete mutation
              console.log('Delete article', row.original._id);
            }
          }}
        >
          Delete
        </button>
      </div>
    ),
  },
];

export default function AdminArticlesTable({ articles }: AdminArticlesTableProps) {
  const table = useReactTable({
    data: articles,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {articles.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No articles yet</h3>
          <p className="text-gray-500 mb-6">Create your first article to get started</p>
          <Link
            href="/admin/articles/new"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Create Your First Article
          </Link>
        </div>
      )}
    </div>
  );
}