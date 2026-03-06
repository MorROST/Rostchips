import { NextRequest, NextResponse } from 'next/server';
import { getRecipeById, deleteRecipe } from '@/lib/aws/dynamodb';
import { verifyAuth } from '../../auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await verifyAuth(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const recipe = await getRecipeById(id);

  if (!recipe) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (recipe.userId !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json({ recipe });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await verifyAuth(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const recipe = await getRecipeById(id);

  if (!recipe) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (recipe.userId !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await deleteRecipe(id);
  return NextResponse.json({ success: true });
}
