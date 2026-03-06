'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/lib/i18n/navigation';
import {
  BookOpenIcon,
  PlusCircleIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import {
  BookOpenIcon as BookOpenSolid,
  PlusCircleIcon as PlusCircleSolid,
  Cog6ToothIcon as Cog6ToothSolid,
} from '@heroicons/react/24/solid';
import { clsx } from 'clsx';

export function Navbar() {
  const t = useTranslations('nav');
  const pathname = usePathname();

  const tabs = [
    {
      href: '/' as const,
      label: t('myRecipes'),
      icon: BookOpenIcon,
      activeIcon: BookOpenSolid,
    },
    {
      href: '/add' as const,
      label: t('addRecipe'),
      icon: PlusCircleIcon,
      activeIcon: PlusCircleSolid,
    },
    {
      href: '/settings' as const,
      label: t('settings'),
      icon: Cog6ToothIcon,
      activeIcon: Cog6ToothSolid,
    },
  ];

  return (
    <nav className="fixed bottom-0 start-0 end-0 z-50 border-t border-gray-200 bg-white/80 backdrop-blur-lg dark:border-gray-800 dark:bg-gray-950/80 safe-bottom">
      <div className="mx-auto flex max-w-lg items-center justify-around py-2">
        {tabs.map((tab) => {
          const isActive =
            tab.href === '/'
              ? pathname === '/'
              : pathname.startsWith(tab.href);
          const Icon = isActive ? tab.activeIcon : tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={clsx(
                'flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors',
                isActive
                  ? 'text-orange-500'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              )}
            >
              <Icon className="h-6 w-6" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
