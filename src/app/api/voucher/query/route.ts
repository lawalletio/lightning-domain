import { validateEvent, verifySignature, type Event } from 'nostr-tools';
import { validateSchema } from '~/lib/utils';
import { prisma } from '~/server/db';

import { NextResponse } from 'next/server';

enum Voucher_Status {
  NONE = 'NONE',
  REQUESTED = 'REQUESTED',
  CLAIMED = 'CLAIMED',
}

export async function POST(request: Request) {
  const event: Event = (await request.json()) as unknown as Event;

  // Validate event
  try {
    if (!validateEvent(event)) throw new Error('Malformed event');
    if (!verifySignature(event)) throw new Error('Invalid signature');
    validateSchema(event);

    if (event.tags.find((t) => t[0] === 't')![1] !== 'query-voucher')
      throw new Error('Only query-voucher subkind is allowed');
  } catch (e: unknown) {
    return NextResponse.json({ reason: (e as Error).message }, { status: 422 });
  }

  try {
    const voucher: any = await prisma.voucher.findFirst({
      where: { Identity: { pubkey: event.pubkey } },
    });

    let status: Voucher_Status = Voucher_Status.NONE;
    if (null !== voucher) {
      status = voucher.claimed ? Voucher_Status.CLAIMED : Voucher_Status.REQUESTED;
    }

    return NextResponse.json({ status }, { status: 200 });
  } catch (error: unknown) {
    const message = (error as Error).message;
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
