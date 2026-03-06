'use client';

import { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={twMerge(
            clsx(
              'w-full rounded-xl border bg-white px-4 py-2.5 text-base text-gray-900 placeholder-gray-400 transition-colors',
              'focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20',
              'dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500',
              error
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                : 'border-gray-300'
            ),
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
