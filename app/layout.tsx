import { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { Figtree } from 'next/font/google';
import { getThemeColor } from '@utilities/tools';
import { ThemeProvider } from '@components/ThemeContext';
import './globals.css';

const font = Figtree({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-figtree',
  fallback: ['sans-serif', 'Arial'],
});

export default function RootLayout({ children, params }: { children: React.ReactNode; params: { lang: string } }): ReactNode {

  const cookieStore = cookies();
  let theme: any = cookieStore.get('theme')?.value;
  if (typeof theme !== 'string') theme = 'light';
  const themeColor: string = getThemeColor(theme);

  return (
    <html lang={params.lang} className={`${font.className} ${theme}`}>
      <head>
        <meta name="author" content={process.env.author} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-touch-fullscreen" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content={themeColor} />
        <meta name="msapplication-TileColor" content={themeColor} />
        <meta name="theme-color" content={themeColor} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
      </head>
      <body className={`${font.className} antialiased bg-slate-100 dark:bg-slate-950 p-0 m-0`}>
        <ThemeProvider defaultTheme={theme}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}