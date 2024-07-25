import { NextRequest, NextResponse } from 'next/server';
import { Event, validateEvent, verifySignature } from 'nostr-tools';
import { validateSchema } from '~/lib/utils';

import { generateIdentityEvent, publishEvent } from '~/lib/events';
import { prisma } from '~/server/db';

import reserved from '../../../constants/reserved.json';
import { randomBytes } from 'crypto';
import { ADMIN_PRIVATE_KEY, AUTOCREATE_NONCE } from '~/lib/envs';

async function createIdentity(request: Request) {
  const event: Event = (await request.json()) as unknown as Event;

  try {
    if (!validateEvent(event)) throw new Error('Malformed event');
    if (!verifySignature(event)) throw new Error('Invalid signature');
    validateSchema(event);

    if (event.tags.find((t) => t[0] === 't')![1] !== 'create-identity')
      throw new Error('Only create-identity subkind is allowed');
  } catch (e: unknown) {
    return NextResponse.json({ reason: (e as Error).message }, { status: 422 });
  }

  try {
    // Get variables from Event tags
    let name = event.tags.find((t) => t[0] === 'name')![1]!;
    let nonce = event.tags.find((t) => t[0] === 'nonce')![1]!;

    name = name.toLowerCase().trim();

    // Validate variables exist
    try {
      if (!name) throw new Error('You need to set a name tag');
      if (!nonce) throw new Error('Nonce not found');
    } catch (e: unknown) {
      return NextResponse.json({ reason: (e as Error).message }, { status: 422 });
    }

    // Validate reserved names
    if (reserved.find((r) => r === name)) return NextResponse.json({ reason: 'Name is reserved' }, { status: 403 });

    // For debugging
    if (AUTOCREATE_NONCE && AUTOCREATE_NONCE === nonce) {
      nonce = randomBytes(32).toString('hex');

      await prisma.nonce.create({
        data: {
          nonce,
        },
      });
    }

    // Start transaction
    await prisma.$transaction(async (tx) => {
      // Find nonce record
      const nonceRecord = await tx.nonce.findUnique({
        where: {
          nonce,
        },
      });

      if (!nonceRecord) {
        throw new Error('Nonce not found');
      }

      if (nonceRecord.burned) {
        throw new Error('Nonce already burned');
      }

      // Find identity record
      const identityRecord = await tx.identity.findUnique({
        where: {
          name,
        },
      });

      if (identityRecord) {
        throw new Error('Name already taken');
      }

      // Burn nonce
      await tx.nonce.update({
        data: {
          burned: true,
        },
        where: {
          nonce,
        },
      });

      // Add identity record to database
      await tx.identity.create({
        data: {
          name: name,
          pubkey: event.pubkey,
          nonceId: nonceRecord.id,
        },
      });
    });

    // Broadcast identity
    try {
      const _event = generateIdentityEvent(name, event.pubkey);
      await publishEvent(_event, ADMIN_PRIVATE_KEY);
    } catch (e) {
      console.error('Failed to broadcast create identity event');
      console.error(e);
    }

    return NextResponse.json({ pubkey: event.pubkey }, { status: 200 });
  } catch (error: unknown) {
    const message = (error as Error).message;
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

async function getIdentity(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  let name = searchParams.get('name');

  // Check if exists
  if (!name) return NextResponse.json({ data: 'Not found' }, { status: 404 });

  name = name.toLowerCase().trim();

  // Find identity record by name
  const identityRecord = await prisma.identity.findUnique({
    where: {
      name,
    },
  });

  // Check if exists
  if (!identityRecord) return NextResponse.json({ data: 'Not found' }, { status: 404 });

  // Respond NIP-05
  return NextResponse.json(
    {
      names: {
        [name]: identityRecord.pubkey,
      },
    },
    { status: 200 },
  );
}

export async function POST(request: Request) {
  return createIdentity(request);
}

export async function GET(request: NextRequest) {
  return getIdentity(request);
}
