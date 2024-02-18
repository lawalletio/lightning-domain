import { type NostrEvent } from "@nostr-dev-kit/ndk";
const urlxEndpoint =
  process.env.LAWALLET_API_DOMAIN ?? "https://api.lawallet.ar";

export function validateSchema(event: NostrEvent): boolean {
  if (1112 !== event.kind!) {
    throw new Error(`Invalid kind ${event.kind!} for event ${event.id!}`);
  }
  const subKindTags = event.tags.filter((t) => "t" === t[0]!);
  if (1 !== subKindTags.length) {
    throw new Error(`Event must have exactly one subkind`);
  }
  const subkind = subKindTags[0]![1];
  switch (subkind) {
    case "create-nonce":
    case "create-identity":
    case "query-voucher":
    case "identity-transfer":
      return true;
    default:
      throw new Error(`Invalid subkind for ${subkind}`);
  }
}

export function generateLUD06(pubkey: string) {
  return {
    status: "OK",
    tag: "payRequest",
    commentAllowed: 255,
    callback: `${urlxEndpoint}/lnurlp/${pubkey}/callback`,
    metadata: '[["text/plain", "lawallet"]]',
    minSendable: 1000,
    maxSendable: 10000000000,
    payerData: {
      name: { mandatory: false },
      email: { mandatory: false },
      pubkey: { mandatory: false },
    },
    nostrPubkey:
      "e17feb5f2cf83546bcf7fd9c8237b05275be958bd521543c2285ffc6c2d654b3",
    allowsNostr: true,
    federationId: "lawallet.ar",
    accountPubKey: pubkey,
  };
}
