'use client';

import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import ErrorPage from '@/components/ErrorPage';
import DashboardSidebar from '@/components/DashboardSidebar';
import { usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/articles', label: 'Articles', icon: '📝' },
    { href: '/admin/categories', label: 'Categories', icon: '📂' },
    { href: '/admin/tags', label: 'Tags', icon: '🏷️' },
    { href: '/admin/media', label: 'Media Library', icon: '🖼️' },
    { href: '/admin/users', label: 'Users', icon: '👥' },
    { href: '/admin/requests', label: 'Requests', icon: '📨' },
    ...(user.role === 'superuser' ? [{ href: '/admin/backup', label: 'Backup Database', icon: '💾' as const }] : []),
    { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar
        title="Admin Dashboard"
        userName={user.name}
        navItems={navItems}
        activePath={pathname}
        onSignOut={signOut}
      />

      <div className="pl-64">
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

        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
