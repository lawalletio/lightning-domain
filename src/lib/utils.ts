import NDK, { NDKEvent, NDKSigner, type NostrEvent } from '@nostr-dev-kit/ndk';
import { federationConfig } from './federation';
import { Event, validateEvent, verifySignature } from 'nostr-tools';
import { randomBytes } from 'crypto';
import { prisma } from '~/server/db';

export const initializeNDK = async (relays: string[], signer: NDKSigner) => {
  const ndkProvider = new NDK({
    explicitRelayUrls: relays,
    signer,
  });

  await ndkProvider.connect();
  return ndkProvider;
};

export const signNdk = async (ndk: NDK, eventInfo: NostrEvent, publish: boolean = false) => {
  const event: NDKEvent = new NDKEvent(ndk, eventInfo);

  await event.sign();
  if (publish) await event.publish();

  return event.toNostrEvent();
};

export function requiredEnvVar(key: string): string {
  const envVar = process.env[key];
  if (undefined === envVar) {
    throw new Error(`Environment process ${key} must be defined`);
  }
  return envVar;
}

export function validateSchema(event: NostrEvent): boolean {
  if (1112 !== event.kind!) {
    throw new Error(`Invalid kind ${event.kind!} for event ${event.id!}`);
  }
  const subKindTags = event.tags.filter((t) => 't' === t[0]!);
  if (1 !== subKindTags.length) {
    throw new Error(`Event must have exactly one subkind`);
  }
  const subkind = subKindTags[0]![1];
  switch (subkind) {
    case 'create-nonce':
    case 'create-identity':
    case 'query-voucher':
    case 'identity-transfer':
      return true;
    default:
      throw new Error(`Invalid subkind for ${subkind}`);
  }
}

export function generateLUD06(pubkey: string) {
  return {
    status: 'OK',
    tag: 'payRequest',
    commentAllowed: 255,
    callback: `${federationConfig.endpoints.gateway}/lnurlp/${pubkey}/callback`,
    metadata: '[["text/plain", "lawallet"]]',
    minSendable: 1000,
    maxSendable: 10000000000,
    payerData: {
      name: { mandatory: false },
      email: { mandatory: false },
      pubkey: { mandatory: false },
    },
    nostrPubkey: 'e17feb5f2cf83546bcf7fd9c8237b05275be958bd521543c2285ffc6c2d654b3',
    allowsNostr: true,
    federationId: 'lawallet.ar',
    accountPubKey: pubkey,
  };
}

export type GenerateNonceReturns = {
  success: boolean;
  status: 200 | 403 | 422;
  message: string;
};

export async function generateNonce(event: NDKEvent, adminPubkey: string): Promise<GenerateNonceReturns> {
  // Validate event
  try {
    if (!validateEvent(event)) return { success: false, status: 422, message: 'Malformed event' };
    if (!verifySignature(event as Event)) return { success: false, status: 422, message: 'Invalid signature' };

    validateSchema(event as NostrEvent);
    if (event.tagValue('t') !== 'create-nonce')
      return { success: false, status: 422, message: 'Only create-nonce subkind is allowed' };

    // Authorization
    if (event.pubkey !== adminPubkey) return { success: false, status: 403, message: 'Pubkey not authorized' };

    const eventNonce: string | undefined = event.tagValue('nonce');
    const entropy: string = eventNonce ?? randomBytes(32).toString('hex');

    // Create nonce
    const createdNonce = await prisma.nonce.create({
      data: {
        nonce: entropy,
      },
    });

    return { success: true, status: 200, message: createdNonce.nonce };
  } catch (e: unknown) {
    return { success: false, status: 422, message: (e as Error).message };
  }
}
