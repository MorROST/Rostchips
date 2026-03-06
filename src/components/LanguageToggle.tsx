'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/lib/i18n/navigation';
import { clsx } from 'clsx';

export function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('settings');

  function switchLocale(newLocale: 'en' | 'he') {
    router.replace(pathname, { locale: newLocale });
  }

  return (
    <div className="flex items-center gap-1 rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
      <button
        onClick={() => switchLocale('en')}
        className={clsx(
          'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
          locale === 'en'
            ? 'bg-white text-orange-600 shadow-sm dark:bg-gray-700 dark:text-orange-400'
            : 'text-gray-600 hover:text-gray-900 dark:text-gray-400'
        )}
      >
        {t('english')}
      </button>
      <button
        onClick={() => switchLocale('he')}
        className={clsx(
          'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
          locale === 'he'
            ? 'bg-white text-orange-600 shadow-sm dark:bg-gray-700 dark:text-orange-400'
            : 'text-gray-600 hover:text-gray-900 dark:text-gray-400'
        )}
      >
        {t('hebrew')}
      </button>
    </div>
  );
}
