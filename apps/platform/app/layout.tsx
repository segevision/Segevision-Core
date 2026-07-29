import type { Metadata } from 'next';
import './globals.css';
import { ThemeScript } from '../components/theme-script';

export const metadata: Metadata = {
  title: 'Segevision — פלטפורמת האתרים',
  description: 'מערכת פנימית ליצירה, עריכה ותצוגה מקדימה של אתרי לקוחות.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Every Hebrew family the platform chrome or a client preview can select. */}
        <link
          href="https://fonts.googleapis.com/css2?family=Alef:wght@400;700&family=Assistant:wght@400;500;600;700;800&family=Frank+Ruhl+Libre:wght@400;500;700;800&family=Heebo:wght@400;500;700;800;900&family=Noto+Sans+Hebrew:wght@400;500;600;700;800&family=Rubik:wght@400;500;600;700;800&family=Secular+One&display=swap"
          rel="stylesheet"
        />
        <ThemeScript />
      </head>
      <body>{children}</body>
    </html>
  );
}
