'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import ArticleEditor from '@/components/ArticleEditor';

export default function AdminArticleNewPage() {
  const { user } = useAuth();

  const canPublish = !!(user?.role && ['author', 'editor', 'admin', 'superuser'].includes(user.role));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">New Article</h1>
          <p className="text-gray-600 mt-2">Create a new article for publication.</p>
        </div>
      </div>
      <ArticleEditor canPublish={canPublish} userRole={user?.role} />
    </div>
  );
}
