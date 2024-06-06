import { buildCreateNonceEvent, decodeInvoice, getTagValue } from '@lawallet/utils';
import { DecodedInvoiceReturns } from '@lawallet/utils/types';
import NDK, { NDKEvent, NDKPrivateKeySigner, NostrEvent } from '@nostr-dev-kit/ndk';
import { NextResponse } from 'next/server';
import { Event, getPublicKey, nip04, validateEvent, verifySignature } from 'nostr-tools';
import { signUpInfo } from '~/lib/signup';
import { ADMIN_PUBLISHER_PRIVATE_KEY } from '~/lib/envs';
import { federationConfig } from '~/lib/federation';
import { GenerateNonceReturns, generateNonce, initializeNDK } from '~/lib/utils';

export async function POST(request: Request) {
  if (!ADMIN_PUBLISHER_PRIVATE_KEY.length) return NextResponse.json({ data: 'Missing admin key' }, { status: 401 });

  try {
    const adminPubkey: string = getPublicKey(ADMIN_PUBLISHER_PRIVATE_KEY);

    const zapReceipt: NostrEvent = await request.json();
    if (!zapReceipt) return NextResponse.json({ data: 'Missing zap receipt event' }, { status: 401 });

    const zapRequest: NostrEvent = JSON.parse(getTagValue(zapReceipt.tags, 'description'));
    if (!zapRequest) return NextResponse.json({ data: 'Missing zap request event' }, { status: 401 });

    if (
      !verifySignature(zapReceipt as Event) ||
      !verifySignature(zapRequest as Event) ||
      zapRequest.pubkey !== adminPubkey ||
      zapReceipt.pubkey !== federationConfig.modulePubkeys.urlx
    )
      throw new Error('Invalid signature');

    const buyRequestId: string = getTagValue(zapRequest.tags, 'e');
    const payedInvoice: string = getTagValue(zapReceipt.tags, 'bolt11');
    const decodedInvoice: DecodedInvoiceReturns | undefined = decodeInvoice(payedInvoice);

    if (!validateEvent(zapReceipt) || !buyRequestId || !decodedInvoice) throw new Error('Malformed event');
    if (Number(decodedInvoice.millisatoshis) !== signUpInfo.price) throw new Error('Insufficient payment');

    const ndk: NDK = await initializeNDK(
      federationConfig.relaysList,
      new NDKPrivateKeySigner(ADMIN_PUBLISHER_PRIVATE_KEY),
    );

    const buyRequestEvent: NDKEvent | null = await ndk.fetchEvent({ ids: [buyRequestId], authors: [adminPubkey] });
    if (!buyRequestEvent) throw new Error('Invalid buy request event');

    const decryptedNonce: string = await nip04.decrypt(
      ADMIN_PUBLISHER_PRIVATE_KEY,
      adminPubkey,
      buyRequestEvent.content,
    );

    const createNonceEvent: NDKEvent = new NDKEvent(ndk, buildCreateNonceEvent(adminPubkey, decryptedNonce));
    await createNonceEvent.sign();

    const createdNonce: GenerateNonceReturns = await generateNonce(createNonceEvent, adminPubkey);
    if (!createdNonce.success) throw new Error(createdNonce.message);

    return NextResponse.json({ data: { nonce: createdNonce.message } }, { status: 200 });
  } catch (e: unknown) {
    return NextResponse.json({ data: (e as Error).message }, { status: 422 });
  }
}
