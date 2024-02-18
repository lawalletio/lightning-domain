import type { NextApiRequest, NextApiResponse } from "next";
import { type Event, validateEvent, verifySignature } from "nostr-tools";
import { validateSchema } from "~/lib/utils";
import { prisma } from "~/server/db";

import type { Prisma } from "@prisma/client";

enum VoucherStatus {
  NONE = "NONE",
  REQUESTED = "REQUESTED",
  CLAIMED = "CLAIMED",
};

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

    if (event.tags.find((t) => t[0] === "t")![1] !== "query-voucher")
      throw new Error("Only query-voucher subkind is allowed");
  } catch (e: unknown) {
    res.status(422).json({ reason: (e as Error).message });
    return;
  }

  try {
    const voucher: Prisma.VoucherGetPayload<Prisma.VoucherDefaultArgs> | null = await prisma.voucher.findFirst({ where: { Identity: { pubkey: event.pubkey } } });
    let status: VoucherStatus = VoucherStatus.NONE;
    if (null !== voucher) {
      status = voucher.claimed ? VoucherStatus.CLAIMED : VoucherStatus.REQUESTED;
    }
    res.status(200).json({ status });

  } catch (error: unknown) {
    const message = (error as Error).message;
    res.status(400).json({ error: message });
  }
}
