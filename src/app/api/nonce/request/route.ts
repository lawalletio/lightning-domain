import { buildBuyHandleRequest, buildZapRequestEvent } from '@lawallet/utils';
import { requestInvoice } from '@lawallet/utils/actions';
import NDK, { NDKPrivateKeySigner, NostrEvent } from '@nostr-dev-kit/ndk';
import { randomBytes } from 'crypto';
import { NextResponse } from 'next/server';
import { getPublicKey, nip04, nip19 } from 'nostr-tools';

import { ADMIN_PRIVATE_KEY, SIGNUP_ENABLED, SIGNUP_MSATS_PRICE, SIGNUP_NIP05_RECEIVER } from '~/lib/envs';
import { federationConfig } from '~/lib/federation';
import { initializeNDK, signNdk } from '~/lib/utils';
import { LightningAddress, type LnUrlRawData } from '@getalby/lightning-tools';

export const revalidate = 0;

interface ExtendedLnUrlRawData extends LnUrlRawData {
  accountPubKey: string;
}

export async function GET() {
  if (!SIGNUP_ENABLED) return NextResponse.json({ data: 'Sign up disabled' }, { status: 422 });
  if (!ADMIN_PRIVATE_KEY.length) return NextResponse.json({ data: 'Missing admin key' }, { status: 401 });

  try {
    const lnAddressReceiver = new LightningAddress(SIGNUP_NIP05_RECEIVER);
    await lnAddressReceiver.fetch();

    const receiverAccountPubKey: string = (lnAddressReceiver.lnurlpData.rawData as ExtendedLnUrlRawData).accountPubKey;

    if (!lnAddressReceiver || receiverAccountPubKey) {
      throw new Error(
        'SIGN_UP_NIP05_RECEIVER_ERROR: Could not get the `accountPubKey` field of the NIP05 that receives the sign up funds.',
      );
    }

    const adminPubkey: string = getPublicKey(ADMIN_PRIVATE_KEY);
    const randomNonce: string = randomBytes(32).toString('hex');
    const encryptedNonce: string = await nip04.encrypt(ADMIN_PRIVATE_KEY, adminPubkey, randomNonce);
    const ndk: NDK = await initializeNDK(federationConfig.relaysList, new NDKPrivateKeySigner(ADMIN_PRIVATE_KEY));

    /* Buy Handle Request Event */
    const buyReqEvent: NostrEvent = await signNdk(ndk, buildBuyHandleRequest(adminPubkey, encryptedNonce), true);

    /* Zap Request Event */
    const zapRequestEvent: NostrEvent | undefined = await signNdk(
      ndk,
      buildZapRequestEvent(adminPubkey, receiverAccountPubKey, SIGNUP_MSATS_PRICE, federationConfig, [
        ['e', buyReqEvent.id!],
      ]),
    );

    const zapRequestURI: string = encodeURI(JSON.stringify(zapRequestEvent));

    const bolt11 = await requestInvoice(
      `${federationConfig.endpoints.gateway}/lnurlp/${nip19.npubEncode(receiverAccountPubKey)}/callback?amount=${SIGNUP_MSATS_PRICE}&nostr=${zapRequestURI}`,
    );

    return NextResponse.json({ zapRequest: JSON.stringify(zapRequestEvent), invoice: bolt11 }, { status: 200 });
  } catch (e: unknown) {
    return NextResponse.json({ data: (e as Error).message }, { status: 422 });
  }
}
