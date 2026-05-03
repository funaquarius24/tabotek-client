'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { getUserSettings, saveUserSettings } from '@/lib/api';

interface User {
  _id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  userSettings: Record<string, unknown>;
  updateSettings: (settings: Record<string, unknown>) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoggedIn: false,
  isLoading: true,
  userSettings: {},
  updateSettings: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userSettings, setUserSettings] = useState<Record<string, unknown>>({});

  const loadSettings = useCallback(async () => {
    try {
      const data = await getUserSettings();
      setUserSettings(data.settings);
    } catch {
      setUserSettings({});
    }
  }, []);

  const fetchSession = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/session');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        await loadSettings();
      } else {
        setUser(null);
        setUserSettings({});
      }
    } catch {
      setUser(null);
      setUserSettings({});
    } finally {
      setIsLoading(false);
    }
  }, [loadSettings]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const updateSettings = useCallback(async (settings: Record<string, unknown>) => {
    await saveUserSettings(settings);
    setUserSettings(settings);
  }, []);

  const signOut = async () => {
    await fetch('/api/auth/signout', { method: 'POST' });
    setUser(null);
    setUserSettings({});
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, isLoading, userSettings, updateSettings, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);