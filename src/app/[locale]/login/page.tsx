'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { signIn } from '@/lib/aws/cognito';
import { Link, useRouter } from '@/lib/i18n/navigation';

export default function LoginPage() {
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      router.replace('/');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : tCommon('error')
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-orange-500">
            {tCommon('appName')}
          </h1>
          <h2 className="mt-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
            {t('loginTitle')}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {t('loginSubtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('email')}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            dir="ltr"
          />
          <Input
            label={t('password')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            dir="ltr"
          />

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <Button type="submit" size="lg" className="w-full" loading={loading}>
            {t('login')}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          {t('noAccount')}{' '}
          <Link
            href="/register"
            className="font-medium text-orange-500 hover:text-orange-600"
          >
            {t('register')}
          </Link>
        </p>
      </div>
    </div>
  );
}
