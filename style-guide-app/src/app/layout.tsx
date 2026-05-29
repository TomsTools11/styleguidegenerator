import type { Metadata } from 'next';
import { Geist_Mono } from 'next/font/google';
import './globals.css';

// Lato is self-hosted via @font-face in globals.css.
// Geist Mono comes from next/font for tabular-nums + tight subset.
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: 'StyleSnap — Create professional style guides in seconds',
  description:
    'Enter any website URL and receive a comprehensive, beautifully formatted PDF style guide documenting colors, typography, components, and more. A tiny utility from S3 Labs.',
  metadataBase: new URL('https://styleguidegenerator-production.up.railway.app'),
  openGraph: {
    title: 'StyleSnap — by S3 Labs',
    description:
      'Snap any website. Get a printable style guide. No accounts, no subscriptions.',
    type: 'website',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/brand/ss-favicon.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: '/brand/ss-favicon-180.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistMono.variable} antialiased`}>{children}</body>
    </html>
  );
}
