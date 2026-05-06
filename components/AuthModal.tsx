'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './AuthModal.module.css';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'signin' | 'signup';
}

export default function AuthModal({ isOpen, onClose, mode = 'signin' }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const isSignUp = mode === 'signup';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email) {
      newErrors.email = 'Email or username is required';
    } else if (isSignUp) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (isSignUp && password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      if (res.ok) {
        const data = await res.json();
        const role = data.user?.role;
        const isStaff = role === 'admin' || role === 'editor' || role === 'superuser';
        onClose();
        if (isStaff) {
          window.location.href = '/admin';
        } else {
          window.location.reload();
        }
      } else {
        const data = await res.json();
        setErrors({ email: data.error || 'Authentication failed' });
      }
    } catch (err) {
      setErrors({ email: 'Connection error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>&times;</button>
        
        <h2 className={styles.title}>{mode === 'signin' ? 'Sign In' : 'Create Account'}</h2>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>{isSignUp ? 'Email Address' : 'Email or Username'}</label>
            <input
              type={isSignUp ? 'email' : 'text'}
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={errors.email ? styles.errorInput : ''}
              placeholder={isSignUp ? 'you@example.com' : 'you@example.com or username'}
            />
            {errors.email && <span className={styles.error}>{errors.email}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={errors.password ? styles.errorInput : ''}
              placeholder="••••••••"
            />
            {errors.password && <span className={styles.error}>{errors.password}</span>}
          </div>

          <button type="submit" className={styles.submitButton} disabled={isLoading}>
            {isLoading ? 'Processing...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className={styles.divider}>
          <span>or continue with</span>
        </div>

        <div className={styles.socialButtons}>
          <button className={styles.googleButton}>
            Sign in with Google
          </button>
          <button className={styles.twitterButton}>
            Sign in with X (Twitter)
          </button>
        </div>

        <div className={styles.footer}>
          {mode === 'signin' ? (
            <p>Don't have an account? <Link href="/auth/signup" onClick={onClose}>Sign up</Link></p>
          ) : (
            <p>Already have an account? <button onClick={() => onClose()} className={styles.linkButton}>Sign in</button></p>
          )}
        </div>
      </div>
    </div>
  );
}
