'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getCurrentUser,
  fetchAuthSession,
  signOut as cognitoSignOut,
} from '@/lib/aws/cognito';

interface AuthUser {
  userId: string;
  username: string;
  token?: string;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const checkUser = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();
      const session = await fetchAuthSession();
      setUser({
        userId: currentUser.userId,
        username: currentUser.username,
        token: session.tokens?.idToken?.toString(),
      });
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  const handleSignOut = useCallback(async () => {
    await cognitoSignOut();
    setUser(null);
  }, []);

  return { user, loading, signOut: handleSignOut, refresh: checkUser };
}
