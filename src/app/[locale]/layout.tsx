import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/lib/i18n/navigation';
import { AuthGuard } from '@/components/AuthGuard';
import { Navbar } from '@/components/Navbar';

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as 'en' | 'he')) {
    notFound();
  }

  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch {
    notFound();
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <AuthGuard>
        <main className="min-h-screen pb-20">
          {children}
        </main>
        <Navbar />
      </AuthGuard>
    </NextIntlClientProvider>
  );
}
