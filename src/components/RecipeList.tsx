'use client';

import { useTranslations } from 'next-intl';
import { RecipeCard } from './RecipeCard';
import { Spinner } from './ui/Spinner';
import { BookOpenIcon } from '@heroicons/react/24/outline';
import type { Recipe } from '@/types';

interface RecipeListProps {
  recipes: Recipe[];
  loading: boolean;
}

export function RecipeList({ recipes, loading }: RecipeListProps) {
  const t = useTranslations('recipes');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <BookOpenIcon className="mb-4 h-16 w-16 text-gray-300 dark:text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {t('empty')}
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {t('emptySubtitle')}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  );
}
