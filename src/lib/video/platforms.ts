import type { Platform } from '@/types';

const patterns: Record<Platform, RegExp[]> = {
  tiktok: [
    /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@[\w.-]+\/video\/\d+/i,
    /(?:https?:\/\/)?(?:vm|vt)\.tiktok\.com\/[\w]+/i,
    /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/t\/[\w]+/i,
  ],
  instagram: [
    /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:reel|p)\/[\w-]+/i,
    /(?:https?:\/\/)?(?:www\.)?instagr\.am\/(?:reel|p)\/[\w-]+/i,
    /(?:https?:\/\/)?(?:www\.)?instagram\.com\/share\/[\w-]+/i,
  ],
  youtube: [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=[\w-]+/i,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/[\w-]+/i,
    /(?:https?:\/\/)?youtu\.be\/[\w-]+/i,
  ],
  facebook: [
    /(?:https?:\/\/)?(?:www\.)?facebook\.com\/[\w.-]+\/videos\/\d+/i,
    /(?:https?:\/\/)?(?:www\.)?facebook\.com\/(?:watch|reel)\/?\?v=\d+/i,
    /(?:https?:\/\/)?(?:www\.)?facebook\.com\/reel\/\d+/i,
    /(?:https?:\/\/)?(?:www\.)?facebook\.com\/share\/[\w/]+/i,
    /(?:https?:\/\/)?(?:www\.)?fb\.watch\/[\w]+/i,
  ],
};

/** Patterns that are share/short links needing redirect resolution */
const SHARE_PATTERNS = [
  /facebook\.com\/share\//i,
  /instagram\.com\/share\//i,
  /vm\.tiktok\.com\//i,
  /vt\.tiktok\.com\//i,
  /tiktok\.com\/t\//i,
  /fb\.watch\//i,
  /youtu\.be\//i,
];

export function isShareUrl(url: string): boolean {
  return SHARE_PATTERNS.some((re) => re.test(url));
}

/**
 * Follow redirects on share/short URLs to get the canonical URL.
 * e.g. facebook.com/share/r/xxx → facebook.com/reel/123456
 */
export async function resolveShareUrl(url: string): Promise<string> {
  if (!isShareUrl(url)) return url;

  try {
    const res = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      },
    });
    const resolved = res.url;
    console.log(`[Resolve] ${url} → ${resolved}`);
    return resolved;
  } catch {
    // If HEAD fails, try GET with manual redirect
    try {
      const res = await fetch(url, {
        redirect: 'manual',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
        },
      });
      const location = res.headers.get('location');
      if (location) {
        console.log(`[Resolve] ${url} → ${location}`);
        return location;
      }
    } catch {
      // ignore
    }
    return url;
  }
}

export function detectPlatform(url: string): Platform | null {
  for (const [platform, regexes] of Object.entries(patterns)) {
    if (regexes.some((re) => re.test(url))) {
      return platform as Platform;
    }
  }
  return null;
}

export function isValidVideoUrl(url: string): boolean {
  return detectPlatform(url) !== null;
}

export function getPlatformIcon(platform: Platform): string {
  const icons: Record<Platform, string> = {
    tiktok: '♪',
    instagram: '📷',
    youtube: '▶',
    facebook: '📘',
  };
  return icons[platform];
}

export function getPlatformName(platform: Platform): string {
  const names: Record<Platform, string> = {
    tiktok: 'TikTok',
    instagram: 'Instagram',
    youtube: 'YouTube',
    facebook: 'Facebook',
  };
  return names[platform];
}
