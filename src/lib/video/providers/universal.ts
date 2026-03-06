import type { Platform, TranscriptSegment } from '@/types';

const API_HOST = 'video-transcript-scraper.p.rapidapi.com';

/**
 * Universal video info fetcher via RapidAPI's Video Transcript Scraper.
 * Uses /transcribe to get video metadata (title, description, thumbnail).
 * Only the video_info fields are used — the speech transcript is ignored
 * because the post description typically contains the full recipe.
 */
export async function getUniversalTranscript(
  url: string,
  platform: Platform
): Promise<{ segments: TranscriptSegment[]; title?: string; description?: string; thumbnailUrl?: string }> {
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) throw new Error('RAPIDAPI_KEY not configured');

  const res = await fetch(`https://${API_HOST}/transcribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': API_HOST,
    },
    body: JSON.stringify({ video_url: url }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(
      `Transcript API error (${res.status}): ${errText.substring(0, 200)}`
    );
  }

  const data = await res.json();

  if (data.status === 'error') {
    throw new Error(data.message || 'Transcription failed');
  }

  const title = data.data?.video_info?.title || data.title;
  const description = data.data?.video_info?.description || data.description;
  const thumbnailUrl = data.data?.video_info?.thumbnail;

  if (!title && !description) {
    throw new Error('No video info returned from API');
  }

  console.log(`[Transcript] Got video info via /transcribe — title: ${!!title}, description: ${!!description}`);

  return {
    segments: [],
    title,
    description,
    thumbnailUrl,
  };
}

