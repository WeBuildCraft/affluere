import type { Metadata, Viewport } from 'next'
import './globals.css'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://affleure.com'

export const metadata: Metadata = {
  title: {
    default: 'Affleure — Histoires et observations de Bordeaux Métropole',
    template: '%s | Affleure',
  },
  description: 'Affleure est une plateforme de récits géolocalisés. Déposez et explorez des observations, histoires, photos, questions et conversations sur Bordeaux Métropole.',
  metadataBase: new URL(siteUrl),
  applicationName: 'Affleure',
  keywords: [
    'Bordeaux', 'Bordeaux Métropole', 'histoires', 'observations', 'récits géolocalisés',
    'carte interactive', 'patrimoine', 'culture bordeaux', 'stories Bordeaux',
    'photos Bordeaux', 'quartiers Bordeaux', 'vie locale Bordeaux',
    'Gironde', 'Nouvelle-Aquitaine', 'urban stories', 'city observations',
  ],
  authors: [{ name: 'Affleure' }],
  creator: 'Affleure',
  publisher: 'Affleure',
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
  openGraph: {
    type: 'website',
    siteName: 'Affleure',
    title: 'Affleure — Histoires et observations de Bordeaux Métropole',
    description: 'Déposez et explorez des observations, histoires, photos, questions et conversations géolocalisées sur Bordeaux Métropole.',
    locale: 'fr_FR',
    url: siteUrl,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Affleure — Histoires et observations de Bordeaux Métropole',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Affleure — Histoires et observations de Bordeaux Métropole',
    description: 'Déposez et explorez des observations, histoires, photos, questions et conversations géolocalisées sur Bordeaux Métropole.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: siteUrl,
  },
  category: 'social',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#e8643a',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Affleure',
    url: siteUrl,
    description: 'Plateforme de récits géolocalisés sur Bordeaux Métropole. Déposez et explorez des observations, histoires, photos, questions et conversations.',
    applicationCategory: 'SocialNetworkingApplication',
    operatingSystem: 'Web',
    inLanguage: 'fr',
    areaServed: {
      '@type': 'Place',
      name: 'Bordeaux Métropole',
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 44.8378,
        longitude: -0.5792,
      },
      containedInPlace: {
        '@type': 'AdministrativeArea',
        name: 'Gironde, Nouvelle-Aquitaine, France',
      },
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
    },
    image: `${siteUrl}/og-image.png`,
  }

  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400;1,9..40,500&family=DM+Serif+Display:ital@0;1&display=swap"
          rel="stylesheet"
        />
        <link rel="manifest" href="/manifest.json" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
