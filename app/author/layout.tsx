'use client';

import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import ErrorPage from '@/components/ErrorPage';
import DashboardSidebar from '@/components/DashboardSidebar';
import { usePathname } from 'next/navigation';

const authorRoles = ['author', 'editor', 'admin', 'superuser'];

export default function AuthorLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, signOut } = useAuth();
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

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar
        title="Author Dashboard"
        userName={user.name}
        userRole={user.role}
        navItems={[
          { href: '/author/articles', label: 'Articles', icon: '📝' },
          { href: '/author/comments', label: 'Comments', icon: '💬' },
        ]}
        activePath={pathname}
        onSignOut={signOut}
      />

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
