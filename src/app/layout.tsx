import React from 'react';
import '~/styles/globals.css';

export const metadata = {
  title: 'LaWallet.ar',
  description: 'Identity Provider - LaWallet',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>{children}</body>
    </html>
  );
}
