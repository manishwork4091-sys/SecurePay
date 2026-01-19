"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

const LoadingScreen = () => (
  <div className="flex items-center justify-center h-screen w-full">
    <div className="text-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
      <p className="mt-4 text-muted-foreground">Verifying session...</p>
    </div>
  </div>
);

export function UserAuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login");
      } else if (user.role !== 'admin') {
        router.replace("/dashboard");
      }
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'admin') {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
