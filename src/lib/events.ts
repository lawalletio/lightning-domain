import { finishEvent, type EventTemplate } from 'nostr-tools';
import { LAWALLET_API_DOMAIN, NOSTR_LEDGER_PUBLIC_KEY, VOUCHER_AMOUNT, VOUCHER_TOKEN } from '~/constants/constants';

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

export function generateVoucherEvent(to: string): EventTemplate {
  return {
    kind: 1112,
    content: JSON.stringify({
      tokens: {
        [VOUCHER_TOKEN]: VOUCHER_AMOUNT,
      },
    }),
    tags: [
      ['t', 'internal-transaction-start'],
      ['p', NOSTR_LEDGER_PUBLIC_KEY],
      ['p', to],
    ],
    created_at: Math.floor(Date.now() / 1000),
  };
}

export async function publishEvent(event: EventTemplate, privateKey: string): Promise<void> {
  const url = `${LAWALLET_API_DOMAIN}/nostr/publish`;

  const signedEvent = finishEvent(event, privateKey);
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
