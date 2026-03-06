'use client';

import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';

export type ExtractionStep = 'idle' | 'fetching' | 'transcript' | 'extracting' | 'saving' | 'done' | 'error';

interface ExtractionState {
  step: ExtractionStep;
  recipeId: string | null;
  error: string | null;
}

export function useExtraction() {
  const { user } = useAuth();
  const [state, setState] = useState<ExtractionState>({
    step: 'idle',
    recipeId: null,
    error: null,
  });

  const extract = useCallback(
    async (url: string) => {
      if (!user?.token) return;

      setState({ step: 'fetching', recipeId: null, error: null });

      try {
        // Create recipe record and start extraction
        setState((s) => ({ ...s, step: 'transcript' }));

        const res = await fetch('/api/recipes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ url }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Extraction failed');
        }

        setState((s) => ({ ...s, step: 'extracting' }));

        const data = await res.json();

        setState((s) => ({ ...s, step: 'saving' }));

        // Small delay so user sees the saving step
        await new Promise((r) => setTimeout(r, 500));

        setState({ step: 'done', recipeId: data.id, error: null });
      } catch (err) {
        setState({
          step: 'error',
          recipeId: null,
          error: err instanceof Error ? err.message : 'Extraction failed',
        });
      }
    },
    [user?.token]
  );

  const reset = useCallback(() => {
    setState({ step: 'idle', recipeId: null, error: null });
  }, []);

  return { ...state, extract, reset };
}
