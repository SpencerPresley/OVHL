import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import '@/styles/notifications.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthSessionProvider } from '../providers/auth-session-provider';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'OVHL - Online Virtual Hockey League',
  description: 'Welcome to the Online Virtual Hockey League - Where Competition Meets Community',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script id="remove-grammarly">{`
          window.addEventListener('load', function() {
            document.body.removeAttribute('data-new-gr-c-s-check-loaded');
            document.body.removeAttribute('data-gr-ext-installed');
          });
        `}</Script>
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        <AuthSessionProvider>
          {children}
        </AuthSessionProvider>
        <Toaster />
      </body>
    </html>
  );
}
