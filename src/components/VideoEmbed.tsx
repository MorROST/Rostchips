'use client';

import { useEffect, useRef } from 'react';
import type { Platform } from '@/types';

interface VideoEmbedProps {
  embedHtml?: string;
  url: string;
  platform: Platform;
}

export function VideoEmbed({ embedHtml, url, platform }: VideoEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !embedHtml) return;

    // Set the HTML
    containerRef.current.innerHTML = embedHtml;

    // Load platform-specific scripts
    if (platform === 'tiktok') {
      loadScript('https://www.tiktok.com/embed.js');
    } else if (platform === 'instagram') {
      loadScript('https://www.instagram.com/embed.js');
    }
  }, [embedHtml, platform]);

  if (!embedHtml) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-48 items-center justify-center rounded-xl bg-gray-100 text-orange-500 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
      >
        Watch on {platformName(platform)}
      </a>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex justify-center overflow-hidden rounded-xl [&>iframe]:max-w-full [&>blockquote]:max-w-full"
    />
  );
}

function platformName(p: Platform): string {
  const m: Record<Platform, string> = {
    tiktok: 'TikTok',
    instagram: 'Instagram',
    youtube: 'YouTube',
    facebook: 'Facebook',
  };
  return m[p];
}

function loadScript(src: string) {
  if (document.querySelector(`script[src="${src}"]`)) return;
  const script = document.createElement('script');
  script.src = src;
  script.async = true;
  document.body.appendChild(script);
}
