'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { VideoEmbed } from './VideoEmbed';
import { Button } from './ui/Button';
import {
  ClockIcon,
  UsersIcon,
  TrashIcon,
  ArrowUturnLeftIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import type { Recipe } from '@/types';
import { Link } from '@/lib/i18n/navigation';
import { getPlatformName } from '@/lib/video/platforms';

interface RecipeDetailProps {
  recipe: Recipe;
  onDelete?: () => void;
  deleting?: boolean;
}

export function RecipeDetail({ recipe, onDelete, deleting }: RecipeDetailProps) {
  const t = useTranslations('recipes');
  const locale = useLocale();
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(
    new Set()
  );

  const title = locale === 'he' && recipe.titleHe ? recipe.titleHe : recipe.title;
  const description =
    locale === 'he' && recipe.descriptionHe
      ? recipe.descriptionHe
      : recipe.description;
  const instructions =
    locale === 'he' && recipe.instructionsHe?.length
      ? recipe.instructionsHe
      : recipe.instructions;

  function toggleIngredient(idx: number) {
    setCheckedIngredients((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <Link href="/" className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
          <ArrowUturnLeftIcon className="h-5 w-5" />
        </Link>
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            loading={deleting}
            className="text-red-500 hover:text-red-600"
          >
            <TrashIcon className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Video Embed */}
      <div className="px-4">
        <VideoEmbed
          embedHtml={recipe.embedHtml}
          url={recipe.url}
          platform={recipe.platform}
        />
      </div>

      {/* Title & Meta */}
      <div className="px-4 pt-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        )}

        {/* Meta badges */}
        <div className="mt-3 flex flex-wrap gap-3">
          {recipe.prepTime != null && recipe.prepTime > 0 && (
            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
              <ClockIcon className="h-4 w-4" />
              <span>
                {t('prepTime')}: {recipe.prepTime} {t('minutes')}
              </span>
            </div>
          )}
          {recipe.cookTime != null && recipe.cookTime > 0 && (
            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
              <ClockIcon className="h-4 w-4" />
              <span>
                {t('cookTime')}: {recipe.cookTime} {t('minutes')}
              </span>
            </div>
          )}
          {recipe.servings != null && recipe.servings > 0 && (
            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
              <UsersIcon className="h-4 w-4" />
              <span>
                {recipe.servings} {t('servings')}
              </span>
            </div>
          )}
        </div>

        {/* Tags */}
        {recipe.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {recipe.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-950/30 dark:text-orange-300"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Source link */}
        <a
          href={recipe.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block text-xs text-orange-500 hover:text-orange-600"
        >
          Watch on {getPlatformName(recipe.platform)} &rarr;
        </a>
      </div>

      {/* Ingredients */}
      {recipe.ingredients.length > 0 && (
        <div className="mt-6 px-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('ingredients')}
          </h2>
          <ul className="mt-2 space-y-2">
            {recipe.ingredients.map((ing, idx) => {
              const name =
                locale === 'he' && ing.nameHe ? ing.nameHe : ing.name;
              const isChecked = checkedIngredients.has(idx);

              return (
                <li
                  key={idx}
                  onClick={() => toggleIngredient(idx)}
                  className={clsx(
                    'ingredient-check flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50',
                    isChecked && 'checked'
                  )}
                >
                  <div
                    className={clsx(
                      'flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors',
                      isChecked
                        ? 'border-green-500 bg-green-500'
                        : 'border-gray-300 dark:border-gray-600'
                    )}
                  >
                    {isChecked && (
                      <svg
                        className="h-3 w-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    <span className="font-medium">
                      {ing.amount}
                      {ing.unit ? ` ${ing.unit}` : ''}
                    </span>{' '}
                    {name}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Instructions */}
      {instructions.length > 0 && (
        <div className="mt-6 px-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('instructions')}
          </h2>
          <ol className="mt-2 space-y-4">
            {instructions.map((step, idx) => (
              <li key={idx} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700 dark:bg-orange-950/50 dark:text-orange-300">
                  {idx + 1}
                </span>
                <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  {step}
                </p>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
