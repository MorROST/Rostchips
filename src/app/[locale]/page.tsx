'use client';

import { useTranslations } from 'next-intl';
import { RecipeList } from '@/components/RecipeList';
import { useRecipes } from '@/hooks/useRecipes';

export default function HomePage() {
  const t = useTranslations('recipes');
  const { recipes, loading } = useRecipes();

  return (
    <div className="px-4 pt-4">
      <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
        {t('title')}
      </h1>
      <RecipeList recipes={recipes} loading={loading} />
    </div>
  );
}
