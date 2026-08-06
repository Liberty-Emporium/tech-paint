import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import { Providers } from '@/components/providers';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'Coltrane Tech Paint — Professional Painting Estimates & Invoices', template: '%s | Coltrane Tech Paint' },
  description: 'Get professional painting estimates and invoices in seconds. Coltrane Tech Paint — powered by AI photo analysis, in partnership with Alexander AI Solutions.',
  metadataBase: new URL('https://techpaint.jays-web.org'),
  openGraph: {
    title: 'Coltrane Tech Paint',
    description: 'Professional painting estimates & invoices — powered by AI.',
    url: 'https://techpaint.jays-web.org',
    siteName: 'Coltrane Tech Paint',
    type: 'website',
  },
  alternates: {
    canonical: '/',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable}`}>
      <body className="min-h-screen bg-ink-50 font-sans">
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Navigation />
            <div className="flex-1 flex flex-col">
              {children}
            </div>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
