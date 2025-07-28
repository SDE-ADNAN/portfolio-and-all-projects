import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/hooks/useAuth';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'WhatsApp Clone',
  description: 'A high-performance, scalable WhatsApp clone built with Next.js',
  keywords: ['WhatsApp', 'chat', 'messaging', 'real-time', 'Next.js'],
  authors: [{ name: 'WhatsApp Clone Team' }],
  creator: 'WhatsApp Clone Team',
  publisher: 'WhatsApp Clone Team',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'WhatsApp Clone',
    description: 'A high-performance, scalable WhatsApp clone built with Next.js',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    siteName: 'WhatsApp Clone',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'WhatsApp Clone',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WhatsApp Clone',
    description: 'A high-performance, scalable WhatsApp clone built with Next.js',
    images: ['/og-image.png'],
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
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#128C7E" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="WhatsApp Clone" />
        <meta name="msapplication-TileColor" content="#128C7E" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body className={`${inter.className} h-full antialiased`}>
        <div id="root" className="h-full">
          <AuthProvider>
            {children}
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
