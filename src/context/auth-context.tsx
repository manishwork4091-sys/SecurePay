'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { User } from 'firebase/auth';
import { useFirebase, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useDoc, WithId } from '@/firebase/firestore/use-doc';
import type { UserProfile } from '@/lib/types';


interface AuthContextType {
  user: WithId<UserProfile> | null;
  firebaseUser: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  loading: true,
  signOut: async () => {},
});


export function AuthProvider({ children }: { children: ReactNode }) {
  const { auth } = useFirebase();
  const { user: firebaseUser, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const pathname = usePathname();

  const userDocRef = useMemoFirebase(() => firebaseUser ? doc(firestore, 'users', firebaseUser.uid) : null, [firestore, firebaseUser]);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(isUserLoading || isProfileLoading);
  }, [isUserLoading, isProfileLoading]);

  const signOut = async () => {
    await auth.signOut();
    // The onAuthStateChanged listener will handle the redirect.
  };

  useEffect(() => {
    if (loading) return;

    const isAuthPage = pathname === '/login' || pathname === '/register';
    
    if (userProfile) {
      if (isAuthPage) {
        if (userProfile.role === 'admin') {
          router.replace('/admin');
        } else {
          router.replace('/dashboard');
        }
      }
    } else if (!firebaseUser) {
      const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/admin');
      if (isProtectedRoute) {
        router.replace('/login');
      }
    }
  }, [firebaseUser, userProfile, loading, pathname, router]);

  const value = {
    user: userProfile,
    firebaseUser,
    loading,
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
