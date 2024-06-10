# Lightning Domain

Provide Lightning Addreses with your domain.
Provides [NIP-05](https://github.com/nostr-protocol/nips/blob/master/05.md) and [LUD-16](https://github.com/lnurl/luds/blob/luds/16.md) for users.

Just deploy it and assign your domain.

## Our stack

- [Prisma](https://prisma.io)
- [Tailwind CSS](https://tailwindcss.com)
- [NextJS](https://nextjs.org)

## Documentation

You can check the full documentation in [LaWallet Documentation](https://backend.lawallet.io/identity-provider)

## One Click install

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Flawalletio%2Flightning-domain&env=ADMIN_NOSTR_PRIVATE_KEY,AUTOCREATE_NONCE&project-name=lightning-domain&repository-name=lightning-domain&integration-ids=oac_3sK3gnG06emjIEVL09jjntDD)

1. Select a name for your repo
2. Set the environment variables

   ```bash
   DATABASE_URL="postgresql://" # < Database URI
   ADMIN_NOSTR_PRIVATE_KEY="..." # < Nostr Admin Private Key (hex)
   AUTOCREATE_NONCE="SECRET_NONCE" # < Remember this value

   SIGNUP_ENABLED=1
   SIGNUP_NIP05_RECEIVER=tesoro@lawallet.ar
   SIGNUP_MSATS_PRICE=21000
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
