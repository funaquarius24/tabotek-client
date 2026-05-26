'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function AdminDashboard() {
  const { isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState<any[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/admin/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  useEffect(() => {
    async function fetchActivity() {
      try {
        const res = await fetch('/api/admin/recent-activity');
        if (res.ok) {
          const data = await res.json();
          setActivity(data.activity || []);
        }
      } catch (error) {
        console.error('Error fetching activity:', error);
      } finally {
        setActivityLoading(false);
      }
    }
    fetchActivity();
  }, []);

  if (authLoading || loading) {
    return <div>Loading...</div>;
  }

  const defaultStats = stats || {
    totalArticles: 0,
    publishedArticles: 0,
    draftArticles: 0,
    totalCategories: 0,
    totalUsers: 0,
    totalTags: 0,
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2">
          Welcome to your content management dashboard. Here's what's happening with your site.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Articles</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{defaultStats.totalArticles}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <span className="text-2xl">📝</span>
            </div>
          </div>
          <div className="mt-4">
            <Link
              href="/admin/articles"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View all articles →
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Published</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{defaultStats.publishedArticles}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
          </div>
          <div className="mt-4">
            <Link
              href="/admin/articles?status=published"
              className="text-green-600 hover:text-green-800 text-sm font-medium"
            >
              View published →
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Drafts</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{defaultStats.draftArticles}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <span className="text-2xl">📋</span>
            </div>
          </div>
          <div className="mt-4">
            <Link
              href="/admin/articles?status=draft"
              className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
            >
              View drafts →
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Categories</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{defaultStats.totalCategories}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <span className="text-2xl">📂</span>
            </div>
          </div>
          <div className="mt-4">
            <Link
              href="/admin/categories"
              className="text-purple-600 hover:text-purple-800 text-sm font-medium"
            >
              Manage categories →
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Tags</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{defaultStats.totalTags}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <span className="text-2xl">🏷️</span>
            </div>
          </div>
          <div className="mt-4">
            <Link
              href="/admin/tags"
              className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
            >
              Manage tags →
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link
            href="/admin/articles/new"
            className="p-4 border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 rounded-lg text-center transition-colors"
          >
            <div className="text-3xl mb-2">➕</div>
            <h3 className="font-semibold text-gray-900">Create New Article</h3>
            <p className="text-sm text-gray-500 mt-1">Start writing a new article</p>
          </Link>

          <Link
            href="/admin/categories/new"
            className="p-4 border-2 border-dashed border-gray-300 hover:border-green-500 hover:bg-green-50 rounded-lg text-center transition-colors"
          >
            <div className="text-3xl mb-2">📁</div>
            <h3 className="font-semibold text-gray-900">Add Category</h3>
            <p className="text-sm text-gray-500 mt-1">Create a new content category</p>
          </Link>

          <Link
            href="/admin/tags"
            className="p-4 border-2 border-dashed border-gray-300 hover:border-yellow-500 hover:bg-yellow-50 rounded-lg text-center transition-colors"
          >
            <div className="text-3xl mb-2">🏷️</div>
            <h3 className="font-semibold text-gray-900">Manage Tags</h3>
            <p className="text-sm text-gray-500 mt-1">Organize article tags and keywords</p>
          </Link>

          <Link
            href="/admin/media"
            className="p-4 border-2 border-dashed border-gray-300 hover:border-purple-500 hover:bg-purple-50 rounded-lg text-center transition-colors"
          >
            <div className="text-3xl mb-2">🖼️</div>
            <h3 className="font-semibold text-gray-900">Upload Media</h3>
            <p className="text-sm text-gray-500 mt-1">Add images or files to library</p>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
        {activityLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-3 text-gray-500">Loading recent activity...</p>
          </div>
        ) : activity.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No recent activity to display.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activity.map((item, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className={`p-2 ${item.color} rounded-lg`}>
                  <span className="text-lg">{item.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{item.title}</p>
                  <p className="text-sm text-gray-500 truncate">{item.description}</p>
                </div>
                <span className="text-sm text-gray-500 whitespace-nowrap">{timeAgo(item.timestamp)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
