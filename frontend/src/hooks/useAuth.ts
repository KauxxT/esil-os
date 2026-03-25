'use client';
import { useState, useEffect } from 'react';
import { getUser, getToken, clearAuth, User } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export function useAuth(requireAuth = true) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const u = getUser();
    const t = getToken();
    if (!t && requireAuth) {
      router.replace('/login');
      return;
    }
    setUser(u);
    setLoading(false);
  }, []);

  const logout = () => {
    clearAuth();
    router.push('/login');
  };

  return { user, loading, logout };
}
