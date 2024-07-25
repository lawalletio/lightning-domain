import { buildCreateNonceEvent, decodeInvoice, getTagValue } from '@lawallet/utils';
import { DecodedInvoiceReturns } from '@lawallet/utils/types';
import NDK, { NDKEvent, NDKPrivateKeySigner, NostrEvent } from '@nostr-dev-kit/ndk';
import { randomBytes } from 'crypto';
import { NextResponse } from 'next/server';
import { Event, getPublicKey, nip04, validateEvent, verifySignature } from 'nostr-tools';
import { ADMIN_PRIVATE_KEY, SIGNUP_ENABLED, SIGNUP_MSATS_PRICE } from '~/lib/envs';
import { federationConfig } from '~/lib/federation';
import { GenerateNonceReturns, initializeNDK, validateSchema } from '~/lib/utils';
import { prisma } from '~/server/db';

async function generateNonce(event: NDKEvent, adminPubkey: string): Promise<GenerateNonceReturns> {
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

export async function POST(request: Request) {
  if (!SIGNUP_ENABLED) return NextResponse.json({ error: 'Sign up disabled' }, { status: 422 });
  if (!ADMIN_PRIVATE_KEY.length) return NextResponse.json({ error: 'Missing admin key' }, { status: 401 });

  try {
    const adminPubkey: string = getPublicKey(ADMIN_PRIVATE_KEY);

    const zapReceipt: NostrEvent = await request.json();
    if (!zapReceipt) return NextResponse.json({ error: 'Missing zap receipt event' }, { status: 401 });

    const zapRequest: NostrEvent = JSON.parse(getTagValue(zapReceipt.tags, 'description'));
    if (!zapRequest) return NextResponse.json({ error: 'Missing zap request event' }, { status: 401 });

    if (
      !verifySignature(zapReceipt as Event) ||
      !verifySignature(zapRequest as Event) ||
      zapRequest.pubkey !== adminPubkey
    )
      throw new Error('Invalid signature');

    const buyRequestId: string = getTagValue(zapRequest.tags, 'e');
    const payedInvoice: string = getTagValue(zapReceipt.tags, 'bolt11');
    const decodedInvoice: DecodedInvoiceReturns | undefined = decodeInvoice(payedInvoice);

    if (!validateEvent(zapReceipt) || !buyRequestId || !decodedInvoice) throw new Error('Malformed event');
    if (Number(decodedInvoice.millisatoshis) !== SIGNUP_MSATS_PRICE) throw new Error('Insufficient payment');

    const ndk: NDK = await initializeNDK(federationConfig.relaysList, new NDKPrivateKeySigner(ADMIN_PRIVATE_KEY));

    const buyRequestEvent: NDKEvent | null = await ndk.fetchEvent({ ids: [buyRequestId], authors: [adminPubkey] });
    if (!buyRequestEvent) throw new Error('Invalid buy request event');

    const decryptedNonce: string = await nip04.decrypt(ADMIN_PRIVATE_KEY, adminPubkey, buyRequestEvent.content);

    const createNonceEvent: NDKEvent = new NDKEvent(ndk, buildCreateNonceEvent(adminPubkey, decryptedNonce));
    await createNonceEvent.sign();

    const createdNonce: GenerateNonceReturns = await generateNonce(createNonceEvent, adminPubkey);
    if (!createdNonce.success) throw new Error(createdNonce.message);

    return NextResponse.json({ nonce: createdNonce.message }, { status: 200 });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 422 });
  }
}
