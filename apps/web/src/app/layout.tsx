import React from 'react';
import type { Metadata, Viewport } from 'next';
import { I18nProvider } from '../lib/i18n/I18nContext';
import { AuthProvider } from '../lib/auth/AuthContext';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#1f4127'
};

export const metadata: Metadata = {
  title: 'Bakka Farm Management System',
  description: 'Offline-first farm operations and produce platform',
  manifest: '/manifest.webmanifest'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#f8faf8] antialiased">
        <AuthProvider>
          <I18nProvider>
            {children}
          </I18nProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
