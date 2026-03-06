import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin('./src/lib/i18n/request.ts');

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.tiktokcdn.com' },
      { protocol: 'https', hostname: '*.ytimg.com' },
      { protocol: 'https', hostname: '*.cdninstagram.com' },
      { protocol: 'https', hostname: '*.fbcdn.net' },
    ],
  },
};

export default withNextIntl(nextConfig);
