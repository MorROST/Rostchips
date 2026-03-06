'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { ExtractionProgress } from './ExtractionProgress';
import { useExtraction } from '@/hooks/useExtraction';
import { detectPlatform, getPlatformIcon, getPlatformName } from '@/lib/video/platforms';
import { useRouter } from '@/lib/i18n/navigation';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export function AddRecipeForm() {
  const t = useTranslations('recipes');
  const [url, setUrl] = useState('');
  const { step, recipeId, error, extract, reset } = useExtraction();
  const router = useRouter();

  const detectedPlatform = url.trim() ? detectPlatform(url.trim()) : null;
  const isExtracting = step !== 'idle' && step !== 'done' && step !== 'error';

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim() || !detectedPlatform) return;
    extract(url.trim());
  }

  if (step === 'done' && recipeId) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {t('stepDone')}
        </h2>
        <div className="flex gap-3">
          <Button onClick={() => router.push(`/recipe/${recipeId}`)}>
            {t('viewRecipe')}
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              reset();
              setUrl('');
            }}
          >
            {t('addTitle')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Input
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (step === 'error') reset();
            }}
            placeholder={t('urlPlaceholder')}
            disabled={isExtracting}
            dir="ltr"
          />
          {detectedPlatform && (
            <span className="absolute end-3 top-1/2 -translate-y-1/2 text-lg" title={getPlatformName(detectedPlatform)}>
              {getPlatformIcon(detectedPlatform)}
            </span>
          )}
        </div>

        {url.trim() && !detectedPlatform && (
          <p className="text-sm text-red-500">{t('invalidUrl')}</p>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={!detectedPlatform || isExtracting}
          loading={isExtracting}
        >
          {isExtracting ? t('extracting') : t('extract')}
        </Button>
      </form>

      {isExtracting && (
        <ExtractionProgress currentStep={step} />
      )}

      {step === 'error' && error && (
        <div className="mt-4 flex items-start gap-3 rounded-xl bg-red-50 p-4 dark:bg-red-950/20">
          <ExclamationTriangleIcon className="h-5 w-5 shrink-0 text-red-500" />
          <div>
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            <p className="mt-1 text-xs text-red-500">{t('extractionFailed')}</p>
          </div>
        </div>
      )}
    </div>
  );
}
