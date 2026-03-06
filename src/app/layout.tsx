import type { Metadata, Viewport } from 'next';
import { Inter, Heebo } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const heebo = Heebo({
  subsets: ['hebrew'],
  variable: '--font-heebo',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Rostcipes',
  description: 'Save recipes from social media videos',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Rostcipes',
  },
};

export const viewport: Viewport = {
  themeColor: '#f97316',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale?: string }>;
}) {
  const { locale } = await params;
  const dir = locale === 'he' ? 'rtl' : 'ltr';

  return (
    <html lang={locale || 'en'} dir={dir} suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className={`${inter.variable} ${heebo.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
