'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import ArticleEditor from '@/components/ArticleEditor';
import styles from './page.module.css';

export default function PublishPage() {
  const { user, isLoggedIn, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className={styles.container}>
        <div className={styles.blocked}>
          <div className={styles.blockedIcon}>📝</div>
          <h1 className={styles.blockedTitle}>Sign in to Publish</h1>
          <p className={styles.blockedText}>
            You need to be signed in to compose and publish articles.
          </p>
          <a href="/login" className={styles.accountLink}>
            Sign In
          </a>
        </div>
      </div>
    );
  }

  const canPublish = !!(user?.role && ['author', 'editor', 'admin', 'superuser'].includes(user.role));

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Compose an article for publishing</h1>
          <p className={styles.pageSubtitle}>
            Write, format, and publish your content to the world.
          </p>
        </div>
      </div>
      <div className={styles.editorCard}>
        <ArticleEditor canPublish={canPublish} userRole={user?.role} />
      </div>
    </div>
  );
}
