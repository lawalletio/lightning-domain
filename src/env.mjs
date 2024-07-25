import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    // POSTGRES_PRISMA_URL: z.string().url(),
    // POSTGRES_PRISMA_URL_NON_POOLING: z.string().url(),
    // NOSTR_NONCE_ADMIN_PUBLIC_KEY: z.string().url(),
    NODE_ENV: z.enum(['development', 'test', 'production']),
  },

  client: {},

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    // POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL,
    // POSTGRES_PRISMA_URL_NON_POOLING: process.env.POSTGRES_PRISMA_URL_NON_POOLING,
    NODE_ENV: process.env.NODE_ENV,
    // NEXT_PUBLIC_CLIENTVAR: process.env.NEXT_PUBLIC_CLIENTVAR,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
   * This is especially useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
