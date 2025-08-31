import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

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
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WhatsApp Clone',
    description: 'A high-performance, scalable WhatsApp clone built with Next.js',
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
        <meta name="theme-color" content="#128C7E" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className={`${inter.className} h-full antialiased bg-background text-foreground`}>
        <div id="root" className="h-full">
          {children}
        </div>
      </body>
    </html>
  );
}
