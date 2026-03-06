'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from '@/lib/i18n/navigation';
import { Spinner } from './ui/Spinner';

const PUBLIC_PATHS = ['/login', '/register'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user && !PUBLIC_PATHS.includes(pathname)) {
      router.replace('/login');
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user && !PUBLIC_PATHS.includes(pathname)) {
    return null;
  }

  return <>{children}</>;
}
