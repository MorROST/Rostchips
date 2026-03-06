'use client';

import { useTranslations } from 'next-intl';
import { AddRecipeForm } from '@/components/AddRecipeForm';

export default function AddRecipePage() {
  const t = useTranslations('recipes');

  return (
    <div className="px-4 pt-4">
      <h1 className="mb-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
        {t('addTitle')}
      </h1>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        {t('addDescription')}
      </p>
      <AddRecipeForm />
    </div>
  );
}
