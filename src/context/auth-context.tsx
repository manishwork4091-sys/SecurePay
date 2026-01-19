"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { UserProfile } from '@/lib/types';
import { usePathname, useRouter } from 'next/navigation';

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: { uid: string, email: string } | null;
  loading: boolean;
  signIn: (email: string) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  loading: true,
  signIn: () => {},
  signOut: () => {},
});

const mockUsers: { [key: string]: Omit<UserProfile, 'email'> } = {
  'user@example.com': {
    uid: 'mock-user-id',
    role: 'user',
    createdAt: new Date(),
    mfaEnabled: true,
  },
  'admin@sentinel.com': {
    uid: 'mock-admin-id',
    role: 'admin',
    createdAt: new Date(),
    mfaEnabled: true,
  },
};


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // In a real app, you'd check for a session here.
    // For this static mock, we'll just finish loading.
    setLoading(false);
  }, []);

  useEffect(() => {
    if (loading) return;

    const isAuthPage = pathname === '/login' || pathname === '/register';
    
    if (user) {
      // If user is logged in, redirect from auth pages
      if (isAuthPage) {
        if (user.role === 'admin') {
          router.replace('/admin');
        } else {
          router.replace('/dashboard');
        }
      }
    } else {
      // If user is not logged in, protect routes
      const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/admin');
      if (isProtectedRoute) {
          router.replace('/login');
      }
    }
  }, [user, loading, pathname, router]);

  const signIn = (email: string) => {
    const lowerCaseEmail = email.toLowerCase();
    const baseUser = mockUsers[lowerCaseEmail] || mockUsers['user@example.com'];
    setUser({ ...baseUser, email: lowerCaseEmail });
  };

  const signOut = () => {
    setUser(null);
    router.push('/login');
  };

  const value = {
    user,
    firebaseUser: user ? { uid: user.uid, email: user.email } : null,
    loading,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
