import type { NostrEvent } from "@nostr-dev-kit/ndk";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import { randomBytes } from "crypto";
import type { NextApiRequest, NextApiResponse } from "next";
import { type Event, validateEvent, verifySignature } from "nostr-tools";
import { validateSchema } from "~/lib/utils";
import { prisma } from "~/server/db";

const adminKey = process.env.NOSTR_NONCE_ADMIN_PUBLIC_KEY;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Only POST requests are allowed" });
    return;
  }

  const event: NDKEvent = new NDKEvent(
    undefined,
    req.body as unknown as NostrEvent
  );

  // Validate event
  try {
    if (!validateEvent(event as NostrEvent)) throw new Error("Malformed event");
    if (!verifySignature(event as Event)) throw new Error("Invalid signature");

    validateSchema(event as NostrEvent);
    if (event.tagValue("t") !== "create-nonce")
      throw new Error("Only create-nonce subkind is allowed");
  } catch (e: unknown) {
    res.status(422).json({ reason: (e as Error).message });
    return;
  }

  // Authorization
  if (event.pubkey !== adminKey!) {
    res.status(403).json({ event, reason: "Pubkey not authorized" });
    return;
  }

  // Create nonce
  const createdNonce = await prisma.nonce.create({
    data: {
      nonce: randomBytes(32).toString("hex"),
    },
  });

  res.status(200).json({ nonce: createdNonce.nonce });
}
