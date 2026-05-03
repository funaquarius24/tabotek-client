'use client';

import { useState, useEffect } from 'react';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user_id cookie exists
    const checkAuth = () => {
      const cookies = document.cookie.split(';');
      const userIdCookie = cookies.find(cookie => cookie.trim().startsWith('user_id='));

      setIsAuthenticated(!!userIdCookie);
      setIsLoading(false);
    };

    checkAuth();

    // Listen for storage changes (in case cookies change)
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const signOut = () => {
    // Clear the cookie by setting it to expire
    document.cookie = 'user_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    setIsAuthenticated(false);
    window.location.href = '/';
  };

  return { isAuthenticated, isLoading, signOut };
}