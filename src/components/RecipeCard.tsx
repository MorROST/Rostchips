'use client';

import { useLocale } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import { Card } from './ui/Card';
import { ClockIcon } from '@heroicons/react/24/outline';
import type { Recipe } from '@/types';
import { getPlatformIcon } from '@/lib/video/platforms';

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const locale = useLocale();
  const title = locale === 'he' && recipe.titleHe ? recipe.titleHe : recipe.title;
  const totalTime = (recipe.prepTime ?? 0) + (recipe.cookTime ?? 0);

  return (
    <Link href={`/recipe/${recipe.id}`}>
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        {recipe.thumbnailUrl ? (
          <div className="relative h-40 w-full bg-gray-100 dark:bg-gray-800">
            <img
              src={recipe.thumbnailUrl}
              alt={title}
              className="h-full w-full object-cover"
            />
            <span className="absolute top-2 end-2 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white">
              {getPlatformIcon(recipe.platform)}
            </span>
          </div>
        ) : (
          <div className="flex h-40 items-center justify-center bg-orange-50 text-4xl dark:bg-orange-950/30">
            {getPlatformIcon(recipe.platform)}
          </div>
        )}
        <div className="p-3">
          <h3 className="line-clamp-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
            {title || 'Untitled Recipe'}
          </h3>
          <div className="mt-2 flex flex-wrap gap-1">
            {recipe.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-orange-50 px-2 py-0.5 text-xs text-orange-700 dark:bg-orange-950/30 dark:text-orange-300"
              >
                {tag}
              </span>
            ))}
          </div>
          {totalTime > 0 && (
            <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
              <ClockIcon className="h-3.5 w-3.5" />
              <span>{totalTime} min</span>
            </div>
          )}
          {recipe.extractionStatus === 'processing' && (
            <div className="mt-2 text-xs text-orange-500 animate-pulse">
              Processing...
            </div>
          )}
          {recipe.extractionStatus === 'failed' && (
            <div className="mt-2 text-xs text-red-500">
              Extraction failed
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
