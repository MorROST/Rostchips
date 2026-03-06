'use client';

import { useTranslations } from 'next-intl';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { clsx } from 'clsx';
import type { ExtractionStep } from '@/hooks/useExtraction';

interface ExtractionProgressProps {
  currentStep: ExtractionStep;
}

const STEPS: ExtractionStep[] = ['fetching', 'transcript', 'extracting', 'saving', 'done'];

export function ExtractionProgress({ currentStep }: ExtractionProgressProps) {
  const t = useTranslations('recipes');

  const stepLabels: Record<string, string> = {
    fetching: t('stepFetching'),
    transcript: t('stepTranscript'),
    extracting: t('stepExtracting'),
    saving: t('stepSaving'),
    done: t('stepDone'),
  };

  const currentIdx = STEPS.indexOf(currentStep);

  return (
    <div className="space-y-3 py-4">
      {STEPS.map((step, idx) => {
        const isCompleted = idx < currentIdx;
        const isActive = idx === currentIdx;

        return (
          <div key={step} className="flex items-center gap-3">
            <div
              className={clsx(
                'flex h-8 w-8 items-center justify-center rounded-full transition-all',
                isCompleted && 'bg-green-500 text-white',
                isActive && 'bg-orange-500 text-white',
                !isCompleted && !isActive && 'bg-gray-200 text-gray-400 dark:bg-gray-700'
              )}
            >
              {isCompleted ? (
                <CheckCircleIcon className="h-5 w-5" />
              ) : isActive ? (
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              ) : (
                <span className="text-sm">{idx + 1}</span>
              )}
            </div>
            <span
              className={clsx(
                'text-sm font-medium transition-colors',
                isCompleted && 'text-green-600 dark:text-green-400',
                isActive && 'text-orange-600 dark:text-orange-400',
                !isCompleted && !isActive && 'text-gray-400 dark:text-gray-500'
              )}
            >
              {stepLabels[step]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
