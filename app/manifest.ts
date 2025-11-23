import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Sistema de Rastreamento GTX',
    short_name: 'GTX Sistemas',
    description:
      'PWA oficial da Agência GTX para relatórios personalizados, notificações proativas e IA preditiva.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#020617',
    theme_color: '#16a34a',
    orientation: 'portrait',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      }
    ]
  };
}
