import type { NextApiRequest, NextApiResponse } from "next";
import { generateLUD06 } from "~/lib/utils";
import { prisma } from "~/server/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let pubkey = req.query.pubkey as string;

  // Check if exists
  if (!pubkey) {
    res.status(404).send("Not found");
    return;
  }

  pubkey = pubkey.toLowerCase().trim();

  // Find identity record by name
  const identityRecord = await prisma.identity.findUnique({
    where: {
      pubkey,
    },
  });

  // Check if exists
  if (!identityRecord) {
    res.status(404).send("Not found");
    return;
  }

  // Respond LUD06
  res.status(200).json(generateLUD06(pubkey));
}
