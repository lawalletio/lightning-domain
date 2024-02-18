import type { NextApiRequest, NextApiResponse } from "next";
import { type Event, validateEvent, verifySignature, nip26 } from "nostr-tools";
import { validateSchema } from "~/lib/utils";
import { prisma } from "~/server/db";

import type { Identity } from "@prisma/client";


const NOSTR_CARD_PUBLIC_KEY: string = process.env.NOSTR_CARD_PUBLIC_KEY!;


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Must be PUT method
  if (req.method !== "POST") {
    res.status(405).json({ reason: "Method not allowed" });
    return;
  }

  const event: Event = req.body as unknown as Event;

  // Validate event
  try {
    if (!validateEvent(event)) throw new Error("Malformed event");
    if (!verifySignature(event)) throw new Error("Invalid signature");
    validateSchema(event);

    if (event.tags.find((t) => t[0] === "t")![1] !== "identity-transfer")
      throw new Error("Only identity-transfer subkind is allowed");
    if (!event.tags.find((t) => t[0] === "delegation"))
      throw new Error("Must delegate identity-transfer subkind");
    if (event.pubkey !== NOSTR_CARD_PUBLIC_KEY) throw new Error("Only the card module can transfer identities");
  } catch (e: unknown) {
    res.status(422).json({ reason: (e as Error).message });
    return;
  }

  try {
    // Start transaction
    await prisma.$transaction(async (tx) => {
      const newPubkey: string | null = (event.tags.find((t) => t[0] === "p") ?? [null, null])[1] ?? null;
      if (null === newPubkey) throw new Error("Cannot retrieve new pubkey");
      if (await tx.identity.count({ where: { pubkey: newPubkey } })) throw new Error("New identity already exists");

      const oldPubkey: string | null = nip26.getDelegator(event);
      if (null === oldPubkey) throw new Error("Cannot retrieve delegator");
      const oldIdentity: Identity | null = await tx.identity.findUnique({ where: { pubkey: oldPubkey } });
      if (null === oldIdentity) throw new Error("Existing identity not found");

      const newIdentity: Identity | null = await tx.identity.update({
        where: {
          pubkey: oldPubkey,
        },
        data: {
          pubkey: newPubkey,
        }
      });

      res.status(200).json({ name: newIdentity.name, pubkey: newIdentity.pubkey });
    });
  } catch (error: unknown) {
    const message = (error as Error).message;
    res.status(400).json({ error: message });
  }
}
