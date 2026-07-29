import type { Metadata } from 'next';
import './globals.css';
import { PHYSIOTHLETICS_THEME_NAME, physiothleticsThemeCss } from '../theme/physiothletics-theme';
import { seo } from '../content/site-content';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: seo.title,
  description: seo.description,
  openGraph: {
    title: seo.title,
    description: seo.description,
    locale: 'he_IL',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" data-theme={PHYSIOTHLETICS_THEME_NAME}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/*
          Heebo (display) + Assistant (body): two of the few Hebrew families with a
          full weight range and matching Latin, which the brand needs for terms like
          "Explain Pain" and "MMuscSklSportPhysio" sitting inside Hebrew sentences.
        */}
        <link
          href="https://fonts.googleapis.com/css2?family=Assistant:wght@400;500;600;700&family=Heebo:wght@400;500;700;800;900&display=swap"
          rel="stylesheet"
        />
        {/* Client brand theme, generated from theme/physiothletics-theme.ts at render time. */}
        <style dangerouslySetInnerHTML={{ __html: physiothleticsThemeCss }} />
      </head>
      <body className="font-body">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
