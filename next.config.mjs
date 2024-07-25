/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import('./src/env.mjs');

/** @type {import("next").NextConfig} */
const config = {
  output: 'standalone',
  reactStrictMode: true,
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
  },
  // eslint-disable-next-line @typescript-eslint/require-await
  rewrites: async () => [
    {
      source: '/api/nonce',
      destination: '/api/nonce/create',
    },
    {
      source: '/.well-known/nostr.json',
      destination: '/api/identity',
    },
    {
      source: '/.well-known/lnurlp/:name',
      destination: '/api/lud16/:name',
    },
  ],
  // eslint-disable-next-line @typescript-eslint/require-await
  headers: async () => {
    return [
      {
        // matching all API routes
        source: '/(.*)',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' }, // replace this your actual origin
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, DELETE, PATCH, POST, PUT, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value:
              'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
          },
        ],
      },
    ];
  },
};

export default config;
