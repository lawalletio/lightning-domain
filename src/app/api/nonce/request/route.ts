import { buildBuyHandleRequest, buildZapRequestEvent } from '@lawallet/utils';
import { requestInvoice } from '@lawallet/utils/actions';
import NDK, { NDKPrivateKeySigner, NostrEvent } from '@nostr-dev-kit/ndk';
import { randomBytes } from 'crypto';
import { NextResponse } from 'next/server';
import { getPublicKey, nip04, nip19 } from 'nostr-tools';
import { signUpInfo } from '~/lib/constants';
import { NOSTR_NONCE_ADMIN_PRIVATE_KEY } from '~/lib/envs';
import { federationConfig } from '~/lib/federation';
import { initializeNDK, signNdk } from '~/lib/utils';

export const revalidate = 0;

export async function GET() {
  if (!NOSTR_NONCE_ADMIN_PRIVATE_KEY.length) return NextResponse.json({ data: 'Missing admin key' }, { status: 401 });

  try {
    const adminPubkey: string = getPublicKey(NOSTR_NONCE_ADMIN_PRIVATE_KEY);
    const randomNonce: string = randomBytes(32).toString('hex');

    const encryptedNonce: string = await nip04.encrypt(NOSTR_NONCE_ADMIN_PRIVATE_KEY, adminPubkey, randomNonce);
    const ndk: NDK = await initializeNDK(
      federationConfig.relaysList,
      new NDKPrivateKeySigner(NOSTR_NONCE_ADMIN_PRIVATE_KEY),
    );

    /* Buy Handle Request Event */
    const buyReqEvent: NostrEvent = await signNdk(ndk, buildBuyHandleRequest(adminPubkey, encryptedNonce), true);

    /* Zap Request Event */
    const zapRequestEvent: NostrEvent | undefined = await signNdk(
      ndk,
      buildZapRequestEvent(adminPubkey, signUpInfo.receiver, signUpInfo.price, federationConfig, [
        ['e', buyReqEvent.id!],
      ]),
    );

    const zapRequestURI: string = encodeURI(JSON.stringify(zapRequestEvent));

    const bolt11 = await requestInvoice(
      `${federationConfig.endpoints.gateway}/lnurlp/${nip19.npubEncode(signUpInfo.receiver)}/callback?amount=${signUpInfo.price}&nostr=${zapRequestURI}`,
    );

    return NextResponse.json({ zapRequest: JSON.stringify(zapRequestEvent), invoice: bolt11 }, { status: 200 });
  } catch (e: unknown) {
    return NextResponse.json({ data: (e as Error).message }, { status: 422 });
  }
}
