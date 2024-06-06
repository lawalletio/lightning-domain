import { getPublicKey, validateEvent, verifySignature, type Event } from 'nostr-tools';
import { validateSchema } from '~/lib/utils';

import { prisma } from '~/server/db';

import { NDKEvent, type NostrEvent } from '@nostr-dev-kit/ndk';
import { randomBytes } from 'crypto';
import { NOSTR_NONCE_ADMIN_PRIVATE_KEY } from '~/lib/envs';
import { NextResponse } from 'next/server';

const adminPubkey: string = getPublicKey(NOSTR_NONCE_ADMIN_PRIVATE_KEY);

export async function POST(request: Request) {
  const event: NDKEvent = new NDKEvent(undefined, (await request.json()) as unknown as NostrEvent);

  // Validate event
  try {
    if (!validateEvent(event as NostrEvent)) throw new Error('Malformed event');
    if (!verifySignature(event as Event)) throw new Error('Invalid signature');

    validateSchema(event as NostrEvent);
    if (event.tagValue('t') !== 'create-nonce') throw new Error('Only create-nonce subkind is allowed');

    // Authorization
    if (event.pubkey !== adminPubkey)
      return NextResponse.json({ event, reason: 'Pubkey not authorized' }, { status: 403 });

    const eventNonce: string | undefined = event.tagValue('nonce');
    const entropy: string = eventNonce ?? randomBytes(32).toString('hex');

    // Create nonce
    const createdNonce = await prisma.nonce.create({
      data: {
        nonce: entropy,
      },
    });

    return NextResponse.json({ nonce: createdNonce.nonce }, { status: 200 });
  } catch (e: unknown) {
    return NextResponse.json({ reason: (e as Error).message }, { status: 422 });
  }
}
