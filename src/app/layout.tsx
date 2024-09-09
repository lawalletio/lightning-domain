import React from 'react';
import '~/styles/globals.css';

export const metadata = {
  title: 'LaWallet.ar',
  description: 'Gestioná pagos, identidades y comunidad fácilmente',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" href="/favicon.ico" />
        <link rel="canonical" href="https://lawallet.app" />

        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          name="description"
          content="Gestioná pagos, identidades y comunidad fácilmente con LaWallet.app. Con la ayuda de Bitcoin, Lightning Network y Nostr en una plataforma diseñada para simplificarlo todo."
        />
        <meta
          name="keywords"
          content="Bitcoin, Lightning Network, Nostr, billetera digital, pagos, identidad, comunidad, LaWallet, crypto"
        />

        {/* <!-- Opengraph --> */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="LaWallet.app" />
        <meta
          property="og:description"
          content="Gestioná pagos, identidades y comunidad fácilmente con LaWallet.app. Con la ayuda de Bitcoin, Lightning Network y Nostr en una plataforma diseñada para simplificarlo todo."
        />
        {/* <meta property="og:image" content="/og-image.png" /> */}
        <meta property="og:url" content="https://lawallet.app" />
        <meta property="og:site_name" content="LaWallet.app" />

        {/* <!-- Facebook Meta Tags --> */}
        <meta property="og:url" content="https://lawallet.app" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="LaWallet.app" />
        <meta
          property="og:description"
          content="Gestioná pagos, identidades y comunidad fácilmente con LaWallet.app. Con la ayuda de Bitcoin, Lightning Network y Nostr en una plataforma diseñada para simplificarlo todo."
        />
        {/* <meta property="og:image" content="/og-image.png" /> */}

        {/* <!-- Twitter Meta Tags --> */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content="lawallet.app" />
        <meta property="twitter:url" content="https://lawallet.app" />
        <meta name="twitter:title" content="LaWallet.app" />
        <meta
          name="twitter:description"
          content="Gestioná pagos, identidades y comunidad fácilmente con LaWallet.app. Con la ayuda de Bitcoin, Lightning Network y Nostr en una plataforma diseñada para simplificarlo todo."
        />
        {/* <meta name="twitter:image" content="/og-image.png" /> */}

        {/* <!-- robots --> */}
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
      </head>
      <body>{children}</body>
    </html>
  );
}
