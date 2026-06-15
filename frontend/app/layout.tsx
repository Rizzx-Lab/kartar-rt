import type { Metadata, Viewport } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import { LayoutController } from '@/components/layout/layout-controller';
import { PageTransition } from '@/components/ui/page-transition';
import ScrollAnimations from '@/components/ScrollAnimations';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jakarta',
  preload: false,
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#111D4A',
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://armaloeluf.id'),
  title: {
    default: 'Karang Taruna Armalo Eluf - RT 06 RW 12 Surabaya',
    template: '%s | Karang Taruna Armalo Eluf',
  },
  description: 'Website resmi Karang Taruna Armalo Eluf RT 06 RW 12, Manukan Lor, Surabaya. Informasi kegiatan, pengumuman, dan galeri komunitas.',
  keywords: ['Karang Taruna', 'Armalo Eluf', 'RT 06', 'RW 12', 'Surabaya', 'kampung', 'youth organization', 'community'],
  authors: [{ name: 'Karang Taruna Armalo Eluf' }],
  creator: 'Karang Taruna Armalo Eluf',
  publisher: 'Karang Taruna Armalo Eluf',
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://armaloeluf.id',
    siteName: 'Karang Taruna Armalo Eluf',
    title: 'Karang Taruna Armalo Eluf - RT 06 RW 12 Surabaya',
    description: 'Website resmi Karang Taruna Armalo Eluf',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Karang Taruna Armalo Eluf',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Karang Taruna Armalo Eluf',
    description: 'Website resmi Karang Taruna Armalo Eluf RT 06 RW 12',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/admin/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${inter.variable} ${plusJakartaSans.variable}`}>
      <body className="font-sans antialiased">
        <AuthProvider>
          <ScrollAnimations />
          <LayoutController>
            <PageTransition>
              {children}
            </PageTransition>
          </LayoutController>
        </AuthProvider>
      </body>
    </html>
  );
}
