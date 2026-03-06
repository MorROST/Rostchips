import type { TranscriptSegment } from '@/types';

export async function getFacebookTranscript(
  url: string
): Promise<TranscriptSegment[]> {
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) throw new Error('RAPIDAPI_KEY not configured');

  const res = await fetch(
    `https://facebook-video-transcript.p.rapidapi.com/transcript?url=${encodeURIComponent(url)}`,
    {
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'facebook-video-transcript.p.rapidapi.com',
      },
    }
  );

  if (!res.ok) {
    throw new Error(`Facebook transcript API error: ${res.status}`);
  }

  const data = await res.json();

  if (data.transcript && typeof data.transcript === 'string') {
    return [{ text: data.transcript }];
  }

  if (Array.isArray(data.segments)) {
    return data.segments.map((s: { text: string }) => ({ text: s.text }));
  }

  if (Array.isArray(data)) {
    return data.map((s: { text: string }) => ({ text: s.text }));
  }

  throw new Error('Unexpected transcript response format');
}
