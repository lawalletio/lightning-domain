# Lightning Domain

Provide Lightning Addreses with your domain.
Provides [NIP-05](https://github.com/nostr-protocol/nips/blob/master/05.md) and [LUD-16](https://github.com/lnurl/luds/blob/luds/16.md) for users.

Just deploy it and assign your domain.

## Our stack

- [Prisma](https://prisma.io)
- [Tailwind CSS](https://tailwindcss.com)

## Documentation

You can check the full documentation in [LaWallet Documentation](https://lawallet.io/identity-provider)

## One Click install

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Flawalletio%2Flightning-domain&env=LAWALLET_API_DOMAIN,AUTOCREATE_NONCE&project-name=lightning-domain&repository-name=lightning-domain&integration-ids=oac_3sK3gnG06emjIEVL09jjntDD)

1. Select a name for your repo
2. Set the environment variables

   ```bash
   LAWALLET_API_DOMAIN="https://api.lawallet.ar"
   AUTOCREATE_NONCE="SECRET_NONCE" # < Remember this value
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
