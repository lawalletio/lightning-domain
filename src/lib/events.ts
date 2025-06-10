import { finalizeEvent, type EventTemplate } from 'nostr-tools';
import { federationConfig } from './federation';
import { hexToBytes } from 'nostr-tools/utils';
import { NDKKind, NDKTag, NostrEvent } from '@nostr-dev-kit/ndk';
import { LaWalletKinds, LaWalletTags } from '~/lib/lawallet';
import { nowInSeconds } from './utils';

export function generateIdentityEvent(name: string, pubkey: string): EventTemplate {
  return {
    kind: 1112,
    content: '',
    tags: [
      ['t', 'new-user'],
      ['t', name],
      ['p', pubkey],
    ],
    created_at: Math.floor(Date.now() / 1000),
  };
}

export async function publishEvent(event: EventTemplate, privateKey: string): Promise<void> {
  const url = `${federationConfig.endpoints.gateway}/nostr/publish`;

  const _privateKey = hexToBytes(privateKey);
  const signedEvent = finalizeEvent(event, _privateKey);
  // Fetch request options
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(signedEvent), // Uncomment and add data if it's a POST request
  };

  const response = await fetch(url, requestOptions);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
}

export const getTagValue = (tags: NDKTag[], keyTag: string): string => {
  const tag: NDKTag | undefined = tags.find((tag) => tag[0] === keyTag);
  return tag ? tag[1]! : '';
};

export const buildCreateNonceEvent = (adminPubkey: string, randomNonce: string): NostrEvent => {
  return {
    pubkey: adminPubkey,
    kind: LaWalletKinds.REGULAR,
    content: '',
    tags: [
      ['t', LaWalletTags.CREATE_NONCE],
      ['nonce', randomNonce],
    ],
    created_at: nowInSeconds(),
  };
};

export const buildBuyHandleRequest = (adminPubkey: string, encryptedNonce: string): NostrEvent => {
  return {
    pubkey: adminPubkey,
    kind: LaWalletKinds.REGULAR,
    content: encryptedNonce,
    tags: [['t', LaWalletTags.BUY_HANDLE_REQUEST]],
    created_at: nowInSeconds(),
  };
};

export const buildZapRequestEvent = (
  senderPubkey: string,
  receiverPubkey: string,
  amount: number,
  relaysList: string[] = [],
  tags: NDKTag[] = [],
): NostrEvent => {
  return {
    pubkey: senderPubkey,
    content: '',
    kind: NDKKind.ZapRequest,
    tags: [['p', receiverPubkey], ['amount', amount.toString()], ['relays', ...relaysList], ...tags],
    created_at: nowInSeconds(),
  };
};
