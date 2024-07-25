import { type NostrEvent } from '@nostr-dev-kit/ndk';

export const createNonce: NostrEvent = {
  pubkey: '46241efb55cbfc73d410a136fac1cf88ddb6778014b8a58cecd0df8b01a98ffc',
  created_at: 1696457522,
  kind: 1112,
  tags: [['t', 'create-nonce']],
  content: '',
};

export const createIdentity: NostrEvent = {
  pubkey: '46241efb55cbfc73d410a136fac1cf88ddb6778014b8a58cecd0df8b01a98ffc',
  created_at: 1696195102,
  kind: 1112,
  tags: [
    ['t', 'create-identity'],
    ['name', 'pepe'],
    ['nonce', '82e4362f3a9d1c55ac8e46e105dea3b468408d7da50e6dc66c24f9ef9b99b592'],
  ],
  content: '',
};
