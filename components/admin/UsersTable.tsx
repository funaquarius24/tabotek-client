'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  SortingState,
  ColumnDef,
} from '@tanstack/react-table';
import Link from 'next/link';
import { UserResponse } from '@/lib/types';
import { getRoleDisplayName, getRoleColorClass, ROLE_LEVELS } from '@/lib/roles';
import { UserRole } from '@/lib/roles';
import { useUpdateUser, useDeleteUser } from '@/lib/hooks/useUsers';

interface AdminUsersTableProps {
  users: UserResponse[];
  currentUserId?: string;
  currentUserRole?: UserRole;
}

export default function AdminUsersTable({ users, currentUserId, currentUserRole }: AdminUsersTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', role: '', bio: '' });
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();

  const canModify = useCallback((targetUser: UserResponse) => {
    if (!currentUserId || !currentUserRole) return false;
    if (targetUser._id === currentUserId) return true;
    return ROLE_LEVELS[currentUserRole] > ROLE_LEVELS[targetUser.role as UserRole];
  }, [currentUserId, currentUserRole]);

  const columns = useMemo<ColumnDef<UserResponse>[]>(() => [
    {
      accessorKey: 'name',
      header: 'User',
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
              {row.original.avatar ? (
                <img className="h-10 w-10 rounded-full object-cover" src={row.original.avatar} alt="" />
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
      enableSorting: true,
      cell: ({ row }) => (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColorClass(row.original.role)}`}>
          {getRoleDisplayName(row.original.role)}
        </span>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
      enableSorting: true,
      cell: ({ row }) => (
        <span className="text-sm text-gray-500">{row.original.email}</span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Joined',
      enableSorting: true,
      sortingFn: 'datetime',
      cell: ({ row }) => (
        <span className="text-sm text-gray-500">
          {row.original.createdAt ? new Date(row.original.createdAt).toLocaleDateString() : 'N/A'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      cell: ({ row }) => {
        const target = row.original;
        const editable = canModify(target);
        return (
          <div className="flex items-center gap-2">
            {editable ? (
              <button
                onClick={() => openEdit(target)}
                className="px-3 py-1 bg-blue-100 text-blue-800 hover:bg-blue-200 rounded text-sm font-medium"
              >
                Edit
              </button>
            ) : (
              <span className="px-3 py-1 text-sm text-gray-400 italic">Protected</span>
            )}
            {editable && (
              <button
                onClick={() => handleResetPassword(target)}
                className="px-3 py-1 bg-gray-100 text-gray-800 hover:bg-gray-200 rounded text-sm font-medium"
              >
                Reset Password
              </button>
            )}
            {editable && target._id !== currentUserId && (
              <button
                onClick={() => handleDelete(target)}
                disabled={deleteMutation.isPending}
                className="px-3 py-1 bg-red-100 text-red-800 hover:bg-red-200 rounded text-sm font-medium disabled:opacity-50"
              >
                {deleteMutation.isPending ? '...' : 'Delete'}
              </button>
            )}
          </div>
        );
      },
    },
  ], [deleteMutation.isPending]);

  const openEdit = useCallback((user: UserResponse) => {
    setEditingUser(user);
    setEditForm({ name: user.name, email: user.email, role: user.role, bio: user.bio || '' });
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editingUser) return;
    try {
      await updateMutation.mutateAsync({ id: editingUser._id, data: editForm });
      setEditingUser(null);
    } catch (err: any) {
      alert(err.message || 'Failed to update user');
    }
  }, [editingUser, editForm, updateMutation]);

  const handleResetPassword = useCallback(async (user: UserResponse) => {
    const password = prompt(`Enter new password for ${user.name} (min 8 characters):`);
    if (!password || password.length < 8) {
      if (password) alert('Password must be at least 8 characters');
      return;
    }
    try {
      await updateMutation.mutateAsync({ id: user._id, data: { password } });
      alert('Password reset successful');
    } catch (err: any) {
      alert(err.message || 'Failed to reset password');
    }
  }, [updateMutation]);

  const handleDelete = useCallback(async (user: UserResponse) => {
    if (!confirm(`Delete user "${user.name}"? This cannot be undone.`)) return;
    try {
      await deleteMutation.mutateAsync(user._id);
    } catch (err: any) {
      alert(err.message || 'Failed to delete user');
    }
  }, [deleteMutation]);

  const filteredData = useMemo(() => {
    if (!globalFilter) return users;
    const q = globalFilter.toLowerCase();
    return users.filter(u =>
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q) ||
      u.bio?.toLowerCase().includes(q)
    );
  }, [users, globalFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <>
      {/* Search */}
      <div className="p-4 border-b">
        <input
          type="text"
          value={globalFilter}
          onChange={e => setGlobalFilter(e.target.value)}
          placeholder="Search users by name, email, role, or bio..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:text-gray-700"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() === 'asc' && <span className="text-blue-500">▲</span>}
                      {header.column.getIsSorted() === 'desc' && <span className="text-blue-500">▼</span>}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="hover:bg-gray-50">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {filteredData.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {globalFilter ? 'No users match your search' : 'No users yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {globalFilter ? 'Try a different search term' : 'Add users to manage your content'}
            </p>
            {!globalFilter && (
              <Link
                href="/admin/users/new"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Add Your First User
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" onClick={() => setEditingUser(null)}>
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit User</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Role</label>
                <select
                  value={editForm.role}
                  onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {(['user', 'author', 'editor', 'admin', 'superuser'] as const).map(r => (
                    <option key={r} value={r}>{getRoleDisplayName(r)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Bio</label>
                <textarea
                  value={editForm.bio}
                  onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveEdit}
                  disabled={updateMutation.isPending}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
                <button onClick={() => setEditingUser(null)} className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
