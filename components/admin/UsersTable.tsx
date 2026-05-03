'use client';

import { useReactTable, getCoreRowModel, flexRender, ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { UserResponse } from '@/lib/types';
import { getRoleDisplayName, getRoleColorClass } from '@/lib/roles';

interface AdminUsersTableProps {
  users: UserResponse[];
}

const columns: ColumnDef<UserResponse>[] = [
  {
    accessorKey: 'name',
    header: 'User',
    cell: ({ row }) => (
      <div className="flex items-center">
        <div className="flex-shrink-0 h-10 w-10">
          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
            {row.original.avatar ? (
              <img className="h-10 w-10 rounded-full" src={row.original.avatar} alt="" />
            ) : (
              <span className="text-gray-600 font-medium">
                {row.original.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            )}
          </div>
        </div>
        <div className="ml-4">
          <div className="font-medium text-gray-900">{row.original.name}</div>
          <div className="text-sm text-gray-500">{row.original.bio || 'No bio'}</div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColorClass(row.original.role)}`}>
        {getRoleDisplayName(row.original.role)}
      </span>
    ),
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => (
      <span className="text-sm text-gray-500">{row.original.email}</span>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: 'Joined',
    cell: ({ row }) => (
      <span className="text-sm text-gray-500">
        {row.original.createdAt ? new Date(row.original.createdAt).toLocaleDateString() : 'N/A'}
      </span>
    ),
  },
  {
    accessorKey: 'articleCount',
    header: 'Articles',
    cell: () => (
      <span className="text-sm text-gray-500">0</span>
    ),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Link
          href={`/admin/users/edit/${row.original._id}`}
          className="px-3 py-1 bg-blue-100 text-blue-800 hover:bg-blue-200 rounded text-sm font-medium"
        >
          Edit
        </Link>
        <button
          className="px-3 py-1 bg-gray-100 text-gray-800 hover:bg-gray-200 rounded text-sm font-medium"
          onClick={() => {
            // TODO: Implement reset password
            console.log('Reset password for', row.original._id);
          }}
        >
          Reset Password
        </button>
        {row.original.role !== 'admin' && row.original.role !== 'superuser' && (
          <button
            className="px-3 py-1 bg-red-100 text-red-800 hover:bg-red-200 rounded text-sm font-medium"
            onClick={() => {
              if (confirm('Are you sure you want to delete this user?')) {
                // TODO: Implement delete mutation
                console.log('Delete user', row.original._id);
              }
            }}
          >
            Delete
          </button>
        )}
      </div>
    ),
  },
];

export default function AdminUsersTable({ users }: AdminUsersTableProps) {
  const table = useReactTable({
    data: users,
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
      {users.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">👥</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No users yet</h3>
          <p className="text-gray-500 mb-6">Add users to manage your content</p>
          <Link
            href="/admin/users/new"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Add Your First User
          </Link>
        </div>
      )}
    </div>
  );
}