'use client';

import { useEffect, useState, use } from 'react';
import { useTranslations } from 'next-intl';
import { RecipeDetail } from '@/components/RecipeDetail';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from '@/lib/i18n/navigation';
import type { Recipe } from '@/types';

export default function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useAuth();
  const router = useRouter();
  const t = useTranslations('recipes');
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user?.token) return;

    fetch(`/api/recipes/${id}`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((data) => setRecipe(data.recipe))
      .catch(() => setRecipe(null))
      .finally(() => setLoading(false));
  }, [id, user?.token]);

  async function handleDelete() {
    if (!user?.token || !confirm(t('deleteConfirm'))) return;
    setDeleting(true);
    try {
      await fetch(`/api/recipes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` },
      });
      router.replace('/');
    } catch {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Recipe not found</p>
      </div>
    );
  }

  return (
    <RecipeDetail
      recipe={recipe}
      onDelete={handleDelete}
      deleting={deleting}
    />
  );
}
