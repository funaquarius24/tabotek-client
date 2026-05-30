'use client';

import Link from 'next/link';

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

interface DashboardSidebarProps {
  title: string;
  userName: string;
  userRole?: string;
  navItems: NavItem[];
  activePath: string;
  onSignOut: () => void;
}

export default function DashboardSidebar({ title, userName, userRole, navItems, activePath, onSignOut }: DashboardSidebarProps) {
  const isActive = (href: string) =>
    activePath.startsWith(href)
      ? 'bg-blue-50 text-blue-700'
      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700';

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
      <div className="flex flex-col h-full">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome, {userName}</p>
          {userRole && (
            <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full capitalize">
              {userRole}
            </span>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive(item.href)}`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={onSignOut}
            className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
          >
            <span className="text-lg">🚪</span>
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
