import type { Platform, OEmbedResponse } from '@/types';

export async function getOEmbed(
  url: string,
  platform: Platform
): Promise<OEmbedResponse | null> {
  try {
    switch (platform) {
      case 'tiktok':
        return fetchOEmbed(
          `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`
        );
      case 'youtube':
        return fetchOEmbed(
          `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
        );
      case 'instagram':
        // Meta's oEmbed requires app review — use iframe fallback
        return {
          html: `<iframe src="${url}/embed" width="400" height="480" frameborder="0" scrolling="no" allowtransparency="true"></iframe>`,
          provider_name: 'Instagram',
        };
      case 'facebook':
        return {
          html: `<iframe src="https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&width=400" width="400" height="300" frameborder="0" allowfullscreen></iframe>`,
          provider_name: 'Facebook',
        };
      default:
        return null;
    }
  } catch {
    return null;
  }
}

async function fetchOEmbed(endpoint: string): Promise<OEmbedResponse | null> {
  const res = await fetch(endpoint);
  if (!res.ok) return null;
  return res.json();
}
