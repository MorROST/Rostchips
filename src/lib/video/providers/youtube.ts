import type { TranscriptSegment } from '@/types';

/**
 * Fetches YouTube transcript via RapidAPI.
 * YouTube blocks server-side caption scraping, so we use a third-party service.
 */
export async function getYouTubeTranscript(
  url: string
): Promise<TranscriptSegment[]> {
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) throw new Error('RAPIDAPI_KEY not configured');

  const videoId = extractVideoId(url);
  if (!videoId) throw new Error('Invalid YouTube URL');

  const res = await fetch(
    `https://youtube-transcriptor.p.rapidapi.com/transcript?video_id=${videoId}&lang=en`,
    {
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'youtube-transcriptor.p.rapidapi.com',
      },
    }
  );

  if (!res.ok) {
    throw new Error(`YouTube transcript API error: ${res.status}`);
  }

  const data = await res.json();

  // Handle various response formats from RapidAPI transcript services
  if (Array.isArray(data)) {
    return data.map((s: { text?: string; subtitle?: string; start?: number; duration?: number }) => ({
      text: s.text || s.subtitle || '',
      offset: s.start,
      duration: s.duration,
    }));
  }

  if (data.transcription && Array.isArray(data.transcription)) {
    return data.transcription.map((s: { text?: string; subtitle?: string }) => ({
      text: s.text || s.subtitle || '',
    }));
  }

  if (data.transcript && typeof data.transcript === 'string') {
    return [{ text: data.transcript }];
  }

  if (data.subtitles && Array.isArray(data.subtitles)) {
    return data.subtitles.map((s: { text?: string }) => ({
      text: s.text || '',
    }));
  }

  throw new Error('Unexpected YouTube transcript response format');
}

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}
