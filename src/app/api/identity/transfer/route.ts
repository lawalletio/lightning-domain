import { NextResponse } from 'next/server';
import { Event, nip26, validateEvent, verifySignature } from 'nostr-tools';
import { validateSchema } from '~/lib/utils';
import { prisma } from '~/server/db';
import type { Identity } from '@prisma/client';
import { federationConfig } from '~/lib/federation';

export async function POST(request: Request) {
  const event: Event = (await request.json()) as unknown as Event;

  // Validate event
  try {
    if (!validateEvent(event)) throw new Error('Malformed event');
    if (!verifySignature(event)) throw new Error('Invalid signature');
    validateSchema(event);

    if (event.tags.find((t) => t[0] === 't')![1] !== 'identity-transfer')
      throw new Error('Only identity-transfer subkind is allowed');
    if (!event.tags.find((t) => t[0] === 'delegation')) throw new Error('Must delegate identity-transfer subkind');
    if (event.pubkey !== federationConfig.modulePubkeys.card)
      throw new Error('Only the card module can transfer identities');
  } catch (e: unknown) {
    return NextResponse.json({ reason: (e as Error).message }, { status: 422 });
  }

  try {
    // Start transaction
    await prisma.$transaction(async (tx) => {
      const newPubkey: string | null = (event.tags.find((t) => t[0] === 'p') ?? [null, null])[1] ?? null;
      if (null === newPubkey) throw new Error('Cannot retrieve new pubkey');
      if (await tx.identity.count({ where: { pubkey: newPubkey } })) throw new Error('New identity already exists');

      const oldPubkey: string | null = nip26.getDelegator(event);
      if (null === oldPubkey) throw new Error('Cannot retrieve delegator');
      const oldIdentity: Identity | null = await tx.identity.findUnique({ where: { pubkey: oldPubkey } });
      if (null === oldIdentity) throw new Error('Existing identity not found');

      const newIdentity: Identity | null = await tx.identity.update({
        where: {
          pubkey: oldPubkey,
        },
        data: {
          pubkey: newPubkey,
        },
      });

      return NextResponse.json({ name: newIdentity.name, pubkey: newIdentity.pubkey }, { status: 200 });
    });
  } catch (error: unknown) {
    const message = (error as Error).message;
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
