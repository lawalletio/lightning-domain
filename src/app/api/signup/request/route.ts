import { buildBuyHandleRequest, buildZapRequestEvent } from '@lawallet/utils';
import NDK, { NDKPrivateKeySigner, NostrEvent } from '@nostr-dev-kit/ndk';
import { randomBytes } from 'crypto';
import { NextResponse } from 'next/server';
import { getPublicKey, nip04 } from 'nostr-tools';

import { LightningAddress } from '@getalby/lightning-tools';
import { ADMIN_PRIVATE_KEY, SIGNUP_ENABLED, SIGNUP_NIP05_RECEIVER, SIGNUP_MSATS_PRICE } from '~/lib/envs';
import { federationConfig } from '~/lib/federation';
import { initializeNDK, signNdkEvent } from '~/lib/utils';

export const revalidate = 0;

export async function GET() {
  if (!SIGNUP_ENABLED || SIGNUP_MSATS_PRICE < 1000)
    return NextResponse.json({ error: 'Sign up disabled' }, { status: 422 });
  if (!ADMIN_PRIVATE_KEY.length) return NextResponse.json({ error: 'Missing admin key' }, { status: 401 });

  try {
    const lnAddressReceiver = new LightningAddress(SIGNUP_NIP05_RECEIVER);
    await lnAddressReceiver.fetch();

    if (!lnAddressReceiver || !lnAddressReceiver.nostrPubkey) {
      throw new Error('NIP05 nostr pubkey not found');
    }

    const adminPubkey: string = getPublicKey(ADMIN_PRIVATE_KEY);
    const randomNonce: string = randomBytes(32).toString('hex');
    const encryptedNonce: string = await nip04.encrypt(ADMIN_PRIVATE_KEY, adminPubkey, randomNonce);
    const ndk: NDK = await initializeNDK(federationConfig.relaysList, new NDKPrivateKeySigner(ADMIN_PRIVATE_KEY));

    /* Buy Handle Request Event */
    const buyReqEvent: NostrEvent = await signNdkEvent(ndk, buildBuyHandleRequest(adminPubkey, encryptedNonce), true);

    /* Zap Request Event */
    const zapRequestEvent: NostrEvent | undefined = await signNdkEvent(
      ndk,
      buildZapRequestEvent(adminPubkey, lnAddressReceiver.nostrPubkey, SIGNUP_MSATS_PRICE, federationConfig, [
        ['e', buyReqEvent.id!],
      ]),
    );

    const zapParams: { amount: string; nostr: string } = {
      amount: SIGNUP_MSATS_PRICE.toString(),
      nostr: JSON.stringify(zapRequestEvent),
    };

    const { paymentRequest } = await lnAddressReceiver.generateInvoice(zapParams);

    return NextResponse.json({ zapRequest: JSON.stringify(zapRequestEvent), invoice: paymentRequest }, { status: 200 });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 422 });
  }
}
