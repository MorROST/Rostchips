import type { Platform } from '@/types';
import { getUniversalTranscript } from './providers/universal';

export async function getTranscript(
  url: string,
  platform: Platform
): Promise<{ text: string; title?: string; thumbnailUrl?: string }> {
  console.log(`[Transcript] Fetching for ${platform}: ${url}`);

  const result = await getUniversalTranscript(url, platform);

  const speechText = result.segments.map((s) => s.text).join(' ');

  if (!speechText.trim() && !result.title && !result.description) {
    throw new Error('Empty transcript — video may not have speech');
  }

  // Combine title, description, and speech transcript so Claude gets the full context.
  // Many videos (especially Facebook/Instagram) have the full recipe in the description.
  const parts: string[] = [];
  if (result.title) parts.push(`Title: ${result.title}`);
  if (result.description) parts.push(`Description: ${result.description}`);
  if (speechText.trim()) parts.push(`Transcript: ${speechText}`);
  const fullText = parts.join('\n\n');

  console.log(`[Transcript] Got ${result.segments.length} segments, ${fullText.length} chars`);
  return {
    text: fullText,
    title: result.title,
    thumbnailUrl: result.thumbnailUrl,
  };
}
