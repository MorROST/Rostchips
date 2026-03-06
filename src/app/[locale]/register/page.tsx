'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { signUp, confirmSignUp, signIn } from '@/lib/aws/cognito';
import { Link, useRouter } from '@/lib/i18n/navigation';

export default function RegisterPage() {
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const [step, setStep] = useState<'register' | 'verify'>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPw) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const result = await signUp(email, password);
      if (result.nextStep?.signUpStep === 'CONFIRM_SIGN_UP') {
        setStep('verify');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : tCommon('error'));
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await confirmSignUp(email, code);
      // Auto-sign in after verification
      await signIn(email, password);
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : tCommon('error'));
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
            {step === 'register' ? t('registerTitle') : t('verifyEmail')}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {step === 'register'
              ? t('registerSubtitle')
              : t('verifyMessage')}
          </p>
        </div>

        {step === 'register' ? (
          <form onSubmit={handleRegister} className="space-y-4">
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
              autoComplete="new-password"
              dir="ltr"
            />
            <Input
              label={t('confirmPassword')}
              type="password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              required
              autoComplete="new-password"
              dir="ltr"
            />

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button
              type="submit"
              size="lg"
              className="w-full"
              loading={loading}
            >
              {t('register')}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <Input
              label={t('verificationCode')}
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              autoComplete="one-time-code"
              inputMode="numeric"
              dir="ltr"
            />

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button
              type="submit"
              size="lg"
              className="w-full"
              loading={loading}
            >
              {t('verify')}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-gray-500">
          {t('hasAccount')}{' '}
          <Link
            href="/login"
            className="font-medium text-orange-500 hover:text-orange-600"
          >
            {t('login')}
          </Link>
        </p>
      </div>
    </div>
  );
}
