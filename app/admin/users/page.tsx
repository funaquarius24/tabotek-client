'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserResponse } from '@/lib/types';
import { useUsers } from '@/lib/hooks/useUsers';
import { useAuth } from '@/components/providers/AuthProvider';
import AdminUsersTable from '@/components/admin/UsersTable';
import Pagination from '@/components/admin/Pagination';

export default function AdminUsersPage() {
  const { user: authUser } = useAuth();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch('/api/admin/stats').then(r => r.ok && r.json()).then(d => setStats(d)).catch(() => {});
  }, []);

  const params: any = { page, limit: pageSize, sort: 'createdAt', order: 'desc' };
  if (search) params.search = search;
  if (roleFilter) params.role = roleFilter;

  const { data, isLoading, error } = useUsers(params);
  const users: UserResponse[] = data?.users || [];
  const pagination = data?.pagination;

  const roleStats = [
    { role: 'superuser' as const, label: 'Superusers', icon: '👑', bgColor: 'bg-gradient-to-r from-purple-100 to-pink-100' },
    { role: 'admin' as const, label: 'Administrators', icon: '👑', bgColor: 'bg-red-100' },
    { role: 'editor' as const, label: 'Editors', icon: '✏️', bgColor: 'bg-green-100' },
    { role: 'author' as const, label: 'Authors', icon: '📝', bgColor: 'bg-purple-100' },
    { role: 'user' as const, label: 'Users', icon: '👤', bgColor: 'bg-gray-100' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600 mt-2">Manage user accounts, roles, and permissions.</p>
        </div>
        <Link href="/admin/users/new" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg">+ Add User</Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.totalUsers ?? '-'}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg"><span className="text-2xl">👥</span></div>
          </div>
        </div>
        {roleStats.map(({ role, label, icon, bgColor }) => (
          <div key={role} className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.roleCounts?.[role] ?? '-'}</p>
              </div>
              <div className={`p-3 ${bgColor} rounded-lg`}><span className="text-2xl">{icon}</span></div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-4 bg-white rounded-xl shadow-md p-4 items-center">
        <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by name or email..." className="px-4 py-2 border border-gray-300 rounded-lg text-sm w-64" />
        <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }} className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white">
          <option value="">All Roles</option>
          <option value="superuser">Superuser</option>
          <option value="admin">Admin</option>
          <option value="editor">Editor</option>
          <option value="author">Author</option>
          <option value="user">User</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading users...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">❌</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Failed to load users</h3>
            <p className="text-gray-500 mb-6">Please try again later</p>
          </div>
        ) : (
          <>
            <AdminUsersTable users={users} currentUserId={authUser?._id} currentUserRole={authUser?.role as any} />
            {pagination && (
              <Pagination page={page} totalPages={pagination.totalPages} total={pagination.total} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={s => { setPageSize(s); setPage(1); }} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
