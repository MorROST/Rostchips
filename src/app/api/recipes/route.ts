import { NextRequest, NextResponse } from 'next/server';
import { createRecipeRecord, getUserRecipes, updateRecipeWithExtraction, markRecipeFailed } from '@/lib/aws/dynamodb';
import { detectPlatform, isShareUrl, resolveShareUrl } from '@/lib/video/platforms';
import { getOEmbed } from '@/lib/video/oembed';
import { getTranscript } from '@/lib/video/transcript';
import { extractRecipeFromTranscript } from '@/lib/ai/claude';
import { verifyAuth } from '../auth';

export async function GET(request: NextRequest) {
  const userId = await verifyAuth(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { recipes, lastKey } = await getUserRecipes(userId);
    return NextResponse.json({ recipes, cursor: lastKey });
  } catch (error) {
    console.error('Failed to fetch recipes:', error);
    return NextResponse.json({ error: 'Failed to fetch recipes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const userId = await verifyAuth(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { url?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  let { url } = body;
  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  // Resolve share/short URLs to canonical URLs
  if (isShareUrl(url)) {
    url = await resolveShareUrl(url);
  }

  const platform = detectPlatform(url);
  console.log('[Extract] URL:', url, '→ Platform:', platform);
  if (!platform) {
    return NextResponse.json({ error: 'Unsupported platform' }, { status: 400 });
  }

  // Create record with the resolved URL
  const recipeId = await createRecipeRecord(userId, url, platform);

  // Run extraction pipeline (don't await — but for simplicity in MVP, we do await)
  try {
    // 1. Get oEmbed data + transcript in parallel
    const [oembedData, transcriptResult] = await Promise.all([
      getOEmbed(url, platform),
      getTranscript(url, platform),
    ]);

    // 2. Extract recipe with Claude
    const extraction = await extractRecipeFromTranscript(transcriptResult.text);

    // 3. Update record with results (prefer transcript API thumbnail/title as fallback)
    await updateRecipeWithExtraction(
      recipeId,
      extraction,
      oembedData?.html,
      oembedData?.thumbnail_url || transcriptResult.thumbnailUrl
    );

    return NextResponse.json({ id: recipeId, status: 'completed' });
  } catch (error) {
    console.error('Extraction failed:', error);
    await markRecipeFailed(
      recipeId,
      error instanceof Error ? error.message : 'Unknown error'
    );
    return NextResponse.json(
      { id: recipeId, status: 'failed', error: 'Extraction failed' },
      { status: 500 }
    );
  }
}
