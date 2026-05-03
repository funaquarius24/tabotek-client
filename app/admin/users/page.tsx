'use client';

import Link from 'next/link';
import { getRoleDisplayName, getRoleColorClass, ROLES } from '@/lib/roles';
import { UserResponse } from '@/lib/types';
import { useUsers } from '@/lib/hooks/useUsers';
import AdminUsersTable from '@/components/admin/UsersTable';

export default function AdminUsersPage() {
  const { data, isLoading, error } = useUsers();

  const users: UserResponse[] = data?.users || [];
  const roleCounts = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600 mt-2">
            Manage user accounts, roles, and permissions.
          </p>
        </div>
        <Link
          href="/admin/users/new"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          + Add User
        </Link>
      </div>
      
      {/* Role Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{users.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>
        
        {(['superuser', 'admin', 'editor', 'author', 'user'] as const).map((role) => {
          const roleConfig = {
            superuser: { label: 'Superusers', icon: '👑', bgColor: 'bg-gradient-to-r from-purple-100 to-pink-100' },
            admin: { label: 'Administrators', icon: '👑', bgColor: 'bg-red-100' },
            editor: { label: 'Editors', icon: '✏️', bgColor: 'bg-green-100' },
            author: { label: 'Authors', icon: '📝', bgColor: 'bg-purple-100' },
            user: { label: 'Users', icon: '👤', bgColor: 'bg-gray-100' },
          }[role];
          
          return (
            <div key={role} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{roleConfig.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{roleCounts[role] || 0}</p>
                </div>
                <div className={`p-3 ${roleConfig.bgColor} rounded-lg`}>
                  <span className="text-2xl">{roleConfig.icon}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Users Table */}
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
          <AdminUsersTable users={users} />
        )}
      </div>
      
      {/* Role Permissions */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Role Permissions</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {([
            {
              role: 'superuser',
              title: 'Superuser',
              permissions: [
                { allowed: true, text: 'Full system access' },
                { allowed: true, text: 'Manage all content' },
                { allowed: true, text: 'User management' },
                { allowed: true, text: 'System settings' },
                { allowed: true, text: 'Override any restrictions' },
              ],
            },
            {
              role: 'admin',
              title: 'Administrator',
              permissions: [
                { allowed: true, text: 'Full system access' },
                { allowed: true, text: 'Manage all content' },
                { allowed: true, text: 'User management' },
                { allowed: true, text: 'System settings' },
                { allowed: false, text: 'Override superuser settings' },
              ],
            },
            {
              role: 'editor',
              title: 'Editor',
              permissions: [
                { allowed: true, text: 'Create/edit articles' },
                { allowed: true, text: 'Manage categories' },
                { allowed: true, text: 'Upload media' },
                { allowed: false, text: 'User management' },
                { allowed: false, text: 'System settings' },
              ],
            },
            {
              role: 'author',
              title: 'Author',
              permissions: [
                { allowed: true, text: 'Create/edit own articles' },
                { allowed: true, text: 'Upload media' },
                { allowed: false, text: 'Publish articles' },
                { allowed: false, text: 'Manage categories' },
                { allowed: false, text: 'User management' },
              ],
            },
            {
              role: 'user',
              title: 'User',
              permissions: [
                { allowed: true, text: 'View content' },
                { allowed: true, text: 'Comment on articles' },
                { allowed: false, text: 'Create content' },
                { allowed: false, text: 'Upload media' },
                { allowed: false, text: 'Manage categories' },
              ],
            },
          ] as const).map(({ role, title, permissions }) => (
            <div key={role} className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-medium text-gray-900 mb-3">{title}</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                {permissions.map((permission, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className={permission.allowed ? 'text-green-500' : 'text-red-500'}>
                      {permission.allowed ? '✓' : '✗'}
                    </span>
                    <span>{permission.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}