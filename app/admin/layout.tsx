'use client';

import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import ErrorPage from '@/components/ErrorPage';

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, isLoggedIn, isLoading, signOut } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <h1 className="text-8xl font-bold text-gray-200 mb-4">401</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">Unauthorized</h2>
        <p className="text-gray-500 mb-8 text-center max-w-md">
          You must be signed in to access this page.
        </p>
        <Link
          href="/auth/signin"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  if (user.role !== 'admin' && user.role !== 'superuser') {
    return <ErrorPage statusCode={403} title="Forbidden" message="You do not have permission to access this page." />;
  }

  const roleLabel = user.role === 'superuser' ? 'Superuser' : 'Administrator';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">
              Welcome, {user.name}
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <Link
              href="/admin"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors"
            >
              <span className="text-lg">📊</span>
              <span className="font-medium">Dashboard</span>
            </Link>

            <Link
              href="/admin/articles"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors"
            >
              <span className="text-lg">📝</span>
              <span className="font-medium">Articles</span>
            </Link>

            <Link
              href="/admin/categories"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors"
            >
              <span className="text-lg">📂</span>
              <span className="font-medium">Categories</span>
            </Link>

            <Link
              href="/admin/tags"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors"
            >
              <span className="text-lg">🏷️</span>
              <span className="font-medium">Tags</span>
            </Link>

            <Link
              href="/admin/media"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors"
            >
              <span className="text-lg">🖼️</span>
              <span className="font-medium">Media Library</span>
            </Link>

            <Link
              href="/admin/users"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors"
            >
              <span className="text-lg">👥</span>
              <span className="font-medium">Users</span>
            </Link>

            <Link
              href="/admin/settings"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors"
            >
              <span className="text-lg">⚙️</span>
              <span className="font-medium">Settings</span>
            </Link>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t">
            <button
              onClick={() => signOut()}
              className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
            >
              <span className="text-lg">🚪</span>
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pl-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-white border-b shadow-sm">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">
                Content Management System
              </h2>
              <div className="flex items-center gap-4">
                 <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                   {roleLabel}
                 </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
