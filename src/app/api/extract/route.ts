import { NextRequest, NextResponse } from 'next/server';
import { detectPlatform } from '@/lib/video/platforms';
import { getOEmbed } from '@/lib/video/oembed';
import { getTranscript } from '@/lib/video/transcript';
import { extractRecipeFromTranscript } from '@/lib/ai/claude';
import { verifyAuth } from '../auth';

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

  const { url } = body;
  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  const platform = detectPlatform(url);
  if (!platform) {
    return NextResponse.json({ error: 'Unsupported platform' }, { status: 400 });
  }

  try {
    const [oembedData, transcriptResult] = await Promise.all([
      getOEmbed(url, platform),
      getTranscript(url, platform),
    ]);

    const extraction = await extractRecipeFromTranscript(transcriptResult.text);

    return NextResponse.json({
      extraction,
      embedHtml: oembedData?.html,
      thumbnailUrl: oembedData?.thumbnail_url || transcriptResult.thumbnailUrl,
    });
  } catch (error) {
    console.error('Extraction failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Extraction failed' },
      { status: 500 }
    );
  }
}
