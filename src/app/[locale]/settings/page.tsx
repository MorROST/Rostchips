'use client';

import { useTranslations } from 'next-intl';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import {
  GlobeAltIcon,
  UserCircleIcon,
  ArrowRightStartOnRectangleIcon,
} from '@heroicons/react/24/outline';

export default function SettingsPage() {
  const t = useTranslations('settings');
  const tAuth = useTranslations('auth');
  const tCommon = useTranslations('common');
  const { user, signOut } = useAuth();

  return (
    <div className="px-4 pt-4">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
        {t('title')}
      </h1>

      <div className="space-y-6">
        {/* Language */}
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <GlobeAltIcon className="h-5 w-5" />
            {t('language')}
          </div>
          <LanguageToggle />
        </div>

        {/* Profile */}
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <UserCircleIcon className="h-5 w-5" />
            {t('profile')}
          </div>
          <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-900">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {user?.username || 'Not signed in'}
            </p>
          </div>
        </div>

        {/* Logout */}
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
          onClick={signOut}
        >
          <ArrowRightStartOnRectangleIcon className="h-5 w-5" />
          {tAuth('logout')}
        </Button>

        {/* About */}
        <div className="pt-4 text-center text-xs text-gray-400 dark:text-gray-500">
          {tCommon('appName')} &middot; {t('version')} 0.1.0
        </div>
      </div>
    </div>
  );
}
