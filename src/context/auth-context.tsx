"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { UserProfile } from '@/lib/types';
import { usePathname, useRouter } from 'next/navigation';

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: { uid: string, email: string } | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  loading: true,
});

const mockUser: UserProfile = {
  uid: 'mock-user-id',
  email: 'user@example.com',
  role: 'user',
  createdAt: new Date(),
  mfaEnabled: true,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(mockUser);
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (user) {
      const isAuthPage = pathname === '/login' || pathname === '/register';
      const isLandingPage = pathname === '/';

      if (user.role === 'admin' && !pathname.startsWith('/admin')) {
        router.replace('/admin');
      } else if (user.role === 'user' && (pathname.startsWith('/admin') || isAuthPage || isLandingPage)) {
        router.replace('/dashboard');
      }
    } else {
        const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/admin');
        if (isProtectedRoute) {
            router.replace('/login');
        }
    }
  }, [user, loading, pathname, router]);

  const value = {
    user,
    firebaseUser: user ? { uid: user.uid, email: user.email } : null,
    loading
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
