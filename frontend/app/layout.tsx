import { Public_Sans } from 'next/font/google';
import localFont from 'next/font/local';
import { headers } from 'next/headers';
import { ThemeProvider } from '@/components/app/theme-provider';
import { ThemeToggle } from '@/components/app/theme-toggle';
import { DisasterTicker } from '@/components/app/disaster-ticker';
import { cn } from '@/lib/shadcn/utils';
import { getAppConfig, getStyles } from '@/lib/utils';
import '@/styles/globals.css';

const publicSans = Public_Sans({
  variable: '--font-public-sans',
  subsets: ['latin'],
  display: 'swap',
});

const commitMono = localFont({
  display: 'swap',
  variable: '--font-commit-mono',
  src: [
    {
      path: '../fonts/CommitMono-400-Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/CommitMono-700-Regular.otf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../fonts/CommitMono-400-Italic.otf',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../fonts/CommitMono-700-Italic.otf',
      weight: '700',
      style: 'italic',
    },
  ],
});

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const hdrs = await headers();
  const appConfig = await getAppConfig(hdrs);
  const styles = getStyles(appConfig);
  const { pageTitle, pageDescription, companyName, logo, logoDark } = appConfig;

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        publicSans.variable,
        commitMono.variable,
        'scroll-smooth font-sans antialiased'
      )}
    >
      <head>
        {styles && <style>{styles}</style>}
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
      </head>
      <body className="overflow-x-hidden">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {/* Top Active Disaster Ticker */}
          <DisasterTicker />

          <header className="fixed top-9 left-0 z-40 hidden w-full flex-row items-center justify-between p-4 md:px-6 md:py-3 pointer-events-none">
            <div className="pointer-events-auto flex items-center space-x-2 rounded-full border border-amber-400/70 bg-white/90 dark:bg-slate-900/90 px-3.5 py-1.5 shadow-md backdrop-blur-md">
              <span className="text-sm">🇮🇳</span>
              <span className="text-xs font-mono font-bold tracking-wider text-slate-800 dark:text-slate-100 uppercase">
                Sentinel AI <span className="text-emerald-600 dark:text-emerald-400 font-sans">• Voice for Bharat</span>
              </span>
            </div>

            <span className="pointer-events-auto text-foreground font-mono text-xs font-bold tracking-wider uppercase rounded-full border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 px-3.5 py-1.5 shadow-sm backdrop-blur-md">
              Built with{' '}
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://docs.livekit.io/agents"
                className="underline underline-offset-4 text-sky-600 dark:text-sky-400"
              >
                LiveKit Agents
              </a>
            </span>
          </header>

          {children}
          <div className="group fixed bottom-0 left-1/2 z-50 mb-2 -translate-x-1/2">
            <ThemeToggle className="translate-y-20 transition-transform delay-150 duration-300 group-hover:translate-y-0" />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
