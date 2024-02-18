import type { NextApiRequest, NextApiResponse } from "next";
import { type Event, validateEvent, verifySignature } from "nostr-tools";
import { generateIdentityEvent, publishEvent } from "~/lib/events";
import { validateSchema } from "~/lib/utils";
import { prisma } from "~/server/db";

import reserved from "../../../constants/reserved.json";
import { randomBytes } from "crypto";

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

    if (event.tags.find((t) => t[0] === "t")![1] !== "create-identity")
      throw new Error("Only create-identity subkind is allowed");
  } catch (e: unknown) {
    res.status(422).json({ reason: (e as Error).message });
    return;
  }

  try {
    // Get variables from Event tags
    let name = event.tags.find((t) => t[0] === "name")![1]!;
    let nonce = event.tags.find((t) => t[0] === "nonce")![1]!;

    name = name.toLowerCase().trim();

    // Validate variables exist
    try {
      if (!name) throw new Error("You need to set a name tag");
      if (!nonce) throw new Error("Nonce not found");
    } catch (e: unknown) {
      res.status(422).json({ reason: (e as Error).message });
      return;
    }

    // Validate reserved names
    if (reserved.find((r) => r === name)) {
      res.status(403).json({ reason: "Name is reserved" });
      return;
    }

    // For debugging
    if (
      process.env.AUTOCREATE_NONCE &&
      process.env.AUTOCREATE_NONCE === nonce
    ) {
      nonce = randomBytes(32).toString("hex");

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
        throw new Error("Nonce not found");
      }

      if (nonceRecord.burned) {
        throw new Error("Nonce already burned");
      }

      // Find identity record
      const identityRecord = await tx.identity.findUnique({
        where: {
          name,
        },
      });

      if (identityRecord) {
        throw new Error("Name already taken");
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
      await publishEvent(_event, process.env.NOSTR_IDENTITY_PUBLISHER_PRIVATE_KEY!);
    } catch (e) {
      console.error("Failed to broadcast create identity event");
      console.error(e);
    }

    res.status(200).json({ name: req.query.name, pubkey: event.pubkey });
  } catch (error: unknown) {
    const message = (error as Error).message;
    res.status(400).json({ error: message });
  }
}
