'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import styles from './page.module.css';

export default function AccountPage() {
  const { user, isLoggedIn, isLoading, signOut } = useAuth();
  const [requestState, setRequestState] = useState<'idle' | 'pending' | 'submitted' | 'error'>('idle');
  const [requestStatus, setRequestStatus] = useState<string | null>(null);

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

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Account</h1>
      <div className={styles.card}>
        <div className={styles.field}>
          <span className={styles.label}>Name</span>
          <span className={styles.value}>{user.name}</span>
        </div>
        <div className={styles.field}>
          <span className={styles.label}>Email</span>
          <span className={styles.value}>{user.email}</span>
        </div>
        <div className={styles.field}>
          <span className={styles.label}>Role</span>
          <span className={styles.value}>{user.role}</span>
        </div>
      </div>

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
