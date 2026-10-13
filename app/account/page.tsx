'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { updateAuthorName } from '@/lib/api';
import styles from './page.module.css';

const dashboardsByRole: Record<string, { href: string; label: string }[]> = {
  author: [{ href: '/author', label: 'Author Dashboard' }],
  editor: [
    { href: '/editor', label: 'Editor Dashboard' },
    { href: '/author', label: 'Author Dashboard' },
  ],
  admin: [
    { href: '/admin', label: 'Admin Dashboard' },
    { href: '/editor', label: 'Editor Dashboard' },
  ],
  superuser: [
    { href: '/admin', label: 'Admin Dashboard' },
    { href: '/editor', label: 'Editor Dashboard' },
  ],
};

export default function AccountPage() {
  const { user, isLoggedIn, isLoading, signOut, refreshSession } = useAuth();
  const [requestState, setRequestState] = useState<'idle' | 'pending' | 'submitted' | 'error'>('idle');
  const [requestStatus, setRequestStatus] = useState<string | null>(null);

  const [editingAuthorName, setEditingAuthorName] = useState(false);
  const [authorNameInput, setAuthorNameInput] = useState('');
  const [authorNameSaving, setAuthorNameSaving] = useState(false);
  const [authorNameError, setAuthorNameError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    fetch('/api/auth/request-author')
      .then(res => res.json())
      .then(data => {
        if (data.requested) {
          setRequestState('submitted');
          setRequestStatus(data.status);
        }
      })
      .catch(() => {});
  }, [user]);

  const handleRequestAuthor = async () => {
    setRequestState('pending');
    try {
      const res = await fetch('/api/auth/request-author', { method: 'POST' });
      if (res.ok) {
        setRequestState('submitted');
        setRequestStatus('pending');
      } else {
        const data = await res.json();
        if (res.status === 409) {
          setRequestState('submitted');
          setRequestStatus(data.status);
        } else {
          setRequestState('error');
        }
      }
    } catch {
      setRequestState('error');
    }
  };

  const startEditingAuthorName = () => {
    setAuthorNameInput(user?.authorName || user?.name || '');
    setAuthorNameError(null);
    setEditingAuthorName(true);
  };

  const handleSaveAuthorName = async () => {
    const value = authorNameInput.trim();
    if (!value) {
      setAuthorNameError('Author name cannot be empty.');
      return;
    }
    setAuthorNameSaving(true);
    setAuthorNameError(null);
    try {
      await updateAuthorName(value);
      await refreshSession();
      setEditingAuthorName(false);
    } catch (err) {
      setAuthorNameError(err instanceof Error ? err.message : 'Failed to save author name.');
    } finally {
      setAuthorNameSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isLoggedIn || !user) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Account</h1>
        <p>Please sign in to view your account.</p>
      </div>
    );
  }

  const canPublish = ['author', 'editor', 'admin', 'superuser'].includes(user.role);
  const dashboards = dashboardsByRole[user.role] || [];
  const currentAuthorName = user.authorName || user.name;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Account</h1>
      <div className={styles.card}>
        <div className={styles.field}>
          <span className={styles.label}>Name</span>
          <span className={styles.value}>{user.name}</span>
        </div>
        <div className={styles.field}>
          <span className={styles.label}>Author Name</span>
          {editingAuthorName ? (
            <div className={styles.editRow}>
              <input
                type="text"
                className={styles.input}
                value={authorNameInput}
                onChange={(e) => setAuthorNameInput(e.target.value)}
                maxLength={60}
                disabled={authorNameSaving}
                placeholder="Your author name"
                aria-label="Author name"
              />
              <button
                className={styles.saveButton}
                onClick={handleSaveAuthorName}
                disabled={authorNameSaving}
              >
                {authorNameSaving ? 'Saving...' : 'Save'}
              </button>
              <button
                className={styles.cancelButton}
                onClick={() => setEditingAuthorName(false)}
                disabled={authorNameSaving}
              >
                Cancel
              </button>
            </div>
          ) : (
            <span className={styles.valueGroup}>
              <span className={styles.value}>{currentAuthorName}</span>
              <button className={styles.changeButton} onClick={startEditingAuthorName}>
                Change
              </button>
            </span>
          )}
        </div>
        <div className={styles.field}>
          <span className={styles.label}>Email</span>
          <span className={styles.value}>{user.email}</span>
        </div>
        <div className={styles.field}>
          <span className={styles.label}>Role</span>
          <span className={styles.value}>{user.role}</span>
        </div>
        {authorNameError && <p className={styles.errorText}>{authorNameError}</p>}
      </div>

      {dashboards.length > 0 && (
        <div className={styles.card}>
          <p className={styles.statusText}>Jump back into your workspace.</p>
          <div className={styles.actionButtons}>
            {dashboards.map((dashboard) => (
              <Link key={dashboard.href} href={dashboard.href} className={styles.dashboardButton}>
                {dashboard.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {user.role === 'user' && (
        <div className={styles.card}>
          {requestState === 'submitted' ? (
            <p className={styles.statusText}>
              Author request submitted — {requestStatus === 'approved' ? 'approved' : 'pending review'}.
            </p>
          ) : requestState === 'error' ? (
            <p className={styles.statusText}>Something went wrong. Please try again later.</p>
          ) : (
            <>
              <p className={styles.statusText}>
                You are currently a standard user. Request author access to publish articles.
              </p>
              <button
                className={styles.authorButton}
                onClick={handleRequestAuthor}
                disabled={requestState === 'pending'}
              >
                {requestState === 'pending' ? 'Submitting...' : 'Request to be an Author'}
              </button>
            </>
          )}
        </div>
      )}

      {canPublish && (
        <div className={styles.card}>
          <p className={styles.statusText}>You have author access and can publish articles.</p>
        </div>
      )}

      <button className={styles.signOutButton} onClick={signOut}>
        Sign Out
      </button>
    </div>
  );
}
