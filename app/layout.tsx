import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sistema de Rastreamento GTX',
  description:
    'Login e dashboard inteligente da Agência GTX com relatórios personalizados, notificações proativas e onboarding guiado.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/images/favicon.png',
    apple: '/images/favicon.png'
  }
};

export const viewport: Viewport = {
  themeColor: '#0f172a',
  colorScheme: 'dark'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
