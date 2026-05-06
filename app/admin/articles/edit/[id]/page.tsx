'use client';

import { useParams } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import ArticleEditor from '@/components/ArticleEditor';

export default function AdminArticleEditPage() {
  const params = useParams();
  const { user } = useAuth();
  const articleId = params.id as string;

  const canPublish = !!(user?.role && ['author', 'editor', 'admin', 'superuser'].includes(user.role));

  if (!articleId) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-700">Invalid article ID</h2>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Article</h1>
          <p className="text-gray-600 mt-2">Edit the content and settings of this article.</p>
        </div>
      </div>
      <ArticleEditor canPublish={canPublish} userRole={user?.role} articleId={articleId} />
    </div>
  );
}
