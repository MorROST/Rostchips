'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Recipe } from '@/types';
import { useAuth } from './useAuth';

export function useRecipes() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecipes = useCallback(async () => {
    if (!user?.token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/recipes', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch recipes');
      const data = await res.json();
      setRecipes(data.recipes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recipes');
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const deleteRecipe = useCallback(
    async (id: string) => {
      if (!user?.token) return;
      const res = await fetch(`/api/recipes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (!res.ok) throw new Error('Failed to delete recipe');
      setRecipes((prev) => prev.filter((r) => r.id !== id));
    },
    [user?.token]
  );

  return { recipes, loading, error, refresh: fetchRecipes, deleteRecipe };
}
