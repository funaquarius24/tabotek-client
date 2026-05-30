'use client';

import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import ErrorPage from '@/components/ErrorPage';
import { usePathname } from 'next/navigation';

const authorRoles = ['author', 'editor', 'admin', 'superuser'];

export default function AuthorLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoggedIn, isLoading, signOut } = useAuth();
  const pathname = usePathname();

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
        <p className="text-gray-500 mb-8 text-center max-w-md">You must be signed in to access this page.</p>
        <Link href="/auth/signin" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Sign In</Link>
      </div>
    );
  }

  if (!authorRoles.includes(user.role)) {
    return <ErrorPage statusCode={403} title="Forbidden" message="You do not have permission to access this page." />;
  }

  const isActive = (path: string) => pathname.startsWith(path)
    ? 'bg-blue-50 text-blue-700'
    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold text-gray-900">Author Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Welcome, {user.name}</p>
            <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full capitalize">{user.role}</span>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Content</p>
            <Link
              href="/author/articles"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/author/articles')}`}
            >
              <span className="text-lg">📝</span>
              <span className="font-medium">Articles</span>
            </Link>
            <Link
              href="/author/comments"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/author/comments')}`}
            >
              <span className="text-lg">💬</span>
              <span className="font-medium">Comments</span>
            </Link>
          </nav>

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

      <div className="pl-64">
        <header className="sticky top-0 z-40 bg-white border-b shadow-sm">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">My Content</h2>
            </div>
          </div>
        </header>
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
