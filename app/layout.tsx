import type { Metadata, Viewport } from 'next';
import './globals.css';
import { RegisterServiceWorker } from './register-sw';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#ffffff',
};

export const metadata: Metadata = {
  title: 'CB Health Tracker',
  description: 'Medication reminders and daily check-ins for peace of mind',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'CB Health Tracker',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <RegisterServiceWorker />
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  );
}
