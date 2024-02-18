# Identity Provider

Provides NIP-05 and LUD-16 for users.
Just deploy it and assign your domain.

## Our stack

- [Prisma](https://prisma.io)
- [Tailwind CSS](https://tailwindcss.com)

## Documentation

You can check the full documentation in [LaWallet Documentation](https://lawallet.io/identity-provider)

## One Click install

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Flawalletio%2Fidentity-provider&env=LAWALLET_API_DOMAIN,NOSTR_NONCE_ADMIN_PUBLIC_KEY&project-name=your-domain&repository-name=your-domain)

1. Select a name for your repo
2. Set the environment variables

   ```bash
   LAWALLET_API_DOMAIN="https://api.lawallet.ar"
   NOSTR_NONCE_ADMIN_PUBLIC_KEY="46241efb55cbfc73d410a136fac1cf88ddb6778014b8a58cecd0df8b01a98ffc"
   ```

3. Deploy
4. Assign a domain

## Developing

Set nvm version

```bash
nvm use
```

Install packages

```bash
pnpm install
```

Start development server

```bash
pnpm dev
```

## Build

```bash
pnpm build
```
