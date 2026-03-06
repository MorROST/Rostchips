import type { TranscriptSegment } from '@/types';

export async function getTikTokTranscript(
  url: string
): Promise<TranscriptSegment[]> {
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) throw new Error('RAPIDAPI_KEY not configured');

  const res = await fetch(
    `https://tiktok-video-transcript.p.rapidapi.com/transcript?url=${encodeURIComponent(url)}`,
    {
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'tiktok-video-transcript.p.rapidapi.com',
      },
    }
  );

  if (!res.ok) {
    throw new Error(`TikTok transcript API error: ${res.status}`);
  }

  const data = await res.json();

  if (data.transcript && typeof data.transcript === 'string') {
    return [{ text: data.transcript }];
  }

  if (Array.isArray(data.segments)) {
    return data.segments.map((s: { text: string; start?: number; duration?: number }) => ({
      text: s.text,
      offset: s.start,
      duration: s.duration,
    }));
  }

  if (Array.isArray(data)) {
    return data.map((s: { text: string }) => ({ text: s.text }));
  }

  throw new Error('Unexpected transcript response format');
}
